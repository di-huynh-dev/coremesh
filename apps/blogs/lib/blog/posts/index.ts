import { BlogPostSource } from "../types";
import { buildingWithShadcnUiPost } from "./building-with-shadcn-ui";
import { codeSplittingAndLazyLoadingReactPost } from "./code-splitting-and-lazy-loading-react";
import { whyWeChoseBunPost } from "./why-we-chose-bun";

export const posts: BlogPostSource[] = [
  whyWeChoseBunPost,
  buildingWithShadcnUiPost,
  codeSplittingAndLazyLoadingReactPost,
];
