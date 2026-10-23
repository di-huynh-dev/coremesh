import {
  Base64Explainer,
  CidrCalculatorExplainer,
  CronParserExplainer,
  HashGeneratorExplainer,
  JwtDecoderExplainer,
  K8sResourcesExplainer,
  TimestampConverterExplainer,
  UuidGeneratorExplainer,
  YamlJsonFormatterExplainer,
} from "@/components/tools/explainers";
import type { ComponentType } from "react";

// Server-rendered explainer copy per tool. The interactive tools themselves are
// code-split in tool-loader.tsx; icons live in tool-icons.ts.
export const TOOL_EXPLAINERS: Record<string, ComponentType> = {
  "cidr-calculator": CidrCalculatorExplainer,
  "jwt-decoder": JwtDecoderExplainer,
  base64: Base64Explainer,
  "uuid-generator": UuidGeneratorExplainer,
  "cron-parser": CronParserExplainer,
  "k8s-resources": K8sResourcesExplainer,
  "yaml-json-formatter": YamlJsonFormatterExplainer,
  "timestamp-converter": TimestampConverterExplainer,
  "hash-generator": HashGeneratorExplainer,
};
