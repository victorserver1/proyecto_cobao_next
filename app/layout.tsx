import Navbar from './Navbar'
import Footer from './Footer'
import AuthProvider from './auth/components/AuthProvider'
import './globals.css'
import { Toaster } from 'sonner'
import NavControls from '@/components/NavControls'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Alturas aproximadas:
  // Navbar ~64px (h-16), NavControls ~48px → total ~112px
  // Ajusta si tu NavControls es más alto.
  const HEADER_HEIGHT = 112;

  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          {/* Header fijo con Navbar + NavControls */}
          <div className="fixed top-0 left-0 right-0 z-50 bg-white">
            <Navbar />
            <NavControls />
            
          </div>

          {/* Spacer para que el contenido no quede debajo del header fijo */}
          <div style={{ height: HEADER_HEIGHT }} />

          {/* Contenido */}
          <main className="flex-1">
            {children}
          </main>

          <Footer />
          <Toaster position="bottom-right" richColors style={{ marginBottom: '4.5rem' }} />
        </AuthProvider>
      </body>
    </html>
  )
}