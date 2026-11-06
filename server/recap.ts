import type { PluginHandlerContext } from "@getpaseo/plugin/server";
import { RECAP_MODEL, recapRow } from "../shared/recap";

const PROMPT =
  "Below is a chat between a user and a coding agent. Write a TL;DR recap of it and the next steps. " +
  "Answer from the transcript only; do not use tools.\n\n<transcript>\n";
// Keeps the prompt well inside Haiku's 200k-token window.
const MAX_CHARS = 200_000;

export async function runRecap({ agentId }: { agentId: string }, { paseo }: PluginHandlerContext) {
  const source = paseo.agents.ref(agentId);
  const page = await source.timeline.refetch({ direction: "tail", limit: 1000 });
  const transcript = page.entries
    .map(({ item }) =>
      item.type === "user_message" ? `User: ${item.text}` : item.type === "assistant_message" ? `Agent: ${item.text}` : "",
    )
    .filter(Boolean)
    .join("\n\n")
    .slice(-MAX_CHARS);
  if (!transcript) throw new Error("Nothing to recap yet.");
  const cwd = page.agent?.cwd ?? (await source.refresh())?.agent.cwd;
  if (!cwd) throw new Error("Agent has no working directory.");

  const id = `recap-${Date.now()}`;
  const show = (text: string, phase: "streaming" | "complete") =>
    source.timeline.append({ type: "plugin", id, kind: recapRow.kind, version: recapRow.version, data: { text, phase } });
  await show("Haiku is writing a recap…", "streaming");

  const haiku = await paseo.agents.create({
    config: { provider: RECAP_MODEL },
    cwd,
    title: "Recap",
    autoArchive: true,
    prompt: `${PROMPT}${transcript}\n</transcript>`,
  });
  try {
    const result = await haiku.waitForFinish(180_000);
    const text = result.lastMessage ?? `Recap failed: ${result.error ?? result.status}`;
    await show(`${text}\n\nRECAP ↑ (Haiku)`, "complete");
  } catch (error) {
    await show(`Recap failed: ${error instanceof Error ? error.message : String(error)}`, "complete");
    throw error;
  } finally {
    await haiku.archive().catch(() => undefined);
  }
  return {};
}
