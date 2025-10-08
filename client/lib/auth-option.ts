import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { AuthService } from "@/services/authService";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

export const authOptions: NextAuthOptions = {
  debug: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        accessToken: { label: "Access Token", type: "text" },
        user: { label: "User", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.accessToken || !credentials.user) return null;

        // Parse user object back from JSON
        const user = JSON.parse(credentials.user);

        return {
          accessToken: credentials.accessToken,
          ...user,
        };
      },
    }),
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    // Requests to /api/auth/signin, /api/auth/session
    // and calls to getSession(), getServerSession(),
    // useSession() will invoke this function
    async jwt({ token, user, account, trigger, session }) {
      if (account && user) {
        if (account.provider === "google") {
          // Google login
          const res = await AuthService.loginGoogle(account.id_token!);
          const userRes = res.data?.user;
          const userAccessToken = res.data?.accessToken;
          if (userRes) {
            token.accessToken = userAccessToken;
            token.user = {
              id: userRes.id,
              email: userRes.email!,
              username: userRes.username,
              fullname: userRes.fullname,
              avatarUrl: userRes.avatarUrl,
              roles: userRes.roles,
            };
          }
        } else {
          // Credentials Login (email, password)
          token.accessToken = user.accessToken;
          token.user = {
            id: user.id,
            email: user.email!,
            username: user.username,
            fullname: user.fullname,
            avatarUrl: user.avatarUrl,
            roles: user.roles,
          };
        }
      }
      // call the update() function from getSession() to trigger this
      if (trigger === "update" && session) {
        // session here contains the payload passed to update()
        if (session.accessToken) {
          token.accessToken = session.accessToken;
        }
        if (session.user) {
          token.user = session.user;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token.user) {
        session.user = token.user;
      }
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
};
