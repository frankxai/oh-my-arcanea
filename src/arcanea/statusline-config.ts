/**
 * Arcanea Statusline Configuration
 *
 * Provides statusline segments that display the active Guardian,
 * current Gate, and element in the terminal statusline.
 */

import type { Guardian } from "./guardians"
import { GUARDIANS } from "./guardians"

/** ANSI colour codes mapped to each element */
const ELEMENT_COLORS: Record<string, string> = {
  Earth: "\x1b[32m",      // green
  Water: "\x1b[36m",      // cyan
  Fire: "\x1b[31m",       // red
  Heart: "\x1b[35m",      // magenta
  Voice: "\x1b[33m",      // yellow
  Sight: "\x1b[34m",      // blue
  Crown: "\x1b[97m",      // bright white
  Starweave: "\x1b[95m",  // bright magenta
  Unity: "\x1b[96m",      // bright cyan
  Void: "\x1b[90m",       // dark grey (with gold accent implied)
}

const RESET = "\x1b[0m"

export interface StatuslineSegment {
  /** Raw text (no ANSI) for width calculation */
  text: string
  /** ANSI-colored text for display */
  colored: string
}

/**
 * Build a statusline segment for a Guardian.
 */
export function guardianStatusSegment(guardian: Guardian): StatuslineSegment {
  const color = ELEMENT_COLORS[guardian.element] ?? ""
  const glyph = getElementGlyph(guardian.element)
  const text = `${glyph} ${guardian.name} [${guardian.gate}]`
  const colored = `${color}${text}${RESET}`
  return { text, colored }
}

/**
 * Build a compact segment showing just the gate and frequency.
 */
export function gateFrequencySegment(guardian: Guardian): StatuslineSegment {
  const color = ELEMENT_COLORS[guardian.element] ?? ""
  const text = `${guardian.frequency}Hz`
  const colored = `${color}${text}${RESET}`
  return { text, colored }
}

/**
 * Build a motto segment for display in session start.
 */
export function mottoSegment(guardian: Guardian): StatuslineSegment {
  const color = ELEMENT_COLORS[guardian.element] ?? ""
  const text = `"${guardian.motto}"`
  const colored = `${color}${text}${RESET}`
  return { text, colored }
}

/**
 * Get the full statusline string for a Guardian.
 */
export function formatGuardianStatus(guardian: Guardian): string {
  const seg = guardianStatusSegment(guardian)
  const freq = gateFrequencySegment(guardian)
  return `${seg.colored} ${freq.colored}`
}

/**
 * Get a Unicode glyph for each element.
 */
function getElementGlyph(element: string): string {
  switch (element) {
    case "Earth":     return "\u25B2" // triangle up (mountain)
    case "Water":     return "\u224B" // triple tilde (waves)
    case "Fire":      return "\u2737" // six-pointed star (flame)
    case "Heart":     return "\u2661" // white heart
    case "Voice":     return "\u266A" // eighth note (song)
    case "Sight":     return "\u25C9" // fisheye (eye)
    case "Crown":     return "\u2655" // white chess queen (crown)
    case "Starweave": return "\u2726" // four-pointed star
    case "Unity":     return "\u221E" // infinity
    case "Void":      return "\u25CC" // dotted circle
    default:          return "\u2022" // bullet
  }
}

/**
 * Get the full Guardian roster as a formatted string — useful for help output.
 */
export function formatGuardianRoster(): string {
  const lines = GUARDIANS.map((g) => {
    const color = ELEMENT_COLORS[g.element] ?? ""
    const glyph = getElementGlyph(g.element)
    return `${color}${glyph} ${g.name.padEnd(12)} ${g.gate.padEnd(12)} ${g.element.padEnd(10)} ${g.frequency}Hz  ${g.domain}${RESET}`
  })

  return [
    "",
    `${ELEMENT_COLORS.Crown}The Ten Guardians of Arcanea${RESET}`,
    `${"=".repeat(72)}`,
    ...lines,
    `${"=".repeat(72)}`,
    "",
  ].join("\n")
}
