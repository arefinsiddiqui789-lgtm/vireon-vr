"use client";

import { useState, useMemo } from "react";
import { useVireonStore, DAYS_OF_WEEK, type GymExercise, type FitnessProfile } from "@/store/vireon-store";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Dumbbell,
  Plus,
  Trash2,
  Check,
  Circle,
  Flame,
  Activity,
  Heart,
  Timer,
  Trophy,
  User,
  Ruler,
  Weight,
  Calculator,
  Target,
  Utensils,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Salad,
  Beef,
  Wheat,
  Droplets,
} from "lucide-react";

// Quick preset exercises
const EXERCISE_PRESETS = [
  { name: "Push-ups", sets: 3, reps: 15, icon: "💪" },
  { name: "Pull-ups", sets: 3, reps: 10, icon: "🏋️" },
  { name: "Squats", sets: 3, reps: 15, icon: "🦵" },
  { name: "Plank", sets: 3, reps: 60, icon: "🧘" },
  { name: "Running", sets: 1, reps: 30, icon: "🏃" },
  { name: "Crunches", sets: 3, reps: 20, icon: "🔥" },
  { name: "Deadlift", sets: 4, reps: 8, icon: "🏋️" },
  { name: "Bench Press", sets: 4, reps: 10, icon: "💪" },
];

// Weight loss routine recommendation
const WEIGHT_LOSS_ROUTINE = [
  { day: "Monday", focus: "Cardio + Core", exercises: ["30 min Jogging", "3×20 Crunches", "3×15 Mountain Climbers", "3×30s Plank", "3×20 Jumping Jacks"] },
  { day: "Tuesday", focus: "Upper Body HIIT", exercises: ["3×15 Push-ups", "3×12 Burpees", "3×15 Dumbbell Rows", "3×30s Battle Rope", "3×15 Tricep Dips"] },
  { day: "Wednesday", focus: "Active Recovery", exercises: ["20 min Brisk Walk", "15 min Stretching", "Yoga Flow 20 min", "Foam Rolling 10 min"] },
  { day: "Thursday", focus: "Lower Body HIIT", exercises: ["3×20 Squats", "3×15 Lunges", "3×20 Jump Squats", "3×15 Calf Raises", "3×30s Wall Sit"] },
  { day: "Friday", focus: "Full Body Circuit", exercises: ["4×15 Burpees", "4×10 Pull-ups", "4×15 Push-ups", "4×20 Squats", "4×30s Plank"] },
  { day: "Saturday", focus: "Cardio Endurance", exercises: ["45 min Cycling / Swimming", "3×15 Step-ups", "3×20 High Knees", "3×15 Box Jumps"] },
  { day: "Sunday", focus: "Rest & Recovery", exercises: ["Light Stretching 15 min", "Walk 20 min", "Meditation"] },
];

// Weight gain routine recommendation
const WEIGHT_GAIN_ROUTINE = [
  { day: "Monday", focus: "Chest + Triceps", exercises: ["4×8 Bench Press", "4×10 Incline Dumbbell Press", "3×12 Cable Flyes", "3×10 Skull Crushers", "3×12 Tricep Pushdown"] },
  { day: "Tuesday", focus: "Back + Biceps", exercises: ["4×8 Deadlift", "4×10 Barbell Rows", "3×12 Lat Pulldown", "3×12 Barbell Curls", "3×10 Hammer Curls"] },
  { day: "Wednesday", focus: "Rest / Light Cardio", exercises: ["20 min Light Walk", "Stretching 15 min"] },
  { day: "Thursday", focus: "Shoulders + Abs", exercises: ["4×8 Overhead Press", "4×10 Lateral Raises", "3×12 Face Pulls", "3×15 Cable Crunches", "3×30s Plank"] },
  { day: "Friday", focus: "Legs", exercises: ["4×8 Barbell Squats", "4×10 Leg Press", "3×12 Romanian Deadlift", "3×15 Leg Curls", "4×12 Calf Raises"] },
  { day: "Saturday", focus: "Full Body Power", exercises: ["3×5 Power Cleans", "3×8 Weighted Pull-ups", "3×8 Weighted Dips", "3×10 Front Squats", "3×12 Farmer's Walk"] },
  { day: "Sunday", focus: "Rest & Recovery", exercises: ["Light Stretching 15 min", "Foam Rolling 10 min"] },
];

