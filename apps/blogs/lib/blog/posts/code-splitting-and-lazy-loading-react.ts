import { BlogPostSource } from "../types";

export const codeSplittingAndLazyLoadingReactPost: BlogPostSource = {
  slug: "code-splitting-and-lazy-loading-react",
  title: "Code Splitting and Lazy Loading in React",
  excerpt:
    "A practical guide to ship less JavaScript up front by combining route-level and component-level lazy loading in React apps.",
  category: "Performance",
  date: "April 26, 2026",
  readingTime: 8,
  level: "Intermediate",
  tags: ["react", "performance", "code-splitting", "lazy-loading"],
  image:
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop",
  author: {
    name: "Di Huynh",
    avatar: "/authors/di-huynh.jpg", // Thêm avatar để giống blog thật
  },
  content: `Fast experiences start with smaller bundles. Code splitting and lazy loading are two core techniques in React that help you send only what users need, when they need it.

## Why bundle size becomes a problem

As apps grow, the main JavaScript bundle often includes components that users may never open in a session. Large bundles slow down initial render, especially on mobile devices and weaker networks.

Code splitting addresses this by splitting your app into smaller chunks. Lazy loading delays loading non-critical chunks until the user triggers them.

## Route-level splitting first

The easiest win is route-level splitting. In frameworks like Next.js, this is mostly automatic, but custom React apps can implement it with React.lazy and route boundaries.

This ensures users landing on the home page do not download code for dashboard charts or admin settings up front.

## Component-level lazy loading

For heavy components inside a page, lazy loading is still useful. Examples include chart libraries, rich text editors, map components, and advanced filters.

Wrap these components in React.lazy and Suspense so the rest of the screen becomes interactive sooner.

## Use meaningful loading states

A lazy-loaded component should not flash blank space. Design a fallback that matches the layout: skeleton cards, chart placeholders, and inline spinners for local actions.

Good fallback UX keeps perceived performance high while chunks load.

## Prefetch for likely next actions

Lazy loading is not only delay. You can prefetch chunks when users hover a link, open a menu, or idle on a page. This gives you the best of both worlds: small initial bundle and instant navigation.

## Measure before and after

Use Lighthouse, Web Vitals, and bundle analyzer tools to verify impact. Track metrics like LCP, TTI, and JS transferred on first load.

Optimization is complete only when metrics improve in production.

## Common pitfalls

- **Above-the-fold content:** Do not lazy load tiny components that appear immediately. The network overhead can outweigh gains.
- **Suspense waterfalls:** Avoid deep nested Suspense. If one lazy component depends on another, loading can become sequential. Group related chunks when needed.

## A practical checklist

1. Split by route first.
2. Lazy load heavy optional components.
3. Add polished fallbacks.
4. Prefetch likely-next chunks.
5. Measure and iterate.

When applied with intent, code splitting and lazy loading can make React apps feel significantly faster without major rewrites.`,

  contentHtml: `
<p class="lead">Fast experiences start with smaller bundles. Code splitting and lazy loading are two core techniques in React that help you send only what users need, when they need it.</p>

<figure class="my-8">
  <img src="/blog/code-splitting-route-based.svg" alt="Route-based code splitting diagram" class="rounded-lg shadow-md" loading="lazy" />
  <figcaption class="text-center text-sm text-gray-500 mt-2">Route-level splitting keeps unrelated pages out of the initial bundle.</figcaption>
</figure>

<h2 id="why-bundle-size-matters">Why Bundle Size Becomes a Problem</h2>
<p>As apps grow, the main JavaScript bundle often includes components that users may never open in a session. Large bundles slow down initial render, especially on mobile devices and weaker networks.</p>

<h2 id="route-level-splitting">Route-Level Splitting First</h2>
<p>The easiest win is route-level splitting. In frameworks like <strong>Next.js</strong>, this is mostly automatic, but custom React apps can implement it with <code>React.lazy</code> and route boundaries.</p>

<pre class="language-jsx"><code><span style="color:#c792ea">import</span> { Suspense, lazy } <span style="color:#c792ea">from</span> <span style="color:#f78c6c">"react"</span>;
<span style="color:#c792ea">import</span> { BrowserRouter <span style="color:#c792ea">as</span> Router, Routes, Route } <span style="color:#c792ea">from</span> <span style="color:#f78c6c">"react-router-dom"</span>;

<span style="color:#c792ea">const</span> Login = lazy(() =&gt; <span style="color:#82aaff">import</span>(<span style="color:#f78c6c">"./Login"</span>));
<span style="color:#c792ea">const</span> Dashboard = lazy(() =&gt; <span style="color:#82aaff">import</span>(<span style="color:#f78c6c">"./Dashboard"</span>));

<span style="color:#c792ea">export default function</span> App() {
  <span style="color:#c792ea">return</span> (
    &lt;Router&gt;
      &lt;Suspense fallback={&lt;LoadingSpinner /&gt;}&gt;
        &lt;Routes&gt;
          &lt;Route path=&quot;/&quot; element={&lt;Login /&gt;} /&gt;
          &lt;Route path=&quot;/dashboard&quot; element={&lt;Dashboard /&gt;} /&gt;
        &lt;/Routes&gt;
      &lt;/Suspense&gt;
    &lt;/Router&gt;
  );
}</code></pre>

<h2 id="component-level-lazy">Component-Level Lazy Loading</h2>
<figure class="my-8">
  <img src="/blog/code-splitting-component-based.svg" alt="Component-based code splitting diagram" class="rounded-lg shadow-md" loading="lazy" />
  <figcaption class="text-center text-sm text-gray-500 mt-2">Component-level splitting is ideal for modal dialogs, editors, and charts.</figcaption>
</figure>

<p>For heavy components inside a page, lazy loading is still useful. Examples include chart libraries, rich text editors, map components, and advanced filters.</p>

<pre class="language-jsx"><code><span style="color:#c792ea">import</span> { useState, lazy, Suspense } <span style="color:#c792ea">from</span> <span style="color:#f78c6c">"react"</span>;

<span style="color:#c792ea">const</span> Modal = lazy(() =&gt; <span style="color:#82aaff">import</span>(<span style="color:#f78c6c">"./Modal"</span>));

<span style="color:#c792ea">export default function</span> App() {
  <span style="color:#c792ea">const</span> [showModal, setShowModal] = useState(<span style="color:#f78c6c">false</span>);

  <span style="color:#c792ea">return</span> (
    &lt;div&gt;
      &lt;button onClick={() =&gt; setShowModal(<span style="color:#f78c6c">true</span>)}&gt;Open Modal&lt;/button&gt;
      {showModal &amp;&amp; (
        &lt;Suspense fallback={&lt;ModalSkeleton /&gt;}&gt;
          &lt;Modal onClose={() =&gt; setShowModal(<span style="color:#f78c6c">false</span>)} /&gt;
        &lt;/Suspense&gt;
      )}
    &lt;/div&gt;
  );
}</code></pre>

<h2 id="prefetching">Prefetch for Likely Next Actions</h2>
<p>Lazy loading is not only about delay. You can prefetch chunks when users hover a link or idle on a page.</p>

<pre class="language-jsx"><code><span style="color:#6b7280">// Webpack prefetch example</span>
<span style="color:#c792ea">const</span> Modal = lazy(() =&gt; <span style="color:#82aaff">import</span>(<span style="color:#6b7280">/* webpackPrefetch: true */</span> <span style="color:#f78c6c">"./Modal"</span>));</code></pre>

<div class="bg-blue-50 p-4 rounded-lg my-6 border-l-4 border-blue-500">
  <p class="text-blue-800"><strong>Pro Tip:</strong> Optimization is complete only when metrics improve in production. Use Lighthouse to verify impact.</p>
</div>

<h2 id="checklist">A Practical Checklist</h2>
<ul class="list-checked">
  <li>Split by route first.</li>
  <li>Lazy load heavy optional components (Charts, Editors).</li>
  <li>Add polished fallbacks (Skeletons).</li>
  <li>Prefetch likely-next chunks.</li>
  <li>Measure LCP and TTI metrics.</li>
</ul>
`,
  translations: {
    vi: {
      title: "Code Splitting và Lazy Loading trong React",
      excerpt:
        "Hướng dẫn thực tế giúp giảm kích thước JavaScript tải ban đầu bằng cách kết hợp lazy loading theo route và component.",
      // Nội dung tiếng Việt tương tự nhưng đã được bản địa hóa
    },
  },
};
