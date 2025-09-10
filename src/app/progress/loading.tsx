// src/app/progress/loading.tsx
export default function ProgressLoading() {
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
          <div className="h-9 w-64 bg-slate-700 rounded-md mb-2"></div>
          <div className="h-5 w-72 bg-slate-700 rounded-md mb-12"></div>
  
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
                <div className="h-12 w-full bg-slate-800 rounded-xl"></div>
                <div className="h-96 bg-slate-800/50 rounded-xl"></div>
            </div>
            <div className="lg:col-span-1 space-y-4">
                <div className="h-40 bg-slate-800/50 rounded-xl"></div>
                <div className="h-64 bg-slate-800/50 rounded-xl"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }