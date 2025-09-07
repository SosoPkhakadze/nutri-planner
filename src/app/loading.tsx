// src/app/loading.tsx

export default function DashboardLoading() {
    return (
      <div>
        {/* Skeleton Header */}
        <div className="bg-slate-800 shadow-sm border-b border-slate-700">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center h-[42px]">
              <div className="h-6 w-48 bg-slate-700 rounded-md animate-pulse"></div>
              <div className="flex items-center gap-6">
                <div className="h-6 w-48 bg-slate-700 rounded-md animate-pulse hidden md:block"></div>
                <div className="h-10 w-10 bg-slate-700 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
  
        <main className="container mx-auto p-4 md:p-8">
          {/* Skeleton Page Title and Button */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="h-9 w-72 bg-slate-700 rounded-md animate-pulse mb-2"></div>
              <div className="h-5 w-56 bg-slate-700 rounded-md animate-pulse"></div>
            </div>
            <div className="h-10 w-32 bg-slate-700 rounded-md animate-pulse"></div>
          </div>
  
          {/* Skeleton Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Schedule Skeleton */}
            <div className="lg:col-span-2">
              <div className="bg-slate-800 rounded-lg p-6 space-y-4">
                <div className="h-7 w-48 bg-slate-700 rounded-md animate-pulse mb-2"></div>
                {/* Skeleton meal cards */}
                <div className="h-28 w-full bg-slate-700 rounded-md animate-pulse"></div>
                <div className="h-28 w-full bg-slate-700 rounded-md animate-pulse opacity-70"></div>
              </div>
            </div>
  
            {/* Right Column: Stats Skeleton */}
            <div className="space-y-6">
              <div className="bg-slate-800 rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-7 w-24 bg-slate-700 rounded-md animate-pulse"></div>
                <div className="h-32 w-32 bg-slate-700 rounded-full animate-pulse"></div>
              </div>
              <div className="bg-slate-800 rounded-lg p-6 space-y-6">
                <div className="h-7 w-24 bg-slate-700 rounded-md animate-pulse"></div>
                {/* Skeleton macro bars */}
                <div className="space-y-2">
                  <div className="h-4 w-full bg-slate-700 rounded-md animate-pulse"></div>
                  <div className="h-2 w-full bg-slate-700 rounded-md animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-slate-700 rounded-md animate-pulse"></div>
                  <div className="h-2 w-full bg-slate-700 rounded-md animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-slate-700 rounded-md animate-pulse"></div>
                  <div className="h-2 w-full bg-slate-700 rounded-md animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }