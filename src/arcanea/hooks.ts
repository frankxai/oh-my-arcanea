/**
 * Arcanea Session Hooks
 *
 * Injects Guardian-awareness into session start and end.
 * These hooks layer on top of the existing oh-my-opencode hook system —
 * they do NOT replace Sisyphus/Prometheus/Hephaestus agents.
 */

import type { Guardian } from "./guardians"
import { GUARDIANS, detectGuardianForTask } from "./guardians"
import { formatGuardianStatus, mottoSegment } from "./statusline-config"
import { log } from "../shared/logger"

/** Per-session Guardian state */
interface GuardianSessionState {
  activeGuardian: Guardian
  activatedAt: number
  sessionId: string
}

/** In-memory store of active Guardian per session */
const sessionGuardians = new Map<string, GuardianSessionState>()

/**
 * Activate a Guardian for a session based on the first message content.
 * Called during session start / first message processing.
 */
export function activateGuardianForSession(
  sessionId: string,
  messageText: string,
): Guardian {
  const guardian = detectGuardianForTask(messageText)

  sessionGuardians.set(sessionId, {
    activeGuardian: guardian,
    activatedAt: Date.now(),
    sessionId,
  })

  log("[Arcanea] Guardian activated", {
    session: sessionId,
    guardian: guardian.name,
    gate: guardian.gate,
    element: guardian.element,
  })

  return guardian
}

/**
 * Get the active Guardian for a session, or the default (Leyla / Flow).
 */
export function getSessionGuardian(sessionId: string): Guardian {
  return sessionGuardians.get(sessionId)?.activeGuardian ?? GUARDIANS[1]
}

/**
 * Clear Guardian state when a session ends.
 */
export function clearSessionGuardian(sessionId: string): void {
  sessionGuardians.delete(sessionId)
  log("[Arcanea] Guardian cleared for session", { session: sessionId })
}

/**
 * Build the Arcanea context block that gets injected into the system prompt.
 * This adds Guardian-awareness without replacing any existing agent prompts.
 */
export function buildGuardianContextBlock(sessionId: string): string {
  const guardian = getSessionGuardian(sessionId)
  const motto = mottoSegment(guardian)
  const status = formatGuardianStatus(guardian)

  return [
    "",
    "<!-- Arcanea Guardian Overlay -->",
    `<arcanea-guardian gate="${guardian.gate}" element="${guardian.element}" frequency="${guardian.frequency}Hz">`,
    `  Guardian: ${guardian.name} (${guardian.godbeast})`,
    `  Domain: ${guardian.domain}`,
    `  Motto: ${motto.text}`,
    `</arcanea-guardian>`,
    "",
  ].join("\n")
}

/**
 * Build a session-start banner shown to the user.
 */
export function buildSessionStartBanner(guardian: Guardian): string {
  const status = formatGuardianStatus(guardian)
  const motto = mottoSegment(guardian)

  return [
    "",
    status,
    `  ${motto.colored}`,
    `  Domain: ${guardian.domain}`,
    "",
  ].join("\n")
}
