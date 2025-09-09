// src/app/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
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

      <main className="container mx-auto p-4 md:p-8 space-y-8 animate-pulse">
          {/* Page Header Skeleton */}
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div className="h-16 w-full lg:w-1/2 bg-slate-800/50 rounded-xl"></div>
                  <div className="flex items-center gap-3">
                      <div className="h-10 w-40 bg-slate-600 rounded-md"></div>
                      <div className="h-10 w-48 bg-slate-600 rounded-md"></div>
                  </div>
              </div>
              <div className="mt-6 space-y-2">
                  <div className="h-2 w-full bg-slate-800 rounded-full"></div>
              </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="h-28 bg-slate-800/50 border border-slate-700/50 rounded-xl"></div>
              <div className="h-28 bg-slate-800/50 border border-slate-700/50 rounded-xl"></div>
              <div className="h-28 bg-slate-800/50 border border-slate-700/50 rounded-xl"></div>
              <div className="h-28 bg-slate-800/50 border border-slate-700/50 rounded-xl"></div>
          </div>

          {/* Main Content Grid Skeleton */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Meals Section Skeleton */}
              <div className="xl:col-span-3 bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 space-y-6">
                  <div className="h-10 w-full bg-slate-700/50 rounded-lg"></div>
                  <div className="h-48 w-full bg-slate-700/50 rounded-lg"></div>
                  <div className="h-48 w-full bg-slate-700/50 rounded-lg opacity-70"></div>
              </div>
  
              {/* Sidebar Skeleton */}
              <div className="xl:col-span-1 space-y-6">
                  <div className="h-64 bg-slate-800/50 border border-slate-700/50 rounded-xl"></div>
                  <div className="h-64 bg-slate-800/50 border border-slate-700/50 rounded-xl"></div>
              </div>
          </div>
      </main>
    </div>
  );
}