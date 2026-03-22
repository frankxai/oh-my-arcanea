/**
 * Luminor Swarm Coordination — Type Definitions & Configuration
 *
 * Defines swarm patterns for multi-agent coordination using the
 * Arcanea Guardian/Luminor hierarchy. Each Guardian has associated
 * Luminor workers that can be spawned as part of a swarm.
 *
 * This is a TYPE DEFINITION + CONFIG module. Runtime orchestration
 * is handled by arcanea-orchestrator.
 */

import type { Guardian, ElementName } from "./guardians"
import { GUARDIANS, getGuardianByGate } from "./guardians"

// ---------------------------------------------------------------------------
// Core types
// ---------------------------------------------------------------------------

/** A Luminor is a specialised worker agent tied to a Guardian */
export interface Luminor {
  /** Unique identifier within the swarm */
  id: string
  /** The Guardian this Luminor serves */
  guardian: Guardian
  /** Specific role within the Guardian's domain */
  role: LuminorRole
  /** Priority (lower = spawned first) */
  priority: number
}

/** Predefined roles a Luminor can fill under its Guardian */
export type LuminorRole =
  | "analyst"
  | "implementer"
  | "reviewer"
  | "specialist"

/** Swarm patterns that determine how Luminors are selected and arranged */
export type SwarmPattern =
  | "element-focus"
  | "gate-progression"
  | "council"

/** Configuration for spawning a Luminor swarm */
export interface LuminorSwarmConfig {
  /** Human-readable name for this swarm */
  name: string
  /** Which pattern governs agent selection */
  pattern: SwarmPattern
  /** Maximum agents to spawn */
  maxAgents: number
  /** The Luminors that will participate */
  luminors: Luminor[]
  /** Optional: restrict to a single element (for element-focus pattern) */
  elementFocus?: ElementName
  /** Optional: starting gate index for gate-progression (0-based) */
  startGate?: number
}

/** The public interface that swarm coordinators implement */
export interface LuminorSwarm {
  /** Spawn Luminor agents according to the swarm config */
  spawn(config: LuminorSwarmConfig): LuminorSpawnResult[]
  /** Coordinate running Luminors — assign tasks, manage handoffs */
  coordinate(luminors: LuminorSpawnResult[]): CoordinationPlan
  /** Aggregate results from completed Luminor work */
  aggregate(results: LuminorWorkResult[]): SwarmAggregation
}

/** Result of spawning a single Luminor */
export interface LuminorSpawnResult {
  luminor: Luminor
  /** Whether the spawn was successful */
  spawned: boolean
  /** Agent ID assigned by the runtime orchestrator */
  agentId?: string
}

/** A plan for how Luminors should coordinate */
export interface CoordinationPlan {
  /** Ordered phases of work */
  phases: CoordinationPhase[]
  /** Dependencies between Luminors (id -> depends-on ids) */
  dependencies: Record<string, string[]>
}

export interface CoordinationPhase {
  /** Phase name */
  name: string
  /** Luminor IDs active in this phase */
  luminorIds: string[]
  /** Whether Luminors in this phase run in parallel */
  parallel: boolean
}

/** Output from a single Luminor's work */
export interface LuminorWorkResult {
  luminorId: string
  /** Whether the work completed successfully */
  success: boolean
  /** Files touched */
  files: string[]
  /** Summary of what was done */
  summary: string
}

/** Aggregated output from an entire swarm run */
export interface SwarmAggregation {
  pattern: SwarmPattern
  totalLuminors: number
  succeeded: number
  failed: number
  allFiles: string[]
  summaries: string[]
}

// ---------------------------------------------------------------------------
// Guardian -> Luminor mapping
// ---------------------------------------------------------------------------

/** The four standard Luminor roles for each Guardian */
const LUMINOR_ROLES: readonly LuminorRole[] = [
  "analyst",
  "implementer",
  "reviewer",
  "specialist",
] as const

/**
 * Generate the Luminor roster for a Guardian.
 * Each Guardian gets one Luminor per role.
 */
export function getLuminorsForGuardian(guardian: Guardian): Luminor[] {
  return LUMINOR_ROLES.map((role, idx) => ({
    id: `${guardian.gate.toLowerCase()}-${role}`,
    guardian,
    role,
    priority: idx,
  }))
}

