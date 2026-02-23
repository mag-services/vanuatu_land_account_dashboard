import { LandCoverDashboard } from './pages/LandCoverDashboard'
import { InstallPWAButton } from './components/InstallPWAButton'

export default function LandCoverApp() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-white/20 dark:border-gray-700/30 bg-white/80 dark:bg-gray-900/70 py-3 shadow-md backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              Vanuatu Land Cover Accounts
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Land cover changes 2020–2023 (sq km)
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <InstallPWAButton />
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="container mx-auto">
          <LandCoverDashboard />
        </div>
      </main>
      <footer className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        <p>© 2026 Vanuatu Land Cover Accounts. Data: Ministry of Lands / SEEA compliant.</p>
        <p className="mt-1">All rights reserved.</p>
      </footer>
    </div>
  )
}
