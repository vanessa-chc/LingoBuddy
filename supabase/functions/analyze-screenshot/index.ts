import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { imageBase64, context } = await req.json();

    if (!imageBase64 || !context) {
      return new Response(
        JSON.stringify({ error: "imageBase64 and context are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are Leon, a Gen-Z slang expert and cultural translator. You analyze screenshots of text conversations and break down slang, tone, and subtext.

Given the relationship context "${context}", analyze the screenshot and return a JSON object with this exact structure:
{
  "summary": "A brief 1-2 sentence overview of the conversation's vibe and tone",
  "slangTerms": [
    {
      "term": "the slang word or phrase",
      "meaning": "what it actually means in this context",
      "vibeCheck": "positive" | "neutral" | "negative" | "sarcastic",
      "confidence": 0.0-1.0
    }
  ],
  "overallTone": "friendly" | "flirty" | "passive-aggressive" | "formal" | "casual" | "hostile" | "playful",
  "suggestedReplies": [
    "A contextually appropriate reply option",
    "Another reply option",
    "A third reply option"
  ],
  "culturalNotes": "Any relevant cultural context or warnings about misinterpretation"
}

Be accurate, fun, and insightful. If there's no slang, still analyze the tone and suggest replies.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: imageBase64 },
              },
              {
                type: "text",
                text: `Analyze this screenshot. The relationship context is: ${context}. Return ONLY the JSON object, no markdown or extra text.`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("AI response finish_reason:", data.choices?.[0]?.finish_reason);
    console.log("AI response content length:", data.choices?.[0]?.message?.content?.length ?? 0);
    
    const content = data.choices?.[0]?.message?.content;
    const finishReason = data.choices?.[0]?.finish_reason;

    if (!content) {
      console.error("Empty AI response. Full data:", JSON.stringify(data).slice(0, 500));
      
      if (finishReason === "length") {
        return new Response(
          JSON.stringify({ error: "AI response was too long. Please try a simpler screenshot." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (finishReason === "content_filter" || finishReason === "SAFETY") {
        return new Response(
          JSON.stringify({ error: "Content was filtered by safety checks. Try a different screenshot." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI could not analyze this image. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON from the response, stripping markdown code fences if present
    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse analysis results", raw: content }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analysis complete for context:", context);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-screenshot error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
