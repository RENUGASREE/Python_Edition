import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function PageLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-32 rounded-2xl" />
      <div className="grid md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
