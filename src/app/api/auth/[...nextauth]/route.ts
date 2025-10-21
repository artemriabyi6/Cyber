import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Відсутні email або пароль');
          return null;
        }

        try {
          console.log('Спробуємо авторизувати:', credentials.email);
          
          const response = await fetch('http://localhost:3001/users');
          if (!response.ok) {
            console.error('Помилка отримання користувачів:', response.status);
            return null;
          }
          
          const users = await response.json();
          console.log('Знайдено користувачів:', users.length);
          
          const user = users.find((u: any) => u.email === credentials.email);
          
          if (!user) {
            console.log('Користувач не знайдений:', credentials.email);
            return null;
          }

          // Проста перевірка пароля (без хешування для тесту)
          const isPasswordValid = credentials.password === user.password;

          if (!isPasswordValid) {
            console.log('Невірний пароль для:', credentials.email);
            return null;
          }

          console.log('Успішна авторизація для:', credentials.email, 'Роль:', user.role);
          
          // Повертаємо користувача з роллю
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role || 'student' // Додаємо роль
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }) {
      // Додаємо роль до JWT токена
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Додаємо роль до сесії
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/signin',
    signUp: '/signup',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };