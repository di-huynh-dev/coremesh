import { findLibraryIcon, libraryIconLabel, type LibraryIconId } from "@/lib/library-icons";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function LibraryIcon({
  id,
  size = 16,
  className,
}: {
  id: LibraryIconId;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={`/icons/svgl/${id}.svg`}
      alt={libraryIconLabel(id)}
      width={size}
      height={size}
      className={cn("shrink-0", className)}
    />
  );
}

/** Pill for a skill or tag, with the library logo when one is known. */
export function SkillChip({ label, className }: { label: string; className?: string }) {
  const icon = findLibraryIcon(label);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-line bg-background px-2.5 py-1 text-xs font-medium text-ink/80",
        className,
      )}
    >
      {icon ? <LibraryIcon id={icon} size={14} /> : null}
      {label}
    </span>
  );
}
