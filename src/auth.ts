import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      authorize: async (credentials, request) => {
        const limite = rateLimit(`login:${getClientIp(request)}`, 10, 15 * 60 * 1000);
        if (!limite.permitido) return null;

        const email = credentials?.email as string | undefined;
        const senha = credentials?.senha as string | undefined;
        if (!email || !senha) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.senhaHash) return null;

        const senhaValida = await bcrypt.compare(senha, user.senhaHash);
        if (!senhaValida) return null;

        return { id: user.id, name: user.nome, email: user.email, role: user.role };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user.email) return true;

      const dbUser =
        (await prisma.user.findUnique({ where: { email: user.email } })) ??
        (await prisma.user.create({
          data: { nome: user.name ?? user.email, email: user.email, emailVerificado: true },
        }));

      user.id = dbUser.id;
      (user as { role?: string }).role = dbUser.role;
      return true;
    },
  },
});
