<p align="center"><img src="assets/icon.png" width="96" alt="Recap logo"></p>

# Recap — a Paseo plugin

![Recap: Paseo plugin screen (illustration)](docs/hero.svg)

Adds a Recap button to every agent's composer. Pressing it gives you a TL;DR recap of the chat and the next steps, so you can catch up on a long chat in one tap.

![The Recap button, outlined, in an agent's composer](assets/screenshot-recap.png)

Claude Haiku 5.5 writes the recap, so the chat's own agent spends nothing on it. The daemon side copies the chat's user and agent messages (last 200,000 characters, no tool calls) into a short-lived `claude/claude-haiku-5-5` agent and shows its answer in the chat as a "RECAP ↑ (Haiku)" row. It runs through the installed Claude provider, so no API key is needed. The row is not sent to the chat's agent and does not survive a daemon restart.

The button shows only in chats with an existing agent, because Paseo does not draw plugin pills in a new-agent draft.

## Install

Requires Paseo 0.15.2 or later.

```bash
paseo plugin install https://github.com/puchkoff/paseo-recap
```

Or from a local clone: `paseo plugin install ./paseo-recap`. Check with `paseo plugin ls`.

## Develop

```bash
npm install
npm run typecheck
```

The in-app description shown by Paseo lives in [OVERVIEW.md](OVERVIEW.md).
