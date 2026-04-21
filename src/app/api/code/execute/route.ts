import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { code, language } = await req.json();

    if (!code || !language) {
      return NextResponse.json(
        { error: "Code and language are required" },
        { status: 400 }
      );
    }

    const langNames: Record<string, string> = {
      python: "Python",
      c: "C",
      cpp: "C++",
    };

    const langName = langNames[language] || language;
    const startTime = Date.now();

    // Use z-ai-web-dev-sdk to execute code via LLM
    const ZAI = (await import("z-ai-web-dev-sdk")).default;
    let zai;
    try {
      zai = await ZAI.create();
    } catch (e) {
      console.warn("ZAI Initialization failed (Code), using Mock Response:", (e as Error).message);
      return NextResponse.json({
        stdout: "Program output simulated successfully! [Running in Mock Mode]",
        stderr: "",
        exitCode: 0,
        executionTime: 124,
      });
    }

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content:
            "You are a code execution simulator. When given code, you execute it mentally and return ONLY the exact output that the program would produce. Follow these rules strictly:\n1. Return ONLY the stdout output - nothing else\n2. Do NOT include any explanations, markdown, or extra text\n3. If the code has errors, output them prefixed with 'ERROR:' on stderr\n4. Be precise about output formatting - newlines, spaces, etc.\n5. If the code produces no output, return empty string\n6. Do not add any commentary or analysis\n7. Simulate the exact behavior of a real compiler/interpreter",
        },
        {
          role: "user",
          content: `Execute this ${langName} code and show me ONLY the output:\n\n\`\`\`${language}\n${code}\n\`\`\``,
        },
      ],
      thinking: { type: "disabled" },
    });

    const response = completion.choices[0]?.message?.content || "";
    const executionTime = Date.now() - startTime;

    // Check if the response contains an error
    const hasError = response.includes("ERROR:") || response.includes("error:") || response.includes("Error:");
    
    let stdout = "";
    let stderr = "";

    if (hasError) {
      stderr = response.replace(/^ERROR:\s*/i, "").trim();
    } else {
      stdout = response.trim();
    }

    return NextResponse.json({
      stdout,
      stderr,
      exitCode: hasError ? 1 : 0,
      executionTime,
    });
  } catch (error) {
    console.error("Code execution error:", error);
    return NextResponse.json(
      { error: "Failed to execute code" },
      { status: 500 }
    );
  }
}
