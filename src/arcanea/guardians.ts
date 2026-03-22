/**
 * Arcanea Guardian Overlay — Ten Gates with Guardian routing
 *
 * Each Guardian corresponds to a Gate in the Arcanea progression system.
 * Guardians provide domain-specific routing hints that the statusline
 * and hooks can use to contextualise the coding session.
 */

export type ElementName =
  | "Earth"
  | "Water"
  | "Fire"
  | "Heart"
  | "Voice"
  | "Sight"
  | "Crown"
  | "Starweave"
  | "Unity"
  | "Void"

export interface Guardian {
  /** Gate name in the Ten Gates system */
  gate: string
  /** Guardian (God/Goddess) name */
  name: string
  /** Elemental affinity */
  element: ElementName
  /** Solfeggio frequency in Hz */
  frequency: number
  /** Godbeast companion */
  godbeast: string
  /** Primary coding domain */
  domain: string
  /** File-pattern globs that activate this Guardian */
  filePatterns: string[]
  /** Keywords in commit messages / task descriptions that activate */
  keywords: string[]
  /** Short motto shown in the statusline */
  motto: string
}

/**
 * The canonical Ten Guardians, ordered by Gate frequency.
 */
export const GUARDIANS: readonly Guardian[] = [
  {
    gate: "Foundation",
    name: "Lyssandria",
    element: "Earth",
    frequency: 174,
    godbeast: "Kaelith",
    domain: "Stability, architecture",
    filePatterns: ["**/config/**", "**/infra/**", "**/*.config.*", "**/docker*", "**/terraform/**"],
    keywords: ["setup", "infrastructure", "scaffold", "init", "bootstrap", "config"],
    motto: "Build on bedrock.",
  },
  {
    gate: "Flow",
    name: "Leyla",
    element: "Water",
    frequency: 285,
    godbeast: "Veloura",
    domain: "Creativity, flow state",
    filePatterns: ["**/src/**", "**/lib/**", "**/features/**", "**/modules/**"],
    keywords: ["feature", "implement", "create", "build", "new", "flow"],
    motto: "Let the current carry you.",
  },
  {
    gate: "Fire",
    name: "Draconia",
    element: "Fire",
    frequency: 396,
    godbeast: "Draconis",
    domain: "Transformation, testing",
    filePatterns: ["**/*.test.*", "**/*.spec.*", "**/tests/**", "**/__tests__/**"],
    keywords: ["test", "assert", "verify", "validate", "coverage", "mutation"],
    motto: "Through flame, truth.",
  },
  {
    gate: "Heart",
    name: "Maylinn",
    element: "Heart",
    frequency: 417,
    godbeast: "Laeylinn",
    domain: "Empathy, UX",
    filePatterns: ["**/components/**", "**/ui/**", "**/pages/**", "**/app/**", "**/*.css", "**/*.scss"],
    keywords: ["ux", "ui", "component", "accessibility", "a11y", "user", "experience"],
    motto: "Feel what they feel.",
  },
  {
    gate: "Voice",
    name: "Alera",
    element: "Voice",
    frequency: 528,
    godbeast: "Otome",
    domain: "Clarity, documentation",
    filePatterns: ["**/*.md", "**/docs/**", "**/README*", "**/*.txt", "**/CHANGELOG*"],
    keywords: ["doc", "readme", "comment", "explain", "document", "changelog", "api-doc"],
    motto: "Speak so all may understand.",
  },
  {
    gate: "Sight",
    name: "Lyria",
    element: "Sight",
    frequency: 639,
    godbeast: "Yumiko",
    domain: "Vision, design",
    filePatterns: ["**/design/**", "**/*.figma", "**/styles/**", "**/theme/**", "**/*.svg"],
    keywords: ["design", "visual", "layout", "theme", "style", "figma", "mockup"],
    motto: "See what is not yet.",
  },
  {
    gate: "Crown",
    name: "Aiyami",
    element: "Crown",
    frequency: 741,
    godbeast: "Sol",
    domain: "Mastery, optimization",
    filePatterns: ["**/perf/**", "**/benchmark/**", "**/optimize/**"],
    keywords: ["optimize", "performance", "perf", "cache", "speed", "memory", "bundle"],
    motto: "Mastery is economy of motion.",
  },
  {
    gate: "Starweave",
    name: "Elara",
    element: "Starweave",
    frequency: 852,
    godbeast: "Vaelith",
    domain: "Perspective, refactoring",
    filePatterns: ["**/refactor/**", "**/migration/**", "**/legacy/**"],
    keywords: ["refactor", "restructure", "migrate", "rewrite", "clean", "debt", "pattern"],
    motto: "Weave the threads anew.",
  },
  {
    gate: "Unity",
    name: "Ino",
    element: "Unity",
    frequency: 963,
    godbeast: "Kyuro",
    domain: "Collaboration, integration",
    filePatterns: ["**/.github/**", "**/ci/**", "**/cd/**", "**/*.yml", "**/*.yaml"],
    keywords: ["integrate", "merge", "ci", "cd", "pipeline", "deploy", "release", "pr"],
    motto: "Together, unstoppable.",
  },
  {
    gate: "Source",
    name: "Shinkami",
    element: "Void",
    frequency: 1111,
    godbeast: "Source",
    domain: "Meta-consciousness, orchestration",
    filePatterns: ["**/orchestrator/**", "**/swarm/**", "**/agents/**", "**/plugin/**"],
    keywords: ["orchestrate", "swarm", "agent", "meta", "architect", "system", "plan"],
    motto: "All paths converge at the Source.",
  },
] as const

/**
 * Look up a Guardian by gate name (case-insensitive).
 */
export function getGuardianByGate(gate: string): Guardian | undefined {
  return GUARDIANS.find((g) => g.gate.toLowerCase() === gate.toLowerCase())
}

/**
 * Look up a Guardian by name (case-insensitive).
 */
export function getGuardianByName(name: string): Guardian | undefined {
  return GUARDIANS.find((g) => g.name.toLowerCase() === name.toLowerCase())
}

/**
 * Detect which Guardian is most relevant for a given file path.
 * Returns the first match, or Leyla (Flow) as the default.
 */
export function detectGuardianForFile(filePath: string): Guardian {
  const normalised = filePath.replace(/\\/g, "/")

  for (const guardian of GUARDIANS) {
    for (const pattern of guardian.filePatterns) {
      // Simple glob check — convert glob to regex
      const regexStr = pattern
        .replace(/\*\*/g, ".*")
        .replace(/\*/g, "[^/]*")
        .replace(/\./g, "\\.")
      if (new RegExp(regexStr).test(normalised)) {
        return guardian
      }
    }
  }

  // Default to Leyla (Flow) — the creative coding gate
  return GUARDIANS[1]
}

/**
 * Detect which Guardian is most relevant based on keywords in a task description.
 * Returns the first match, or Leyla (Flow) as the default.
 */
export function detectGuardianForTask(description: string): Guardian {
  const lower = description.toLowerCase()

  for (const guardian of GUARDIANS) {
    for (const keyword of guardian.keywords) {
      if (lower.includes(keyword)) {
        return guardian
      }
    }
  }

  return GUARDIANS[1]
}
