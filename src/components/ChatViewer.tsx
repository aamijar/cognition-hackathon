import React from "react";

type StreamEvent =
  | { type: "message"; role: "agentA" | "agentB"; content: string; round: number }
  | { type: "status"; content: string }
  | { type: "done"; agreement?: string };

export default function ChatViewer({
  events,
  agentAName,
  agentBName
}: {
  events: StreamEvent[];
  agentAName: string;
  agentBName: string;
}) {
  return (
    <div style={{ marginTop: 24 }}>
      <h3>Live Negotiation</h3>
      <div
        style={{
          border: "1px solid #eee",
          borderRadius: 8,
          padding: 12,
          minHeight: 240
        }}
      >
        {events.map((e, i) => {
          if (e.type === "message") {
            const isA = e.role === "agentA";
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: isA ? "flex-start" : "flex-end",
                  marginBottom: 8
                }}
              >
                <div
                  style={{
                    maxWidth: "72%",
                    background: isA ? "#f1f5f9" : "#ecfeff",
                    border: "1px solid #e2e8f0",
                    padding: "8px 10px",
                    borderRadius: 8,
                    whiteSpace: "pre-wrap"
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "#475569",
                      marginBottom: 4
                    }}
                  >
                    {isA ? agentAName : agentBName} • Round {e.round}
                  </div>
                  <div>{e.content}</div>
                </div>
              </div>
            );
          }
          if (e.type === "status") {
            return (
              <div
                key={i}
                style={{
                  textAlign: "center",
                  color: "#64748b",
                  fontSize: 12,
                  margin: "8px 0"
                }}
              >
                {e.content}
              </div>
            );
          }
          if (e.type === "done") {
            return (
              <div
                key={i}
                style={{
                  textAlign: "center",
                  color: "#065f46",
                  background: "#ecfdf5",
                  border: "1px solid #d1fae5",
                  padding: 8,
                  borderRadius: 6,
                  marginTop: 8
                }}
              >
                Negotiation complete{e.agreement ? `: ${e.agreement}` : "."}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
