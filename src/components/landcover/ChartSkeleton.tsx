import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function ChartSkeleton() {
  return (
    <Card className="border-white/20 dark:border-gray-700/30 bg-white/70 dark:bg-gray-900/60 backdrop-blur-md shadow-lg">
      <CardHeader>
        <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-[340px] animate-pulse rounded-lg bg-muted/50" />
      </CardContent>
    </Card>
  )
}
