# Oh My Arcanea — Development Guide

## What It Is

Oh My Arcanea is the **Arcanea overlay for OpenCode** — it layers the Ten Gates Guardian system on top of [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode). All upstream agents (Sisyphus, Prometheus, Hephaestus, Oracle) remain intact. The Arcanea layer adds:

- **Guardian detection** — maps files and task keywords to the Ten Guardians
- **Context injection** — active Guardian domain/motto/element added to the session
- **Luminor swarms** — type definitions for multi-agent coordination patterns
- **Statusline** — terminal display of active Guardian with element colours

## Architecture

```
src/
  arcanea/              # <-- THE OVERLAY (Arcanea-specific code)
    guardians.ts        # Ten Guardians: types, roster, file/task detection
    hooks.ts            # Session lifecycle: activate/clear Guardian per session
    statusline-config.ts # ANSI-coloured statusline segments
    luminor-swarm.ts    # Luminor swarm types and config builders
    index.ts            # Public API re-exports
  ...                   # Everything else is upstream oh-my-opencode
```

Only edit files in `src/arcanea/` for Guardian/Luminor features. The rest of the codebase is upstream and should only be modified for integration points.

## The Guardian System

Ten Guardians, each tied to a Gate, an element, and a coding domain:

| Gate | Guardian | Element | Domain |
|------|----------|---------|--------|
| Foundation | Lyssandria | Earth | Stability, architecture |
| Flow | Leyla | Water | Creativity, flow state |
| Fire | Draconia | Fire | Transformation, testing |
| Heart | Maylinn | Heart | Empathy, UX |
| Voice | Alera | Voice | Clarity, documentation |
| Sight | Lyria | Sight | Vision, design |
| Crown | Aiyami | Crown | Mastery, optimization |
| Starweave | Elara | Starweave | Perspective, refactoring |
| Unity | Ino | Unity | Collaboration, integration |
| Source | Shinkami | Void | Meta-consciousness, orchestration |

Detection priority: file patterns first, then task keywords, default to Leyla (Flow).

## Build & Test

```bash
# Install dependencies
bun install

# Build
bun run build

# Type check
bun run typecheck

# Test
bun test
```

## Key Rules

- Read a file before editing it
- Do not modify upstream oh-my-opencode files unless integrating a new hook point
- All Guardian/Luminor types go in `src/arcanea/`
- Export new public API through `src/arcanea/index.ts`
- Keep files under 500 lines
- Run `bun run typecheck` after changes

## Cached-Belief Validation Protocol

Any claim about CURRENT state — versions, ship status, file paths, architecture, deployment — requires same-turn verification (Read/Bash) OR explicit prefix: "unverified, from [memory|prior-turn] (date X):".

Memory is authoritative ONLY for: intent, strategy, preferences, decision history.
Memory is NEVER authoritative for: current state of code, deploys, or systems.
