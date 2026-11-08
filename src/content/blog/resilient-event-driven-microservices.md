---
title: "Designing Resilient Event-Driven Microservices with Kafka & Spring Boot 3"
description: "Practical patterns for transactional outboxes, idempotency keys, and consumer lag mitigation in high-throughput enterprise systems."
date: "2026-11-01"
category: "Distributed Systems"
readingTime: "8 min read"
tags: ["Apache Kafka", "Spring Boot 3", "Event Sourcing"]
---

In distributed architectures, asynchronous communication through event streaming platforms like Apache Kafka offers decoupling and high throughput. However, naive implementations often break under high load or temporary network partitions.

## The Dual-Write Problem

A common architectural trap occurs when a service must simultaneously update its local SQL database and emit an event to Kafka. If the database commit succeeds but the message broker publish fails, the system enters an inconsistent state.


<figure class="my-8 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4 sm:p-6 shadow-sm">
  <svg class="w-full min-w-[580px] h-auto text-slate-800 dark:text-slate-100" viewBox="0 0 700 240" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Service Box -->
    <rect x="20" y="30" width="160" height="180" rx="10" class="fill-white dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-700" stroke-width="1.5" />
    <text x="100" y="55" text-anchor="middle" class="fill-slate-900 dark:fill-white font-bold font-sans text-xs">Order Service</text>
    <rect x="35" y="75" width="130" height="50" rx="6" class="fill-slate-100 dark:fill-slate-700/60 stroke-slate-200 dark:stroke-slate-600" stroke-width="1"/>
    <text x="100" y="98" text-anchor="middle" class="fill-slate-700 dark:fill-slate-300 text-[11px] font-sans">Business DB Table</text>
    <text x="100" y="113" text-anchor="middle" class="fill-teal-600 dark:fill-teal-400 font-mono text-[10px] font-semibold">1. Local Commit</text>
    <rect x="35" y="140" width="130" height="50" rx="6" class="fill-teal-50 dark:fill-teal-950/60 stroke-teal-300 dark:stroke-teal-800" stroke-width="1"/>
    <text x="100" y="163" text-anchor="middle" class="fill-teal-800 dark:fill-teal-300 text-[11px] font-sans font-semibold">Transactional Outbox</text>
    <text x="100" y="178" text-anchor="middle" class="fill-teal-600 dark:fill-teal-400 font-mono text-[10px]">2. Atomic Insert</text>

    <!-- Arrow 1 to Kafka -->
    <path d="M180 165 L270 165" class="stroke-teal-600 dark:stroke-teal-400" stroke-width="2" stroke-dasharray="4 4" marker-end="url(#arrow)"/>
    <text x="225" y="155" text-anchor="middle" class="fill-slate-500 dark:fill-slate-400 font-mono text-[10px]">CDC / Poller</text>

    <!-- Kafka Cluster Box -->
    <rect x="270" y="80" width="160" height="110" rx="10" class="fill-slate-900 dark:fill-slate-950 stroke-teal-500" stroke-width="1.5" />
    <text x="350" y="105" text-anchor="middle" class="fill-white font-bold font-sans text-xs">Apache Kafka</text>
    <rect x="285" y="120" width="130" height="26" rx="4" class="fill-slate-800 stroke-slate-700" stroke-width="1"/>
    <text x="350" y="137" text-anchor="middle" class="fill-teal-400 font-mono text-[10px]">topic: order-events</text>
    <text x="350" y="170" text-anchor="middle" class="fill-slate-400 font-mono text-[9px]">Partition Distributed</text>

    <!-- Arrow 2 to Consumer -->
    <path d="M430 135 L520 135" class="stroke-teal-600 dark:stroke-teal-400" stroke-width="2" marker-end="url(#arrow)"/>
    <text x="475" y="125" text-anchor="middle" class="fill-slate-500 dark:fill-slate-400 font-mono text-[10px]">Streaming IO</text>

    <!-- Idempotent Consumer Box -->
    <rect x="520" y="30" width="160" height="180" rx="10" class="fill-white dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-700" stroke-width="1.5" />
    <text x="600" y="55" text-anchor="middle" class="fill-slate-900 dark:fill-white font-bold font-sans text-xs">Payment Service</text>
    <rect x="535" y="75" width="130" height="50" rx="6" class="fill-teal-50 dark:fill-teal-950/60 stroke-teal-300 dark:stroke-teal-800" stroke-width="1"/>
    <text x="600" y="98" text-anchor="middle" class="fill-teal-800 dark:fill-teal-300 text-[11px] font-sans font-semibold">Idempotency Store</text>
    <text x="600" y="113" text-anchor="middle" class="fill-teal-600 dark:fill-teal-400 font-mono text-[10px]">Check Key Exists</text>
    <rect x="535" y="140" width="130" height="50" rx="6" class="fill-slate-100 dark:fill-slate-700/60 stroke-slate-200 dark:stroke-slate-600" stroke-width="1"/>
    <text x="600" y="163" text-anchor="middle" class="fill-slate-700 dark:fill-slate-300 text-[11px] font-sans">Payment Ledger</text>
    <text x="600" y="178" text-anchor="middle" class="fill-emerald-600 dark:fill-emerald-400 font-mono text-[10px] font-semibold">3. Process Once</text>

    <!-- Markers -->
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 8 5 L 0 9 z" class="fill-teal-600 dark:fill-teal-400"/>
      </marker>
    </defs>
  </svg>
  <figcaption class="text-xs text-center text-slate-500 dark:text-slate-400 mt-3 font-mono">
    Figure 1: Transactional Outbox • Kafka Streaming • Idempotent Consumer Flow
  </figcaption>
