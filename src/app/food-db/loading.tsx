// src/app/food-db/loading.tsx
export default function FoodDbLoading() {
  const skeletonItems = Array.from({ length: 5 });
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <div className="h-9 w-64 bg-slate-700 rounded-md animate-pulse"></div>
            <div className="h-5 w-72 bg-slate-700 rounded-md animate-pulse mt-2"></div>
          </div>
          <div className="h-12 w-44 bg-cyan-700/50 rounded-md animate-pulse"></div>
        </div>
        
        <div className="bg-slate-800/50 rounded-xl animate-pulse">
          <div className="p-6 border-b border-slate-700/50">
             <div className="h-12 w-full bg-slate-800 rounded-xl"></div>
          </div>
          <div className="divide-y divide-slate-700/50">
            {skeletonItems.map((_, index) => (
              <div key={index} className="p-6 flex justify-between items-center">
                 <div className="flex-1 space-y-3">
                   <div className="h-6 w-3/5 bg-slate-700 rounded-md"></div>
                   <div className="h-4 w-4/5 bg-slate-700 rounded-md"></div>
                   <div className="h-4 w-1/2 bg-slate-700 rounded-md"></div>
                 </div>
                 <div className="h-8 w-16 bg-slate-700 rounded-md"></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}