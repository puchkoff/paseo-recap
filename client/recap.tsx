import type { PluginButtonContentProps } from "@getpaseo/plugin/client";
import { usePaseo } from "@getpaseo/plugin/client";
import { Markdown } from "@getpaseo/plugin/client/ui";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

const PROMPT = "tldr recap and next steps?";

// One run per agent: reopening the popup while a recap is running shows it instead of asking again.
const running = new Map<string, Promise<string>>();

type State = { kind: "loading" } | { kind: "done"; text: string } | { kind: "error"; text: string };

export function RecapPopup(props: PluginButtonContentProps) {
  const paseo = usePaseo();
  const { theme } = props;
  const agentId = props.context === "agent" ? props.agentId : null;
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (!agentId) return;
    let live = true;
    let run = running.get(agentId);
    if (!run) {
      run = paseo.agents
        .ref(agentId)
        .run(PROMPT)
        .then((result) => {
          if (result.status !== "idle") throw new Error(result.error ?? `Agent stopped: ${result.status}`);
          return result.lastMessage ?? "";
        })
        .finally(() => running.delete(agentId));
      running.set(agentId, run);
    }
    run.then(
      (text) => live && setState({ kind: "done", text }),
      (error: unknown) => live && setState({ kind: "error", text: String(error) }),
    );
    return () => {
      live = false;
    };
  }, [agentId, paseo]);

  if (state.kind === "loading") {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, minWidth: 280 }}>
        <ActivityIndicator color={theme.colors.foregroundMuted} />
        <Text style={{ color: theme.colors.foregroundMuted }}>Asking the agent for a recap…</Text>
      </View>
    );
  }
  if (state.kind === "error") {
    return <Text style={{ color: theme.colors.foreground }}>Recap failed: {state.text}</Text>;
  }
  return (
    <View style={{ maxWidth: 560 }}>
      <Markdown>{state.text || "_The agent replied with no text._"}</Markdown>
    </View>
  );
}