function getTodayDayOfWeek(): number {
  return new Date().getDay();
}

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

function getWeekDates(): string[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dayOfWeek);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

// Staggered animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

// Questionnaire step type
interface QuestionnaireData {
  name: string;
  age: string;
  gender: "male" | "female" | "";
  weight: string;
  height: string;
  activityLevel: FitnessProfile["activityLevel"] | "";
  goal: FitnessProfile["goal"] | "";
}

const INITIAL_QUESTIONNAIRE: QuestionnaireData = {
  name: "",
  age: "",
  gender: "",
  weight: "",
  height: "",
  activityLevel: "",
  goal: "",
};

const ACTIVITY_OPTIONS: { value: FitnessProfile["activityLevel"]; label: string; desc: string }[] = [
  { value: "sedentary", label: "Sedentary", desc: "Little or no exercise, desk job" },
  { value: "light", label: "Lightly Active", desc: "Light exercise 1-3 days/week" },
  { value: "moderate", label: "Moderately Active", desc: "Moderate exercise 3-5 days/week" },
  { value: "active", label: "Very Active", desc: "Hard exercise 6-7 days/week" },
  { value: "very_active", label: "Extra Active", desc: "Very hard exercise, physical job" },
];

const TOTAL_STEPS = 4;

export function GymRoutineSection() {
  const {
    gymExercises,
    gymLogs,
    addGymExercise,
    toggleGymExercise,
    deleteGymExercise,
    toggleGymLog,
    fitnessProfile,
    saveFitnessProfile,
    clearFitnessProfile,
  } = useVireonStore();

  const today = getTodayDayOfWeek();
  const [selectedDay, setSelectedDay] = useState<string>(DAYS_OF_WEEK[today]);
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseSets, setExerciseSets] = useState("3");
  const [exerciseReps, setExerciseReps] = useState("10");
  const [exerciseDay, setExerciseDay] = useState<string>(DAYS_OF_WEEK[today]);

  // Questionnaire state
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData>(INITIAL_QUESTIONNAIRE);
  const [step, setStep] = useState(0);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  // Get exercises for the selected day
  const selectedDayIndex = DAYS_OF_WEEK.indexOf(selectedDay);
  const dayExercises = useMemo(
    () => gymExercises.filter((e) => e.dayOfWeek === selectedDayIndex),
    [gymExercises, selectedDayIndex]
  );

  // Weekly consistency data
  const weekDates = useMemo(() => getWeekDates(), []);
  const completedDaysCount = weekDates.filter(
    (date) => gymLogs[date]
  ).length;

  // Check if today is already logged
  const todayStr = getTodayDateString();
  const isTodayLogged = gymLogs[todayStr] || false;

  // Handle add exercise
  const handleAddExercise = () => {
    const name = exerciseName.trim();
    if (!name) return;
    const dayIndex = DAYS_OF_WEEK.indexOf(exerciseDay);
    addGymExercise({
      name,
      sets: parseInt(exerciseSets) || 3,
      reps: parseInt(exerciseReps) || 10,
      dayOfWeek: dayIndex,
      completed: false,
    });
    setExerciseName("");
    setExerciseSets("3");
    setExerciseReps("10");
  };

  // Handle quick preset add
  const handlePresetAdd = (preset: (typeof EXERCISE_PRESETS)[number]) => {
    const dayIndex = DAYS_OF_WEEK.indexOf(exerciseDay);
    addGymExercise({
      name: preset.name,
      sets: preset.sets,
      reps: preset.reps,
      dayOfWeek: dayIndex,
      completed: false,
    });
  };

  // Handle mark day complete
  const handleMarkDayComplete = () => {
    toggleGymLog(todayStr);
  };

  // Stats
  const totalExercisesToday = gymExercises.filter(
    (e) => e.dayOfWeek === today
  ).length;
  const completedExercisesToday = gymExercises.filter(
    (e) => e.dayOfWeek === today && e.completed
  ).length;

  // Questionnaire handlers
  const handleQChange = (field: keyof QuestionnaireData, value: string) => {
    setQuestionnaire((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 0:
        return questionnaire.name.trim() !== "" && questionnaire.age !== "" && parseInt(questionnaire.age) > 0;
      case 1:
        return questionnaire.gender !== "" && questionnaire.weight !== "" && questionnaire.height !== "" && parseFloat(questionnaire.weight) > 0 && parseFloat(questionnaire.height) > 0;
      case 2:
        return questionnaire.activityLevel !== "";
      case 3:
        return questionnaire.goal !== "";
      default:
        return false;
    }
  };

  const handleSubmitQuestionnaire = () => {
    if (!canProceed()) return;
    saveFitnessProfile({
      name: questionnaire.name.trim(),
      age: parseInt(questionnaire.age),
      gender: questionnaire.gender as "male" | "female",
      weight: parseFloat(questionnaire.weight),
      height: parseFloat(questionnaire.height),
      activityLevel: questionnaire.activityLevel as FitnessProfile["activityLevel"],
      goal: questionnaire.goal as FitnessProfile["goal"],
    });
    setShowQuestionnaire(false);
  };

  const handleStartQuestionnaire = () => {
    if (fitnessProfile) {
      setQuestionnaire({
        name: fitnessProfile.name,
        age: String(fitnessProfile.age),
        gender: fitnessProfile.gender,
        weight: String(fitnessProfile.weight),
        height: String(fitnessProfile.height),
        activityLevel: fitnessProfile.activityLevel,
        goal: fitnessProfile.goal,
      });
    } else {
      setQuestionnaire(INITIAL_QUESTIONNAIRE);
    }
    setStep(0);
    setShowQuestionnaire(true);
  };

  const recommendedRoutine = fitnessProfile?.goal === "lose" ? WEIGHT_LOSS_ROUTINE : WEIGHT_GAIN_ROUTINE;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-start gap-4"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0"
        >
          <Dumbbell size={28} />
        </motion.div>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Gym Routine
          </h2>
          <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1.5">
            <Heart size={14} className="text-emerald-500" />
            Stay fit, code better
          </p>
        </div>
      </motion.div>

      {/* Quick Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <Card className="py-3">
          <CardContent className="flex items-center gap-3 px-4">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Activity size={18} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Today&apos;s Exercises</p>
              <p className="text-lg font-bold">{totalExercisesToday}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardContent className="flex items-center gap-3 px-4">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Check size={18} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-lg font-bold">{completedExercisesToday}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardContent className="flex items-center gap-3 px-4">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Flame size={18} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">This Week</p>
              <p className="text-lg font-bold">{completedDaysCount}/7</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardContent className="flex items-center gap-3 px-4">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Trophy size={18} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Streak</p>
              <p className="text-lg font-bold">
                {completedDaysCount > 0 ? `${completedDaysCount} day${completedDaysCount > 1 ? "s" : ""}` : "—"}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Consistency Tracker */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Timer size={16} className="text-emerald-500" />
              Weekly Consistency
            </CardTitle>
            <CardDescription>
              {completedDaysCount}/7 days this week •{" "}
              {Math.round((completedDaysCount / 7) * 100)}% consistency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {weekDates.map((date, i) => {
                const isCompleted = gymLogs[date];
                const isCurrentDay = date === todayStr;
                const dayLabel = DAYS_OF_WEEK[i].slice(0, 3);
                const dateObj = new Date(date + "T00:00:00");
                const dateNum = dateObj.getDate();

                return (
                  <motion.div
                    key={date}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.05 * i, duration: 0.3 }}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300",
                      isCompleted
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : isCurrentDay
                        ? "bg-primary/5 border border-primary/20 text-foreground"
                        : "bg-muted/50 text-muted-foreground border border-transparent"
                    )}
                  >
                    <span className="text-[10px] font-medium uppercase tracking-wider">
                      {dayLabel}
                    </span>
                    <motion.div
                      initial={false}
                      animate={{ scale: isCompleted ? 1 : 0.85 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                        isCompleted
                          ? "bg-emerald-500 text-white"
                          : isCurrentDay
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <Check size={14} />
                      ) : (
                        dateNum
                      )}
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
            {/* Progress bar */}
            <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(completedDaysCount / 7) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Mark Day Complete */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={handleMarkDayComplete}
            variant={isTodayLogged ? "default" : "outline"}
            className={cn(
              "w-full h-12 text-base font-semibold transition-all duration-300 gap-2",
              isTodayLogged
                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                : "border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
            )}
          >
            <AnimatePresence mode="wait">
              {isTodayLogged ? (
                <motion.span
                  key="done"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex items-center gap-2"
                >
                  <Check size={20} />
                  Workout Logged Today!
                </motion.span>
              ) : (
                <motion.span
                  key="mark"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Flame size={20} />
                  Mark Today&apos;s Workout Complete
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </motion.div>

      {/* Day Tabs + Exercise List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell size={18} className="text-emerald-500" />
              Exercises by Day
            </CardTitle>
            <CardDescription>
              Plan your weekly workout schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={selectedDay}
              onValueChange={setSelectedDay}
              className="w-full"
            >
              <TabsList className="w-full flex overflow-x-auto mb-4 h-auto p-1 gap-0.5">
                {DAYS_OF_WEEK.map((day, i) => {
                  const exerciseCount = gymExercises.filter(
                    (e) => e.dayOfWeek === i
                  ).length;
                  const isToday = i === today;

                  return (
                    <TabsTrigger
                      key={day}
                      value={day}
                      className={cn(
                        "flex-1 min-w-[60px] px-1.5 py-2 text-xs md:text-sm flex-col gap-0.5 h-auto relative",
                        isToday && "ring-1 ring-emerald-500/50"
                      )}
                    >
                      <span className="font-medium">{day.slice(0, 3)}</span>
                      {exerciseCount > 0 && (
                        <Badge
                          variant="secondary"
                          className="h-4 min-w-4 px-1 text-[10px]"
                        >
                          {exerciseCount}
                        </Badge>
                      )}
                      {isToday && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {DAYS_OF_WEEK.map((day) => (
                <TabsContent key={day} value={day}>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-2"
                  >
                    <AnimatePresence>
                      {gymExercises
                        .filter(
                          (e) => e.dayOfWeek === DAYS_OF_WEEK.indexOf(day)
                        )
                        .length === 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col items-center justify-center py-8 text-muted-foreground"
                        >
                          <Circle size={32} className="mb-2 opacity-30" />
                          <p className="text-sm">No exercises planned</p>
                          <p className="text-xs mt-1">
                            Add exercises or use quick presets below
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {gymExercises
                        .filter(
                          (e) => e.dayOfWeek === DAYS_OF_WEEK.indexOf(day)
                        )
                        .map((exercise) => (
                          <ExerciseCard
                            key={exercise.id}
                            exercise={exercise}
                            onToggle={toggleGymExercise}
                            onDelete={deleteGymExercise}
                          />
                        ))}
                    </AnimatePresence>
                  </motion.div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Exercise Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus size={18} className="text-emerald-500" />
              Add Exercise
            </CardTitle>
            <CardDescription>
              Create a custom exercise for your routine
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                  Exercise Name
                </label>
                <Input
                  placeholder="e.g. Push-ups"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddExercise()}
                  className="h-10"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                  Sets
                </label>
                <Input
                  type="number"
                  min={1}
                  max={99}
                  value={exerciseSets}
                  onChange={(e) => setExerciseSets(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddExercise()}
                  className="h-10"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                  Reps
                </label>
                <Input
                  type="number"
                  min={1}
                  max={999}
                  value={exerciseReps}
                  onChange={(e) => setExerciseReps(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddExercise()}
                  className="h-10"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                  Day
                </label>
                <select
                  value={exerciseDay}
                  onChange={(e) => setExerciseDay(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30"
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full"
                >
                  <Button
                    onClick={handleAddExercise}
                    disabled={!exerciseName.trim()}
                    className="w-full h-10 bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 disabled:opacity-50"
                  >
                    <Plus size={16} />
                    Add
                  </Button>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Presets */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame size={18} className="text-emerald-500" />
              Quick Presets
            </CardTitle>
            <CardDescription>
              Tap to add common exercises to{" "}
              <span className="font-medium text-foreground">{exerciseDay}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {EXERCISE_PRESETS.map((preset, i) => (
                <motion.button
                  key={preset.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.04 * i }}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handlePresetAdd(preset)}
                  className={cn(
                    "flex items-center gap-2.5 p-3 rounded-xl border text-left",
                    "bg-card hover:bg-emerald-500/5 border-border hover:border-emerald-500/30",
                    "transition-all duration-200 group"
                  )}
                >
                  <span className="text-lg shrink-0">{preset.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {preset.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {preset.sets}×{preset.reps}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== FITNESS PROFILE QUESTIONNAIRE ===== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Calculator size={20} className="text-emerald-500" />
          <h2 className="text-lg font-semibold">Fitness Profile &amp; Calorie Calculator</h2>
        </div>

        {!fitnessProfile && !showQuestionnaire && (
          <Card className="border-dashed border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent">
            <CardContent className="py-10">
              <div className="flex flex-col items-center gap-4 text-center">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="p-4 rounded-2xl bg-emerald-500/10"
                >
                  <Calculator size={36} className="text-emerald-500" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Get Your Personalized Plan</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Answer a few questions about yourself to get a customized workout routine
                    and daily calorie target for weight loss or muscle gain.
                  </p>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    onClick={handleStartQuestionnaire}
                    className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                  >
                    <User size={18} />
                    Start Questionnaire
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Multi-step Questionnaire */}
        <AnimatePresence mode="wait">
          {showQuestionnaire && (
            <motion.div
              key="questionnaire"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-emerald-500/20 overflow-hidden">
                {/* Step progress bar */}
                <div className="h-1.5 bg-muted">
                  <motion.div
                    animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <User size={18} className="text-emerald-500" />
                      Step {step + 1} of {TOTAL_STEPS}
                    </CardTitle>
                    <Badge variant="outline" className="text-emerald-600 border-emerald-500/30">
                      {step === 0 && "Personal Info"}
                      {step === 1 && "Body Metrics"}
                      {step === 2 && "Activity Level"}
                      {step === 3 && "Your Goal"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <AnimatePresence mode="wait">
                    {/* Step 0: Personal Info */}
                    {step === 0 && (
                      <motion.div
                        key="step0"
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-5"
                      >
                        <div className="space-y-2">
                          <Label className="flex items-center gap-1.5">
                            <User size={14} /> Your Name
                          </Label>
                          <Input
                            placeholder="Enter your name"
                            value={questionnaire.name}
                            onChange={(e) => handleQChange("name", e.target.value)}
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-1.5">
                            <Timer size={14} /> Age
                          </Label>
                          <Input
                            type="number"
                            placeholder="e.g. 21"
                            min={10}
                            max={100}
                            value={questionnaire.age}
                            onChange={(e) => handleQChange("age", e.target.value)}
                            className="h-11"
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Step 1: Body Metrics */}
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-5"
                      >
                        <div className="space-y-3">
                          <Label className="flex items-center gap-1.5">
                            <User size={14} /> Gender
                          </Label>
                          <div className="grid grid-cols-2 gap-3">
                            {(["male", "female"] as const).map((g) => (
                              <motion.button
                                key={g}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleQChange("gender", g)}
                                className={cn(
                                  "p-4 rounded-xl border-2 text-center font-medium transition-all duration-200",
                                  questionnaire.gender === g
                                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                    : "border-border hover:border-emerald-500/30 text-muted-foreground"
                                )}
                              >
                                <span className="text-2xl block mb-1">{g === "male" ? "♂" : "♀"}</span>
                                <span className="text-sm">{g === "male" ? "Male" : "Female"}</span>
                              </motion.button>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="flex items-center gap-1.5">
                              <Weight size={14} /> Weight (kg)
                            </Label>
                            <Input
                              type="number"
                              placeholder="e.g. 70"
                              min={20}
                              max={300}
                              value={questionnaire.weight}
                              onChange={(e) => handleQChange("weight", e.target.value)}
                              className="h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="flex items-center gap-1.5">
                              <Ruler size={14} /> Height (cm)
                            </Label>
                            <Input
                              type="number"
                              placeholder="e.g. 170"
                              min={100}
                              max={250}
                              value={questionnaire.height}
                              onChange={(e) => handleQChange("height", e.target.value)}
                              className="h-11"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Activity Level */}
                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-3"
                      >
                        <Label className="flex items-center gap-1.5 mb-2">
                          <Activity size={14} /> How active are you?
                        </Label>
                        {ACTIVITY_OPTIONS.map((opt, i) => (
                          <motion.button
                            key={opt.value}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            whileHover={{ scale: 1.01, x: 4 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleQChange("activityLevel", opt.value)}
                            className={cn(
                              "w-full p-3.5 rounded-xl border-2 text-left transition-all duration-200",
                              questionnaire.activityLevel === opt.value
                                ? "border-emerald-500 bg-emerald-500/10"
                                : "border-border hover:border-emerald-500/30"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className={cn(
                                  "text-sm font-semibold",
                                  questionnaire.activityLevel === opt.value
                                    ? "text-emerald-700 dark:text-emerald-400"
                                    : "text-foreground"
                                )}>
                                  {opt.label}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {opt.desc}
                                </p>
                              </div>
                              {questionnaire.activityLevel === opt.value && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                >
                                  <Check size={18} className="text-emerald-500" />
                                </motion.div>
                              )}
                            </div>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}

                    {/* Step 3: Goal */}
                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-4"
                      >
                        <Label className="flex items-center gap-1.5 mb-2">
                          <Target size={14} /> What is your fitness goal?
                        </Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Weight Loss Card */}
                          <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleQChange("goal", "lose")}
                            className={cn(
                              "p-5 rounded-2xl border-2 text-left transition-all duration-200",
                              questionnaire.goal === "lose"
                                ? "border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/10"
                                : "border-border hover:border-orange-500/30"
                            )}
                          >
                            <div className="text-3xl mb-3">🔥</div>
                            <h3 className={cn(
                              "text-base font-bold mb-1",
                              questionnaire.goal === "lose"
                                ? "text-orange-700 dark:text-orange-400"
                                : "text-foreground"
                            )}>
                              Weight Loss
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Burn fat, get lean. Calorie deficit with high-protein diet and
                              cardio-focused workout plan. Target: ~0.5 kg/week loss.
                            </p>
                            {questionnaire.goal === "lose" && (
                              <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-3 flex items-center gap-1.5 text-xs font-medium text-orange-600 dark:text-orange-400"
                              >
                                <Check size={14} /> Selected
                              </motion.div>
                            )}
                          </motion.button>

                          {/* Weight Gain Card */}
                          <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleQChange("goal", "gain")}
                            className={cn(
                              "p-5 rounded-2xl border-2 text-left transition-all duration-200",
                              questionnaire.goal === "gain"
                                ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                                : "border-border hover:border-emerald-500/30"
                            )}
                          >
                            <div className="text-3xl mb-3">💪</div>
                            <h3 className={cn(
                              "text-base font-bold mb-1",
                              questionnaire.goal === "gain"
                                ? "text-emerald-700 dark:text-emerald-400"
                                : "text-foreground"
                            )}>
                              Muscle Gain
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Build muscle, get stronger. Calorie surplus with high-carb diet and
                              progressive overload training. Target: ~0.5 kg/week gain.
                            </p>
                            {questionnaire.goal === "gain" && (
                              <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                              >
                                <Check size={14} /> Selected
                              </motion.div>
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Navigation buttons */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        if (step > 0) {
                          setStep(step - 1);
                        } else {
                          setShowQuestionnaire(false);
                        }
                      }}
                      className="gap-1"
                    >
                      <ChevronLeft size={16} />
                      {step === 0 ? "Cancel" : "Back"}
                    </Button>
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-2 h-2 rounded-full transition-all duration-300",
                            i === step
                              ? "bg-emerald-500 w-6"
                              : i < step
                              ? "bg-emerald-500/50"
                              : "bg-muted-foreground/20"
                          )}
                        />
                      ))}
                    </div>
                    {step < TOTAL_STEPS - 1 ? (
                      <Button
                        onClick={() => setStep(step + 1)}
                        disabled={!canProceed()}
                        className="gap-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        Next
                        <ChevronRight size={16} />
                      </Button>
                    ) : (
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Button
                          onClick={handleSubmitQuestionnaire}
                          disabled={!canProceed()}
                          className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                        >
                          <Calculator size={16} />
                          Calculate My Plan
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== FITNESS RESULTS ===== */}
        {fitnessProfile && !showQuestionnaire && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-5"
          >
            {/* Summary Header */}
            <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-600" />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User size={18} className="text-emerald-500" />
                    {fitnessProfile.name}&apos;s Fitness Plan
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={cn(
                      "text-xs",
                      fitnessProfile.goal === "lose"
                        ? "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/20"
                        : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                    )}>
                      {fitnessProfile.goal === "lose" ? "🔥 Weight Loss" : "💪 Muscle Gain"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleStartQuestionnaire}
                      aria-label="Edit profile"
                    >
                      <RotateCcw size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={clearFitnessProfile}
                      aria-label="Clear profile"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="text-center p-3 rounded-xl bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Age</p>
                    <p className="text-lg font-bold">{fitnessProfile.age}</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Weight</p>
                    <p className="text-lg font-bold">{fitnessProfile.weight} <span className="text-xs font-normal text-muted-foreground">kg</span></p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Height</p>
                    <p className="text-lg font-bold">{fitnessProfile.height} <span className="text-xs font-normal text-muted-foreground">cm</span></p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Activity</p>
                    <p className="text-sm font-bold capitalize">{fitnessProfile.activityLevel.replace("_", " ")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calorie & Macro Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* BMR Card */}
              <motion.div whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2 }}>
                <Card className="h-full">
                  <CardContent className="pt-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
                        <Heart size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Basal Metabolic Rate</p>
                        <p className="text-2xl font-bold">{fitnessProfile.bmr}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Calories your body burns at complete rest (Mifflin-St Jeor equation)
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* TDEE Card */}
              <motion.div whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2 }}>
                <Card className="h-full">
                  <CardContent className="pt-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                        <Flame size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Daily Expenditure</p>
                        <p className="text-2xl font-bold">{fitnessProfile.tdee}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      BMR × activity level = total calories you burn per day
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Daily Calorie Target */}
              <motion.div whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2 }}>
                <Card className={cn(
                  "h-full border-2",
                  fitnessProfile.goal === "lose"
                    ? "border-orange-500/30 bg-orange-500/5"
                    : "border-emerald-500/30 bg-emerald-500/5"
                )}>
                  <CardContent className="pt-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn(
                        "p-2.5 rounded-xl",
                        fitnessProfile.goal === "lose"
                          ? "bg-orange-500/10 text-orange-500"
                          : "bg-emerald-500/10 text-emerald-500"
                      )}>
                        <Target size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Daily Calorie Target</p>
                        <p className="text-2xl font-bold">{fitnessProfile.dailyCalories}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {fitnessProfile.goal === "lose"
                        ? `TDEE − 500 = deficit for ~0.5 kg/week loss`
                        : `TDEE + 500 = surplus for ~0.5 kg/week gain`}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Macros Breakdown */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Utensils size={16} className="text-emerald-500" />
                  Daily Macro Targets
                </CardTitle>
                <CardDescription>
                  {fitnessProfile.goal === "lose"
                    ? "High-protein split: 40% protein, 30% carbs, 30% fat"
                    : "Muscle-building split: 30% protein, 45% carbs, 25% fat"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {/* Protein */}
                  <div className="text-center">
                    <div className="p-3 rounded-2xl bg-rose-500/10 mb-2">
                      <Beef size={24} className="mx-auto text-rose-500" />
                    </div>
                    <p className="text-xl font-bold">{fitnessProfile.proteinG}g</p>
                    <p className="text-xs text-muted-foreground">Protein</p>
                    <p className="text-[10px] text-muted-foreground">{Math.round(fitnessProfile.proteinG * 4)} cal</p>
                    <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-rose-500"
                        style={{ width: `${fitnessProfile.goal === "lose" ? 40 : 30}%` }}
                      />
                    </div>
                  </div>
                  {/* Carbs */}
                  <div className="text-center">
                    <div className="p-3 rounded-2xl bg-amber-500/10 mb-2">
                      <Wheat size={24} className="mx-auto text-amber-500" />
                    </div>
                    <p className="text-xl font-bold">{fitnessProfile.carbG}g</p>
                    <p className="text-xs text-muted-foreground">Carbs</p>
                    <p className="text-[10px] text-muted-foreground">{Math.round(fitnessProfile.carbG * 4)} cal</p>
                    <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-500"
                        style={{ width: `${fitnessProfile.goal === "lose" ? 30 : 45}%` }}
                      />
                    </div>
                  </div>
                  {/* Fat */}
                  <div className="text-center">
                    <div className="p-3 rounded-2xl bg-sky-500/10 mb-2">
                      <Droplets size={24} className="mx-auto text-sky-500" />
                    </div>
                    <p className="text-xl font-bold">{fitnessProfile.fatG}g</p>
                    <p className="text-xs text-muted-foreground">Fat</p>
                    <p className="text-[10px] text-muted-foreground">{Math.round(fitnessProfile.fatG * 9)} cal</p>
                    <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-sky-500"
                        style={{ width: `${fitnessProfile.goal === "lose" ? 30 : 25}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommended Weekly Routine */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {fitnessProfile.goal === "lose" ? (
                    <Flame size={18} className="text-orange-500" />
                  ) : (
                    <Dumbbell size={18} className="text-emerald-500" />
                  )}
                  Recommended {fitnessProfile.goal === "lose" ? "Fat Loss" : "Muscle Gain"} Routine
                </CardTitle>
                <CardDescription>
                  Weekly plan tailored for {fitnessProfile.goal === "lose" ? "cutting" : "bulking"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {recommendedRoutine.map((dayPlan, i) => {
                    const isCurrentDay = DAYS_OF_WEEK[today] === dayPlan.day;
                    return (
                      <motion.div
                        key={dayPlan.day}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={cn(
                          "p-3.5 rounded-xl border transition-all duration-200",
                          isCurrentDay
                            ? "border-emerald-500/30 bg-emerald-500/5"
                            : "border-border bg-card hover:border-emerald-500/20"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">{dayPlan.day}</span>
                            {isCurrentDay && (
                              <Badge variant="default" className="text-[9px] px-1.5 py-0 bg-emerald-500">
                                Today
                              </Badge>
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px]",
                              fitnessProfile.goal === "lose"
                                ? "border-orange-500/30 text-orange-600 dark:text-orange-400"
                                : "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                            )}
                          >
                            {dayPlan.focus}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {dayPlan.exercises.map((ex) => (
                            <span
                              key={ex}
                              className="text-[11px] px-2 py-1 rounded-md bg-muted/60 text-muted-foreground"
                            >
                              {ex}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Food Tips */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Salad size={16} className="text-emerald-500" />
                  {fitnessProfile.goal === "lose" ? "Fat Loss" : "Muscle Gain"} Nutrition Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {fitnessProfile.goal === "lose" ? (
                    <>
                      <TipCard emoji="🥗" title="Prioritize Protein" desc="Chicken breast, eggs, fish, Greek yogurt — keeps you full longer" />
                      <TipCard emoji="🥦" title="Load Up on Veggies" desc="Fill half your plate with vegetables for volume & fiber" />
                      <TipCard emoji="🍚" title="Smart Carbs Only" desc="Brown rice, sweet potato, oats — avoid refined carbs & sugar" />
                      <TipCard emoji="💧" title="Drink More Water" desc="2-3L daily. Often thirst is mistaken for hunger" />
                    </>
                  ) : (
                    <>
                      <TipCard emoji="🥩" title="Protein Every Meal" desc="Aim 30-40g protein per meal: chicken, beef, eggs, lentils" />
                      <TipCard emoji="🍝" title="Carbs Are Fuel" desc="Rice, pasta, oats, potatoes — fuel your workouts & recovery" />
                      <TipCard emoji="🥜" title="Healthy Fats" desc="Peanut butter, almonds, avocado, olive oil — calorie-dense & essential" />
                      <TipCard emoji="🥛" title="Eat Frequently" desc="5-6 meals/day. Never skip breakfast. Add a mass gainer shake" />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// Individual exercise card component
function ExerciseCard({
  exercise,
  onToggle,
  onDelete,
}: {
  exercise: GymExercise;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <motion.div
      variants={itemVariants}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ duration: 0.25 }}
    >
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-xl border transition-all duration-300",
          exercise.completed
            ? "bg-emerald-500/5 border-emerald-500/20 dark:bg-emerald-500/10"
            : "bg-card border-border hover:border-emerald-500/20"
        )}
      >
        <Checkbox
          checked={exercise.completed}
          onCheckedChange={() => onToggle(exercise.id)}
          className={cn(
            "shrink-0",
            exercise.completed &&
              "data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
          )}
        />
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm font-medium transition-all duration-300",
              exercise.completed
                ? "line-through text-emerald-600/60 dark:text-emerald-400/60"
                : "text-foreground"
            )}
          >
            {exercise.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            <span className="inline-flex items-center gap-1">
              <Timer size={10} />
              {exercise.sets} sets × {exercise.reps} reps
            </span>
          </p>
        </div>
        {exercise.completed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">
              <Check size={10} />
              Done
            </Badge>
          </motion.div>
        )}
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(exercise.id)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
          >
            <Trash2 size={14} />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Nutrition tip card
function TipCard({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
      <span className="text-xl shrink-0">{emoji}</span>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
