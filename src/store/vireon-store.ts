import { create } from "zustand";
import { persist } from "zustand/middleware";

// Types
export interface StudyTask {
  id: string;
  subject: string;
  title: string;
  description?: string;
  dayOfWeek: number;
  completed: boolean;
}

export interface DailyGoal {
  id: string;
  title: string;
  completed: boolean;
  date: string;
}

export interface GymExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  completed: boolean;
  dayOfWeek: number;
}

export interface CodeSnippet {
  id: string;
  title: string;
  language: string;
  code: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface FitnessProfile {
  name: string;
  age: number;
  gender: "male" | "female";
  weight: number; // kg
  height: number; // cm
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal: "lose" | "gain";
  // Calculated fields
  bmr: number;
  tdee: number;
  dailyCalories: number;
  proteinG: number;
  carbG: number;
  fatG: number;
}

export type ActiveSection =
  | "dashboard"
  | "study"
  | "goals"
  | "gym"
  | "compiler"
  | "helper";

export const SUBJECTS = [
  "Data Structures",
  "Algorithms",
  "Operating Systems",
  "Database Systems",
  "Networking",
  "Programming Languages",
] as const;

export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const MOTIVATIONAL_QUOTES = {
  morning: [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Every expert was once a beginner. Start your grind today.", author: "Unknown" },
    { text: "Code is poetry. Write yours beautifully today.", author: "Unknown" },
    { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
    { text: "Your limitation—it's only your imagination.", author: "Unknown" },
  ],
  day: [
    { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
    { text: "Programming is not about typing, it's about thinking.", author: "Unknown" },
    { text: "The function of good software is to make the complex appear to be simple.", author: "Grady Booch" },
    { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
    { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
    { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
    { text: "Consistency beats intensity. Keep pushing.", author: "Unknown" },
  ],
  night: [
    { text: "The best error message is the one that never shows up.", author: "Thomas Fuchs" },
    { text: "Debugging is twice as hard as writing the code in the first place.", author: "Brian Kernighan" },
    { text: "Reflect on what you learned today. Tomorrow, be better.", author: "Unknown" },
    { text: "Every bug you find is a lesson you learn.", author: "Unknown" },
    { text: "Sleep is not the enemy of productivity. It's the fuel.", author: "Unknown" },
    { text: "Today's struggles are tomorrow's strengths.", author: "Unknown" },
    { text: "Rest well. The code will still be there tomorrow.", author: "Unknown" },
  ],
};

function getTodaysDate(): string {
  return new Date().toISOString().split("T")[0];
}

function getTimeCategory(): "morning" | "day" | "night" {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "day";
  return "night";
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

interface VireonState {
  // Navigation
  activeSection: ActiveSection;
  sidebarOpen: boolean;
  setActiveSection: (section: ActiveSection) => void;
  setSidebarOpen: (open: boolean) => void;

  // Study Planner
  studyTasks: StudyTask[];
  addStudyTask: (task: Omit<StudyTask, "id">) => void;
  toggleStudyTask: (id: string) => void;
  deleteStudyTask: (id: string) => void;

  // Daily Goals
  dailyGoals: DailyGoal[];
  streakCount: number;
  lastGoalDate: string;
  addDailyGoal: (title: string) => void;
  toggleDailyGoal: (id: string) => void;
  deleteDailyGoal: (id: string) => void;
  calculateStreak: () => void;

  // Gym
  gymExercises: GymExercise[];
  gymLogs: Record<string, boolean>;
  addGymExercise: (exercise: Omit<GymExercise, "id">) => void;
  toggleGymExercise: (id: string) => void;
  deleteGymExercise: (id: string) => void;
  toggleGymLog: (date: string) => void;

  // Code Snippets
  codeSnippets: CodeSnippet[];
  saveCodeSnippet: (snippet: Omit<CodeSnippet, "id">) => void;
  deleteCodeSnippet: (id: string) => void;

  // Chat
  chatHistory: ChatMessage[];
  addChatMessage: (role: "user" | "assistant", content: string) => void;
  clearChatHistory: () => void;

  // Fitness Profile
  fitnessProfile: FitnessProfile | null;
  saveFitnessProfile: (profile: Omit<FitnessProfile, "bmr" | "tdee" | "dailyCalories" | "proteinG" | "carbG" | "fatG">) => void;
  clearFitnessProfile: () => void;

  // Motivation
  currentQuote: { text: string; author: string };
  refreshQuote: () => void;
}

export const useVireonStore = create<VireonState>()(
  persist(
    (set, get) => ({
      // Navigation
      activeSection: "dashboard",
      sidebarOpen: false,
      setActiveSection: (section) => set({ activeSection: section }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Study Planner
      studyTasks: [],
      addStudyTask: (task) =>
        set((state) => ({
          studyTasks: [...state.studyTasks, { ...task, id: generateId() }],
        })),
      toggleStudyTask: (id) =>
        set((state) => ({
          studyTasks: state.studyTasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        })),
      deleteStudyTask: (id) =>
        set((state) => ({
          studyTasks: state.studyTasks.filter((t) => t.id !== id),
        })),

      // Daily Goals
      dailyGoals: [],
      streakCount: 0,
      lastGoalDate: "",
      addDailyGoal: (title) => {
        const today = getTodaysDate();
        const state = get();
        const todayGoals = state.dailyGoals.filter((g) => g.date === today);
        if (todayGoals.length >= 3) return; // Max 3 goals per day
        set((state) => ({
          dailyGoals: [
            ...state.dailyGoals,
            { id: generateId(), title, completed: false, date: today },
          ],
        }));
      },
      toggleDailyGoal: (id) =>
        set((state) => {
          const updated = state.dailyGoals.map((g) =>
            g.id === id ? { ...g, completed: !g.completed } : g
          );
          return { dailyGoals: updated };
        }),
      deleteDailyGoal: (id) =>
        set((state) => ({
          dailyGoals: state.dailyGoals.filter((g) => g.id !== id),
        })),
      calculateStreak: () => {
        const state = get();
        const today = getTodaysDate();
        const todayGoals = state.dailyGoals.filter((g) => g.date === today);
        const allCompleted = todayGoals.length > 0 && todayGoals.every((g) => g.completed);
        
        if (allCompleted && state.lastGoalDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];
          
          const newStreak = state.lastGoalDate === yesterdayStr 
            ? state.streakCount + 1 
            : 1;
          set({ streakCount: newStreak, lastGoalDate: today });
        }
      },

      // Gym
      gymExercises: [],
      gymLogs: {},
      addGymExercise: (exercise) =>
        set((state) => ({
          gymExercises: [...state.gymExercises, { ...exercise, id: generateId() }],
        })),
      toggleGymExercise: (id) =>
        set((state) => ({
          gymExercises: state.gymExercises.map((e) =>
            e.id === id ? { ...e, completed: !e.completed } : e
          ),
        })),
      deleteGymExercise: (id) =>
        set((state) => ({
          gymExercises: state.gymExercises.filter((e) => e.id !== id),
        })),
      toggleGymLog: (date) =>
        set((state) => ({
          gymLogs: {
            ...state.gymLogs,
            [date]: !state.gymLogs[date],
          },
        })),

      // Code Snippets
      codeSnippets: [],
      saveCodeSnippet: (snippet) =>
        set((state) => ({
          codeSnippets: [...state.codeSnippets, { ...snippet, id: generateId() }],
        })),
      deleteCodeSnippet: (id) =>
        set((state) => ({
          codeSnippets: state.codeSnippets.filter((s) => s.id !== id),
        })),

      // Chat
      chatHistory: [],
      addChatMessage: (role, content) =>
        set((state) => ({
          chatHistory: [
            ...state.chatHistory,
            { id: generateId(), role, content },
          ],
        })),
      clearChatHistory: () => set({ chatHistory: [] }),

      // Fitness Profile
      fitnessProfile: null,
      saveFitnessProfile: (profile) => {
        // Mifflin-St Jeor BMR
        let bmr: number;
        if (profile.gender === "male") {
          bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
        } else {
          bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
        }

        // Activity multipliers
        const activityMultipliers: Record<string, number> = {
          sedentary: 1.2,
          light: 1.375,
          moderate: 1.55,
          active: 1.725,
          very_active: 1.9,
        };
        const tdee = Math.round(bmr * (activityMultipliers[profile.activityLevel] || 1.2));

        // Calorie target: -500 for loss, +500 for gain
        const dailyCalories =
          profile.goal === "lose" ? tdee - 500 : tdee + 500;

        // Macro split
        // Lose: 40% protein, 30% carbs, 30% fat
        // Gain: 30% protein, 45% carbs, 25% fat
        const proteinPct = profile.goal === "lose" ? 0.4 : 0.3;
        const carbPct = profile.goal === "lose" ? 0.3 : 0.45;
        const fatPct = profile.goal === "lose" ? 0.3 : 0.25;

        const proteinG = Math.round((dailyCalories * proteinPct) / 4); // 4 cal/g
        const carbG = Math.round((dailyCalories * carbPct) / 4);       // 4 cal/g
        const fatG = Math.round((dailyCalories * fatPct) / 9);         // 9 cal/g

        set({
          fitnessProfile: {
            ...profile,
            bmr: Math.round(bmr),
            tdee,
            dailyCalories,
            proteinG,
            carbG,
            fatG,
          },
        });
      },
      clearFitnessProfile: () => set({ fitnessProfile: null }),

      // Motivation
      currentQuote: MOTIVATIONAL_QUOTES.morning[0],
      refreshQuote: () => {
        const category = getTimeCategory();
        const quotes = MOTIVATIONAL_QUOTES[category];
        const randomIndex = Math.floor(Math.random() * quotes.length);
        set({ currentQuote: quotes[randomIndex] });
      },
    }),
    {
      name: "vireon-storage",
      partialize: (state) => ({
        studyTasks: state.studyTasks,
        dailyGoals: state.dailyGoals,
        streakCount: state.streakCount,
        lastGoalDate: state.lastGoalDate,
        gymExercises: state.gymExercises,
        gymLogs: state.gymLogs,
        codeSnippets: state.codeSnippets,
        chatHistory: state.chatHistory,
        activeSection: state.activeSection,
        fitnessProfile: state.fitnessProfile,
      }),
    }
  )
);
