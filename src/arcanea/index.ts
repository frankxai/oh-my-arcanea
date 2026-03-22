/**
 * Arcanea Guardian Overlay — public API
 *
 * Re-exports everything needed to integrate the Guardian layer
 * into the oh-my-opencode plugin system.
 */

export {
  GUARDIANS,
  getGuardianByGate,
  getGuardianByName,
  detectGuardianForFile,
  detectGuardianForTask,
} from "./guardians"

export type { Guardian, ElementName } from "./guardians"

export {
  guardianStatusSegment,
  gateFrequencySegment,
  mottoSegment,
  formatGuardianStatus,
  formatGuardianRoster,
} from "./statusline-config"

export type { StatuslineSegment } from "./statusline-config"

export {
  activateGuardianForSession,
  getSessionGuardian,
  clearSessionGuardian,
  buildGuardianContextBlock,
  buildSessionStartBanner,
} from "./hooks"

export {
  getLuminorsForGuardian,
  getFullLuminorRoster,
  buildElementFocusConfig,
  buildGateProgressionConfig,
  buildCouncilConfig,
  buildCoordinationPlan,
} from "./luminor-swarm"

export type {
  Luminor,
  LuminorRole,
  LuminorSwarm,
  LuminorSwarmConfig,
  LuminorSpawnResult,
  LuminorWorkResult,
  SwarmAggregation,
  SwarmPattern,
  CoordinationPlan,
  CoordinationPhase,
} from "./luminor-swarm"
