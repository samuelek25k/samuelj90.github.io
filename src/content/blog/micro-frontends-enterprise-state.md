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
