# Contributing

This repository is a Bun workspace managed by Turborepo.

## Before Opening a PR

Run these commands from the repository root:

```bash
bun install
bun run lint
bun run check-types
bun run build
```

If `bun install` changes `bun.lock`, include that file in the same commit.

## Where New Code Should Go

- Put product-specific UI and logic inside the owning app.
- Put code used by two or more apps into `packages/`.
- Prefer extending an existing package before creating a new one.
- Treat `tmp/` as scratch space. Do not wire new production code to it.

## Package Guidelines

Create a new shared package only when at least one of these is true:

- two or more apps already duplicate the same logic
- a domain concept needs one shared implementation
- repo-level tooling or config should be versioned together

Every shared package should include:

- `package.json`
- `tsconfig.json`
- `eslint.config.mjs`
- `build`, `lint`, and `check-types` scripts

## Release Checklist

Before merging changes that affect workspace structure or dependencies:

1. Confirm all root validation commands pass.
2. Confirm any new env vars are declared in `turbo.json`.
3. Confirm generated lockfile changes are committed.
4. Confirm shared packages expose only the public entrypoints they intend to support.
