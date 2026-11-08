---
title: "Micro-Frontends in Enterprise Portals: State Sharing Without Tight Coupling"
description: "Analyzing Web Components, Module Federation, and custom DOM event brokers for cross-team autonomy in high-traffic airline applications."
date: "2026-09-18"
category: "Frontend Architecture"
readingTime: "10 min read"
tags: ["Module Federation", "TypeScript", "Web Components"]
---

When enterprise development teams scale past dozens of engineers contributing to a single customer-facing portal, monolithic single-page applications become organizational bottlenecks. Deployment queues back up, a regression in one domain can take down unrelated features, and dependency upgrades turn into multi-month migrations.

**Micro-frontends** solve this dilemma by slicing applications vertically across business domains. However, they introduce a distinct architectural challenge: **how to share essential cross-cutting state without re-coupling independent applications.**

## The Three Core State Categories

In large-scale portals, state naturally falls into three tiers:

1. **Ephemeral Local State**: Component-internal UI toggle states, input forms, and dropdown selections. This state must stay completely isolated within the individual micro-app.
2. **Domain State**: User booking records, inventory carts, or transaction details. These should be managed via bounded context APIs and local cache stores.
3. **Ambient Session State**: Authentication identity tokens, user locale/currency preferences, and global error boundaries.

## Practical Decoupling Strategies

### 1. Module Federation with Shared Singletons
Webpack and Vite Module Federation allow runtime loading of remote modules while establishing strict version agreements on foundational singletons:

```typescript
// federation.config.js
module.exports = {
  shared: {
    react: { singleton: true, eager: true },
    'react-dom': { singleton: true, eager: true },
    '@enterprise/auth-sdk': { singleton: true }
  }
};
```

### 2. Custom DOM Event Brokers

<figure class="my-8 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4 sm:p-6 shadow-sm">
  <svg class="w-full min-w-[580px] h-auto text-slate-800 dark:text-slate-100" viewBox="0 0 700 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Micro-app 1 (Booking) -->
    <rect x="30" y="30" width="160" height="70" rx="8" class="fill-white dark:fill-slate-800 stroke-teal-500" stroke-width="1.5"/>
    <text x="110" y="55" text-anchor="middle" class="fill-slate-900 dark:fill-white font-bold font-sans text-xs">Booking App (React)</text>
    <text x="110" y="75" text-anchor="middle" class="fill-slate-500 dark:fill-slate-400 text-[10px] font-mono">Dispatches: session:update</text>

    <!-- Micro-app 2 (Loyalty) -->
    <rect x="510" y="30" width="160" height="70" rx="8" class="fill-white dark:fill-slate-800 stroke-indigo-500" stroke-width="1.5"/>
    <text x="590" y="55" text-anchor="middle" class="fill-slate-900 dark:fill-white font-bold font-sans text-xs">Loyalty App (Angular)</text>
    <text x="590" y="75" text-anchor="middle" class="fill-slate-500 dark:fill-slate-400 text-[10px] font-mono">Subscribes: session:update</text>

    <!-- Central Event Broker -->
    <rect x="180" y="125" width="340" height="55" rx="10" class="fill-slate-900 dark:fill-slate-950 stroke-teal-400" stroke-width="1.5"/>
    <text x="350" y="148" text-anchor="middle" class="fill-white font-bold font-sans text-xs">Window CustomEvent Broker (DOM Bus)</text>
    <text x="350" y="165" text-anchor="middle" class="fill-teal-300 font-mono text-[10px]">Zero Direct Imports • Pure Decoupling</text>

    <!-- Flow Arrows -->
    <path d="M110 100 L110 152 L180 152" class="stroke-teal-500" stroke-width="2" marker-end="url(#arrow3)"/>
    <path d="M520 152 L590 152 L590 100" class="stroke-indigo-500" stroke-width="2" marker-end="url(#arrow3)"/>

    <defs>
      <marker id="arrow3" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 8 5 L 0 9 z" class="fill-teal-500"/>
      </marker>
    </defs>
  </svg>
  <figcaption class="text-xs text-center text-slate-500 dark:text-slate-400 mt-3 font-mono">
    Figure 1: CustomEvent DOM Event Broker • Micro-Frontend State Sharing Without Coupling
  </figcaption>
</figure>

To allow disparate micro-apps (e.g. an Angular legacy app and a modern React micro-frontend) to communicate without direct dependencies, employ window-level CustomEvent channels with strictly typed payloads:

<div class="my-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
  <div class="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
    <div class="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
      <svg class="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
      <span>MicroFrontendBroker.ts • Type-Safe DOM Bus</span>
    </div>
    <a href="https://gist.github.com/samuelj90/674f2bc1cb36c9e02cadf73053e4d1e2" target="_blank" rel="noopener noreferrer" class="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-sans font-medium">
      View Gist on GitHub →
    </a>
  </div>
</div>

```typescript
export interface PortalSessionEventDetail {
  authenticated: boolean;
  tenantId: string;
  userRole: 'ADMIN' | 'ENGINEER' | 'VIEWER';
  timestamp: number;
}

export class MicroFrontendBroker {
  private static readonly TOPIC = 'portal:session:updated';

  public static publish(detail: PortalSessionEventDetail): void {
    window.dispatchEvent(
      new CustomEvent<PortalSessionEventDetail>(this.TOPIC, {
        detail,
        bubbles: true,
        composed: true // Crosses shadow DOM boundaries
      })
    );
  }

  public static subscribe(
    handler: (detail: PortalSessionEventDetail) => void
  ): () => void {
    const listener = (event: Event) => {
      const customEvent = event as CustomEvent<PortalSessionEventDetail>;
      if (customEvent.detail) {
        handler(customEvent.detail);
      }
    };

    window.addEventListener(this.TOPIC, listener);
    return () => window.removeEventListener(this.TOPIC, listener);
  }
}
```

## Summary
By treating ambient state as an immutable event stream rather than a centralized, shared state store, engineering organizations retain independent deployment cycles while delivering a unified, seamless user experience.
