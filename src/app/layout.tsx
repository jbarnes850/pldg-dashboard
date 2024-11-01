import './globals.css'
import { Inter } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Providers } from '@/components/providers/Providers'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap'
})

export const metadata = {
  title: 'Developer Engagement Dashboard',
  description: 'Track developer engagement, technical progress, and collaboration metrics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
              <ErrorBoundary fallback={
                <div className="p-4 text-red-600">
                  <h2 className="text-lg font-semibold">Something went wrong</h2>
                  <p className="text-sm">Please try refreshing the page</p>
                </div>
              }>
                {children}
              </ErrorBoundary>
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
} 