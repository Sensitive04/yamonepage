export function ProductSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-2 shadow-sm sm:p-3"
      aria-hidden="true"
    >
      <div className="skeleton aspect-square rounded-xl sm:aspect-[4/5]" />
      <div className="px-1 pb-1 pt-3 sm:pt-4">
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton mt-2 h-4 w-3/4" />
        <div className="mt-4 flex items-center justify-between">
          <div className="skeleton h-5 w-16" />
          <div className="skeleton h-4 w-14" />
        </div>
        <div className="skeleton mt-4 h-10 sm:h-11" />
      </div>
    </div>
  );
}
