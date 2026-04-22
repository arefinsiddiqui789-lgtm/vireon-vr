import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // --- TRY OPENAI ---
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      try {
        const openai = new OpenAI({ apiKey });
        const conversationHistory = (history || []).slice(-10).map((msg: any) => ({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        }));

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are Vireon Bro, a friendly CSE assistant. Creator: Arefin Siddiqui." },
            ...conversationHistory,
            { role: "user", content: message }
          ],
        });

        if (completion.choices[0]?.message?.content) {
          return NextResponse.json({ response: completion.choices[0].message.content });
        }
      } catch (e) {
        console.error("OpenAI Error:", e);
      }
    }

    // --- TRY GEMINI 2.0 (DIRECT LINK) ---
    const geminiKey = (process.env.GEMINI_API_KEY || "AIzaSyAxMnEzO6ql7oYtUoa54Kbaeq8Y59smVCQ").trim();
    if (geminiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
        const response = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are "Vireon Bro", a friendly and helpful AI assistant specialized in CSE. personality: supportive, fun, bro-like. Creator: Arefin Siddiqui. \n\nUser Question: ${message}`
              }]
            }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (responseText) {
            return NextResponse.json({ response: responseText });
          }
        }
      } catch (e) {
        console.error("Gemini Error:", e);
      }
    }

    // --- LAST RESORT: FALLBACK ---
    return NextResponse.json({ 
      response: "Yo! I hear you, but my brain is a bit foggy right now. Try again in 10 seconds, bro! 🚀" 
    });
  } catch (error) {
    console.error("Global Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
