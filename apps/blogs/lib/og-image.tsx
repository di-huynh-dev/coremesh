import type { BlogTopic } from "@/lib/content/types";
import { AUTHOR, OG_IMAGE_SIZE, SITE_NAME, SITE_URL } from "@/lib/site";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ReactNode } from "react";
import { ImageResponse } from "next/og";

export const ogSize = OG_IMAGE_SIZE;

// Light-theme tokens from globals.css as hex, since Satori has no CSS variables.
const ink = "#0b1015";
const soft = "#566170";
const faint = "#8a94a3";
const line = "#e2e6ed";
const cobalt = "#2f5bff";
const topicColor: Record<BlogTopic, string> = {
  systems: "#2f5bff",
  frontend: "#c2410c",
  performance: "#0b7a55",
  tooling: "#7c3aed",
  growth: "#a16207",
};

// Satori needs TTF/OTF (not the woff2 in app/fonts). Shipped via outputFileTracingIncludes.
const asset = (file: string) => readFile(path.join(process.cwd(), "assets", "og", file));
let assets: Promise<{ bold: Buffer; medium: Buffer; avatar: string }> | undefined;

function loadAssets() {
  assets ??= Promise.all([
    asset("BeVietnamPro-Bold.ttf"),
    asset("BeVietnamPro-Medium.ttf"),
    asset("avatar.png"),
  ]).then(([bold, medium, avatar]) => ({
    bold,
    medium,
    avatar: `data:image/png;base64,${avatar.toString("base64")}`,
  }));
  return assets;
}

const host = SITE_URL.replace(/^https?:\/\//, "");

// Satori lays a fragment out as one flex row: pass `body` and `footer` as single elements.
async function render(accent: string, header: string, body: ReactNode, footer: ReactNode) {
  const { bold, medium, avatar } = await loadAssets();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          color: ink,
          fontFamily: "Be Vietnam Pro",
        }}
      >
        <div style={{ display: "flex", height: 12, background: accent }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "44px 72px 52px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain img */}
              <img src={avatar} width={56} height={56} alt="" style={{ borderRadius: 9999 }} />
              <div style={{ display: "flex", fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>
                {header}
              </div>
            </div>
            <div style={{ display: "flex", fontSize: 24, fontWeight: 500, color: faint }}>{host}</div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {body}
          </div>
          <div
            style={{
              display: "flex",
              borderTop: `2px solid ${line}`,
              paddingTop: 28,
              fontSize: 24,
              fontWeight: 500,
              color: soft,
            }}
          >
            {footer}
          </div>
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Be Vietnam Pro", data: medium, weight: 500, style: "normal" },
        { name: "Be Vietnam Pro", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}

function Dot({ color }: { color: string }) {
  return <div style={{ display: "flex", width: 16, height: 16, borderRadius: 9999, background: color }} />;
}

/** Default card: locale homes and every page without its own image. */
export function renderSiteOgImage({
  description,
  topics,
}: {
  description: string;
  topics: { topic: BlogTopic; title: string }[];
}) {
  return render(
    cobalt,
    AUTHOR.name,
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", fontSize: 104, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>
        {SITE_NAME}
      </div>
      <div style={{ display: "flex", fontSize: 36, fontWeight: 500, color: soft, marginTop: 28, maxWidth: 940, lineHeight: 1.35 }}>
        {description}
      </div>
    </div>,
    <div style={{ display: "flex", flex: 1, flexWrap: "wrap", gap: "12px 28px" }}>
      {topics.map(({ topic, title }) => (
        <div key={topic} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 21 }}>
          <Dot color={topicColor[topic]} />
          {title}
        </div>
      ))}
    </div>,
  );
}

/** Leading tags that fit on the footer line next to the byline. */
function footerTags(tags: string[], budget = 32) {
  const picked: string[] = [];
  let used = 0;
  for (const tag of tags.slice(0, 3)) {
    used += tag.length + 2;
    if (used > budget) break;
    picked.push(tag);
  }
  return picked;
}

function titleSize(title: string) {
  if (title.length <= 50) return 68;
  if (title.length <= 80) return 58;
  if (title.length <= 105) return 50;
  return 44;
}

/** Per-post card: topic, title, author, date and reading time. */
export function renderPostOgImage({
  title,
  topic,
  topicTitle,
  meta,
  tags,
}: {
  title: string;
  topic: BlogTopic;
  topicTitle: string;
  /** e.g. "26 tháng 10, 2026 · 9 phút đọc" */
  meta: string;
  tags: string[];
}) {
  const color = topicColor[topic];

  return render(
    color,
    SITE_NAME,
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 26, fontWeight: 500, color }}>
        <Dot color={color} />
        {topicTitle}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: titleSize(title),
          fontWeight: 700,
          lineHeight: 1.18,
          letterSpacing: -1,
          marginTop: 22,
        }}
      >
        {title}
      </div>
    </div>,
    <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "space-between", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ fontWeight: 700, color: ink }}>{AUTHOR.name}</span>
        <span>·</span>
        <span>{meta}</span>
      </div>
      <div style={{ display: "flex", gap: 14, fontSize: 22, color: faint }}>
        {footerTags(tags).map((tag) => (
          <span key={tag}>#{tag}</span>
        ))}
      </div>
    </div>,
  );
}
