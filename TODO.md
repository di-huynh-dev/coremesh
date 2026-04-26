# TODO — Share Post List UI via Monorepo

## Phase 1: Setup shared package `@repo/ui`

- [x] Add `@repo/ui` dependency to `apps/blogs/package.json`
- [x] Add `@repo/ui` dependency to `apps/me/package.json`
- [x] Run `bun install` to sync workspace
- [x] Build shared package (`packages/ui`) successfully

## Phase 2: Create shared UI components in `packages/ui/src`

- [x] `types/post.ts` — Shared `BlogPost` type with optional fields for flexibility
- [x] `post-card.tsx` — Reusable `PostCard` component (list/grid variants)
- [x] `post-list.tsx` — `PostList` with view-mode toggle
- [x] `featured-posts.tsx` — `FeaturedPosts` section component
- [x] `post-filters.tsx` — Search, level/tags dropdowns, sort, view toggle
- [x] Export all from `package.json`

## Phase 3: Refactor `apps/blogs` to consume shared UI

- [x] Update `globals.css` — remove `@import "tw-animate-css"` (handled by app)
- [x] Refactor `app/[locale]/blog/page.tsx`:
  - Import `PostList`, `FeaturedPosts`, `PostFilters` from `@repo/ui`
  - Import `BlogPost` type from `@repo/ui/types/post`
  - Keep data-fetching (`getAllPosts`) and state logic in page
  - Delegate rendering to shared components
- [x] Type-check `blogs` app — **PASS**

## Phase 4: Refactor `apps/me` to consume shared UI

- [x] Update `app/page.tsx`:
  - Import `BlogPost` type from `@repo/ui/types/post`
  - Explicitly type posts as `BlogPost[]`
- [x] Refactor `components/sections/overview-section.tsx`:
  - Import `PostCard` from `@repo/ui/post-card`
  - Replace inline post cards with `<PostCard viewMode="grid" ... />`
  - Remove duplicated card markup
- [x] Type-check `me` app — **PASS**

## Notes

- The `PostCard` component now gracefully handles optional fields (`content`, `contentHtml`, `author`, `level`, `tags`, `image`), making it reusable across both full blog pages and summary grids.
- The `me` app still fetches data via `../../blogs/lib/blog` cross-import; future improvement could move blog data to a shared `@repo/blog-data` package or fetch via API.
