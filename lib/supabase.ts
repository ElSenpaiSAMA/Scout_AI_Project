import { createClient } from "@supabase/supabase-js";

let _supabase: ReturnType<typeof createClient> | null = null;

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    if (!_supabase) {
      _supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }
    return (_supabase as any)[prop];
  },
});

export type Scout = {
  id: string;
  product: string;
  audience: string;
  objective: string;
  trends_data: any;
  reddit_data: any;
  scout_text: string;
  source: "web" | "slack";
  created_at: string;
};
