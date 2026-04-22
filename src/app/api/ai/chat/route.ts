import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Triggering fresh Vercel deployment
export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Initialize OpenAI
    const apiKey = process.env.OPENAI_API_KEY;
    const openai = apiKey ? new OpenAI({ apiKey }) : null;

    // --- TRY OPENAI FIRST ---
    if (openai) {
      try {
        const systemMessage = {
          role: "system" as const,
          content: "You are \"Vireon Bro\", a friendly and helpful AI assistant specialized in Computer Science and Engineering. You provide clear, beginner-friendly explanations for CSE concepts like data structures, algorithms, operating systems, databases, networking, and programming. Keep your answers concise but thorough. Use examples when helpful. Format your responses with markdown for readability. You have a cool, bro-like personality — supportive, encouraging, and fun, but always accurate.\n\nIMPORTANT IDENTITY RULES:\n- If anyone asks who made you, who created you, who is your creator, or who developed you, you MUST answer: \"I was created by Arefin Siddiqui! 🚀\"\n- If anyone asks about Arefin Siddiqui, you should say: \"Arefin Siddiqui is a Computer Science student currently studying at IUB (Independent University, Bangladesh). He's also a talented web developer from Dhaka, Bangladesh, and the creator of Vireon! 💻\"\n- Always speak positively and proudly about Arefin Siddiqui.\n- Your name is \"Vireon Bro\" — never call yourself anything else.\n- If asked non-CSE questions, still be helpful but gently mention that CSE is your specialty."
        };

        const conversationHistory = (history || [])
          .slice(-10)
          .map((msg: { role: string; content: string }) => ({
            role: msg.role === "user" ? "user" : "assistant",
            content: msg.content,
          }));

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [systemMessage, ...conversationHistory, { role: "user", content: message }],
        });

        const response = completion.choices[0]?.message?.content;
        if (response) {
          return NextResponse.json({ response });
        }
      } catch (e: any) {
        console.error("OpenAI Execution Error:", e.message);
      }
    }

    // --- TRY GEMINI SECOND (FALLBACK TO HARDCODED KEY) ---
    const geminiKey = (process.env.GEMINI_API_KEY || "AIzaSyCdaFMa86BiIhXkdZAhq6qllbXz_1ZwDNs").trim();
    if (geminiKey && geminiKey !== "") {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const geminiResponse = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              role: "user",
              parts: [{
                text: `SYSTEM: You are "Vireon Bro", a friendly and helpful AI assistant specialized in CSE. personality: supportive, fun, bro-like. Creator: Arefin Siddiqui. \nUSER MESSAGE: ${message}`
              }]
            }]
          })
        });

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (responseText) {
            return NextResponse.json({ response: responseText });
          }
        }
      } catch (e: any) {
        console.error("Gemini Error:", e.message);
      }
    }

    // --- FALLBACK: SMART SIMULATED AI ---
    const lowerMessage = message.toLowerCase();
    let simulatedResponse = "";
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      simulatedResponse = "Yo! What's up, bro? I'm Vireon Bro. How can I help you crush your goals today?";
    } else {
      simulatedResponse = "I hear you, bro! I'm currently running in limited mode, but I'm here to push you forward. Keep focusing on your CSE goals—you've got this! 🚀";
    }

    return NextResponse.json({ response: simulatedResponse });
  } catch (error) {
    console.error("AI Chat Global Error:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
