---
title: 'React Design Patterns'
description: 'A 15-pattern learning path for writing React components that stay readable as the codebase grows, rewritten in TypeScript and updated for React 19.'
category:
  name: 'Frontend'
  slug: 'frontend'
publishedAt: '2026-10-30'
updatedAt: '2026-10-30'
tags:
  - React
  - Design Patterns
  - TypeScript
  - React 19
  - Frontend Architecture
adaptedFrom:
  name: '15 Days of React Design Patterns by tapaScript'
  url: 'https://github.com/tapascript/15-days-of-react-design-patterns'
  license: 'Apache-2.0'
  licenseUrl: 'https://github.com/tapascript/15-days-of-react-design-patterns/blob/main/LICENSE'
---

Most React code does not go wrong because of one bad decision. It goes wrong slowly: a component picks up one more prop, one more `useEffect`, one more boolean flag, until nobody wants to touch it. Design patterns are the names we give to the refactors that stop that drift. Knowing them lets you see the problem earlier and talk about the fix with your team in one word.

This guide is my study notes for the [15 Days of React Design Patterns](https://github.com/tapascript/15-days-of-react-design-patterns) series by Tapas Adhikary (tapaScript), turned into a written course. I rewrote every chapter in my own words, moved the code to TypeScript, and added what has changed with React 19 and the React Compiler, because a few of these patterns are now the wrong default and it is worth knowing why.

## Who this is for

You already build features with React and hooks, and you want to go from "it works" to "it is easy to change". You should be comfortable with props, state, `useEffect` and basic TypeScript. Nothing here needs a specific framework; the examples run the same in Vite or Next.js.

## How each chapter works

Every chapter follows the same shape, so you can skim or go deep:

1. A small piece of code with a real smell, and why it hurts.
2. The pattern, applied step by step to that code.
3. A second, different example.
4. How the pattern stands today with React 19.
5. When to use it, when not to, and the usual pitfalls.
6. Exercises, plus the original video and source code.

Read the chapter, watch the video if you like learning that way, then do at least one exercise before moving on. The exercises are where the pattern sticks.

## The learning path

The chapters follow the order of the original series. If you want a weekly plan, this is how I would split it, about 4 to 6 hours a week:

### Week 1: composing components

- [Why React needs design patterns](react-design-patterns/01-why-design-patterns)
- [Container and Presenter](react-design-patterns/02-container-presenter)
- [Controlled and Uncontrolled components](react-design-patterns/03-controlled-uncontrolled)
- [Compound Components](react-design-patterns/04-compound-components)

### Week 2: sharing logic

- [Render Props](react-design-patterns/05-render-props)
- [Higher-Order Components](react-design-patterns/06-higher-order-components)
- [Custom Hooks](react-design-patterns/07-custom-hooks)
- [Provider](react-design-patterns/08-provider-pattern)

### Week 3: state and user experience

- [Optimistic UI](react-design-patterns/09-optimistic-ui)
- [State Reducer](react-design-patterns/10-state-reducer)
- [Pub-Sub and Observer](react-design-patterns/11-pub-sub-observer)
- [Performance patterns](react-design-patterns/12-performance-patterns)

### Week 4: flexible APIs and resilience

- [Slot](react-design-patterns/13-slot-pattern)
- [Strategy](react-design-patterns/14-strategy-pattern)
- [Facade](react-design-patterns/15-facade-pattern)
- [Error Boundary](react-design-patterns/16-error-boundary)

## A word of caution

Patterns are tools, not goals. The best outcome of this guide is not that you use all fifteen, it is that you can look at a component, name what is wrong with it, and pick the smallest change that fixes it. Sometimes that change is a pattern. Often it is just splitting a function.

## Credits

The structure, the topics and many of the code examples come from tapaScript's open-source series, licensed under Apache-2.0. Each chapter links to the matching video and source folder. If the series helps you, give the [repository](https://github.com/tapascript/15-days-of-react-design-patterns) a star and subscribe to the [tapaScript YouTube channel](https://youtube.com/tapasadhikary).
