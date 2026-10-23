"use client";

import dynamic from "next/dynamic";

// One code-split chunk per tool: a tool page downloads only its own tool.
// Still server-rendered (ssr defaults to true), so there is no loading flash.
const TOOLS = {
  "cidr-calculator": dynamic(() => import("./cidr-calculator").then((m) => m.CidrCalculator)),
  "jwt-decoder": dynamic(() => import("./jwt-decoder").then((m) => m.JwtDecoder)),
  base64: dynamic(() => import("./base64-encoder").then((m) => m.Base64Encoder)),
  "uuid-generator": dynamic(() => import("./uuid-generator").then((m) => m.UuidGenerator)),
  "cron-parser": dynamic(() => import("./cron-parser").then((m) => m.CronParser)),
  "k8s-resources": dynamic(() => import("./k8s-resources").then((m) => m.K8sResourcesCalculator)),
  "yaml-json-formatter": dynamic(() =>
    import("./yaml-json-formatter").then((m) => m.YamlJsonFormatter),
  ),
  "timestamp-converter": dynamic(() =>
    import("./timestamp-converter").then((m) => m.TimestampConverter),
  ),
  "hash-generator": dynamic(() => import("./hash-generator").then((m) => m.HashGenerator)),
};

function hasTool(slug: string): slug is keyof typeof TOOLS {
  return slug in TOOLS;
}

export function ToolLoader({ slug }: { slug: string }) {
  if (!hasTool(slug)) return null;
  const Tool = TOOLS[slug];
  return <Tool />;
}
