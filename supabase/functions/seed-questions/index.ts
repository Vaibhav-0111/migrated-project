import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface GameData {
  id: string;
  chapter: string;
  game_title: string;
  game_concept: string;
}

// Hardcoded admin user IDs - only these users can seed questions
const ADMIN_USER_IDS: string[] = [];
// To restrict access, add admin user UUIDs above. If empty, any authenticated user can seed.

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: authData, error: authError } = await supabaseAuth.auth.getClaims(token);
    if (authError || !authData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = authData.claims.sub as string;

    // Check admin access if admin list is configured
    if (ADMIN_USER_IDS.length > 0 && !ADMIN_USER_IDS.includes(userId)) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { gameId, difficulty, count = 20 } = await req.json();

    // Validate inputs
    if (!gameId || typeof gameId !== 'string') {
      return new Response(JSON.stringify({ error: 'gameId is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!difficulty || !['easy', 'medium', 'hard'].includes(difficulty)) {
      return new Response(JSON.stringify({ error: 'difficulty must be easy, medium, or hard' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const safeCount = Math.min(Math.max(1, Number(count) || 20), 50); // Cap at 50
    
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!lovableApiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    // Get game data
    const gameResponse = await fetch(`${supabaseUrl}/rest/v1/games?id=eq.${gameId}`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
    });
    
    const games = await gameResponse.json();
    if (!games || games.length === 0) {
      throw new Error('Game not found');
    }
    
    const game: GameData = games[0];
    
    const generatedQuestions = [];
    
    // Generate questions
    for (let i = 0; i < safeCount; i++) {
      const systemPrompt = `You are an educational mathematics content generator for Class 11-12 students (Indian CBSE curriculum).

Generate a UNIQUE, THEME-SPECIFIC mathematics question for the game "${game.game_title}" which focuses EXCLUSIVELY on "${game.game_concept}" within the chapter "${game.chapter}".

🎯 CRITICAL INSTRUCTIONS FOR UNIQUENESS:
1. This is question ${i + 1} for THIS SPECIFIC GAME - make it completely unique to this game's theme
2. The question MUST be contextually tied to "${game.game_title}" - use its specific scenario/setting
3. DO NOT create generic trigonometry questions - make them specific to the game's concept
4. Use the game's unique context in the word problem
5. Each question should feel like it belongs ONLY to this game

Difficulty: ${difficulty}

CRITICAL FORMATTING RULES:
1. Return ONLY valid JSON, no markdown code blocks
2. IMPORTANT: In JSON strings, ALL backslashes must be escaped as double backslashes (\\\\)
3. For LaTeX in JSON: use \\\\frac not \\frac, \\\\sin not \\sin, \\\\sqrt not \\sqrt, etc.
4. Do not include any text before or after the JSON object
5. Use inline LaTeX notation within dollar signs: $x^2$, $\\\\frac{1}{2}$, $\\\\sin \\\\theta$
6. Keep the narrative engaging and specific to the game's theme

Return JSON with this structure:
{
  "question": "Clear, theme-specific question with $LaTeX$ for math",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correctAnswer": 0,
  "explanation": "Step-by-step explanation with $LaTeX$",
  "hint": "Helpful hint with $LaTeX$",
  "topic": "${game.game_concept}"
}`;
    
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
            { role: 'user', content: `Generate a completely unique, theme-specific question ${i + 1} for "${game.game_title}". Return ONLY valid JSON with properly escaped LaTeX.` }
          ],
          temperature: 0.8,
        }),
      });

      if (!aiResponse.ok) {
        console.error(`AI API error for question ${i + 1}:`, await aiResponse.text());
        continue;
      }

      const aiData = await aiResponse.json();
      let content = aiData.choices[0].message.content;
      
      // Clean response
      content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const firstBrace = content.indexOf('{');
      const lastBrace = content.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        content = content.substring(firstBrace, lastBrace + 1);
      }
      
      // Fix LaTeX escaping
      const latexCommands = ['frac', 'sqrt', 'sin', 'cos', 'tan', 'theta', 'alpha', 'beta', 'gamma', 'pi', 'circ'];
      const commandPattern = latexCommands.join('|');
      const latexRegex = new RegExp(`(?<!\\\\)\\\\(${commandPattern})`, 'g');
      content = content.replace(latexRegex, '\\\\$1');

      try {
        const question = JSON.parse(content);
        
        // Insert into database
        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/questions`, {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            game_id: gameId,
            difficulty: difficulty,
            question_text: question.question,
            options: question.options,
            correct_answer: question.correctAnswer,
            explanation: question.explanation,
            hint: question.hint || '',
            topic: question.topic,
          }),
        });
        
        if (insertResponse.ok) {
          const inserted = await insertResponse.json();
          generatedQuestions.push(inserted[0]);
          console.log(`Generated question ${i + 1}/${safeCount}`);
        }
      } catch (error) {
        console.error(`Failed to parse/insert question ${i + 1}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: generatedQuestions.length,
        questions: generatedQuestions 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in seed-questions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
