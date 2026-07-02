import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

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
