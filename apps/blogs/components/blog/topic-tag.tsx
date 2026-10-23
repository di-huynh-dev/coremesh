import type { BlogTopic } from "@/lib/content/types";
import { topicStyles } from "@/lib/topic-style";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function TopicTag({
  topic,
  className,
}: {
  topic: BlogTopic;
  className?: string;
}) {
  const t = useTranslations("topics");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[0.8rem] font-medium text-soft",
        className,
      )}
    >
      <span className={cn("topic-dot", topicStyles[topic].dot)} />
      {t(`${topic}.title`)}
    </span>
  );
}
