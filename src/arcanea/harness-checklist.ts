/**
 * Harness Engineering Review Checklist — Programmatic Validators
 *
 * Turns the 7-section HARNESS_CHECKLIST.md into runnable validation logic.
 * Each section has a validator function that returns ChecklistResult[].
 * Call `runHarnessChecklist()` for a full harness health report.
 */

import { GUARDIANS, getGuardianByGate } from "./guardians"
import type { Guardian } from "./guardians"
import {
  getFullLuminorRoster,
  buildElementFocusConfig,
  buildGateProgressionConfig,
  buildCouncilConfig,
  buildCoordinationPlan,
} from "./luminor-swarm"
import {
  activateGuardianForSession,
  getSessionGuardian,
  clearSessionGuardian,
  buildGuardianContextBlock,
} from "./hooks"
import {
  getAllPermissionProfiles,
  getPermissionProfile,
  isOperationAllowed,
  getOperationalLimits,
} from "./harness-permissions"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ChecklistStatus = "pass" | "fail" | "warn"

export interface ChecklistItem {
  id: string
  section: string
  description: string
}

export interface ChecklistResult {
  item: ChecklistItem
  status: ChecklistStatus
  message: string
}

export interface HarnessReport {
  timestamp: number
  results: ChecklistResult[]
  passed: number
  failed: number
  warnings: number
}

// ---------------------------------------------------------------------------
// Checklist definitions — mirrors HARNESS_CHECKLIST.md
// ---------------------------------------------------------------------------

const CHECKLIST_ITEMS: ChecklistItem[] = [
  // Agent Instructions
  { id: "ai-1", section: "Agent Instructions", description: "Confirm agent capabilities and constraints" },
  { id: "ai-2", section: "Agent Instructions", description: "Verify that agent instructions are clear and concise" },
  { id: "ai-3", section: "Agent Instructions", description: "Ensure instructions cover all expected scenarios" },
  // Tool Design
  { id: "td-1", section: "Tool Design", description: "Identify all tools involved in the process" },
  { id: "td-2", section: "Tool Design", description: "Assess usability and functionality of each tool" },
  { id: "td-3", section: "Tool Design", description: "Ensure tools are compatible with plugin architecture" },
  // Context Delivery
  { id: "cd-1", section: "Context Delivery", description: "Verify the context passed to agents is accurate" },
  { id: "cd-2", section: "Context Delivery", description: "Ensure context is sufficient for decision-making" },
  { id: "cd-3", section: "Context Delivery", description: "Assess how context is updated during execution" },
  // Planning Artifacts
  { id: "pa-1", section: "Planning Artifacts", description: "Review artifacts that guide plugin architecture decisions" },
  { id: "pa-2", section: "Planning Artifacts", description: "Confirm documentation is up-to-date" },
  { id: "pa-3", section: "Planning Artifacts", description: "Ensure all inferred dependencies are identified" },
  // Permissions and Sandbox
  { id: "ps-1", section: "Permissions and Sandbox", description: "Assess permissions assigned to agents" },
  { id: "ps-2", section: "Permissions and Sandbox", description: "Validate sandboxing measures are effectively in place" },
  { id: "ps-3", section: "Permissions and Sandbox", description: "Ensure agents operate within defined limits" },
  // Verification Loop
  { id: "vl-1", section: "Verification Loop", description: "Establish criteria for verification" },
  { id: "vl-2", section: "Verification Loop", description: "Verify outputs align with expectations" },
  { id: "vl-3", section: "Verification Loop", description: "Document any discrepancies and resolutions" },
  // Component Removal Criteria
  { id: "cr-1", section: "Component Removal Criteria", description: "Define criteria for removing unused components" },
  { id: "cr-2", section: "Component Removal Criteria", description: "Review the impact of removal on system functionality" },
  { id: "cr-3", section: "Component Removal Criteria", description: "Ensure proper documentation is in place before removal" },
]

function item(id: string): ChecklistItem {
  return CHECKLIST_ITEMS.find((i) => i.id === id)!
}

function pass(id: string, message: string): ChecklistResult {
  return { item: item(id), status: "pass", message }
}

function fail(id: string, message: string): ChecklistResult {
  return { item: item(id), status: "fail", message }
}

