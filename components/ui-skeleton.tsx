import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse nm-inset rounded-xl bg-muted/10",
        className
      )}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="nm-flat p-8 rounded-[2.5rem] space-y-6">
      <div className="flex justify-between items-start">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <Skeleton className="w-6 h-6 rounded-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="w-3/4 h-8" />
        <Skeleton className="w-1/4 h-4" />
      </div>
      <div className="pt-4 border-t border-white/5 flex justify-between items-center">
        <Skeleton className="w-16 h-10" />
        <Skeleton className="w-20 h-10" />
      </div>
    </div>
  );
}
