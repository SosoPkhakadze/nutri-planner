// src/app/food-db/page.tsx
'use client';

import Header from "@/components/Header";
import { GlassCard } from "@/components/ui/Card";
import AddFoodItemModal from "@/components/food-db/AddFoodItemModal";
import RemoveButton from "@/components/ui/RemoveButton";
import EditFoodItemModal from "@/components/food-db/EditFoodItemModal";
import { deleteFoodItem, cloneFoodItem } from "@/app/actions/food";
import { Pencil, Tag, Copy, ShieldCheck, Database, Search } from "lucide-react";
import { useState, useMemo, useEffect, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import FoodDbLoading from "./loading";

export default function FoodDbPage() {
  const [user, setUser] = useState<User | null>(null);
  const [foodItems, setFoodItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();
  
  useEffect(() => {
    const fetchUserAndData = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from('food_items')
          .select('*')
          .or(`owner_user_id.eq.${user.id},verified.eq.true`)
          .order('name', { ascending: true });
        setFoodItems(data || []);
      }
      setIsLoading(false);
    };
    
    fetchUserAndData();

    const channel = supabase.channel('food_items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'food_items' },
        (payload) => {
          fetchUserAndData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleClone = (foodItemId: string) => {
    startTransition(async () => {
      if (confirm("This will create a personal, editable copy of this food item in your database. Continue?")) {
        const result = await cloneFoodItem(foodItemId);
        if (result.success) {
          alert("Food item copied successfully! You can now find and edit it in your database.");
        } else {
          alert(result.error || "Failed to copy item.");
        }
      }
    });
  };

  const filteredItems = useMemo(() => {
    if (!searchTerm) return foodItems;
    return foodItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, foodItems]);

  if (isLoading) {
    return <FoodDbLoading />;
  }

  return (
    <div>
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Food Database
            </h1>
            <p className="text-slate-400 mt-1">Your personal and global food items.</p>
          </div>
          <AddFoodItemModal />
        </div>
        
        <GlassCard className="overflow-hidden">
          {/* Search Bar */}
          <div className="p-6 bg-slate-900/50 border-b border-slate-700/50">
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input 
                type="search" 
                placeholder="Search foods by name, brand, or tag..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-colors"
              />
            </div>
          </div>
          
          {/* List Content */}
          <div>
            {filteredItems.length > 0 ? (
              <ul className="divide-y divide-slate-700/50">
                {filteredItems.map((item) => {
                  const isUserOwned = user && item.owner_user_id === user.id;

                  return (
                    <li key={item.id} className="relative p-6 flex justify-between items-center group hover:bg-slate-800/30 transition-colors">
                      {isUserOwned && (
                        <div className="absolute left-0 top-0 h-full w-1 bg-cyan-500 opacity-75 group-hover:opacity-100 transition-opacity" title="Your editable item"></div>
                      )}

                      <div className={`flex-1 min-w-0 ${isUserOwned ? 'ml-4' : ''}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-semibold text-lg text-white truncate">{item.name}</p>
                          {isUserOwned && (
                             <span className="text-xs bg-slate-700 text-cyan-300 px-2 py-0.5 rounded-full font-medium hidden sm:block">Editable</span>
                          )}
                          {item.verified && !isUserOwned && (
                            <div className="flex-shrink-0" title="Verified Global Item">
                              <ShieldCheck size={18} className="text-cyan-400" />
                            </div>
                          )}
                          {item.brand && <span className="text-sm font-normal text-slate-400 hidden sm:block truncate">- {item.brand}</span>}
                        </div>
                        
                        {/* Macros */}
                        <div className="flex items-center gap-4 text-sm text-slate-300 font-mono mt-3">
                          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-400"></div>{item.calories}<span className="text-slate-500 text-xs">kcal</span></div>
                          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-400"></div>{item.protein_g}g <span className="text-slate-500 text-xs">P</span></div>
                          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-400"></div>{item.carbs_g}g <span className="text-slate-500 text-xs">C</span></div>
                          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-400"></div>{item.fat_g}g <span className="text-slate-500 text-xs">F</span></div>
                        </div>

                        {item.tags && item.tags.length > 0 && (
                          <div className="flex items-center gap-2 mt-4">
                            <Tag size={14} className="text-slate-500 flex-shrink-0" />
                            <div className="flex gap-2 flex-wrap">
                              {item.tags.map((tag: string) => (
                                <span key={tag} className="text-xs bg-cyan-900/70 text-cyan-300 px-2.5 py-1 rounded-full font-medium">{tag}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pl-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isUserOwned ? (
                          <>
                            <EditFoodItemModal foodItem={item}>
                              {/* This is no longer a button to avoid nesting */}
                              <div className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                                 <Pencil size={16} />
                              </div>
                            </EditFoodItemModal>
                            <RemoveButton 
                              action={() => deleteFoodItem(item.id)} 
                              itemDescription={item.name} 
                            />
                          </>
                        ) : (
                          <button 
                            onClick={() => handleClone(item.id)} 
                            disabled={isPending} 
                            title="Create an editable copy" 
                            className="p-2 rounded-lg text-cyan-400 hover:text-white hover:bg-cyan-500/20 transition-colors disabled:opacity-50"
                          >
                            <Copy size={16} />
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-center text-slate-500 py-16">
                 <Database size={32} className="mx-auto mb-4" />
                 <h3 className="font-semibold text-lg text-slate-300">No Items Found</h3>
                 <p className="mt-1">No items in the database match your search criteria.</p>
              </div>
            )}
          </div>
        </GlassCard>
      </main>
    </div>
  );
}