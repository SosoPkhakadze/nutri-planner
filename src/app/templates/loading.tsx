// src/app/templates/loading.tsx
export default function TemplatesLoading() {
  const skeletonCards = Array.from({ length: 3 });
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
            <div className="h-10 w-10 bg-slate-700 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto p-4 md:p-8 animate-pulse">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
              <div className="h-9 w-64 bg-slate-700 rounded-md"></div>
              <div className="h-5 w-72 bg-slate-700 rounded-md mt-2"></div>
          </div>
        </div>

        <div className="space-y-12">
          {/* Day Templates Skeleton */}
          <section>
            <div className="h-8 w-1/3 bg-slate-700 rounded-md mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skeletonCards.map((_, index) => (
                <div key={index} className="bg-slate-800/50 rounded-xl h-[220px] flex flex-col justify-between">
                  <div className="p-6 space-y-3 border-b border-slate-700/50">
                      <div className="h-14 w-full bg-slate-700/50 rounded-lg"></div>
                      <div className="h-5 w-1/2 bg-slate-700/50 rounded-md"></div>
                  </div>
                  <div className="p-6">
                      <div className="h-12 w-full bg-slate-700 rounded-xl"></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}