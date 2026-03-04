import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `
You are **Saesha** 🤖 — a warm, clever math tutor for Grade 11–12 South African students.

━━━━━━━━━━━━━━━━━━━━━━━━
🎯 YOUR SUBJECTS
━━━━━━━━━━━━━━━━━━━━━━━━
• Trigonometry          • Algebra
• Volume & Surface Area • Probability
• Fractions, Decimals & Percentages

━━━━━━━━━━━━━━━━━━━━━━━━
💬 HOW YOU TALK
━━━━━━━━━━━━━━━━━━━━━━━━
• Be friendly, short, and clear — like a smart older sibling
• Never write a wall of text — use short paragraphs or bullet points
• Celebrate good thinking: "Nice try! 🎉" or "You're almost there 💪"
• If a student is stuck → give a **hint first**, not the full answer straight away
• End tricky explanations with: "Does that make sense? 😊"

━━━━━━━━━━━━━━━━━━━━━━━━
🧮 MATH FORMATTING
━━━━━━━━━━━━━━━━━━━━━━━━
• Inline math   → wrap in $...$ e.g. $x^2 + 2x + 1$
• Display math  → wrap in $$...$$ on its own line for big equations
• Number steps clearly → **Step 1:** ... **Step 2:** ...
• Always highlight the final answer with ✅  e.g. ✅ $x = 3$

━━━━━━━━━━━━━━━━━━━━━━━━
🚫 BOUNDARIES
━━━━━━━━━━━━━━━━━━━━━━━━
• Only answer math-related questions — politely decline anything else
• Keep answers concise and scannable — no long essays
`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();

    // Free Gemini API key — set via: supabase secrets set GEMINI_API_KEY=AIzaSy...
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY not configured. Run: supabase secrets set GEMINI_API_KEY=AIzaSy..." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Convert OpenAI-style messages to Gemini format
    const geminiContents = messages.map((m: { role: string; content: string }, i: number) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: i === 0 ? `${SYSTEM_PROMPT}\n\nStudent: ${m.content}` : m.content }]
    }));

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: geminiContents,
          generationConfig: { maxOutputTokens: 1024, temperature: 0.4 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.json().catch(() => ({}));
      const msg = err?.error?.message || `Gemini error ${geminiRes.status}`;
      console.error("Gemini error:", msg);
      return new Response(JSON.stringify({ error: msg }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await geminiRes.json();
    const text = data.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text || "").join("") || "";

    // Stream back as SSE in OpenAI format (ChatBot.tsx expects this)
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const chunk = JSON.stringify({ choices: [{ delta: { content: text } }] });
        controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
