import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const RoutineInput = z.object({
  name: z.string().min(1).max(80),
  icon: z.string().max(8).optional().nullable(),
  category: z.string().max(40).optional().nullable(),
  time_of_day: z.string().max(10).optional().nullable(),
  days: z.array(z.number().int().min(0).max(6)).max(7).default([]),
  grace_days: z.number().int().min(0).max(7).default(0),
});

export const listRoutines = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: routines }, { data: completions }, { data: profile }, { data: achievements }] = await Promise.all([
      supabase.from("routines").select("*").eq("archived", false).order("created_at"),
      supabase.from("routine_completions").select("routine_id,date").gte("date", new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString().slice(0, 10)),
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("achievements").select("*").order("unlocked_at", { ascending: false }),
    ]);
    return {
      routines: routines ?? [],
      completions: completions ?? [],
      profile,
      achievements: achievements ?? [],
    };
  });

export const createRoutine = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RoutineInput.parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase.from("routines").insert({ ...data, user_id: userId }).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteRoutine = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { error } = await supabase.from("routines").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const toggleCompletion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ routine_id: z.string().uuid(), date: z.string() }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase
      .from("routine_completions")
      .select("id")
      .eq("routine_id", data.routine_id)
      .eq("date", data.date)
      .maybeSingle();
    if (existing) {
      await supabase.from("routine_completions").delete().eq("id", existing.id);
      return { completed: false };
    } else {
      await supabase.from("routine_completions").insert({ routine_id: data.routine_id, date: data.date, user_id: userId });
      // bump XP
      const { data: p } = await supabase.from("profiles").select("xp").eq("id", userId).maybeSingle();
      const newXp = (p?.xp ?? 0) + 10;
      const newLevel = Math.floor(newXp / 100) + 1;
      await supabase.from("profiles").update({ xp: newXp, level: newLevel, updated_at: new Date().toISOString() }).eq("id", userId);
      return { completed: true, xp: newXp, level: newLevel };
    }
  });

export const unlockAchievement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ code: z.string().min(1).max(40), title: z.string().min(1).max(80), description: z.string().max(200).optional() }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("achievements").insert({ user_id: userId, ...data });
    if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    return { ok: true };
  });
