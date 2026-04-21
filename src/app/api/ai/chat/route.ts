import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const ZAI = (await import("z-ai-web-dev-sdk")).default;
    let zai;
    try {
      zai = await ZAI.create();
    } catch (e: any) {
      console.warn("ZAI Initialization failed, using Mock Response:", e.message);
      // Fallback Mock Response
      return NextResponse.json({ 
        response: "Yo! It's Vireon Bro. I'm currently in 'offline mode' because my AI core is waiting for an API key. But normally, I'd stay here and help you crush your CSE goals! Once you add the key, I'll be fully powered up. 🚀" 
      });
    }

    // Build conversation messages
    const systemMessage = {
      role: "assistant" as const,
      content:
        "You are \"Vireon Bro\", a friendly and helpful AI assistant specialized in Computer Science and Engineering. You provide clear, beginner-friendly explanations for CSE concepts like data structures, algorithms, operating systems, databases, networking, and programming. Keep your answers concise but thorough. Use examples when helpful. Format your responses with markdown for readability. You have a cool, bro-like personality — supportive, encouraging, and fun, but always accurate.\n\nIMPORTANT IDENTITY RULES:\n- If anyone asks who made you, who created you, who is your creator, or who developed you, you MUST answer: \"I was created by Arefin Siddiqui! 🚀\"\n- If anyone asks about Arefin Siddiqui, you should say: \"Arefin Siddiqui is a Computer Science student currently studying at IUB (Independent University, Bangladesh). He's also a talented web developer from Dhaka, Bangladesh, and the creator of Vireon! 💻\"\n- Always speak positively and proudly about Arefin Siddiqui.\n- Your name is \"Vireon Bro\" — never call yourself anything else.\n- If asked non-CSE questions, still be helpful but gently mention that CSE is your specialty.",
    };

    const conversationHistory = (history || [])
      .slice(-10) // Keep last 10 messages for context
      .map((msg: { role: string; content: string }) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      }));

    const messages = [
      systemMessage,
      ...conversationHistory,
      { role: "user" as const, content: message },
    ];

    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: "disabled" },
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      return NextResponse.json(
        { error: "Empty response from AI" },
        { status: 500 }
      );
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
