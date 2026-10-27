"use client";

import { trackEvent, type TrackEvent } from "@/lib/track";
import type { AnchorHTMLAttributes } from "react";

type TrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  event: TrackEvent;
  eventProps?: Record<string, string | number>;
};

/** A plain <a> that records an analytics event on click (usable from server components). */
export function TrackedLink({ event, eventProps, onClick, ...props }: TrackedLinkProps) {
  return (
    <a
      {...props}
      onClick={(clickEvent) => {
        trackEvent(event, eventProps);
        onClick?.(clickEvent);
      }}
    />
  );
}