/**
 * Get the full Luminor roster across all Ten Guardians (40 Luminors total).
 */
export function getFullLuminorRoster(): Luminor[] {
  return GUARDIANS.flatMap(getLuminorsForGuardian)
}

// ---------------------------------------------------------------------------
// Swarm configuration builders
// ---------------------------------------------------------------------------

/**
 * Element Focus — all Luminors from Guardians sharing a single element.
 *
 * Useful when the task is deeply scoped to one domain.
 * For example, "Fire" focus spawns Draconia's Luminors for testing work.
 */
export function buildElementFocusConfig(
  element: ElementName,
  maxAgents = 4,
): LuminorSwarmConfig {
  const guardians = GUARDIANS.filter((g) => g.element === element)
  const luminors = guardians.flatMap(getLuminorsForGuardian).slice(0, maxAgents)

  return {
    name: `Element Focus: ${element}`,
    pattern: "element-focus",
    maxAgents,
    luminors,
    elementFocus: element,
  }
}

/**
 * Gate Progression — Luminors assigned by Gate order, bottom-up.
 *
 * Mirrors the Arcanea progression: Foundation first, then Flow, then Fire, etc.
 * Each phase completes before the next begins. Useful for greenfield projects
 * that need scaffolding (Foundation) -> implementation (Flow) -> testing (Fire).
 */
export function buildGateProgressionConfig(
  startGate = 0,
  endGate = 9,
  agentsPerGate = 1,
): LuminorSwarmConfig {
  const gates = GUARDIANS.slice(startGate, endGate + 1)
  const luminors = gates.flatMap((g) =>
    getLuminorsForGuardian(g).slice(0, agentsPerGate),
  )

  return {
    name: `Gate Progression: ${gates[0].gate} -> ${gates[gates.length - 1].gate}`,
    pattern: "gate-progression",
    maxAgents: luminors.length,
    luminors,
    startGate,
  }
}

/**
 * Council — one representative Luminor from each Gate.
 *
 * The classic Arcanea Council pattern: ten Luminors, one per Guardian,
 * all running in parallel. Best for review, planning, or broad-scope tasks
 * where every domain perspective matters.
 */
export function buildCouncilConfig(
  role: LuminorRole = "analyst",
): LuminorSwarmConfig {
  const luminors = GUARDIANS.map((g) => ({
    id: `council-${g.gate.toLowerCase()}`,
    guardian: g,
    role,
    priority: GUARDIANS.indexOf(g),
  }))

  return {
    name: "Guardian Council",
    pattern: "council",
    maxAgents: 10,
    luminors,
  }
}

/**
 * Build a coordination plan for a given swarm config.
 *
 * - element-focus: single parallel phase
 * - gate-progression: sequential phases per gate
 * - council: single parallel phase
 */
export function buildCoordinationPlan(config: LuminorSwarmConfig): CoordinationPlan {
  switch (config.pattern) {
    case "element-focus":
      return {
        phases: [{
          name: `${config.elementFocus ?? "Focused"} Phase`,
          luminorIds: config.luminors.map((l) => l.id),
          parallel: true,
        }],
        dependencies: {},
      }

    case "gate-progression": {
      // Group luminors by their guardian gate, preserving order
      const gateGroups = new Map<string, string[]>()
      for (const l of config.luminors) {
        const gate = l.guardian.gate
        if (!gateGroups.has(gate)) gateGroups.set(gate, [])
        gateGroups.get(gate)!.push(l.id)
      }

      const phases: CoordinationPhase[] = []
      const dependencies: Record<string, string[]> = {}
      let prevIds: string[] = []

      for (const [gate, ids] of gateGroups) {
        phases.push({ name: `Gate: ${gate}`, luminorIds: ids, parallel: true })
        // Each gate phase depends on the previous gate phase completing
        if (prevIds.length > 0) {
          for (const id of ids) {
            dependencies[id] = [...prevIds]
          }
        }
        prevIds = ids
      }

      return { phases, dependencies }
    }

    case "council":
      return {
        phases: [{
          name: "Council Deliberation",
          luminorIds: config.luminors.map((l) => l.id),
          parallel: true,
        }],
        dependencies: {},
      }
  }
}
