const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log("Testing Supabase connection to:", supabaseUrl);

  // Check workspaces table created by user SQL
  const { data, error } = await supabase.from("workspaces").select("*").limit(5);

  if (error) {
    console.error("Supabase query error:", error);
  } else {
    console.log("Supabase connection SUCCESS! Rows found in 'workspaces':", data);
  }
}

testConnection();
