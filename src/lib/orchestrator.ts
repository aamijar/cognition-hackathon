import { AgentConfig, callAgentLLM, Message } from "./agents";

type NegotiateInput = {
  scenario: string;
  agentA: AgentConfig;
  agentB: AgentConfig;
  maxRounds: number;
};

type StreamEvent =
  | { type: "message"; role: "agentA" | "agentB"; content: string; round: number }
  | { type: "status"; content: string }
  | { type: "done"; agreement?: string };

export async function* negotiate(input: NegotiateInput): AsyncGenerator<StreamEvent> {
  const { scenario, agentA, agentB, maxRounds } = input;

  const systemPromptA = `You are ${agentA.name}. Persona: ${agentA.persona}.
You are negotiating with ${agentB.name}.
Stay concise. Use 1-3 sentences per turn. Propose concrete terms.`;
  const systemPromptB = `You are ${agentB.name}. Persona: ${agentB.persona}.
You are negotiating with ${agentA.name}.
Stay concise. Use 1-3 sentences per turn. Propose concrete terms.`;

  const historyA: Message[] = [{ role: "system", content: systemPromptA }];
  const historyB: Message[] = [{ role: "system", content: systemPromptB }];

  historyA.push({ role: "user", content: `Scenario:\n${scenario}\n\nStart with an opening offer.` });
  const first = await callAgentLLM(agentA.modelProvider, agentA.model, historyA);
  historyA.push({ role: "assistant", content: first });
  historyB.push({ role: "user", content: `Scenario:\n${scenario}\n\nYour counterpart offered:\n${first}` });

  yield { type: "message", role: "agentA", content: first, round: 1 };

  let round = 1;
  while (round < maxRounds) {
    round += 1;

    const bResp = await callAgentLLM(agentB.modelProvider, agentB.model, historyB);
    historyB.push({ role: "assistant", content: bResp });
    historyA.push({ role: "user", content: `Counterpart said:\n${bResp}` });
    yield { type: "message", role: "agentB", content: bResp, round };

    if (isAgreementReached(first, bResp)) {
      const agreement = summarizeAgreement([first, bResp]);
      yield { type: "done", agreement };
      return;
    }

    round += 1;
    if (round > maxRounds) break;

    const aResp = await callAgentLLM(agentA.modelProvider, agentA.model, historyA);
    historyA.push({ role: "assistant", content: aResp });
    historyB.push({ role: "user", content: `Counterpart said:\n${aResp}` });
    yield { type: "message", role: "agentA", content: aResp, round };

    if (isAgreementReached(bResp, aResp)) {
      const agreement = summarizeAgreement([bResp, aResp]);
      yield { type: "done", agreement };
      return;
    }
  }

  yield { type: "done" };
}

function isAgreementReached(prev: string, curr: string): boolean {
  const agreeRegex = /\b(agree|accepted|deal|we have a deal|finalize)\b/i;
  const pricePrev = extractPrice(prev);
  const priceCurr = extractPrice(curr);
  const pricesClose = pricePrev != null && priceCurr != null && Math.abs(pricePrev - priceCurr) <= 50;
  return agreeRegex.test(prev) || agreeRegex.test(curr) || !!pricesClose;
}

function extractPrice(text: string): number | null {
  const m = text.match(/\$?(\d{3,5})/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return isNaN(n) ? null : n;
}

function summarizeAgreement(utterances: string[]): string {
  const combined = utterances.join(" ");
  const price = extractPrice(combined);
  return `Agreement in principle at ${price ? `$${price}` : "mutually acceptable terms"}.`;
}
