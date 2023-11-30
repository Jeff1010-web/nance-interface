import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import { SiweMessage } from "siwe";

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
// FIXME: wallet not unlocked can bring a strange case
export default async function auth(req: any, res: any) {
  const providers = [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
      },
      async authorize(credentials) {
        try {
          const siwe = new SiweMessage(
            JSON.parse(credentials?.message || "{}"),
          );
          const nextAuthDomains = process.env.NEXTAUTH_DOMAINS?.split(",");
          if (!nextAuthDomains) return null;
          const csrf = await getCsrfToken({ req });
          const domain = JSON.parse(credentials?.message || "")?.domain;
          const domainPattern = nextAuthDomains.filter((domain) =>
            domain.includes("*"),
          )[0]; // support 1 domain pattern
          let regexPattern = /.*/; // initialize as any string
          if (domainPattern)
            regexPattern = new RegExp(`^${domainPattern.replace(/\*/g, ".*")}`); // make domain pattern new regex
          if (!nextAuthDomains.includes(domain) && !regexPattern.test(domain)) {
            console.log(
              "❌ NextAuth.authorize.error",
              "Invalid domain",
              domain,
            );
            // FIXME to return meaningful error message
            return null;
          }

          console.log("📚 NextAuth.authorize", credentials, domain, csrf);
          const result = await siwe.verify({
            signature: credentials?.signature || "",
            domain,
            nonce: csrf,
          });

          if (result.success) {
            return {
              id: siwe.address,
            };
          }
          return null;
        } catch (e) {
          console.log("❌ NextAuth.authorize.error", e);
          return null;
        }
      },
    }),
  ];

  const isDefaultSigninPage =
    req.method === "GET" && req.query.nextauth.includes("signin");

  // Hide Sign-In with Ethereum from default sign page
  if (isDefaultSigninPage) {
    providers.pop();
  }

  return await NextAuth(req, res, {
    // https://next-auth.js.org/configuration/providers/oauth
    providers,
    session: {
      strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      async session({ session, token }: { session: any; token: any }) {
        session.address = token.sub;
        session.user.name = token.sub;
        return session;
      },
      async signIn() {
        return true;
      },
      async redirect({ url }: { url: string }) {
        return url;
      },
    },
  });
}
