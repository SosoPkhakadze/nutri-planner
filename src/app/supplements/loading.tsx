// src/app/supplements/loading.tsx
export default function SupplementsLoading() {
    const skeletonItems = Array.from({ length: 3 });
    return (
      <div>
        {/* Skeleton Header */}
        <div className="bg-slate-800 shadow-sm border-b border-slate-700"><div className="container mx-auto px-4 py-4"><div className="flex justify-between items-center h-[42px]"><div className="h-6 w-48 bg-slate-700 rounded-md animate-pulse"></div><div className="flex items-center gap-6"><div className="h-6 w-48 bg-slate-700 rounded-md animate-pulse hidden md:block"></div><div className="h-10 w-10 bg-slate-700 rounded-lg animate-pulse"></div></div></div></div></div>
        <main className="container mx-auto p-4 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="h-9 w-64 bg-slate-700 rounded-md animate-pulse"></div>
            <div className="h-10 w-40 bg-slate-700 rounded-md animate-pulse"></div>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 space-y-2 animate-pulse">
            {skeletonItems.map((_, index) => (
              <div key={index} className="h-16 w-full bg-slate-700 rounded-md"></div>
            ))}
          </div>
        </main>
      </div>
    );
  }