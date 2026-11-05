<p align="center"><img src="assets/icon.png" width="96" alt="Recap logo"></p>

# Recap — a Paseo plugin

Adds a Recap button to every agent's composer. Pressing it sends "tldr recap and next steps?" to that agent and shows the answer in a popup, so you can catch up on a long chat in one tap.

![The Recap button, outlined, in an agent's composer](assets/screenshot-recap.png)

The prompt and the answer also stay in the chat like any message you type. There are no settings and no daemon code.

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
