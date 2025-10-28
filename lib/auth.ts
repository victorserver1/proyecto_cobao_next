import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
// Opcional: credenciales
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"


export const {
  handlers: { GET, POST }, // para /api/auth
  auth,                    // para obtener sesión en Server Components
  signIn, signOut,         // server actions
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, // JWT moderno
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,})
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        // @ts-ignore: si tienes rol en User
        token.role = (user as any).role ?? "user"
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        // @ts-ignore
        session.user.id = token.id as string
        // @ts-ignore
        session.user.role = token.role as string
      }
      return session
    },
  },
  // Opcional: páginas personalizadas
  // pages: { signIn: "/auth/signin" }
})
