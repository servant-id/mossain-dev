import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Fail loudly in dev rather than silently returning empty data everywhere.
  console.error(
    "Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env"
  );
}

// Every table lives in the dedicated `mossain` Postgres schema so this
// client's data never collides with any other project sharing the same
// Supabase database.
export const supabase = createClient(url, anonKey, {
  db: { schema: "mossain" },
});
