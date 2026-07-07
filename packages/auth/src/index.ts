import NextAuthModule from "next-auth";
import GoogleProviderModule from "next-auth/providers/google";

const NextAuth =
  (
    (NextAuthModule as unknown as { default?: unknown }).default ??
    NextAuthModule
  ) as typeof import("next-auth/next").default;

const GoogleProvider =
  (
    (
      GoogleProviderModule as unknown as {
        default?: unknown;
      }
    ).default ?? GoogleProviderModule
  ) as typeof import("next-auth/providers/google").default;

function readEnv(name: string) {
  return process.env[name] ?? "";
}

export function createGoogleAuthHandler() {
  return NextAuth({
    providers: [
      GoogleProvider({
        clientId: readEnv("GOOGLE_CLIENT_ID"),
        clientSecret: readEnv("GOOGLE_CLIENT_SECRET"),
      }),
    ],
    secret: readEnv("NEXTAUTH_SECRET"),
  });
}
