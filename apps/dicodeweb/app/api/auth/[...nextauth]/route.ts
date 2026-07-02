import { createGoogleAuthHandler } from "@repo/auth";

const handler = createGoogleAuthHandler();

export { handler as GET, handler as POST };
