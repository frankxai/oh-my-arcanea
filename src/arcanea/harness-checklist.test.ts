import { describe, test, expect } from "bun:test"

import {
  runHarnessChecklist,
  validateAgentInstructions,
  validateToolDesign,
  validateContextDelivery,
  validatePlanningArtifacts,
  validatePermissionsAndSandbox,
  validateVerificationLoop,
  validateComponentRemoval,
  GUARDIAN_TOOL_MAP,
  VERIFICATION_CRITERIA,
  REMOVAL_CRITERIA,
} from "./harness-checklist"

import {
  getPermissionProfile,
  isOperationAllowed,
  getOperationalLimits,
  validateActionWithinBounds,
  getAllPermissionProfiles,
} from "./harness-permissions"

import { GUARDIANS } from "./guardians"

describe("Agent Instructions", () => {
  test("all 10 Guardians have complete fields", () => {
    //#given
    const results = validateAgentInstructions()

    //#when
    const capabilitiesResult = results.find((r) => r.item.id === "ai-1")

    //#then
    expect(capabilitiesResult?.status).toBe("pass")
  })

  test("all mottos are concise", () => {
    //#given
    const results = validateAgentInstructions()

    //#when
    const clarityResult = results.find((r) => r.item.id === "ai-2")

    //#then
    expect(clarityResult?.status).not.toBe("fail")
  })

  test("all expected gates are covered", () => {
    //#given
    const results = validateAgentInstructions()

    //#when
    const coverageResult = results.find((r) => r.item.id === "ai-3")

    //#then
    expect(coverageResult?.status).toBe("pass")
  })
})

describe("Tool Design", () => {
  test("every Guardian maps to at least one tool category", () => {
    //#given
    const results = validateToolDesign()

    //#when
    const identifyResult = results.find((r) => r.item.id === "td-1")
    const usabilityResult = results.find((r) => r.item.id === "td-2")

    //#then
    expect(identifyResult?.status).toBe("pass")
    expect(usabilityResult?.status).toBe("pass")
  })

  test("tool names follow plugin naming convention", () => {
    //#given
    const results = validateToolDesign()

    //#when
    const compatResult = results.find((r) => r.item.id === "td-3")

    //#then
    expect(compatResult?.status).toBe("pass")
  })
})

describe("Context Delivery", () => {
  test("context block contains all required fields", () => {
    //#given
    const results = validateContextDelivery()

    //#when
    const accuracyResult = results.find((r) => r.item.id === "cd-1")

    //#then
    expect(accuracyResult?.status).toBe("pass")
  })

  test("context has valid XML structure", () => {
    //#given
    const results = validateContextDelivery()

    //#when
    const sufficiencyResult = results.find((r) => r.item.id === "cd-2")

    //#then
    expect(sufficiencyResult?.status).toBe("pass")
  })

  test("session state updates correctly", () => {
    //#given
    const results = validateContextDelivery()

    //#when
    const updateResult = results.find((r) => r.item.id === "cd-3")

    //#then
    expect(updateResult?.status).toBe("pass")
  })
})

describe("Planning Artifacts", () => {
  test("GUARDIANS array has exactly 10 entries", () => {
    //#given
    const results = validatePlanningArtifacts()

    //#when
    const artifactResult = results.find((r) => r.item.id === "pa-1")

    //#then
    expect(artifactResult?.status).toBe("pass")
    expect(GUARDIANS.length).toBe(10)
  })

  test("Luminor roster has 40 entries and coordination plans are valid", () => {
    //#given
    const results = validatePlanningArtifacts()

    //#when
    const depsResult = results.find((r) => r.item.id === "pa-3")

    //#then
    expect(depsResult?.status).toBe("pass")
  })
})

