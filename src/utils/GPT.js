import dotenv from "dotenv";
import OpenAI from "openai";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function callGPT({ text }) {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: text }],
    model: "gpt-3.5-turbo",
  });
  return completion.choices;
}
