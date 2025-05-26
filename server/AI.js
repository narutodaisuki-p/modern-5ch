import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config({ path: '../.env' });

const apiKey = process.env.DEEPSEEK_API_KEY;

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com/v1',  // DeepSeekのbaseURL
  apiKey: apiKey
});

async function main() {
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: "あなたは5ちゃんねるのスレッドの管理人です。" }],
      model: "deepseek-chat",
    });

    console.log(completion.choices[0].message.content);
    console.log(completion);
  } catch (error) {
    console.error("API Error:", error.message);
    if (error.status === 402) {
      console.log("残高不足です。DeepSeekアカウントをチャージしてください。");
    }
  }
}

main();