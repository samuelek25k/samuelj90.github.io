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
    <text x="350" y="165" text-anchor="middle" class="fill-teal-300 font-mono text-[10px]">Zero Direct Imports &bull; Pure Decoupling</text>

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
    Figure 1: CustomEvent DOM Event Broker &bull; Micro-Frontend State Sharing Without Coupling
  </figcaption>
</figure>

To allow disparate micro-apps (e.g. an Angular legacy app and a modern React micro-frontend) to communicate without direct dependencies, employ window-level CustomEvent channels with strictly typed payloads:

```typescript
// Event publisher
window.dispatchEvent(
  new CustomEvent('portal:session:updated', {
    detail: { authenticated: true, tenantId: 'emirates-global' }
  })
);

// Event subscriber
window.addEventListener('portal:session:updated', (e) => {
  syncSession((e as CustomEvent).detail);
});
```

## Summary
By treating ambient state as an immutable event stream rather than a centralized, shared state store, engineering organizations retain independent deployment cycles while delivering a unified, seamless user experience.
