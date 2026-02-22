/**
 * Supabase analysis_history: insert and list.
 * Table: relationship_context, analysis_result (jsonb), image_url, created_at
 */

import { supabase } from "@/integrations/supabase/client";

export type AnalysisHistoryRow = {
  id: string;
  relationship_context: string;
  analysis_result: Record<string, unknown>;
  image_url: string | null;
  created_at: string;
};

export async function insertAnalysisHistory(params: {
  user_id: string;
  relationship_context: string;
  analysis_result: Record<string, unknown>;
  image_url: string | null;
}): Promise<{ data: { id: string } | null; error: Error | null }> {
  const row = {
    user_id: params.user_id,
    relationship_context: params.relationship_context,
    analysis_result: params.analysis_result,
    image_url: params.image_url ?? null,
  };
  console.log("[LingoBuddy] insertAnalysisHistory payload user_id:", row.user_id);
  console.log("[LingoBuddy] full insert row (for Network tab check):", { ...row, analysis_result: "(omitted)" });
  const { data, error } = await supabase.from("analysis_history").insert(row).select("id, user_id").single();
  if (data) console.log("[LingoBuddy] inserted row from DB:", data);
  if (error) console.error("[LingoBuddy] insert error:", error);
  return {
    data: data ? { id: data.id } : null,
    error: error ? new Error(error.message) : null,
  };
}

export async function listAnalysisHistory(user_id: string): Promise<{
  data: AnalysisHistoryRow[] | null;
  error: Error | null;
}> {
  const { data, error } = await supabase
    .from("analysis_history")
    .select("id, relationship_context, analysis_result, image_url, created_at")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });
  return {
    data: error ? null : (data as AnalysisHistoryRow[]),
    error: error ? new Error(error.message) : null,
  };
}
