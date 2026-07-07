# CoreMesh Zones

CoreMesh Zones is a Bun-powered Turborepo that hosts multiple Next.js applications and shared packages in one workspace.

## Workspace Layout

- `apps/`: user-facing applications and product surfaces
- `packages/`: shared UI, lint, Tailwind, and TypeScript configuration
- `tmp/`: experimental or imported code that is not part of the Bun workspace unless explicitly wired in

## Standards

- Package manager: `bun@1.3.3`
- Monorepo orchestration: Turborepo
- Runtime baseline: Node.js 20+
- Shared config packages:
  - `@repo/eslint-config`
  - `@repo/tailwind-config`
  - `@repo/typescript-config`

## Required Workspace Scripts

Each app should expose these scripts when applicable:

- `dev`
- `build`
- `lint`
- `check-types`
- `start`

Buildable shared libraries should expose:

- `build`
- `lint`
- `check-types`

Config-only packages may expose only the scripts they need.

- Config-only packages in this repo:
  - `@repo/eslint-config`
  - `@repo/tailwind-config`
  - `@repo/typescript-config`
- Buildable shared libraries in this repo:
  - `@repo/auth`
  - `@repo/ui`
  - `@repo/utils`

## Commands

```bash
bun install
bun run dev
bun run lint
bun run check-types
bun run build
bun run validate
```

## Monorepo Rules

- Prefer shared packages over copy-pasted config.
- Keep framework versions aligned unless a workspace has a documented exception.
- Use the root `bun.lock` as the single source of truth for workspace dependency resolution.
- Do not add new workspaces under `tmp/`.
- Treat `tmp/` as scratch space or migration input, not production workspace code.
- Update this README when repo-level tooling or conventions change.

## Current Focus

Phase 1 and Phase 2 standardization cover:

- root governance and docs
- shared TypeScript, ESLint, and PostCSS usage
- consistent workspace scripts
- CI quality gates for lint, typecheck, and build