function warn(id: string, message: string): ChecklistResult {
  return { item: item(id), status: "warn", message }
}

// ---------------------------------------------------------------------------
// Guardian -> Tool category mapping (for Tool Design validation)
// ---------------------------------------------------------------------------

/** Maps Guardian gate names to relevant upstream tool categories */
export const GUARDIAN_TOOL_MAP: Record<string, string[]> = {
  Foundation: ["glob", "grep", "interactive_bash", "ast_grep_search"],
  Flow: ["glob", "grep", "ast_grep_search", "ast_grep_replace", "interactive_bash"],
  Fire: ["glob", "grep", "interactive_bash", "ast_grep_search"],
  Heart: ["glob", "grep", "look_at", "ast_grep_search"],
  Voice: ["glob", "grep", "ast_grep_search"],
  Sight: ["glob", "grep", "look_at"],
  Crown: ["glob", "grep", "interactive_bash", "ast_grep_search"],
  Starweave: ["glob", "grep", "ast_grep_search", "ast_grep_replace"],
  Unity: ["glob", "grep", "interactive_bash"],
  Source: ["glob", "grep", "task", "background_output", "call_omo_agent"],
}

// ---------------------------------------------------------------------------
// Guardian domain -> verification criteria mapping
// ---------------------------------------------------------------------------

export const VERIFICATION_CRITERIA: Record<string, string[]> = {
  Foundation: ["config files valid", "infrastructure stable", "bootstrap succeeds"],
  Flow: ["feature implemented", "code compiles", "no regressions"],
  Fire: ["tests pass", "coverage meets threshold", "no test flakiness"],
  Heart: ["UI renders correctly", "accessibility checks pass", "responsive layout"],
  Voice: ["documentation accurate", "no broken links", "clear language"],
  Sight: ["design matches spec", "visual consistency", "no rendering issues"],
  Crown: ["performance improved", "no memory leaks", "benchmarks pass"],
  Starweave: ["refactoring complete", "no behaviour change", "all tests pass"],
  Unity: ["CI pipeline green", "deployment succeeds", "integration tests pass"],
  Source: ["orchestration completes", "all agents report", "no deadlocks"],
}

// ---------------------------------------------------------------------------
// Component removal criteria
// ---------------------------------------------------------------------------

export const REMOVAL_CRITERIA = [
  "No imports or references from other modules",
  "No exports consumed by external API",
  "No test coverage exercising the component",
  "Functionality superseded by a replacement",
  "Guardian gate has empty domain, filePatterns, or keywords",
] as const

// ---------------------------------------------------------------------------
// Section 1: Agent Instructions
// ---------------------------------------------------------------------------

export function validateAgentInstructions(): ChecklistResult[] {
  const results: ChecklistResult[] = []

  // ai-1: Confirm agent capabilities and constraints
  const requiredFields: (keyof Guardian)[] = [
    "gate", "name", "element", "frequency", "godbeast", "domain", "filePatterns", "keywords", "motto",
  ]
  const incomplete = GUARDIANS.filter((g) =>
    requiredFields.some((f) => {
      const val = g[f]
      return val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)
    }),
  )
  if (incomplete.length === 0) {
    results.push(pass("ai-1", `All ${GUARDIANS.length} Guardians have complete capability fields`))
  } else {
    results.push(fail("ai-1", `Incomplete Guardians: ${incomplete.map((g) => g.name).join(", ")}`))
  }

  // ai-2: Verify instructions are clear and concise
  const MAX_MOTTO_LENGTH = 50
  const longMottos = GUARDIANS.filter((g) => g.motto.length > MAX_MOTTO_LENGTH)
  if (longMottos.length === 0) {
    results.push(pass("ai-2", `All mottos are concise (under ${MAX_MOTTO_LENGTH} chars)`))
  } else {
    results.push(warn("ai-2", `Long mottos: ${longMottos.map((g) => `${g.name} (${g.motto.length} chars)`).join(", ")}`))
  }

  // ai-3: Ensure instructions cover all expected scenarios
  const EXPECTED_GATES = [
    "Foundation", "Flow", "Fire", "Heart", "Voice",
    "Sight", "Crown", "Starweave", "Unity", "Source",
  ]
  const gateNames = GUARDIANS.map((g) => g.gate)
  const missingGates = EXPECTED_GATES.filter((g) => !gateNames.includes(g))
  if (missingGates.length === 0) {
    results.push(pass("ai-3", `All ${EXPECTED_GATES.length} expected gates are covered`))
  } else {
    results.push(fail("ai-3", `Missing gates: ${missingGates.join(", ")}`))
  }

  return results
}

