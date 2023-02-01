import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const GOOGLE_CLIENT_ID = (process.env.GOOGLE_CLIENT_ID as string) || undefined;
if (!GOOGLE_CLIENT_ID) throw new Error("GOOGLE_CLIENT_ID is not defined");
const GOOGLE_CLIENT_SECRET =
  (process.env.GOOGLE_CLIENT_SECRET as string) || undefined;
if (!GOOGLE_CLIENT_SECRET)
  throw new Error("GOOGLE_CLIENT_SECRET is not defined");

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
};

export default NextAuth(authOptions);
