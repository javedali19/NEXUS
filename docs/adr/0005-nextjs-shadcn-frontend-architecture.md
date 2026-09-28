# ADR 0005: Next.js + TypeScript + Tailwind CSS Frontend Architecture

## Status
Accepted

## Context
The user experience must provide a unified, reactive interface bringing together ERP, CRM, and AI Communications with seamless customer timeline navigation, dark mode glassmorphism aesthetics, and real-time outbox feedback.

## Decision
We implement the frontend using:
- **Next.js 15 App Router**: Server and client component architecture with route groups.
- **TypeScript (Strict Mode)**: Full type safety for all domain contracts and API clients.
- **Tailwind CSS & Glassmorphism Design System**: Custom design tokens with curated HSL color schemes.
- **Shared Domain Contracts**: TypeScript interfaces mirrored from platform domain definitions.

## Consequences
- **Positive**: Rapid render times, modern aesthetics, responsive layout across all device viewports.
- **Positive**: Single codebase for multi-module dashboard.