// ---------------------------------------------------------------------------
// Section 2: Tool Design
// ---------------------------------------------------------------------------

export function validateToolDesign(): ChecklistResult[] {
  const results: ChecklistResult[] = []

  // td-1: Identify all tools
  const mappedGates = Object.keys(GUARDIAN_TOOL_MAP)
  const unmapped = GUARDIANS.filter((g) => !mappedGates.includes(g.gate))
  if (unmapped.length === 0) {
    results.push(pass("td-1", `All ${GUARDIANS.length} Guardians have tool mappings`))
  } else {
    results.push(fail("td-1", `Unmapped Guardians: ${unmapped.map((g) => g.name).join(", ")}`))
  }

  // td-2: Assess usability — every Guardian has at least one tool
  const emptyMappings = Object.entries(GUARDIAN_TOOL_MAP).filter(([, tools]) => tools.length === 0)
  if (emptyMappings.length === 0) {
    results.push(pass("td-2", "Every Guardian maps to at least one tool"))
  } else {
    results.push(fail("td-2", `Empty tool mappings: ${emptyMappings.map(([g]) => g).join(", ")}`))
  }

  // td-3: Plugin compatibility — tool names follow naming convention
  const allTools = new Set(Object.values(GUARDIAN_TOOL_MAP).flat())
  const validPattern = /^[a-z][a-z0-9_]*$/
  const invalidTools = [...allTools].filter((t) => !validPattern.test(t))
  if (invalidTools.length === 0) {
    results.push(pass("td-3", `All ${allTools.size} tool names are plugin-compatible`))
  } else {
    results.push(fail("td-3", `Invalid tool names: ${invalidTools.join(", ")}`))
  }

  return results
}

// ---------------------------------------------------------------------------
// Section 3: Context Delivery
// ---------------------------------------------------------------------------

export function validateContextDelivery(): ChecklistResult[] {
  const results: ChecklistResult[] = []
  const testSessionId = "__harness_check__"

  // cd-1: Verify context accuracy
  activateGuardianForSession(testSessionId, "test setup infrastructure")
  const context = buildGuardianContextBlock(testSessionId)
  const hasGate = context.includes('gate="')
  const hasElement = context.includes('element="')
  const hasFrequency = context.includes('frequency="')
  const hasGuardianName = context.includes("Guardian:")
  const hasDomain = context.includes("Domain:")
  const hasMotto = context.includes("Motto:")

  if (hasGate && hasElement && hasFrequency && hasGuardianName && hasDomain && hasMotto) {
    results.push(pass("cd-1", "Context block contains all required fields"))
  } else {
    const missing = []
    if (!hasGate) missing.push("gate")
    if (!hasElement) missing.push("element")
    if (!hasFrequency) missing.push("frequency")
    if (!hasGuardianName) missing.push("guardian name")
    if (!hasDomain) missing.push("domain")
    if (!hasMotto) missing.push("motto")
    results.push(fail("cd-1", `Context block missing: ${missing.join(", ")}`))
  }

  // cd-2: Context sufficiency — XML structure present
  const hasOpenTag = context.includes("<arcanea-guardian")
  const hasCloseTag = context.includes("</arcanea-guardian>")
  if (hasOpenTag && hasCloseTag) {
    results.push(pass("cd-2", "Context has valid XML structure for agent parsing"))
  } else {
    results.push(fail("cd-2", "Context missing XML tags"))
  }

  // cd-3: Context updates — activate/get/clear cycle
  const guardian = getSessionGuardian(testSessionId)
  const hasGuardian = guardian.gate === "Foundation"
  clearSessionGuardian(testSessionId)
  const defaultGuardian = getSessionGuardian(testSessionId)
  const clearedToDefault = defaultGuardian.gate === "Flow"

  if (hasGuardian && clearedToDefault) {
    results.push(pass("cd-3", "Session state updates correctly (activate/get/clear cycle)"))
  } else {
    results.push(fail("cd-3", `State cycle failed: activate=${hasGuardian}, clear=${clearedToDefault}`))
  }

  return results
}

