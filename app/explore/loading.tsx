import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-10 w-64 bg-muted animate-pulse rounded" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-video bg-muted animate-pulse" />
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 w-full bg-muted animate-pulse rounded" />
                <div className="h-3 w-4/5 bg-muted animate-pulse rounded" />
              </div>
            </CardContent>
            <CardFooter>
              <div className="h-9 w-full bg-muted animate-pulse rounded" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
