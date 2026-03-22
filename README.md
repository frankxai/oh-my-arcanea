# Oh My Arcanea

**Guardian-routed multi-model orchestration for OpenCode.**

Oh My Arcanea layers the Arcanea Ten Gates system on top of [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) — the powerful agent harness by YeonGyu Kim. All upstream agents (Sisyphus, Prometheus, Hephaestus, Oracle, and friends) remain fully intact. Arcanea adds a Guardian overlay that contextualises your coding sessions through the Ten Gates progression.

## Installation

```bash
npm install oh-my-arcanea
```

Or run directly without installing:

```bash
npx oh-my-arcanea
```

The package uses upstream `oh-my-opencode` platform binaries — no separate binary build required.

## Quick Start

### With OpenCode

Oh My Arcanea works as a drop-in replacement for oh-my-opencode. Start a session and the Guardian overlay activates automatically:

```bash
npx oh-my-arcanea
# or the alias:
npx opencode-arcanea
```

When you begin a session, the overlay detects the domain of your work from file patterns and task keywords, then activates the corresponding Guardian. For example:

- Editing `src/components/Button.tsx` activates **Maylinn** (Heart Gate — UX)
- Running tests activates **Draconia** (Fire Gate — testing)
- Writing docs activates **Alera** (Voice Gate — documentation)

### With arcanea-orchestrator (Multi-Agent Swarms)

For multi-agent swarm coordination, use [arcanea-orchestrator](https://github.com/frankxai/arcanea-orchestrator) which consumes the Luminor swarm types exported by this package:

```typescript
import {
  buildCouncilConfig,
  buildGateProgressionConfig,
  buildElementFocusConfig,
  buildCoordinationPlan,
} from "oh-my-arcanea"

// Council pattern: one Luminor per Guardian, all in parallel
const council = buildCouncilConfig("analyst")

// Gate Progression: sequential phases from Foundation to Source
const progression = buildGateProgressionConfig(0, 4) // Foundation -> Voice

// Element Focus: all agents from one element
const fireFocus = buildElementFocusConfig("Fire", 4)

// Generate the coordination plan for any config
const plan = buildCoordinationPlan(council)
```

## The Ten Guardians

| Gate | Guardian | Godbeast | Element | Freq | Domain |
|------|----------|----------|---------|------|--------|
| Foundation | Lyssandria | Kaelith | Earth | 174 Hz | Stability, architecture |
| Flow | Leyla | Veloura | Water | 285 Hz | Creativity, flow state |
| Fire | Draconia | Draconis | Fire | 396 Hz | Transformation, testing |
| Heart | Maylinn | Laeylinn | Heart | 417 Hz | Empathy, UX |
| Voice | Alera | Otome | Voice | 528 Hz | Clarity, documentation |
| Sight | Lyria | Yumiko | Sight | 639 Hz | Vision, design |
| Crown | Aiyami | Sol | Crown | 741 Hz | Mastery, optimization |
| Starweave | Elara | Vaelith | Starweave | 852 Hz | Perspective, refactoring |
| Unity | Ino | Kyuro | Unity | 963 Hz | Collaboration, integration |
| Source | Shinkami | Source | Void | 1111 Hz | Meta-consciousness, orchestration |

## Luminor Swarm Patterns

Each Guardian has four Luminor workers (analyst, implementer, reviewer, specialist). Three swarm patterns are available:

| Pattern | Description | Use Case |
|---------|-------------|----------|
| **Element Focus** | All Luminors from Guardians sharing one element | Deeply scoped tasks (e.g., all-testing, all-UX) |
| **Gate Progression** | Sequential phases ordered by Gate (Foundation -> Source) | Greenfield projects: scaffold, implement, test, document |
| **Council** | One representative from each Gate, all in parallel | Reviews, planning, broad-scope architecture decisions |

## How It Works

1. **Guardian Detection** — When a session starts, the overlay analyses your first message and active files to detect the relevant Gate.
2. **Context Injection** — The active Guardian's domain, motto, and element are injected into the session context, giving the AI awareness of the coding domain.
3. **Compaction Preservation** — Guardian state survives context compaction so the AI maintains awareness across long sessions.
4. **Statusline** — The active Guardian, Gate, and frequency are shown in the terminal statusline with element-coloured output.

All existing oh-my-opencode features (Sisyphus orchestration, Prometheus planning, Hephaestus tooling, background agents, tmux integration, skills, etc.) work exactly as before.

## Configuration

Oh My Arcanea reads the same `.oh-my-opencode` config file. No additional configuration is needed for the Guardian overlay — it activates automatically based on context.

## Attribution

This project is a fork of [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) by [YeonGyu Kim](https://github.com/code-yeongyu) and contributors, licensed under SUL-1.0. The Arcanea Guardian overlay is an additive layer that extends the original without modifying its core behaviour.

## License

SUL-1.0 (same as upstream oh-my-opencode)
