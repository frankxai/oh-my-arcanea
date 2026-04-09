/**
 * Harness Permissions — Guardian-scoped permission profiles & sandbox boundaries
 *
 * Each Guardian maps to a permission profile that defines what operations
 * are allowed, what paths are in scope, and operational limits for
 * Luminor agents spawned under that Guardian.
 */

import type { Guardian } from "./guardians"
import { GUARDIANS } from "./guardians"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Operations that a Guardian-scoped agent can perform */
export type OperationType = "read" | "edit" | "execute" | "delegate" | "orchestrate"

/** Permission profile tied to a Guardian gate */
export interface GuardianPermissionProfile {
  /** Gate name this profile applies to */
  guardian: string
  /** Operations explicitly allowed */
  allowed: OperationType[]
  /** Operations explicitly restricted */
  restricted: OperationType[]
  /** Maximum concurrent Luminor agents under this Guardian */
  maxConcurrentAgents: number
  /** Glob patterns for files this Guardian can touch */
  sandboxPaths: string[]
}

/** Operational limits for Luminor agents under a Guardian */
export interface OperationalLimits {
  maxAgents: number
  maxFilesPerOperation: number
  timeoutMs: number
}

/** Result of a bounds check */
export interface BoundsCheckResult {
  allowed: boolean
  reason: string
}

// ---------------------------------------------------------------------------
// Permission profiles — one per Guardian gate
// ---------------------------------------------------------------------------

const ALL_OPERATIONS: OperationType[] = ["read", "edit", "execute", "delegate", "orchestrate"]

function complement(allowed: OperationType[]): OperationType[] {
  return ALL_OPERATIONS.filter((op) => !allowed.includes(op))
}

const PROFILES: GuardianPermissionProfile[] = [
  {
    guardian: "Foundation",
    allowed: ["read", "edit", "execute"],
    restricted: ["delegate", "orchestrate"],
    maxConcurrentAgents: 4,
    sandboxPaths: ["**/config/**", "**/infra/**", "**/*.config.*", "**/docker*", "**/terraform/**"],
  },
  {
    guardian: "Flow",
    allowed: ["read", "edit", "execute"],
    restricted: ["delegate", "orchestrate"],
    maxConcurrentAgents: 4,
    sandboxPaths: ["**/src/**", "**/lib/**", "**/features/**", "**/modules/**"],
  },
  {
    guardian: "Fire",
    allowed: ["read", "execute"],
    restricted: ["edit", "delegate", "orchestrate"],
    maxConcurrentAgents: 4,
    sandboxPaths: ["**/*.test.*", "**/*.spec.*", "**/tests/**", "**/__tests__/**"],
  },
  {
    guardian: "Heart",
    allowed: ["read", "edit"],
    restricted: ["execute", "delegate", "orchestrate"],
    maxConcurrentAgents: 4,
    sandboxPaths: ["**/components/**", "**/ui/**", "**/pages/**", "**/app/**", "**/*.css", "**/*.scss"],
  },
  {
    guardian: "Voice",
    allowed: ["read", "edit"],
    restricted: ["execute", "delegate", "orchestrate"],
    maxConcurrentAgents: 2,
    sandboxPaths: ["**/*.md", "**/docs/**", "**/README*", "**/*.txt", "**/CHANGELOG*"],
  },
  {
    guardian: "Sight",
    allowed: ["read"],
    restricted: ["edit", "execute", "delegate", "orchestrate"],
    maxConcurrentAgents: 2,
    sandboxPaths: ["**/design/**", "**/*.figma", "**/styles/**", "**/theme/**", "**/*.svg"],
  },
  {
    guardian: "Crown",
    allowed: ["read", "execute"],
    restricted: ["edit", "delegate", "orchestrate"],
    maxConcurrentAgents: 4,
    sandboxPaths: ["**/perf/**", "**/benchmark/**", "**/optimize/**"],
  },
  {
    guardian: "Starweave",
    allowed: ["read", "edit"],
    restricted: ["execute", "delegate", "orchestrate"],
    maxConcurrentAgents: 4,
    sandboxPaths: ["**/*"],
  },
  {
    guardian: "Unity",
    allowed: ["read", "edit", "execute"],
    restricted: ["delegate", "orchestrate"],
    maxConcurrentAgents: 4,
    sandboxPaths: ["**/.github/**", "**/ci/**", "**/cd/**", "**/*.yml", "**/*.yaml"],
  },
  {
    guardian: "Source",
    allowed: ["read", "orchestrate", "delegate"],
    restricted: ["edit", "execute"],
    maxConcurrentAgents: 10,
    sandboxPaths: ["**/orchestrator/**", "**/swarm/**", "**/agents/**", "**/plugin/**"],
  },
]

