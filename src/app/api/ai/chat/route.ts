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

    // --- TRY GEMINI (MULTI-MODEL FALLBACK) ---
    const geminiKey = (process.env.GEMINI_API_KEY || "AIzaSyAxMnEzO6ql7oYtUoa54Kbaeq8Y59smVCQ").trim();
    let lastError = "";
    if (geminiKey) {
      const models = ["gemini-1.5-flash", "gemini-2.0-flash"];
      for (const model of models) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `You are Vireon Bro, a CSE assistant. Creator: Arefin Siddiqui. \n\nQuestion: ${message}` }] }]
            })
          });

          if (response.ok) {
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) return NextResponse.json({ response: text });
          } else {
            const err = await response.json();
            lastError = err.error?.message || response.statusText;
          }
        } catch (e: any) {
          lastError = e.message;
        }
      }
    }

    // --- LAST RESORT: FALLBACK ---
    return NextResponse.json({ 
      response: `Yo! My brain is foggy. Error: ${lastError.substring(0, 50)}. Try again, bro! 🚀` 
    });
  } catch (error) {
    console.error("Global Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
