import { BlogPostSource } from "../types";

export const buildingWithShadcnUiPost: BlogPostSource = {
  slug: "building-with-shadcn-ui",
  title: "Building Production UIs with shadcn/ui",
  excerpt:
    "How shadcn/ui changed our approach to component libraries and why copy-paste beats npm install.",
  category: "Design",
  date: "January 3, 2025",
  readingTime: 4,
  level: "Intermediate",
  tags: ["ui", "components", "design"],
  image:
    "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=400&fit=crop",
  author: {
    name: "Yuval Avidani",
  },
  content: `Component libraries have always been a trade-off. You get speed and consistency, but you lose control and flexibility. shadcn/ui changes that equation entirely.

The Copy-Paste Philosophy

Unlike traditional component libraries where you npm install and import, shadcn/ui gives you the actual source code. You copy it into your project, and it's yours. Want to modify a button? Just edit the file. No more fighting with CSS overrides or wrapping components in styled wrappers.

This approach means you're never locked in. Your components evolve with your design system, not against it.

Built on Radix UI

Under the hood, shadcn/ui uses Radix UI primitives. This gives you world-class accessibility out of the box. Screen readers, keyboard navigation, focus management — it all just works.

Tailwind CSS Integration

Every component is styled with Tailwind CSS, making customization intuitive. If you know Tailwind, you already know how to customize these components. The utility classes are right there in the code, ready to be tweaked.

The Right Level of Abstraction

shadcn/ui hits the sweet spot between too primitive and too opinionated. The components are complete enough to use immediately but simple enough to understand and modify. You're not fighting a black box.

For this boilerplate, shadcn/ui was the obvious choice. It gives you professional UI components while keeping full control in your hands.`,
  contentHtml: `
<p>Component libraries have always been a trade-off. You get speed and consistency, but you lose control and flexibility. shadcn/ui changes that equation entirely.</p>

<h2>The Copy-Paste Philosophy</h2>

<p>Unlike traditional component libraries where you <code>npm install</code> and import, shadcn/ui gives you the actual source code. You copy it into your project, and it's yours.</p>

<p>Want to modify a button? Just edit the file. No more fighting with CSS overrides or wrapping components in styled wrappers.</p>

<p>This approach means you're never locked in. Your components evolve with your design system, not against it.</p>

<h2>Built on Radix UI</h2>

<p>Under the hood, shadcn/ui uses Radix UI primitives. This gives you world-class accessibility out of the box.</p>

<p>Screen readers, keyboard navigation, focus management — it all just works.</p>

<h2>Tailwind CSS Integration</h2>

<p>Every component is styled with Tailwind CSS, making customization intuitive. If you know Tailwind, you already know how to customize these components.</p>

<p>The utility classes are right there in the code, ready to be tweaked.</p>

<h2>The Right Level of Abstraction</h2>

<p>shadcn/ui hits the sweet spot between too primitive and too opinionated. The components are complete enough to use immediately but simple enough to understand and modify.</p>

<p>You're not fighting a black box.</p>

<p>For this boilerplate, shadcn/ui was the obvious choice. It gives you professional UI components while keeping full control in your hands.</p>
`,
};
