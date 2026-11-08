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

<div class="my-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
  <div class="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
    <div class="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
      <svg class="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
      <span>pre-commit-gate.sh • Zero-Token Security Check</span>
    </div>
    <a href="https://gist.github.com/samuelj90/571961f368387ce1578c3300294cb340" target="_blank" rel="noopener noreferrer" class="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-sans font-medium">
      View Gist on GitHub →
    </a>
  </div>
</div>

```bash
#!/bin/bash
# Pre-commit zero-token quality gate enforcing conventional commits and clean author state
set -euo pipefail

# 1. Author identity verification
EXPECTED_EMAIL="samuelj90@gmail.com"
AUTHOR_EMAIL=$(git config user.email)

if [ "$AUTHOR_EMAIL" != "$EXPECTED_EMAIL" ]; then
  echo "❌ [HARNESS GATE] Invalid commit author email: $AUTHOR_EMAIL"
  echo "Expected: $EXPECTED_EMAIL"
  exit 1
fi

# 2. Secret scan
if grep -rE "(AKIA[0-9A-Z]{16}|ghp_[a-zA-Z0-9]{36}|AIza[0-9A-Za-z\-_]{35})" src/ 2>/dev/null; then
  echo "❌ [HARNESS GATE] Hardcoded secret or API key detected in commit diff!"
  exit 1
fi

echo "✅ [HARNESS GATE] Zero-token deterministic verification passed."
exit 0
```
