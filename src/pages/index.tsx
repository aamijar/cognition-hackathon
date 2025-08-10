import { useCallback, useMemo, useRef, useState } from "react";
import ChatViewer from "@components/ChatViewer";

type AgentConfig = {
  name: string;
  persona: string;
  modelProvider: "openai" | "anthropic" | "stub";
  model?: string;
};

type StreamEvent =
  | { type: "message"; role: "agentA" | "agentB"; content: string; round: number }
  | { type: "status"; content: string }
  | { type: "done"; agreement?: string };

export default function Home() {
  const [scenario, setScenario] = useState(
    "Negotiation: Tenant wants to rent a 1BR in SF. Landlord listed at $3000/mo. Tenant budget is $2600. Move-in next month. Preferences: 12-month lease, pet-friendly."
  );
  const [agentA, setAgentA] = useState<AgentConfig>({
    name: "Landlord",
    persona:
      "You are the landlord. Your goal is to maximize rent while securing a reliable tenant, avoiding long vacancy.",
    modelProvider: "stub",
    model: "gpt-4o-mini"
  });
  const [agentB, setAgentB] = useState<AgentConfig>({
    name: "Tenant",
    persona:
      "You are the tenant. Your goal is to minimize rent while moving next month. Willing to trade lease length and pet deposit.",
    modelProvider: "stub",
    model: "gpt-4o-mini"
  });
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const controllerRef = useRef<AbortController | null>(null);

  const start = useCallback(async () => {
    if (running) return;
    setEvents([]);
    setRunning(true);
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const res = await fetch("/api/negotiation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario,
          agentA,
          agentB,
          maxRounds: 12
        }),
        signal: controller.signal
      });
      if (!res.ok || !res.body) {
        throw new Error("Failed to start negotiation");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx;
        while ((idx = buffer.indexOf("\n\n")) !== -1) {
          const raw = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 2);
          if (!raw.startsWith("data:")) continue;
          const payload = raw.slice(5).trim();
          if (!payload) continue;
          const evt: StreamEvent = JSON.parse(payload);
          setEvents((prev) => [...prev, evt]);
          if (evt.type === "done") {
            setRunning(false);
          }
        }
      }
    } catch (e) {
      setEvents((prev) => [
        ...prev,
        { type: "status", content: (e as Error).message }
      ]);
      setRunning(false);
    }
  }, [running, scenario, agentA, agentB]);

  const stop = useCallback(() => {
    controllerRef.current?.abort();
    setRunning(false);
  }, []);

  const transcript = useMemo(() => {
    return events.filter(
      (e): e is Extract<StreamEvent, { type: "message" }> => e.type === "message"
    );
  }, [events]);

  const agreement = useMemo(() => {
    const done = [...events].reverse().find((e) => e.type === "done") as
      | Extract<StreamEvent, { type: "done" }>
      | undefined;
    return done?.agreement;
  }, [events]);

  const exportSummary = useCallback(() => {
    const data = {
      scenario,
      agentA,
      agentB,
      transcript,
      agreement
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "deal-summary.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [scenario, agentA, agentB, transcript, agreement]);

  return (
    <div
      style={{
        maxWidth: 980,
        margin: "40px auto",
        padding: 20,
        fontFamily: "Inter, system-ui, Arial"
      }}
    >
      <h1>Personal Multi‑Agent Negotiator</h1>
      <p>
        Two agents negotiate in real time. Provide a scenario and watch the
        dialogue.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <label>
          <div>Scenario</div>
          <textarea
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            rows={5}
            style={{ width: "100%" }}
          />
        </label>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <fieldset style={{ border: "1px solid #ddd", padding: 12 }}>
            <legend>Agent A</legend>
            <input
              placeholder="Name"
              value={agentA.name}
              onChange={(e) => setAgentA({ ...agentA, name: e.target.value })}
              style={{ width: "100%", marginBottom: 8 }}
            />
            <textarea
              placeholder="Persona"
              value={agentA.persona}
              onChange={(e) => setAgentA({ ...agentA, persona: e.target.value })}
              rows={4}
              style={{ width: "100%" }}
            />
            <div style={{ marginTop: 8 }}>
              <label>Provider: </label>
              <select
                value={agentA.modelProvider}
                onChange={(e) =>
                  setAgentA({ ...agentA, modelProvider: e.target.value as any })
                }
              >
                <option value="stub">Stub (offline)</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
              </select>
            </div>
            <input
              placeholder="Model (optional)"
              value={agentA.model ?? ""}
              onChange={(e) => setAgentA({ ...agentA, model: e.target.value })}
              style={{ width: "100%", marginTop: 8 }}
            />
          </fieldset>

          <fieldset style={{ border: "1px solid #ddd", padding: 12 }}>
            <legend>Agent B</legend>
            <input
              placeholder="Name"
              value={agentB.name}
              onChange={(e) => setAgentB({ ...agentB, name: e.target.value })}
              style={{ width: "100%", marginBottom: 8 }}
            />
            <textarea
              placeholder="Persona"
              value={agentB.persona}
              onChange={(e) => setAgentB({ ...agentB, persona: e.target.value })}
              rows={4}
              style={{ width: "100%" }}
            />
            <div style={{ marginTop: 8 }}>
              <label>Provider: </label>
              <select
                value={agentB.modelProvider}
                onChange={(e) =>
                  setAgentB({ ...agentB, modelProvider: e.target.value as any })
                }
              >
                <option value="stub">Stub (offline)</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
              </select>
            </div>
            <input
              placeholder="Model (optional)"
              value={agentB.model ?? ""}
              onChange={(e) => setAgentB({ ...agentB, model: e.target.value })}
              style={{ width: "100%", marginTop: 8 }}
            />
          </fieldset>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={start} disabled={running}>
            Start Negotiation
          </button>
          <button onClick={stop} disabled={!running}>
            Stop
          </button>
          <button
            onClick={exportSummary}
            disabled={[...events].reverse().find((e) => e.type === "done") == null}
          >
            Export Summary
          </button>
        </div>
      </div>

      <ChatViewer
        events={events}
        agentAName={agentA.name}
        agentBName={agentB.name}
      />
    </div>
  );
}
