import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();
    if (!message) return NextResponse.json({ error: "No message" }, { status: 400 });

    const lower = message.toLowerCase();

    // --- ENGINE 1: LOCAL CSE BRAIN (INSTANT & PERFECT) ---
    const knowledgeBase: Record<string, string> = {
      "dijkstra": "Dijkstra's Algorithm is a classic bro! It finds the shortest path between nodes in a graph. Imagine it like finding the fastest route to your favorite hangout spot. 🗺️",
      "binary search": "Binary Search is all about efficiency, man! It cuts the search area in half every time. It's like finding a word in a dictionary by opening it in the middle. 📚",
      "data structure": "Data structures are how we organize stuff in the computer's brain. Think Arrays, Linked Lists, and Stacks. Pick the right one, and your code flies! ⚡",
      "algorithm": "An algorithm is just a step-by-step recipe to solve a problem. Whether it's sorting numbers or finding paths, it's the heart of CSE. 🧠",
      "arefin": "Arefin Siddiqui is the legend who created me! A CSE student and killer developer from Dhaka. 🚀",
      "hello": "Yo! What's up, bro? Ready to crush some CSE goals today?",
      "hi": "Hey! Vireon Bro here. How can I help you study today?",
    };

    for (const [key, val] of Object.entries(knowledgeBase)) {
      if (lower.includes(key)) {
        return NextResponse.json({ response: val });
      }
    }

    // --- ENGINE 2: LIVE GEMINI FALLBACK ---
    const geminiKey = process.env.GEMINI_API_KEY || "AIzaSyAxMnEzO6ql7oYtUoa54Kbaeq8Y59smVCQ";
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: `You are Vireon Bro, a CSE assistant. Creator: Arefin Siddiqui. Be helpful. \nUser: ${message}` }] }] })
      });
      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return NextResponse.json({ response: text });
      }
    } catch (e) {}

    // --- ENGINE 3: THE BRO FALLBACK ---
    return NextResponse.json({ 
      response: "Yo! That's a deep topic. While I'm fine-tuning my high-level brain, just know that as a CSE student, you've got this! Keep grinding! 🚀" 
    });

  } catch (error) {
    return NextResponse.json({ response: "I hear you, bro! Let's keep moving!" });
  }
}
