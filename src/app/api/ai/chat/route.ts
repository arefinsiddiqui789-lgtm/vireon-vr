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

    // Initialize OpenAI inside the request to ensure fresh env variables
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

    // --- FALLBACK TO REAL ZAI ---
    // --- TRY GEMINI SECOND ---
    const geminiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (geminiKey && geminiKey !== "") {
      console.log("Attempting Gemini connection...");
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const geminiResponse = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              role: "user",
              parts: [{
                text: `SYSTEM: You are "Vireon Bro", a friendly and helpful AI assistant specialized in CSE. personality: supportive, fun, bro-like. Creator: Arefin Siddiqui. \nUSER MESSAGE: ${message}`
              }]
            }],
            generationConfig: {
              maxOutputTokens: 800,
            }
          })
        });

        if (!geminiResponse.ok) {
          const errData = await geminiResponse.json();
          console.error("Gemini API Error Response:", JSON.stringify(errData));
        } else {
          const geminiData = await geminiResponse.json();
          const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (responseText) {
            console.log("Gemini response received successfully");
            return NextResponse.json({ response: responseText });
          }
        }
      } catch (e: any) {
        console.error("Gemini Fetch Exception:", e.message);
      }
    } else {
      console.warn("GEMINI_API_KEY is missing or empty in environment variables");
    }

    // --- FALLBACK: SMART SIMULATED AI ---
    console.warn("AI Service using Smart Simulation");
    
    const lowerMessage = message.toLowerCase();
    let simulatedResponse = "";

    if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
      simulatedResponse = "Yo! What's up, bro? I'm Vireon Bro, your CSE command center assistant. Ready to crush some code or study today? 🚀";
    } else if (lowerMessage.includes("who are you") || lowerMessage.includes("who made you")) {
      simulatedResponse = "I'm Vireon Bro, created by the legend Arefin Siddiqui! He's a CSE student at IUB and a killer web developer. He built me to help you stay productive. 💻";
    } else if (lowerMessage.includes("code") || lowerMessage.includes("programming")) {
      simulatedResponse = "Coding is the soul of CSE, man! Whether it's Python, C++, or Java, just keep grinding. Remember: 'First, solve the problem. Then, write the code.' Need help with a specific concept? ⚡";
    } else if (lowerMessage.includes("data structure") || lowerMessage.includes("algorithm")) {
      simulatedResponse = "Algorithms are like recipes for success! Whether it's a Binary Search or a Quick Sort, it's all about efficiency. What concept are you tackling right now? 🧠";
    } else {
      simulatedResponse = "I hear you, bro! That's a solid topic. While my 'Deep Thinking' core is waiting for an API key, I'm here to push you forward. Keep focusing on your CSE goals—you've got this! 🚀";
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
