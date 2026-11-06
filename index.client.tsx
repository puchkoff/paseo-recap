import type { PluginButtonRegistration, PluginClientContext, PluginTimelineItemProps } from "@getpaseo/plugin/client";
import { StreamedText } from "@getpaseo/plugin/client/ui";
import type { z } from "zod";
import { recap, recapRow } from "./shared/recap";

function RecapRow({ item, theme }: PluginTimelineItemProps<z.infer<typeof recapRow.schema>>) {
  return <StreamedText text={item.data.text} phase={item.data.phase} style={{ color: theme.colors.foreground }} />;
}

export default function contribute(client: PluginClientContext) {
  const pills = new Map<string, PluginButtonRegistration>();
  const lifetime = new AbortController();
  const removeRenderer = client.addTimelineRenderer({ ...recapRow, Component: RecapRow });
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
          title: "Haiku writes a TL;DR recap and next steps of this chat",
          label: "Recap",
          icon: "ListChecks",
          behavior: { kind: "action", onPress: async () => {
            await client.rpc(recap, { agentId });
          } },
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
    removeRenderer();
  };
}