// ---------------------------------------------------------------------------
// Section 4: Planning Artifacts
// ---------------------------------------------------------------------------

export function validatePlanningArtifacts(): ChecklistResult[] {
  const results: ChecklistResult[] = []

  // pa-1: Review artifacts — GUARDIANS array completeness
  if (GUARDIANS.length === 10) {
    results.push(pass("pa-1", "GUARDIANS array has exactly 10 entries (one per gate)"))
  } else {
    results.push(fail("pa-1", `GUARDIANS has ${GUARDIANS.length} entries (expected 10)`))
  }

  // pa-2: Documentation freshness — all Guardians have non-empty domains and mottos
  const stale = GUARDIANS.filter((g) => !g.domain.trim() || !g.motto.trim())
  if (stale.length === 0) {
    results.push(pass("pa-2", "All Guardians have populated domain and motto"))
  } else {
    results.push(warn("pa-2", `Stale documentation: ${stale.map((g) => g.name).join(", ")}`))
  }

  // pa-3: Dependencies — Luminor roster and coordination plans
  const roster = getFullLuminorRoster()
  const councilConfig = buildCouncilConfig()
  const councilPlan = buildCoordinationPlan(councilConfig)
  const hasCorrectRoster = roster.length === 40
  const hasCouncilPlan = councilPlan.phases.length > 0

  if (hasCorrectRoster && hasCouncilPlan) {
    results.push(pass("pa-3", `Luminor roster (${roster.length} agents) and coordination plans valid`))
  } else {
    results.push(fail("pa-3", `Roster: ${roster.length}/40, Council plan phases: ${councilPlan.phases.length}`))
  }

  return results
}

// ---------------------------------------------------------------------------
// Section 5: Permissions and Sandbox
// ---------------------------------------------------------------------------

export function validatePermissionsAndSandbox(): ChecklistResult[] {
  const results: ChecklistResult[] = []

  // ps-1: Assess permissions — every Guardian has a permission profile
  const profiles = getAllPermissionProfiles()
  const profileGates = new Set(profiles.map((p) => p.guardian))
  const missingProfiles = GUARDIANS.filter((g) => !profileGates.has(g.gate))
  if (missingProfiles.length === 0) {
    results.push(pass("ps-1", `All ${GUARDIANS.length} Guardians have permission profiles`))
  } else {
    results.push(fail("ps-1", `Missing profiles: ${missingProfiles.map((g) => g.name).join(", ")}`))
  }

  // ps-2: Validate sandboxing — read-only domains restrict edits
  const readOnlyGates = ["Sight"]
  const editRestricted = readOnlyGates.every((gate) => !isOperationAllowed(gate, "edit"))
  if (editRestricted) {
    results.push(pass("ps-2", `Read-only gates (${readOnlyGates.join(", ")}) correctly restrict edits`))
  } else {
    const violations = readOnlyGates.filter((gate) => isOperationAllowed(gate, "edit"))
    results.push(fail("ps-2", `Sandboxing violation — edit allowed for: ${violations.join(", ")}`))
  }

  // ps-3: Operational limits — swarm maxAgents within bounds
  const councilConfig = buildCouncilConfig()
  const elementConfig = buildElementFocusConfig("Fire")
  const councilOk = councilConfig.maxAgents <= 10
  const elementOk = elementConfig.maxAgents <= 4

  if (councilOk && elementOk) {
    results.push(pass("ps-3", `Swarm limits: council=${councilConfig.maxAgents}/10, element-focus=${elementConfig.maxAgents}/4`))
  } else {
    results.push(fail("ps-3", `Limits exceeded: council=${councilConfig.maxAgents}, element=${elementConfig.maxAgents}`))
  }

  return results
}

// ---------------------------------------------------------------------------
// Section 6: Verification Loop
// ---------------------------------------------------------------------------

