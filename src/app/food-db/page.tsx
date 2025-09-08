// src/app/food-db/page.tsx
'use client';

import Header from "@/components/Header";
import Card from "@/components/ui/Card";
import AddFoodItemModal from "@/components/food-db/AddFoodItemModal";
import RemoveButton from "@/components/ui/RemoveButton";
import EditFoodItemModal from "@/components/food-db/EditFoodItemModal";
import { deleteFoodItem } from "@/app/actions/food";
import { Pencil, Tag } from "lucide-react";
import { useState, useMemo, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export default function FoodDbPage() {
  const [user, setUser] = useState<User | null>(null);
  const [foodItems, setFoodItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const supabase = createClient();
  
  // Use a single useEffect to fetch data and listen for changes
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

    // Set up a listener for real-time updates
    const channel = supabase.channel('food_items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'food_items' },
        (payload) => {
          // Refetch data when a change occurs
          fetchUserAndData();
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return foodItems;
    return foodItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, foodItems]);

  if (isLoading) {
    // You can use your existing FoodDbLoading component here if you want
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h1 className="text-3xl font-bold">Food Database</h1>
          <div className="flex items-center gap-4">
            <input 
              type="search" 
              placeholder="Search foods or tags..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-700 p-2 rounded-md" 
            />
            <AddFoodItemModal />
          </div>
        </div>

        <Card>
          {filteredItems.length > 0 ? (
            <ul className="divide-y divide-slate-700">
              {filteredItems.map((item) => (
                <li key={item.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{item.name} <span className="text-sm font-normal text-gray-400">{item.brand ? `- ${item.brand}` : ''}</span></p>
                    <p className="text-sm text-gray-400 font-mono">
                      100g: {item.calories}kcal | P:{item.protein_g}g C:{item.carbs_g}g F:{item.fat_g}g
                    </p>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <Tag size={14} className="text-gray-500" />
                        <div className="flex gap-1.5 flex-wrap">
                          {item.tags.map((tag: string) => <span key={tag} className="text-xs bg-cyan-900/50 text-cyan-300 px-2 py-0.5 rounded-full">{tag}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {/* THIS IS THE CRUCIAL PART THAT WAS MISSING */}
                    {user && item.owner_user_id === user.id && (
                      <>
                        <EditFoodItemModal foodItem={item}>
                          <Pencil size={16} />
                        </EditFoodItemModal>
                        <RemoveButton 
                          action={() => deleteFoodItem(item.id)} 
                          itemDescription={item.name} 
                        />
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-8">No items found matching your search.</p>
          )}
        </Card>
      </main>
    </div>
  );
}