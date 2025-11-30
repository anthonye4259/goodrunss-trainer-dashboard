import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="max-w-[1600px] mx-auto space-y-8 p-6 md:p-8">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-10 w-[180px]" />
      </div>

      {/* Action Cards Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-card/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-9 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Revenue Cards Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="rounded-3xl">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-4" />
                </div>
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Referral Section Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Client Health Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="rounded-3xl">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-16" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
