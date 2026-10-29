"use client";

import { Maximize2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";

/** Post figure (local SVG diagram) that opens full-size in a modal dialog. */
export function Figure({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  const t = useTranslations("post");
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <figure>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-label={t("zoom")}
        className="figure-zoom group/zoom"
      >
        {/* Plain img: post figures are local SVG diagrams with intrinsic sizing. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" />
        <span aria-hidden className="figure-zoom-hint">
          <Maximize2 className="size-4" />
        </span>
      </button>
      {caption ? <figcaption>{caption}</figcaption> : null}

      <dialog
        ref={dialogRef}
        aria-label={alt}
        onClick={() => dialogRef.current?.close()}
        className="figure-dialog"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" loading="lazy" />
        <button type="button" autoFocus aria-label={t("closeZoom")} className="figure-dialog-close">
          <X className="size-5" />
        </button>
      </dialog>
    </figure>
  );
}
