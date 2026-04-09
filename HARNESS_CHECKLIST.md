# Harness Engineering Review Checklist

> Programmatic validators: `src/arcanea/harness-checklist.ts`
> Permission profiles: `src/arcanea/harness-permissions.ts`
> Run all checks: `runHarnessChecklist()` from `src/arcanea/index.ts`

## Agent Instructions
- [x] Confirm agent capabilities and constraints
- [x] Verify that agent instructions are clear and concise
- [x] Ensure instructions cover all expected scenarios

## Tool Design
- [x] Identify all tools involved in the process
- [x] Assess usability and functionality of each tool
- [x] Ensure tools are compatible with plugin architecture

## Context Delivery
- [x] Verify the context passed to agents is accurate
- [x] Ensure context is sufficient for decision-making
- [x] Assess how context is updated during execution

## Planning Artifacts
- [x] Review artifacts that guide plugin architecture decisions
- [x] Confirm documentation is up-to-date
- [x] Ensure all inferred dependencies are identified

## Permissions and Sandbox
- [x] Assess permissions assigned to agents
- [x] Validate sandboxing measures are effectively in place
- [x] Ensure agents operate within defined limits

## Verification Loop
- [x] Establish criteria for verification
- [x] Verify outputs align with expectations
- [x] Document any discrepancies and resolutions

## Component Removal Criteria
- [x] Define criteria for removing unused components
- [x] Review the impact of removal on system functionality
- [x] Ensure proper documentation is in place before removal
