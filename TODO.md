# Clone carlosdubon.dev Portfolio + GitHub Data Integration

## Progress Tracker

### Phase 1: Foundation ✅

- [x] Update `apps/me/package.json` metadata
- [x] Rewrite `apps/me/app/globals.css` with new design system
- [x] Update `apps/me/app/layout.tsx` metadata and fonts

### Phase 2: Layout Components ✅

- [x] Rewrite `apps/me/components/layout/navbar.tsx` — minimal header
- [x] Rewrite `apps/me/components/layout/footer.tsx` — minimal footer

### Phase 3: Page Sections ✅

- [x] Create `apps/me/components/sections/hero-section.tsx` — avatar, name, tagline
- [x] Create `apps/me/components/sections/overview-section.tsx` — job, location, contact
- [x] Create `apps/me/components/sections/social-section.tsx` — social links
- [x] Create `apps/me/components/sections/about-section.tsx` — bio
- [x] Create `apps/me/components/sections/github-calendar-section.tsx` — contributions
- [x] Create `apps/me/components/sections/stack-section.tsx` — tech icons
- [x] Create `apps/me/components/sections/projects-section.tsx` — GitHub repos
- [x] Create `apps/me/components/sections/experience-section.tsx` — work history

### Phase 4: Assembly ✅

- [x] Rewrite `apps/me/app/page.tsx` — assemble all sections
- [x] Build test passed (`bun run build` — compiled successfully, all pages generated)

---

## Notes for Future Customization

1. **Social Links**: LinkedIn, X (Twitter), and Discord URLs are placeholders (`#`). Update them in `social-section.tsx` and `footer.tsx`.
2. **Email**: GitHub profile shows `null` for email. Update in `footer.tsx` if desired.
3. **Experience**: Only Estuary Solutions is listed. Add more roles in `experience-section.tsx` if needed.
4. **GitHub Calendar**: Uses simulated contribution data (real data requires GitHub auth token). To use real data, integrate `react-github-calendar` with a PAT.
5. **Old Components**: Previous YUV.AI sections (`boilerplate-hero`, `bun-comparison`, etc.) still exist in `components/sections/` but are unused. Safe to delete for cleanup.
