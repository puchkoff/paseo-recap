import type { PluginButtonRegistration, PluginClientContext } from "@getpaseo/plugin/client";

const PROMPT = "tldr recap and next steps? End your reply with a last line that says exactly: RECAP ↑";

export default function contribute(client: PluginClientContext) {
  const pills = new Map<string, PluginButtonRegistration>();
  const lifetime = new AbortController();
  const register = (agent: { id: string; workspaceId?: string | null }) => {
    // Agents upsert on every status change; an existing pill stays.
    if (lifetime.signal.aborted || !agent.workspaceId || pills.has(agent.id)) return;
    const agentId = agent.id;
    pills.set(
      agentId,
      client.addComposerPill({
        id: "recap",
        workspaceId: agent.workspaceId,
        agentId,
        button: {
          title: "Ask for a TL;DR recap and next steps",
          label: "Recap",
          icon: "ListChecks",
          behavior: { kind: "action", onPress: () => client.paseo.agents.ref(agentId).send(PROMPT) },
        },
      }),
    );
  };
  const removeAll = () => {
    for (const pill of pills.values()) pill.remove();
    pills.clear();
  };
  void client.paseo.agents
    .list({ subscribe: {}, signal: lifetime.signal })
    .then(({ subscription }) => {
      subscription.subscribe({
        snapshot: ({ entries }) => {
          removeAll();
          for (const { agent } of entries) register(agent);
        },
        update: (message) => {
          if (message.type !== "agent_update") return;
          const update = message.payload;
          if (update.kind === "upsert") return register(update.agent);
          pills.get(update.agentId)?.remove();
          pills.delete(update.agentId);
        },
      });
      return undefined;
    })
    .catch((error) => {
      if (!lifetime.signal.aborted) console.error("[paseo-recap] agent observation failed", error);
    });
  return () => {
    lifetime.abort();
    removeAll();
  };
}
