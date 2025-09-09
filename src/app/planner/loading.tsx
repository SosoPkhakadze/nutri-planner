// src/app/planner/loading.tsx
export default function PlannerLoading() {
  const skeletonDays = Array.from({ length: 7 });

  return (
    <div>
      {/* Skeleton Header */}
       <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center h-[68px]">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-slate-700 rounded-xl animate-pulse"></div>
              <div>
                <div className="h-7 w-48 bg-slate-700 rounded-md animate-pulse"></div>
                <div className="h-3 w-32 bg-slate-700 rounded-md animate-pulse mt-2"></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-24 bg-slate-700 rounded-xl animate-pulse hidden lg:block"></div>
              <div className="h-10 w-24 bg-slate-700 rounded-xl animate-pulse hidden lg:block"></div>
              <div className="h-10 w-24 bg-slate-700 rounded-xl animate-pulse hidden lg:block"></div>
            </div>
            <div className="h-10 w-10 bg-slate-700 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>

      <main className="container mx-auto p-4 md:p-8">
        {/* Skeleton Page Title and Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <div className="h-9 w-64 bg-slate-700 rounded-md animate-pulse"></div>
            <div className="h-5 w-72 bg-slate-700 rounded-md animate-pulse mt-2"></div>
          </div>
          <div className="h-14 w-80 bg-slate-800 rounded-xl animate-pulse"></div>
        </div>

        {/* Skeleton Weekly Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {skeletonDays.map((_, index) => (
            <div key={index} className="bg-slate-800/50 rounded-xl p-4 min-h-[300px] flex flex-col animate-pulse">
              <div className="flex flex-col items-center gap-2 mb-4">
                <div className="h-5 w-10 bg-slate-700 rounded-md"></div>
                <div className="h-10 w-10 bg-slate-700 rounded-full"></div>
              </div>
              <div className="flex-grow space-y-2">
                <div className="h-10 w-full bg-slate-700/50 rounded-lg"></div>
                <div className="h-10 w-full bg-slate-700/50 rounded-lg opacity-70"></div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-around items-center">
                 <div className="h-12 w-12 bg-slate-700 rounded-full"></div>
                 <div className="h-12 w-12 bg-slate-700 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}