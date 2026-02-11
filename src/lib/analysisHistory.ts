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
  relationship_context: string;
  analysis_result: Record<string, unknown>;
  image_url: string | null;
}): Promise<{ error: Error | null }> {
  const { error } = await supabase.from("analysis_history").insert({
    relationship_context: params.relationship_context,
    analysis_result: params.analysis_result,
    image_url: params.image_url ?? null,
  });
  return { error: error ? new Error(error.message) : null };
}

export async function listAnalysisHistory(): Promise<{
  data: AnalysisHistoryRow[] | null;
  error: Error | null;
}> {
  const { data, error } = await supabase
    .from("analysis_history")
    .select("id, relationship_context, analysis_result, image_url, created_at")
    .order("created_at", { ascending: false });
  return {
    data: error ? null : (data as AnalysisHistoryRow[]),
    error: error ? new Error(error.message) : null,
  };
}
