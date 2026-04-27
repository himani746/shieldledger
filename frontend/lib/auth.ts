import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { apiFetch } from '@/lib/api';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'test@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (credentials?.email && credentials?.password) {
          try {
            const res = await apiFetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: credentials.email.trim().toLowerCase(),
                password: credentials.password,
              }),
            });
            
            const data = await res.json();
            
            if (res.ok && data.token) {
              // The backend returns a token and user details, depending on implementation
              // For NextAuth, we just need to return the user object to store in JWT.
              return {
                id: data.user?.id || data.id,
                email: data.user?.email || data.email,
                name: data.user?.org_name || data.user?.organizationName || 'User',
                // Keep the raw token if we need it in the session
                token: data.token
              };
            }
          } catch (error) {
            console.error('Login error:', error);
          }
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.token = (user as any).token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session as any).token = token.token as string;
      }
      return session;
    },
  },
};
