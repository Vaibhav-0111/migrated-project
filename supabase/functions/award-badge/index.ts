import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// All valid badge definitions with their requirements
const BADGE_DEFINITIONS: Record<string, { title: string; description: string; icon: string; type: string }> = {
  first_game: { title: "First Steps", description: "Complete your first game", icon: "🎮", type: "game" },
  five_games: { title: "Game Explorer", description: "Complete 5 games", icon: "🎯", type: "game" },
  ten_games: { title: "Game Master", description: "Complete 10 games", icon: "🏆", type: "game" },
  first_star: { title: "Rising Star", description: "Earn your first star", icon: "⭐", type: "star" },
  ten_stars: { title: "Star Collector", description: "Earn 10 stars", icon: "🌟", type: "star" },
  fifty_stars: { title: "Superstar", description: "Earn 50 stars", icon: "✨", type: "star" },
  perfect_game: { title: "Perfectionist", description: "Get 100% in any game", icon: "💯", type: "accuracy" },
  high_accuracy: { title: "Sharpshooter", description: "Maintain 80%+ accuracy", icon: "🎯", type: "accuracy" },
  trig_chapter: { title: "Trig Explorer", description: "Complete all Trigonometry games", icon: "📐", type: "chapter" },
  algebra_chapter: { title: "Algebra Ace", description: "Complete all Algebra games", icon: "🔢", type: "chapter" },
  volume_chapter: { title: "Volume Victor", description: "Complete all Volume games", icon: "📦", type: "chapter" },
  probability_chapter: { title: "Probability Pro", description: "Complete all Probability games", icon: "🎲", type: "chapter" },
  fractions_chapter: { title: "Fraction Friend", description: "Complete all Fractions games", icon: "🍕", type: "chapter" },
  three_day_streak: { title: "On Fire", description: "Maintain a 3-day streak", icon: "🔥", type: "streak" },
  seven_day_streak: { title: "Week Warrior", description: "Maintain a 7-day streak", icon: "💪", type: "streak" },
  early_bird: { title: "Early Learner", description: "Complete onboarding", icon: "🐣", type: "special" },
  all_chapters: { title: "Math Champion", description: "Complete all chapters", icon: "👑", type: "special" },
};

async function validateBadgeRequirement(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  badgeId: string
): Promise<boolean> {
  // Get user's game progress stats
  const { data: progress } = await supabase
    .from("game_progress")
    .select("game_id, stars_earned, best_accuracy, completed_at, difficulty")
    .eq("user_id", userId);

  const completedGames = progress?.filter((p) => p.completed_at !== null) || [];
  const totalStars = completedGames.reduce((sum, p) => sum + (p.stars_earned || 0), 0);
  const bestAccuracy = completedGames.reduce((max, p) => Math.max(max, p.best_accuracy || 0), 0);

  // Get user performance for streak
  const { data: perf } = await supabase
    .from("user_performance")
    .select("streak_days")
    .eq("user_id", userId)
    .limit(1);
  const streak = perf?.[0]?.streak_days || 0;

  // Get chapter progress
  const { data: games } = await supabase.from("games").select("id, chapter");
  const chapterMap: Record<string, { total: number; completed: number }> = {};
  if (games) {
    for (const game of games) {
      if (!chapterMap[game.chapter]) chapterMap[game.chapter] = { total: 0, completed: 0 };
      chapterMap[game.chapter].total++;
      if (completedGames.some((p) => p.game_id === game.id)) {
        chapterMap[game.chapter].completed++;
      }
    }
  }

  switch (badgeId) {
    case "first_game": return completedGames.length >= 1;
    case "five_games": return completedGames.length >= 5;
    case "ten_games": return completedGames.length >= 10;
    case "first_star": return totalStars >= 1;
    case "ten_stars": return totalStars >= 10;
    case "fifty_stars": return totalStars >= 50;
    case "perfect_game": return bestAccuracy >= 100;
    case "high_accuracy": return bestAccuracy >= 80;
    case "three_day_streak": return streak >= 3;
    case "seven_day_streak": return streak >= 7;
    case "trig_chapter": return (chapterMap["Trigonometry"]?.completed || 0) >= (chapterMap["Trigonometry"]?.total || 1);
    case "algebra_chapter": return (chapterMap["Algebra"]?.completed || 0) >= (chapterMap["Algebra"]?.total || 1);
    case "volume_chapter": return (chapterMap["Volume & Surface Area"]?.completed || 0) >= (chapterMap["Volume & Surface Area"]?.total || 1);
    case "probability_chapter": return (chapterMap["Probability"]?.completed || 0) >= (chapterMap["Probability"]?.total || 1);
    case "fractions_chapter": return (chapterMap["Fractions/Decimals/Percentages/Interest"]?.completed || 0) >= (chapterMap["Fractions/Decimals/Percentages/Interest"]?.total || 1);
    case "all_chapters": {
      return Object.keys(chapterMap).length >= 5 && Object.values(chapterMap).every((c) => c.completed >= c.total);
    }
    case "early_bird": return true; // Onboarding completion is validated by the client flow
    default: return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const userId = authData.claims.sub as string;
    const { badgeId } = await req.json();

    if (!badgeId || typeof badgeId !== "string") {
      return new Response(JSON.stringify({ error: "badgeId is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const badge = BADGE_DEFINITIONS[badgeId];
    if (!badge) {
      return new Response(JSON.stringify({ error: "Invalid badge ID" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if already earned
    const { data: existing } = await supabase
      .from("rewards")
      .select("id")
      .eq("user_id", userId)
      .eq("reward_type", badgeId)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ success: true, alreadyEarned: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role client for validation queries that need cross-table access
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Validate requirements server-side
    const meetsRequirements = await validateBadgeRequirement(serviceClient, userId, badgeId);
    if (!meetsRequirements) {
      return new Response(JSON.stringify({ error: "Badge requirements not met" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert using service role to bypass RLS (we've already validated the user)
    const { error: insertError } = await serviceClient.from("rewards").insert({
      user_id: userId,
      reward_type: badgeId,
      reward_title: badge.title,
      reward_description: badge.description,
      metadata: { icon: badge.icon, type: badge.type },
    });

    if (insertError) {
      console.error("Failed to insert reward:", insertError);
      throw new Error("Failed to award badge");
    }

    return new Response(JSON.stringify({ success: true, badge }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("award-badge error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
