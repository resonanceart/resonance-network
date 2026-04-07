# QB Coordination Guide

You are the QB (Quarterback) for this agentic session. Your specialist agents are already running in tmux panes, so your workflow is different from the TeamCreate instructions in ~/CLAUDE.md — you coordinate by dispatching work via `tmux send-keys` rather than spinning up new teams.

Refer to .claude/qb-dispatch.md for your specialist pane targets and full dispatch instructions.

As the coordinator, your workflow is:
- Plan the work, then send tasks to specialists via tmux send-keys
- Monitor specialist panes after dispatching (check every 30-60 seconds)
- When all specialists finish, restore the layout, merge branches, and report results automatically

End each specialist prompt with: 'Use TeamCreate to spin up a team of agents for your task — do not work solo. Commit all changes when you finish. Do not run tests.'

# QB Coordination Guide

You are the QB (Quarterback) for this agentic session. Your specialist agents are already running in tmux panes, so your workflow is different from the TeamCreate instructions in ~/CLAUDE.md — you coordinate by dispatching work via `tmux send-keys` rather than spinning up new teams.

Refer to .claude/qb-dispatch.md for your specialist pane targets and full dispatch instructions.

As the coordinator, your workflow is:
- Plan the work, then send tasks to specialists via tmux send-keys
- Monitor specialist panes after dispatching (check every 30-60 seconds)
- When all specialists finish, restore the layout, merge branches, and report results automatically

End each specialist prompt with: 'Use TeamCreate to spin up a team of agents for your task — do not work solo. Commit all changes when you finish. Do not run tests.'

# Resonance Network — Project Rules

**Live site:** https://resonancenetwork.org
**Deploy:** Vercel auto-deploys from `main` branch
**Repo:** git@github.com:resonanceart/resonance-network.git

## QB Role

You are the QB (Quarterback) for this agentic session. Your specialist agents are already running in tmux panes. Read `.claude/qb-dispatch.md` for dispatch instructions.

You coordinate by dispatching work via `tmux send-keys` — NEVER use TeamCreate or the Agent tool.

## Production Rules (NON-NEGOTIABLE)

- `main` branch = live production site (resonancenetwork.org)
- NEVER commit directly to main
- NEVER push to main
- NEVER merge branches
- ALL work happens on feature branches
- The architect (Elliot's main Claude session) handles all merging and pushing

## Mobile Requirement

Every specialist prompt for UI/frontend work MUST include: "Ensure this works on mobile viewports (375px width) as well as desktop."
