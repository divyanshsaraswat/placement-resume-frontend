import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-muted/20 border-2 border-black/10 dark:border-white/10 rounded-lg",
        className
      )}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-background border-4 border-black dark:border-white p-8 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
      <div className="flex justify-between items-start">
        <Skeleton className="w-14 h-14 rounded-xl" />
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
      <div className="space-y-4">
        <Skeleton className="w-3/4 h-10" />
        <Skeleton className="w-1/2 h-6" />
      </div>
      <div className="pt-6 border-t-4 border-black flex justify-between items-center">
        <Skeleton className="w-20 h-10 rounded-lg" />
        <Skeleton className="w-24 h-10 rounded-lg" />
      </div>
    </div>
  );
}
