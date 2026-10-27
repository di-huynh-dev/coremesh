import { highlights, profile, SITE_URL } from "@/lib/data/profile";
import type { Locale } from "@/lib/i18n";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogAlt = `${profile.name} (${profile.englishName}) · ${profile.title}`;

const stackLine: Record<Locale, string> = {
  en: "React · Next.js · TypeScript · AI agents",
  vi: "React · Next.js · TypeScript · AI agent",
};

// Site tokens (globals.css, light theme) as hex, since Satori has no CSS variables.
const paper = "#F7F4ED";
const ink = "#1F1814";
const brand = "#C52F1B";
const bronze = "#AD7015";

const asset = (file: string) => readFile(path.join(process.cwd(), "assets", "og", file));

/** Shared social card; each route's opengraph-image.tsx picks the locale. */
export async function renderOgImage(locale: Locale) {
  const [bold, medium, avatar] = await Promise.all([
    asset("BeVietnamPro-Bold.ttf"),
    asset("BeVietnamPro-Medium.ttf"),
    asset("avatar.png"),
  ]);
  const avatarSrc = `data:image/png;base64,${avatar.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: paper,
          color: ink,
          fontFamily: "Be Vietnam Pro",
          padding: 56,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            border: `2px solid ${ink}1f`,
            padding: "48px 56px",
            alignItems: "center",
            gap: 56,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 300,
              height: 300,
              borderRadius: 9999,
              border: `6px solid ${bronze}`,
              overflow: "hidden",
              background: "#F4EDE3",
              flexShrink: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain img */}
            <img src={avatarSrc} width={300} height={300} alt="" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ display: "flex", fontSize: 24, fontWeight: 500, color: bronze, letterSpacing: 2 }}>
              {SITE_URL.replace(/^https?:\/\//, "").toUpperCase()}
            </div>
            <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.05, marginTop: 16 }}>
              {profile.name}
              <span style={{ color: brand }}>.</span>
            </div>
            <div style={{ display: "flex", fontSize: 34, fontWeight: 500, marginTop: 14 }}>
              {profile.title}
            </div>
            <div style={{ display: "flex", fontSize: 24, fontWeight: 500, color: `${ink}99`, marginTop: 8 }}>
              {stackLine[locale]}
            </div>

            <div style={{ display: "flex", gap: 36, marginTop: 40 }}>
              {highlights.slice(0, 3).map((item) => (
                <div key={item.value} style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", fontSize: 44, fontWeight: 700, color: brand, lineHeight: 1 }}>
                    {item.value}
                  </div>
                  <div style={{ display: "flex", fontSize: 18, fontWeight: 500, color: `${ink}99`, marginTop: 8 }}>
                    {item.label[locale]}
                  </div>
                </div>
              ))}
            </div>
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
