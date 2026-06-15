---
name: DiCodeWeb Digital Learning System
colors:
  surface: "#fef9f2"
  surface-dim: "#ded9d4"
  surface-bright: "#fef9f2"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f8f3ed"
  surface-container: "#f2ede7"
  surface-container-high: "#ece7e1"
  surface-container-highest: "#e6e2dc"
  on-surface: "#1d1b18"
  on-surface-variant: "#44474e"
  inverse-surface: "#32302c"
  inverse-on-surface: "#f5f0ea"
  outline: "#75777f"
  outline-variant: "#c5c6cf"
  surface-tint: "#4e5e81"
  primary: "#000001"
  on-primary: "#ffffff"
  primary-container: "#071b3a"
  on-primary-container: "#7384a9"
  inverse-primary: "#b5c7ee"
  secondary: "#3b6a00"
  on-secondary: "#ffffff"
  secondary-container: "#aaf85d"
  on-secondary-container: "#3f7100"
  tertiary: "#000000"
  on-tertiary: "#ffffff"
  tertiary-container: "#001f26"
  on-tertiary-container: "#0090aa"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  primary-fixed: "#d7e2ff"
  primary-fixed-dim: "#b5c7ee"
  on-primary-fixed: "#071b3a"
  on-primary-fixed-variant: "#364768"
  secondary-fixed: "#aaf85d"
  secondary-fixed-dim: "#8fdb43"
  on-secondary-fixed: "#0e2000"
  on-secondary-fixed-variant: "#2b5000"
  tertiary-fixed: "#adecff"
  tertiary-fixed-dim: "#41d7f9"
  on-tertiary-fixed: "#001f26"
  on-tertiary-fixed-variant: "#004e5d"
  background: "#fef9f2"
  on-background: "#1d1b18"
  surface-variant: "#e6e2dc"
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: "700"
    lineHeight: "1.1"
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: "700"
    lineHeight: "1.2"
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: "600"
    lineHeight: "1.3"
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: "400"
    lineHeight: "1.6"
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: "400"
    lineHeight: "1.5"
  label-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: "500"
    lineHeight: "1.4"
    letterSpacing: 0.01em
  code:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: "400"
    lineHeight: "1.5"
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The design system is built for a premium, high-end EdTech editorial platform. The brand personality is intellectually rigorous yet highly accessible, balancing technical precision with a warm, inviting atmosphere. It targets developers, digital creators, and lifelong learners who value clarity and a distraction-free reading experience.

The aesthetic follows a **Modern Minimalism** approach with **Tactile/Skeuomorphic** hints. It utilizes a sophisticated "Paper & Ink" philosophy, where high-contrast typography sits atop warm, organic backgrounds. This reduces eye strain during long-form reading while maintaining a cutting-edge technical feel through precise line work and vibrant accent colors.

## Colors

The palette is anchored by a deep **Navy (#071B3A)** which provides authoritative contrast for typography and brand elements. The **Warm Beige (#F7F2EC)** background creates a premium, editorial feel that distinguishes the product from typical "stark white" SaaS platforms.

**Lime Green (#8BD63F)** is reserved strictly for primary calls to action and success states, ensuring high visibility and a sense of progression. **Cyan (#22C7E8)** serves as the "Technical Accent," used for inline links, code block highlights, and decorative geometry that signals interactivity. **Slate (#64748B)** provides a soft secondary hierarchy for metadata and captions.

## Typography

The design system utilizes **Geist** exclusively to maintain a technical, precise, and developer-friendly character across all touchpoints.

- **Headlines:** Use Bold weights with tight letter spacing for a punchy, modern look.
- **Body Text:** Leverages the Regular weight with generous line height (1.6) to ensure maximum legibility for long-form educational content.
- **Data/Labels:** Medium weights are used for UI labels and metadata to provide clear distinction from body prose.
- **Hierarchy:** Ensure a clear vertical rhythm by using the defined scale; skip levels only when separating distinct content modules.

## Layout & Spacing

This design system employs a **Fixed Grid** philosophy for desktop to maintain editorial integrity, transitioning to a fluid layout for mobile devices.

- **Desktop:** 12-column grid with a 1200px max-width. Large 40px margins allow the content to breathe.
- **Spacing Rhythm:** Based on an 8px square grid. Use `stack-lg` for section spacing and `stack-md` for component spacing.
- **Negative Space:** Prioritize whitespace between content blocks to prevent cognitive overload—essential for an EdTech platform.
- **Reading Width:** Long-form article text should be constrained to a 720px width (approx. 8 columns) for optimal reading speed and comprehension.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Soft Shadows**.

1. **Background (#F7F2EC):** The lowest layer, representing the "desk" or canvas.
2. **Surface Cards (#FFFFFF):** These sit on the background with a 1px border (#E2DDD5).
3. **Shadows:** Use a single, highly diffused shadow for raised elements: `0px 4px 20px rgba(7, 27, 58, 0.05)`. This creates a subtle "lift" without looking heavy.
4. **Interactive States:** On hover, cards should slightly increase their shadow spread and lift by 2px to signal tactile feedback.

## Shapes

The shape language is **Rounded (Level 2)**. This strikes a balance between the "friendly" nature of education and the "structured" nature of technology.

- **Standard Elements:** Buttons, input fields, and tags use a 0.5rem (8px) radius.
- **Containers:** Large cards and featured images use 1rem (16px) or 1.5rem (24px) for a soft, premium appearance.
- **Consistency:** Avoid sharp corners entirely to maintain the approachable EdTech persona.

## Components

### Buttons

- **Primary:** Lime Green (#8BD63F) fill with Navy (#071B3A) text. Semi-bold weight. 0.5rem radius.
- **Secondary:** White fill with Navy border (1px) and text.
- **Ghost:** Transparent fill with Cyan (#22C7E8) text, used for less prominent actions.

### Cards & Blog Items

- **Structure:** White background, subtle border, soft shadow.
- **Thumbnails:** Use Dark Navy technical illustrations or high-contrast iconography.
- **Tags/Chips:** Small, Navy text on a Cyan-tinted transparent background (10% opacity) or subtle Slate background.

### Form Inputs

- **Fields:** Pure white background, 1px border (#E2DDD5). Focus state uses a 1px Cyan border.
- **Placeholders:** Slate (#64748B) text at 50% opacity.

### Code Snippets

- **Style:** Dark Navy background (#071B3A) with Cyan and Lime highlights for syntax. Monospaced-styled Geist font.

### Progress Indicators

- **Style:** Thin Cyan lines for lesson progress; Lime Green for "Course Completed" states.
