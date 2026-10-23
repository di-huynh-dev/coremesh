import type { ToolIcon } from "@/lib/content/tools";
import {
  Binary,
  Braces,
  CalendarClock,
  Clock,
  Container,
  Fingerprint,
  Hash,
  KeyRound,
  Network,
  type LucideIcon,
} from "lucide-react";

// Kept apart from the tool components so cards and teasers don't pull tool code into their bundle.
export const TOOL_ICON_COMPONENTS: Record<ToolIcon, LucideIcon> = {
  network: Network,
  key: KeyRound,
  binary: Binary,
  fingerprint: Fingerprint,
  clock: Clock,
  container: Container,
  calendar: CalendarClock,
  hash: Hash,
  braces: Braces,
};
