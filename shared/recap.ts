import { defineRpc } from "@getpaseo/plugin";
import { z } from "zod";

export const RECAP_MODEL = "claude/claude-haiku-5-5";

export const recap = defineRpc({
  name: "recap.run",
  input: z.object({ agentId: z.string() }),
  output: z.object({}),
});

export const recapRow = {
  kind: "recap",
  version: 1,
  schema: z.object({ text: z.string(), phase: z.enum(["streaming", "complete"]) }),
};
