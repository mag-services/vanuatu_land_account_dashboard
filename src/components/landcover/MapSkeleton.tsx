import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function MapSkeleton() {
  return (
    <Card className="border-white/20 dark:border-gray-700/30 bg-white/70 dark:bg-gray-900/60 backdrop-blur-md shadow-lg">
      <CardHeader>
        <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-[320px] animate-pulse rounded-xl bg-muted/50" />
      </CardContent>
    </Card>
  )
}