</figure>

### The Transactional Outbox Pattern
To guarantee consistency without heavy two-phase commit (2PC) protocols, record state changes and outbound messages within the same local database transaction using an Outbox table. A separate publisher thread or Change Data Capture (CDC) mechanism then streams events reliably to Kafka.

### Implementation: Transactional Outbox in Spring Boot 3

Here is the production implementation of the transactional outbox pattern ensuring atomic persistence of the business entity alongside the outbox event payload:

<div class="my-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
  <div class="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
    <div class="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
      <svg class="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
      <span>OrderService.java • Transactional Outbox Pattern</span>
    </div>
    <a href="https://gist.github.com/samuelj90/98793fcd72d3478b5a5519975fcb193b" target="_blank" rel="noopener noreferrer" class="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-sans font-medium">
      View Gist on GitHub →
    </a>
  </div>
</div>

```java
@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final OutboxEventRepository outboxRepository;
    private final ObjectMapper objectMapper;

    public OrderService(OrderRepository orderRepository,
                        OutboxEventRepository outboxRepository,
                        ObjectMapper objectMapper) {
        this.orderRepository = orderRepository;
        this.outboxRepository = outboxRepository;
        this.objectMapper = objectMapper;
    }

    public Order createOrder(OrderRequest request) {
        // 1. Commit Domain State Locally
        Order order = new Order(UUID.randomUUID(), request.getCustomerId(), request.getTotalAmount());
        orderRepository.save(order);

        // 2. Insert Outbox Event in the Same Database Transaction
        OutboxEvent event = new OutboxEvent(
            UUID.randomUUID(),
            "ORDER_CREATED",
            order.getId().toString(),
            objectMapper.writeValueAsString(order),
            Instant.now()
        );
        outboxRepository.save(event);

        return order;
    }
}
```

## Idempotent Consumers
Network re-deliveries are guaranteed in distributed networks. Every consumer must implement deterministic deduplication using idempotent keys stored with short-lived distributed caches or database unique constraints.

### Implementation: Idempotent Kafka Consumer with Redis

<div class="my-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
  <div class="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
    <div class="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
      <svg class="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
      <span>PaymentEventListener.java • Idempotent Consumer</span>
    </div>
    <a href="https://gist.github.com/samuelj90/dc1e2292269a30de763a1c6874fbc526" target="_blank" rel="noopener noreferrer" class="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-sans font-medium">
      View Gist on GitHub →
    </a>
  </div>
</div>

```java
@Component
public class PaymentEventListener {

    private final RedisTemplate<String, String> redisTemplate;
    private final PaymentLedgerService ledgerService;
    private static final Duration DEDUPLICATION_TTL = Duration.ofDays(7);

    public PaymentEventListener(RedisTemplate<String, String> redisTemplate,
                                PaymentLedgerService ledgerService) {
        this.redisTemplate = redisTemplate;
        this.ledgerService = ledgerService;
    }

    @KafkaListener(topics = "order-events", groupId = "payment-service-group")
    public void onOrderEvent(@Payload OrderEvent event, Acknowledgment ack) {
        String idempotencyKey = "processed-event:" + event.getEventId();

        // Atomic Check-and-Set: Process only if key does not exist
        Boolean isFirstDelivery = redisTemplate.opsForValue()
            .setIfAbsent(idempotencyKey, "PROCESSING", DEDUPLICATION_TTL);

        if (Boolean.TRUE.equals(isFirstDelivery)) {
            try {
                ledgerService.processPayment(event);
                redisTemplate.opsForValue().set(idempotencyKey, "COMPLETED", DEDUPLICATION_TTL);
                ack.acknowledge();
            } catch (Exception ex) {
                redisTemplate.delete(idempotencyKey);
                throw ex;
            }
        } else {
            // Duplicate delivery detected: acknowledge and discard safely
            ack.acknowledge();
        }
    }
}
```

