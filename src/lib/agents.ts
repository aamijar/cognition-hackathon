import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

type Provider = "openai" | "anthropic" | "stub";

export type AgentConfig = {
  name: string;
  persona: string;
  modelProvider: Provider;
  model?: string;
};

export type Message = { role: "system" | "user" | "assistant"; content: string };

export async function callAgentLLM(
  provider: Provider,
  model: string | undefined,
  messages: Message[]
): Promise<string> {
  if (provider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
    const client = new OpenAI({ apiKey });
    const resp = await client.chat.completions.create({
      model: model || "gpt-4o-mini",
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: 0.6
    });
    return resp.choices[0]?.message?.content || "";
  }

  if (provider === "anthropic") {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");
    const client = new Anthropic({ apiKey });
    const sys = messages.find((m) => m.role === "system")?.content ?? "";
    const user = messages
      .filter((m) => m.role !== "system")
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");

    const resp = await client.messages.create({
      model: model || "claude-3-5-sonnet-latest",
      max_tokens: 512,
      system: sys,
      messages: [{ role: "user", content: user }],
      temperature: 0.6
    });
    const content = resp.content?.map((c: any) => ("text" in c ? c.text : "")).join("") ?? "";
    return content;
  }

  const lastUser = messages.findLast((m) => m.role !== "system")?.content ?? "";
  return stubResponder(lastUser);
}

function stubResponder(input: string): string {
  const priceMatch = input.match(/\$?(\d{3,5})/g);
  const numbers = (priceMatch || []).map((s) => parseInt(s.replace(/\$/g, ""), 10)).filter((n) => !isNaN(n));
  let proposal = "";

  if (numbers.length >= 2) {
    const hi = Math.max(...numbers);
    const lo = Math.min(...numbers);
    const mid = Math.round((hi + lo) / 2 / 25) * 25;
    proposal = `$${mid}`;
  } else if (numbers.length === 1) {
    const n = numbers[0];
    proposal = `$${Math.round(n * 0.97 / 25) * 25}`;
  } else {
    proposal = "$100"; // fallback
  }

  if (/agree|accepted|deal/i.test(input)) {
    return "I can agree to these terms.";
  }

  return `Counter-proposal: ${proposal}. I can be flexible on secondary terms if needed.`;
}
