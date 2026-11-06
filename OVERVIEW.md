Recap adds a Recap button to each agent's composer. Pressing it gives you a TL;DR recap of the chat and the next steps, so you can catch up on a long chat in one tap.

Claude Haiku 5.5 writes the recap, so the chat's own agent spends nothing on it. The plugin copies the chat's user and agent messages (up to the last 200,000 characters, without tool calls) into a short-lived Haiku agent, then shows its answer in the chat as a "RECAP ↑ (Haiku)" row. The Haiku agent is archived when it finishes.

Setup: the Claude provider must be installed and signed in on the daemon. The recap runs through it, so no API key is needed. The recap row is not sent to the chat's agent and is lost when the daemon restarts.
