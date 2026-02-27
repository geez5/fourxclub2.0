import { Inter } from 'next/font/google'
import '@fontsource/satoshi/400.css' // Regular
import '@fontsource/satoshi/500.css' // Medium
import '@fontsource/satoshi/700.css' // Bold
import '@fontsource/jetbrains-mono/400.css' // Regular
import '@fontsource/jetbrains-mono/700.css' // Bold
import './globals.css'
import { Providers } from '@/components/Providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata = {
  title: 'FourXClub',
  description: 'Premium trading course and community',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-body`} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}