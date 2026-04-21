import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

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
    try {
      const ZAI = (await import("z-ai-web-dev-sdk")).default;
      const zai = await ZAI.create();
      
      const messages = [
        { role: "assistant" as const, content: "You are Vireon Bro..." },
        ...(history || []).slice(-10),
        { role: "user" as const, content: message },
      ];

      const completion = await zai.chat.completions.create({
        messages,
        thinking: { type: "disabled" },
      });

      return NextResponse.json({ response: completion.choices[0]?.message?.content });
    } catch (e: any) {
      console.warn("AI Service unavailable, using Mock Response");
      return NextResponse.json({ 
        response: "Yo! It's Vireon Bro. I'm currently in 'offline mode' because my AI core is waiting for an API key. But normally, I'd stay here and help you crush your CSE goals! Once you add the key (OPENAI_API_KEY), I'll be fully powered up. 🚀" 
      });
    }
  } catch (error) {
    console.error("AI Chat Global Error:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