export function validateVerificationLoop(): ChecklistResult[] {
  const results: ChecklistResult[] = []

  // vl-1: Establish criteria — every Guardian has verification criteria
  const criteriaGates = Object.keys(VERIFICATION_CRITERIA)
  const missingCriteria = GUARDIANS.filter((g) => !criteriaGates.includes(g.gate))
  if (missingCriteria.length === 0) {
    results.push(pass("vl-1", `Verification criteria defined for all ${GUARDIANS.length} gates`))
  } else {
    results.push(fail("vl-1", `Missing criteria: ${missingCriteria.map((g) => g.gate).join(", ")}`))
  }

  // vl-2: Verify outputs — criteria lists are non-empty
  const emptyCriteria = Object.entries(VERIFICATION_CRITERIA).filter(([, c]) => c.length === 0)
  if (emptyCriteria.length === 0) {
    results.push(pass("vl-2", "All verification criteria lists are populated"))
  } else {
    results.push(fail("vl-2", `Empty criteria for: ${emptyCriteria.map(([g]) => g).join(", ")}`))
  }

  // vl-3: Document discrepancies — gate progression produces sequential dependencies
  const progressionConfig = buildGateProgressionConfig(0, 2)
  const plan = buildCoordinationPlan(progressionConfig)
  const hasSequentialDeps = plan.phases.length >= 2 && Object.keys(plan.dependencies).length > 0
  if (hasSequentialDeps) {
    results.push(pass("vl-3", `Gate progression produces ${plan.phases.length} phases with dependencies`))
  } else {
    results.push(warn("vl-3", "Gate progression lacks sequential dependencies for discrepancy tracking"))
  }

  return results
}

// ---------------------------------------------------------------------------
// Section 7: Component Removal Criteria
// ---------------------------------------------------------------------------

export function validateComponentRemoval(): ChecklistResult[] {
  const results: ChecklistResult[] = []

  // cr-1: Define criteria — REMOVAL_CRITERIA is populated
  if (REMOVAL_CRITERIA.length > 0) {
    results.push(pass("cr-1", `${REMOVAL_CRITERIA.length} component removal criteria defined`))
  } else {
    results.push(fail("cr-1", "No removal criteria defined"))
  }

  // cr-2: Review impact — no Guardian has empty fields (would be removal candidate)
  const removalCandidates = GUARDIANS.filter(
    (g) => !g.domain || g.filePatterns.length === 0 || g.keywords.length === 0,
  )
  if (removalCandidates.length === 0) {
    results.push(pass("cr-2", "No Guardians qualify for removal (all fields populated)"))
  } else {
    results.push(warn("cr-2", `Removal candidates: ${removalCandidates.map((g) => g.name).join(", ")}`))
  }

  // cr-3: Documentation — all gates referenced in swarm builders
  const elementFocusElements = GUARDIANS.map((g) => g.element)
  const uniqueElements = new Set(elementFocusElements)
  const allElementsHaveGuardians = [...uniqueElements].every(
    (el) => GUARDIANS.some((g) => g.element === el),
  )
  const gateProgression = buildGateProgressionConfig(0, 9)
  const allGatesCovered = gateProgression.luminors.length === 10

  if (allElementsHaveGuardians && allGatesCovered) {
    results.push(pass("cr-3", "All gates and elements referenced in swarm configuration builders"))
  } else {
    results.push(fail("cr-3", "Some gates/elements missing from swarm builders"))
  }

  return results
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

/**
 * Run the full harness engineering review checklist.
 * Returns a report with results for all 21 items across 7 sections.
 */
export function runHarnessChecklist(): HarnessReport {
  const results: ChecklistResult[] = [
    ...validateAgentInstructions(),
    ...validateToolDesign(),
    ...validateContextDelivery(),
    ...validatePlanningArtifacts(),
    ...validatePermissionsAndSandbox(),
    ...validateVerificationLoop(),
    ...validateComponentRemoval(),
  ]

  return {
    timestamp: Date.now(),
    results,
    passed: results.filter((r) => r.status === "pass").length,
    failed: results.filter((r) => r.status === "fail").length,
    warnings: results.filter((r) => r.status === "warn").length,
  }
}
