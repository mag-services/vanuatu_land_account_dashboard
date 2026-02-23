import { LandCoverDashboard } from './pages/LandCoverDashboard'

export default function LandCoverApp() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/95 py-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <h1 className="text-xl font-bold text-foreground md:text-2xl">
            Vanuatu Land Cover Accounts Dashboard
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Land cover changes 2020–2023 (sq km)
          </p>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="container mx-auto">
          <LandCoverDashboard />
        </div>
      </main>
    </div>
  )
}
