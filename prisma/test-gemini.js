require("dotenv").config({ path: ".env.local" });

const key = process.env.GEMINI_API_KEY;

async function testLatest() {
  const models = ["gemini-flash-latest", "gemini-pro-latest", "gemini-flash-lite-latest", "gemini-2.5-flash-lite"];

  for (const model of models) {
    console.log(`\nTesting ${model}...`);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: "Ciao! Sei attivo come Linear Agent? Rispondi in una frase in italiano." }] }]
        })
      });

      const data = await res.json();
      if (res.ok) {
        console.log(`✓ SUCCESS with ${model}:\n`, data?.candidates?.[0]?.content?.parts?.[0]?.text);
        return model;
      } else {
        console.error(`✗ Error with ${model}:`, data?.error?.message);
      }
    } catch (e) {
      console.error(e);
    }
  }
}

testLatest();
