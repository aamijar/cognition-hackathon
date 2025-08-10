import type { NextApiRequest, NextApiResponse } from "next";
import { negotiate } from "@lib/orchestrator";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb"
    }
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
    return;
  }

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const { scenario, agentA, agentB, maxRounds = 12 } = req.body ?? {};
  if (!scenario || !agentA || !agentB) {
    res.write(`data: ${JSON.stringify({ type: "status", content: "Invalid payload" })}\n\n`);
    res.end();
    return;
  }

  try {
    for await (const evt of negotiate({ scenario, agentA, agentB, maxRounds })) {
      res.write(`data: ${JSON.stringify(evt)}\n\n`);
    }
    res.end();
  } catch (e) {
    res.write(`data: ${JSON.stringify({ type: "status", content: (e as Error).message })}\n\n`);
    res.end();
  }
}
