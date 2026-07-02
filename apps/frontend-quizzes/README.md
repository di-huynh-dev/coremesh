# Frontend Prep 🚀

> Master modern frontend interview topics with curated, first-principles-based questions, senior developer trade-offs, and deep-dive explanations.

## 🌟 Why Frontend Prep?

Most interview prep resources focus on simple trivia questions or plain definitions. Senior-level interviews require more. **Frontend Prep** was built to:
1. **Explain from First Principles**: Demystify tricky language semantics, browser engine layout algorithms, and framework internals.
2. **Focus on Senior-Level Trade-offs**: Detail workarounds, performance considerations, and real-world edge cases.
3. **Provide High-Fidelity Explanations**: Supply deep-dives rather than surface-level definitions.

## 🎯 What it Does

- **Curated Question Bank**: Covers JavaScript, TypeScript, CSS & Layouts, React, Next.js, Web Performance, Web Security, DSA, and System Design.
- **MDX-Powered Answers**: Renders rich text, comparative tables, warnings, and syntax-highlighted code blocks.
- **Dynamic Question Browser**: Allows searching, sorting, and filtering questions by difficulty or topic.
- **Flexible UI Layouts**: Supports toggling layouts between a dense row List view and a modern glowing Card Grid view.
- **Pagination & Navigation**: Fully paginated, lightweight, client-side directory navigation.

## 📈 Current State

The platform is a fully-featured Next.js application built with a modern, glassmorphic design system:
- **Comprehensive Question Corpus**: Curated markdown-based MDX questions organized by directory structures.
- **Redesigned Directory View**: Live client-side interactive search, difficulty count pills, category selector, view toggle, and 9-item pagination.
- **Reading Time Tracking**: Parses and displays study duration indicators for every question card and row list.

## 📚 Study Guide Structure

The content is organized by frontend domains in the `content/` directory. Each topic includes detailed explanations, code examples, and interview tips.

### Content Structure

```text
content/
├── css/                   # CSS fundamentals and layout systems
│   ├── box-model.mdx      # Box model, sizing, margin collapsing
│   └── ...
├── javascript/            # Core JavaScript and modern features
│   ├── prototypal-inheritance.mdx
│   ├──closures.mdx
│   └── ...
└── react/                 # React ecosystem and best practices
    ├── rendering-and-reconciliation.mdx
    ├── hooks.mdx
    └── ...
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: React Icons

## 🧩 Current Topics

### JavaScript

- **Protypal Inheritance**: How JS handles inheritance, `__proto__`, `Object.create`, and ES6 classes.
- **Closures**: Lexical scope, memory leaks, and practical uses in private variables and callbacks.
- **Async JS**: Event loop, microtasks vs. macrotasks, promises, async/await.

### CSS

- **Box Model**: `content-box` vs. `border-box`, margin collapsing, layout calculations.
- **Flexbox**: One-dimensional layout, alignment properties, and common patterns.
- **Grid**: Two-dimensional layout, gap property, and grid templates.
- **Positioning**: Static, relative, absolute, fixed, and sticky positioning.
- **BFC**: How to create independent layout contexts.

### React

- **Rendering and Reconciliation**: Virtual DOM, diffing algorithm, and reconciliation process.
- **Hooks**: `useState`, `useEffect`, `useMemo`, `useCallback`, and custom hooks.
- **Context API**: Global state management and avoiding prop drilling.
- **Component Patterns**: Higher-Order Components (HOCs) and Render Props.
- **Performance**: Memoization, code splitting, and lazy loading.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Create a new topic file in the appropriate category directory:

   ```bash
   content/<category>/<topic-name>.mdx
   ```

2. Follow the existing content format:
   - YAML frontmatter with `title`, `description`, `difficulty`, `category`, `tags`, etc.
   - Markdown content with explanations, code examples, and interview tips.

3. Add relevant tags and keywords for better searchability.

4. Ensure the content is interview-focused and practical.

5. (Optional) Add related questions or topics at the end of the file.
# frontend-quizzes
