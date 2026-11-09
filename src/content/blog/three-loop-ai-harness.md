---
title: "The Three-Loop AI Engineering Harness: Eliminating Hallucinations in Production"
description: "Moving beyond loose prompts into structured harness engineering: isolating Project, Feature, and Task loops with AST verification, contract tests, and pre-commit security gates."
date: "2026-10-24"
category: "AI Harness Engineering"
readingTime: "6 min read"
tags: ["Agent Harnesses", "Deterministic CI", "Developer Tooling"]
---

Over the past two years, engineering organizations have rushed to incorporate AI developer assistants and autonomous agents into their daily development workflows. Yet, team leads frequently encounter a common obstacle: while LLMs are phenomenal at generating greenfield code snippets, they struggle with sustained accuracy in mature multi-repository architectures.

## The Failure of the Single-Prompt Loop

Most agent failures do not stem from reasoning deficiencies, but rather from uncontrolled scope and context pollution. When an agent is asked to fulfill a high-level user request in a single execution loop, it attempts to plan, code, refactor, and self-test all within a single shrinking context window. This inevitably leads to:

- **Context Degradation**: Earlier invariant instructions and architectural constraints get dropped from the active context.
- **Silent Regressions**: Existing unit tests are skipped or silently modified to force a green build.
- **Leaked Discussion State**: Workspace commit histories become polluted with raw prompt chatter.

## The Three Loops: Project, Feature, and Task

<figure class="my-8 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4 sm:p-6 shadow-sm">
  <svg class="w-full min-w-[580px] h-auto text-slate-800 dark:text-slate-100" viewBox="0 0 700 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Loop 1: Project Loop -->
    <rect x="20" y="30" width="190" height="140" rx="10" class="fill-white dark:fill-slate-800 stroke-teal-500" stroke-width="1.5"/>
    <text x="115" y="55" text-anchor="middle" class="fill-teal-700 dark:fill-teal-400 font-bold font-sans text-xs uppercase tracking-wide font-mono">Loop 1: Project</text>
    <text x="115" y="78" text-anchor="middle" class="fill-slate-900 dark:fill-white font-semibold text-xs">Repo Governance</text>
    <text x="115" y="98" text-anchor="middle" class="fill-slate-500 dark:fill-slate-400 text-[10px]">• Invariant Rules (AGENTS.md)</text>
    <text x="115" y="115" text-anchor="middle" class="fill-slate-500 dark:fill-slate-400 text-[10px]">• AST Repository Catalog</text>
    <text x="115" y="132" text-anchor="middle" class="fill-slate-500 dark:fill-slate-400 text-[10px]">• Clean Author Commit State</text>

    <!-- Arrow 1 to 2 -->
    <path d="M210 100 L255 100" class="stroke-teal-600 dark:stroke-teal-400" stroke-width="2" marker-end="url(#arrow2)"/>

    <!-- Loop 2: Feature Loop -->
    <rect x="255" y="30" width="190" height="140" rx="10" class="fill-white dark:fill-slate-800 stroke-indigo-500" stroke-width="1.5"/>
    <text x="350" y="55" text-anchor="middle" class="fill-indigo-700 dark:fill-indigo-400 font-bold font-sans text-xs uppercase tracking-wide font-mono">Loop 2: Feature</text>
    <text x="350" y="78" text-anchor="middle" class="fill-slate-900 dark:fill-white font-semibold text-xs">Contract Verification</text>
    <text x="350" y="98" text-anchor="middle" class="fill-slate-500 dark:fill-slate-400 text-[10px]">• Frozen Interface Schema</text>
    <text x="350" y="115" text-anchor="middle" class="fill-slate-500 dark:fill-slate-400 text-[10px]">• Spec-First Unit Tests</text>
    <text x="350" y="132" text-anchor="middle" class="fill-slate-500 dark:fill-slate-400 text-[10px]">• Mock Contract Boundary</text>

    <!-- Arrow 2 to 3 -->
    <path d="M445 100 L490 100" class="stroke-teal-600 dark:stroke-teal-400" stroke-width="2" marker-end="url(#arrow2)"/>

    <!-- Loop 3: Task Loop -->
    <rect x="490" y="30" width="190" height="140" rx="10" class="fill-white dark:fill-slate-800 stroke-emerald-500" stroke-width="1.5"/>
    <text x="585" y="55" text-anchor="middle" class="fill-emerald-700 dark:fill-emerald-400 font-bold font-sans text-xs uppercase tracking-wide font-mono">Loop 3: Task</text>
    <text x="585" y="78" text-anchor="middle" class="fill-slate-900 dark:fill-white font-semibold text-xs">Deterministic Gates</text>
    <text x="585" y="98" text-anchor="middle" class="fill-slate-500 dark:fill-slate-400 text-[10px]">• Atomic Code Mutations</text>
    <text x="585" y="115" text-anchor="middle" class="fill-slate-500 dark:fill-slate-400 text-[10px]">• Zero-Token Pre-Commit Hooks</text>
    <text x="585" y="132" text-anchor="middle" class="fill-slate-500 dark:fill-slate-400 text-[10px]">• Pass / Fail CI Gates</text>

    <defs>
      <marker id="arrow2" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 8 5 L 0 9 z" class="fill-teal-600 dark:fill-teal-400"/>
      </marker>
    </defs>
  </svg>
  <figcaption class="text-xs text-center text-slate-500 dark:text-slate-400 mt-3 font-mono">
    Figure 1: The Three-Loop AI Engineering Harness • Project, Feature & Task Loops
  </figcaption>
</figure>


The solution is to decouple AI operations into three distinct, deterministic harness loops:

### 1. The Project Loop (Repo Intelligence & Governance)
Maintains persistent AST catalogs, dependency graphs, security policies, and commit invariant rules outside the conversation context window.

### 2. The Feature Loop (Contract Verification & Spec Alignment)
Freezes the API schema and test specifications before any code generation begins. The agent is strictly evaluated against predefined mocks.

### 3. The Task Loop (Atomic Code Edits & Zero-Token Hooks)
Micro-executions that edit specific files, verified immediately by deterministic local pre-commit hooks at zero token cost.

## Deterministic Quality Gates

By enforcing zero-token Git hooks (e.g., verifying commit author signatures, blocking accidental secret commits, and requiring conventional commit messages), enterprise teams ensure that agents operate with the same engineering rigor expected of human staff engineers.

### Implementation: Zero-Token Quality Gate Hook

To enforce harness rules without spending token budget on repetitive lint and security prompts, we execute a deterministic local pre-commit gate:

<div class="gist-inline-embed" data-gist-id="571961f368387ce1578c3300294cb340" data-file="harness_hook.sh" data-title="pre-commit-gate.sh • Zero-Token Security Check"></div>
