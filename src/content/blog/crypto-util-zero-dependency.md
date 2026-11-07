---
title: "Zero-Dependency Cryptography: Why We Engineered Crypto-Util for Secure Microservices"
description: "Exploring the design of crypto-util: high-performance AES-256-CBC, RSA keypair handling, HMAC-SHA-512, and zero-dependency Node.js streaming security."
date: "2026-10-30"
category: "Product Architecture"
readingTime: "5 min read"
tags: ["Product Showcase", "Cryptography", "Node.js", "Zero-Dependency"]
---

Modern supply chain vulnerabilities in npm dependencies represent one of the most critical attack surfaces in cloud microservices. When sensitive data like session tokens, credentials, or personal records must be encrypted, pulling in heavy external crypto wrappers often introduces transitive security alerts and CVE risks.

**Crypto-Util** was engineered to eliminate this liability entirely.

## Zero Dependencies, Native Security

Crypto-Util wraps the battle-tested, hardware-accelerated C++ OpenSSL engine built into Node.js, providing an ergonomic, enterprise-ready API with zero external dependencies:

- **Symmetric Encryption**: AES-256-CBC with cryptographic initialization vector (IV) randomization.
- **Key Derivation (PBE)**: PBKDF2 with HMAC-SHA-512 and configurable salt iterations to defend against rainbow table attacks.
- **Asymmetric Encryption**: RSA 2048/4096-bit public-key encryption and private-key decryption with PKCS#1 v2.1 OAEP padding.
- **Streaming Hashes**: Incremental streaming digest generators for multi-gigabyte file validation.

## Deterministic Verification & Benchmark

Crypto-Util runs on the native Node.js test runner (`node --test`), completing end-to-end cryptographic verification across roundtrip encryption, decryption, and hash validation in under **100 milliseconds**.

- **Repository**: [github.com/samuelj90/crypto-util](https://github.com/samuelj90/crypto-util)
- **License**: MIT
- **Security Policy**: Comprehensive `SECURITY.md` vulnerability reporting guidelines.
