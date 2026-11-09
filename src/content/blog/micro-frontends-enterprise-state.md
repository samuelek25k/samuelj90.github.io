---
title: "Micro-Frontends in Enterprise Portals: State Sharing Without Tight Coupling"
description: "Analyzing Web Components, Module Federation, and custom DOM event brokers for cross-team autonomy in high-traffic airline applications."
date: "2026-09-18"
category: "Frontend Architecture"
readingTime: "10 min read"
tags:
  - "Module Federation"
  - "TypeScript"
  - "Web Components"
---

When enterprise development teams scale past dozens of engineers contributing to a single customer-facing portal, monolithic single-page applications become organizational bottlenecks. Deployment queues back up, a regression in one domain can take down unrelated features, and dependency upgrades turn into multi-month migrations.

**Micro-frontends** address this problem by slicing applications vertically across business domains. However, they introduce a distinct architectural challenge: **how to share essential cross-cutting state without re-coupling independent applications.**

## The Three Core State Categories

In large-scale portals, state naturally falls into three tiers:

1. **Ephemeral Local State**  
   Component-internal UI state such as toggles, form inputs, and dropdown selections. This state should remain isolated within the individual micro-app.

2. **Domain State**  
   User booking records, inventory carts, or transaction details. These should be managed through bounded-context APIs and local cache stores.

3. **Ambient Session State**  
   Authentication state, user locale and currency preferences, and other portal-wide session information that multiple micro-apps may need to observe.

## Practical Decoupling Strategies

### 1. Module Federation with Shared Singletons

Webpack and Vite Module Federation allow remote modules to be loaded at runtime while establishing explicit sharing rules for foundational dependencies.

```typescript
// federation.config.js
module.exports = {
  shared: {
    react: {
      singleton: true,
      eager: true
    },
    'react-dom': {
      singleton: true,
      eager: true
    },
    '@enterprise/auth-sdk': {
      singleton: true
    }
  }
};
```

Shared singletons are useful when micro-frontends deliberately depend on the same runtime library or platform SDK.

However, using shared libraries for application-level communication can gradually introduce coupling between independently owned micro-frontends. Shared runtime dependencies should therefore be kept small and intentional.

### 2. Custom DOM Event Broker

For communication between independently implemented micro-apps, such as an Angular application and a React micro-frontend, browser-native events provide a lightweight integration boundary.

![Micro-frontend state sharing through a DOM event broker](/diagrams/micro-frontends/event-broker.svg)

*Figure 1: Micro-frontend state sharing through a CustomEvent DOM event broker.*

The SVG can be exported from draw.io with the diagram data embedded. This allows the same SVG to be rendered directly by the browser while remaining editable in draw.io.

The communication model is intentionally simple:

```text
Publisher
   ↓
CustomEvent
   ↓
Browser DOM
   ↓
Subscriber
```

Neither micro-app needs to import the other.

A small TypeScript wrapper can provide a typed contract around the browser event mechanism:

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
        detail
      })
    );
  }

  public static subscribe(
    handler: (detail: PortalSessionEventDetail) => void
  ): () => void {
    const listener = (event: Event) => {
      const customEvent =
        event as CustomEvent<PortalSessionEventDetail>;

      if (customEvent.detail) {
        handler(customEvent.detail);
      }
    };

    window.addEventListener(this.TOPIC, listener);

    return () =>
      window.removeEventListener(this.TOPIC, listener);
  }
}
```

This keeps the integration contract small:

- Publishers know the event name and payload contract.
- Subscribers know the event name and payload contract.
- Neither side knows which framework the other uses.
- Neither side directly imports the other application.

### Event Contracts Still Need Governance

An event bus removes code-level dependencies, but it does not remove contracts.

For example:

```typescript
interface PortalEvents {
  'portal:session:updated': PortalSessionEventDetail;
  'portal:locale:changed': LocaleChangedEventDetail;
  'portal:currency:changed': CurrencyChangedEventDetail;
}
```

Treat these event definitions as public interfaces.

Changes should remain backward compatible wherever possible. Renaming fields, changing semantics, or publishing framework-specific objects through the event payload can recreate the same coupling that micro-frontends were intended to remove.

### Avoid Sharing Authentication Tokens Through Events

Authentication deserves stricter boundaries than ordinary UI state.

Rather than broadcasting raw access or identity tokens to every micro-frontend, prefer exposing the minimum session information required by the consuming application.

For example:

```typescript
interface PortalSessionEventDetail {
  authenticated: boolean;
  tenantId: string;
  userRole: 'ADMIN' | 'ENGINEER' | 'VIEWER';
  timestamp: number;
}
```

The application shell or authentication layer should remain responsible for credential lifecycle management.

Micro-frontends can react to authentication state changes without becoming owners of the underlying credentials.

## Choosing the Right Mechanism

Use **local component state** when the information belongs only to one component or micro-app.

Use **domain APIs and local caches** when the state belongs to a specific business domain.

Use **Module Federation shared dependencies** for deliberately shared runtime libraries and platform SDKs.

Use **typed DOM events** for small amounts of cross-application state where publishers and subscribers should remain independently deployable.

Avoid introducing a portal-wide shared state store unless the applications genuinely require coordinated state ownership. A global store can easily turn independently deployed micro-frontends back into a distributed monolith.

## Summary

Micro-frontends provide deployment and ownership independence only when their runtime boundaries remain explicit.

The key is not to eliminate state sharing. It is to share **contracts and events rather than application internals**.

For cross-application ambient state, a small typed event protocol provides a practical middle ground:

- local UI state remains local;
- domain state stays behind domain boundaries;
- shared runtime dependencies remain deliberate;
- cross-application communication uses stable contracts;
- authentication credentials remain owned by the icro-frontends to cooperate without requiring them to become one application again.