/** Pre-built map for O(1) lookup */
const PROFILE_MAP = new Map<string, GuardianPermissionProfile>(
  PROFILES.map((p) => [p.guardian.toLowerCase(), p]),
)

// ---------------------------------------------------------------------------
// Operational limits per Guardian
// ---------------------------------------------------------------------------

const DEFAULT_LIMITS: OperationalLimits = {
  maxAgents: 4,
  maxFilesPerOperation: 50,
  timeoutMs: 120_000,
}

const LIMITS_OVERRIDES: Record<string, Partial<OperationalLimits>> = {
  voice: { maxAgents: 2, maxFilesPerOperation: 20, timeoutMs: 60_000 },
  sight: { maxAgents: 2, maxFilesPerOperation: 20, timeoutMs: 60_000 },
  source: { maxAgents: 10, maxFilesPerOperation: 100, timeoutMs: 300_000 },
  crown: { timeoutMs: 180_000 },
  starweave: { maxFilesPerOperation: 100 },
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get the permission profile for a Guardian by gate name.
 * Returns undefined if the gate is not recognised.
 */
export function getPermissionProfile(gateName: string): GuardianPermissionProfile | undefined {
  return PROFILE_MAP.get(gateName.toLowerCase())
}

/**
 * Check whether an operation is allowed for a Guardian gate.
 */
export function isOperationAllowed(gateName: string, operation: OperationType): boolean {
  const profile = PROFILE_MAP.get(gateName.toLowerCase())
  if (!profile) return false
  return profile.allowed.includes(operation)
}

/**
 * Get operational limits for a Guardian gate.
 */
export function getOperationalLimits(gateName: string): OperationalLimits {
  const overrides = LIMITS_OVERRIDES[gateName.toLowerCase()]
  if (!overrides) return { ...DEFAULT_LIMITS }
  return { ...DEFAULT_LIMITS, ...overrides }
}

/**
 * Validate whether an operation on a file path is within bounds for a Guardian.
 */
export function validateActionWithinBounds(
  gateName: string,
  operation: OperationType,
  filePath: string,
): BoundsCheckResult {
  const profile = PROFILE_MAP.get(gateName.toLowerCase())
  if (!profile) {
    return { allowed: false, reason: `Unknown gate: ${gateName}` }
  }

  if (!profile.allowed.includes(operation)) {
    return {
      allowed: false,
      reason: `Operation "${operation}" is restricted for ${profile.guardian} Guardian`,
    }
  }

  const normalised = filePath.replace(/\\/g, "/")
  const pathMatch = profile.sandboxPaths.some((pattern) => {
    const regexStr = pattern
      .replace(/\*\*/g, "\0")
      .replace(/\*/g, "[^/]*")
      .replace(/\./g, "\\.")
      .replace(/\0/g, ".*")
    return new RegExp(regexStr).test(normalised)
  })

  if (!pathMatch) {
    return {
      allowed: false,
      reason: `Path "${filePath}" is outside ${profile.guardian} Guardian sandbox`,
    }
  }

  return { allowed: true, reason: "Action within bounds" }
}

/**
 * Get all permission profiles (used by harness checklist validators).
 */
export function getAllPermissionProfiles(): readonly GuardianPermissionProfile[] {
  return PROFILES
}
