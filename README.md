# Oh My Arcanea

**Guardian-routed multi-model orchestration for OpenCode.**

Oh My Arcanea layers the Arcanea Ten Gates system on top of [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) — the powerful agent harness by YeonGyu Kim. All upstream agents (Sisyphus, Prometheus, Hephaestus, Oracle, and friends) remain fully intact. Arcanea adds a Guardian overlay that contextualises your coding sessions through the Ten Gates progression.

## The Ten Guardians

| Gate | Guardian | Element | Freq | Domain |
|------|----------|---------|------|--------|
| Foundation | Lyssandria | Earth | 174 Hz | Stability, architecture |
| Flow | Leyla | Water | 285 Hz | Creativity, flow state |
| Fire | Draconia | Fire | 396 Hz | Transformation, testing |
| Heart | Maylinn | Heart | 417 Hz | Empathy, UX |
| Voice | Alera | Voice | 528 Hz | Clarity, documentation |
| Sight | Lyria | Sight | 639 Hz | Vision, design |
| Crown | Aiyami | Crown | 741 Hz | Mastery, optimization |
| Starweave | Elara | Starweave | 852 Hz | Perspective, refactoring |
| Unity | Ino | Unity | 963 Hz | Collaboration, integration |
| Source | Shinkami | Void | 1111 Hz | Meta-consciousness, orchestration |

When you start a session, the Guardian overlay detects the domain of your work from file patterns and task keywords, then activates the corresponding Guardian. The active Guardian's context is preserved across compaction and displayed in the statusline.

## Installation

```bash
npm install oh-my-arcanea
```

The package uses upstream `oh-my-opencode` platform binaries — no separate binary build required.

## Usage

Use it exactly as you would oh-my-opencode. The Arcanea layer activates automatically:

```bash
npx oh-my-arcanea
# or
npx opencode-arcanea
```

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
