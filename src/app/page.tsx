 // src/app/page.tsx
 import Header from "@/components/Header";
 import { createClient } from "@/lib/supabase/server";
 import { redirect } from "next/navigation";

 export default async function HomePage() {
   const supabase = await createClient();

   const { data: { user } } = await supabase.auth.getUser();

   if (!user) {
     return redirect("/login");
   }

   return (
     <>
     <Header/>
     <div className="flex min-h-screen flex-col items-center justify-center p-24">
       <h1 className="text-4xl font-bold">Welcome to Nutri-Planner</h1>
       <p className="mt-2 text-lg">You are logged in as {user.email}</p>
       
       <div className="mt-4">
         <form action="/auth/signout" method="post">
           <button 
             type="submit" 
             className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
           >
             Sign Out
           </button>
         </form>
       </div>
     </div>
     </>
   );
 }