describe("Permissions and Sandbox", () => {
  test("permission profiles exist for all 10 gates", () => {
    //#given
    const profiles = getAllPermissionProfiles()

    //#when
    const profileGates = new Set(profiles.map((p) => p.guardian))

    //#then
    expect(profiles.length).toBe(10)
    for (const g of GUARDIANS) {
      expect(profileGates.has(g.gate)).toBe(true)
    }
  })

  test("read-only domains restrict edit operations", () => {
    //#given
    const sightProfile = getPermissionProfile("Sight")

    //#when
    const canEdit = isOperationAllowed("Sight", "edit")

    //#then
    expect(sightProfile).toBeDefined()
    expect(canEdit).toBe(false)
  })

  test("Source gate can orchestrate and delegate", () => {
    //#given & when
    const canOrchestrate = isOperationAllowed("Source", "orchestrate")
    const canDelegate = isOperationAllowed("Source", "delegate")
    const canEdit = isOperationAllowed("Source", "edit")

    //#then
    expect(canOrchestrate).toBe(true)
    expect(canDelegate).toBe(true)
    expect(canEdit).toBe(false)
  })

  test("validateActionWithinBounds checks both operation and path", () => {
    //#given
    const allowed = validateActionWithinBounds("Foundation", "read", "src/config/schema.ts")
    const restrictedOp = validateActionWithinBounds("Sight", "edit", "src/design/theme.ts")
    const outsidePath = validateActionWithinBounds("Voice", "edit", "src/agents/sisyphus.ts")

    //#then
    expect(allowed.allowed).toBe(true)
    expect(restrictedOp.allowed).toBe(false)
    expect(outsidePath.allowed).toBe(false)
  })

  test("operational limits are set correctly", () => {
    //#given
    const voiceLimits = getOperationalLimits("Voice")
    const sourceLimits = getOperationalLimits("Source")

    //#then
    expect(voiceLimits.maxAgents).toBe(2)
    expect(sourceLimits.maxAgents).toBe(10)
    expect(sourceLimits.timeoutMs).toBe(300_000)
  })

  test("swarm maxAgents within bounds", () => {
    //#given
    const results = validatePermissionsAndSandbox()

    //#when
    const limitsResult = results.find((r) => r.item.id === "ps-3")

    //#then
    expect(limitsResult?.status).toBe("pass")
  })
})

describe("Verification Loop", () => {
  test("verification criteria defined for all gates", () => {
    //#given
    const criteriaGates = Object.keys(VERIFICATION_CRITERIA)

    //#then
    for (const g of GUARDIANS) {
      expect(criteriaGates).toContain(g.gate)
    }
  })

  test("all criteria lists are non-empty", () => {
    //#given
    const results = validateVerificationLoop()

    //#when
    const outputResult = results.find((r) => r.item.id === "vl-2")

    //#then
    expect(outputResult?.status).toBe("pass")
  })
})

describe("Component Removal", () => {
  test("removal criteria are defined", () => {
    //#then
    expect(REMOVAL_CRITERIA.length).toBeGreaterThan(0)
  })

  test("no Guardians have empty fields", () => {
    //#given
    const results = validateComponentRemoval()

    //#when
    const impactResult = results.find((r) => r.item.id === "cr-2")

    //#then
    expect(impactResult?.status).toBe("pass")
  })
})

describe("runHarnessChecklist", () => {
  test("produces valid report with 21 results", () => {
    //#given & when
    const report = runHarnessChecklist()

    //#then
    expect(report.results.length).toBe(21)
    expect(report.passed + report.failed + report.warnings).toBe(21)
    expect(report.timestamp).toBeGreaterThan(0)
  })

  test("all items pass or warn (no failures)", () => {
    //#given & when
    const report = runHarnessChecklist()

    //#then
    expect(report.failed).toBe(0)
  })

  test("covers all 7 sections", () => {
    //#given & when
    const report = runHarnessChecklist()

    //#then
    const sections = new Set(report.results.map((r) => r.item.section))
    expect(sections.size).toBe(7)
    expect(sections.has("Agent Instructions")).toBe(true)
    expect(sections.has("Tool Design")).toBe(true)
    expect(sections.has("Context Delivery")).toBe(true)
    expect(sections.has("Planning Artifacts")).toBe(true)
    expect(sections.has("Permissions and Sandbox")).toBe(true)
    expect(sections.has("Verification Loop")).toBe(true)
    expect(sections.has("Component Removal Criteria")).toBe(true)
  })
})
