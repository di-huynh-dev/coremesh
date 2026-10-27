import { Fragment } from "react";

type RichTextProps = {
  text: string;
  strongClassName?: string;
};

/** Renders the tiny markup used in lib/data: `**strong**` and `` `code` ``. */
export function RichText({
  text,
  strongClassName = "font-semibold text-foreground",
}: RichTextProps) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className={strongClassName}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} className="rounded bg-muted px-1 text-[0.92em]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}
