import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function LoadingSkeleton() {
  return (
    <Card className="border-2 border-border/50 bg-card/80 backdrop-blur-sm p-6">
      <div className="flex items-start gap-4">
        <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />

        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />

          <div className="flex gap-2 pt-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>
    </Card>
  )
}
