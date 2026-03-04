import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface QuestionRequest {
  chapter: string;
  gameTitle: string;
  gameConcept: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionNumber?: number;
  grade?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !authData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const request: QuestionRequest = await req.json();
    
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('Lovable API key not configured');
    }

    const difficultyMap = {
      easy: 'Easy level - Focus on basic concepts, simple calculations, single-step problems. Target time: 2-3 minutes per question.',
      medium: 'Medium level - Multi-step problems, require conceptual understanding and application. Target time: 4-5 minutes per question.',
      hard: 'Hard level - Complex problems, advanced applications, require deep understanding and multiple concepts. Target time: 6-8 minutes per question.'
    };

    const studentGrade = request.grade || 11;
    const gradeContext = studentGrade === 12 
      ? 'Class 12 (CBSE) - Advanced level. Use complex multi-step problems, advanced applications of concepts, integration of multiple topics, and NCERT Class 12 level difficulty.'
      : 'Class 11 (CBSE) - Foundation level. Use introductory concepts, single/two-step problems, basic applications, and NCERT Class 11 level difficulty.';

    const systemPrompt = `You are an educational mathematics content generator for ${studentGrade === 12 ? 'Class 12' : 'Class 11'} students (Indian CBSE curriculum).
    
Grade Level: ${gradeContext}

Generate a mathematics question for the game "${request.gameTitle}" which focuses on "${request.gameConcept}" within the chapter "${request.chapter}".

Difficulty: ${difficultyMap[request.difficulty]}

CRITICAL: HUMAN-READABLE QUESTIONS
Your #1 priority is that questions read like a real teacher wrote them.

FORMATTING RULES:
1. Return ONLY valid JSON, no markdown code blocks.
2. Write questions in PLAIN ENGLISH first. Only use $LaTeX$ for actual mathematical formulas.
3. NEVER use raw symbols like %, °, ², ³ outside of $...$. Write "percent" or "degrees" as plain text.
4. In JSON strings, ALL backslashes must be escaped as double backslashes (\\\\).
5. Do not include any text before or after the JSON object.
6. Options should be short and clean.

Return a JSON object with this exact structure:
{
  "id": "unique-question-id",
  "question": "A clear, conversational question in plain English. Use $LaTeX$ only for formulas.",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correctAnswer": 0,
  "explanation": "Step-by-step explanation in plain English.",
  "hint": "A friendly hint that guides thinking.",
  "topic": "${request.gameConcept}",
  "difficulty": "${request.difficulty}"
}

Make the question age-appropriate, use Indian context, and aligned with NCERT/CBSE standards.
The correctAnswer should be the index (0-3) of the correct option.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate question ${request.questionNumber || 1} for this game level. Return ONLY valid JSON.` }
        ],
        temperature: 0.8,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiText = await aiResponse.text();
    if (!aiText || aiText.trim().length === 0) {
      throw new Error('Empty response from AI API');
    }
    
    let aiData;
    try {
      aiData = JSON.parse(aiText);
    } catch {
      console.error('Failed to parse AI response:', aiText.substring(0, 500));
      throw new Error('Invalid JSON from AI API');
    }
    
    let generatedContent = aiData?.choices?.[0]?.message?.content;
    if (!generatedContent || generatedContent.trim().length === 0) {
      throw new Error('AI returned empty content');
    }
    
    generatedContent = generatedContent.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const firstBrace = generatedContent.indexOf('{');
    const lastBrace = generatedContent.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error('No valid JSON object found in AI response');
    }
    
    generatedContent = generatedContent.substring(firstBrace, lastBrace + 1);
    
    const latexCommands = ['frac', 'sqrt', 'sin', 'cos', 'tan', 'theta', 'alpha', 'beta', 'gamma', 'delta', 'pi', 'int', 'sum', 'prod', 'lim', 'infty', 'text', 'cdot', 'times', 'div', 'pm', 'leq', 'geq', 'neq', 'approx', 'equiv', 'circ', 'angle'];
    const commandPattern = latexCommands.join('|');
    const latexRegex = new RegExp(`(?<!\\\\)\\\\(${commandPattern})`, 'g');
    generatedContent = generatedContent.replace(latexRegex, '\\\\$1');
    
    let question;
    try {
      question = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', generatedContent);
      throw new Error('Invalid JSON response from AI');
    }

    if (!question.options || !Array.isArray(question.options)) {
      throw new Error('Invalid question format: options must be an array');
    }

    if (typeof question.correctAnswer !== 'number' || question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
      throw new Error('Invalid question format: correctAnswer must be a valid index');
    }

    return new Response(JSON.stringify(question), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-question:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
