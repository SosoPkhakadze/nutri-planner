// src/app/planner/loading.tsx
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PlannerLoading() {
  // Create a dummy array for the 7 days of the week to loop over
  const skeletonDays = Array.from({ length: 7 });

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
        {/* Skeleton Page Title and Navigation */}
        <div className="flex justify-between items-center mb-6">
          <div className="h-9 w-64 bg-slate-700 rounded-md animate-pulse"></div>
          <div className="flex items-center gap-4">
            <ChevronLeft className="text-slate-700" />
            <div className="h-7 w-72 bg-slate-700 rounded-md animate-pulse"></div>
            <ChevronRight className="text-slate-700" />
          </div>
        </div>

        {/* Skeleton Weekly Grid */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
          {skeletonDays.map((_, index) => (
            <div key={index} className="bg-slate-800 rounded-lg p-3 min-h-[200px] space-y-3">
              <div className="h-10 w-12 mx-auto bg-slate-700 rounded-md animate-pulse"></div>
              {/* Skeleton meal cards */}
              <div className="h-12 w-full bg-slate-700 rounded-md animate-pulse"></div>
              <div className="h-12 w-full bg-slate-700 rounded-md animate-pulse opacity-70"></div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}