import configuration from "../../content-collections.ts";
import { GetTypeByName } from "@content-collections/core";

export type Post = GetTypeByName<typeof configuration, "posts">;
export declare const allPosts: Array<Post>;

export type Series = GetTypeByName<typeof configuration, "series">;
export declare const allSeries: Array<Series>;

export {};
