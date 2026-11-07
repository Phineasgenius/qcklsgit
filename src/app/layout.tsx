import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata: Metadata = {
  title: 'Quiz Club KLS GIT | Question of the Day',
  description: 'The official Question of the Day and trivia publication of Quiz Club, Karnatak Law Society Gogte Institute of Technology, Belagavi.',
  keywords: ['Quiz Club', 'KLS GIT', 'Belagavi', 'Question of the Day', 'Trivia', 'Funda', 'Leaderboard'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased selection:bg-amber-500 selection:text-black">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
