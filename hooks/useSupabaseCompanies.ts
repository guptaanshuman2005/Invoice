import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import type { Company } from '../types';

export function useSupabaseCompanies(userId: string | undefined): [Company[], (value: React.SetStateAction<Company[]>) => void, boolean] {
  const [companies, setCompaniesState] = useState<Company[]>([]);
  const [loading, setLoading] = useState(!!userId);
  const [prevUserId, setPrevUserId] = useState(userId);

  if (userId !== prevUserId) {
    setPrevUserId(userId);
    setLoading(!!userId);
  }

  useEffect(() => {
    if (!userId) {
      setCompaniesState([]);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchCompanies = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('data')
        .eq('owner_id', userId);

      if (!isMounted) return;

      if (error) {
        console.error('Error fetching companies:', error);
      } else if (data) {
        setCompaniesState(data.map((row: any) => row.data as Company));
      }
      setLoading(false);
    };

    fetchCompanies();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const setCompanies = async (value: React.SetStateAction<Company[]>) => {
    setCompaniesState((prev) => {
      const newCompanies = typeof value === 'function' ? (value as Function)(prev) : value;
      
      // Sync to Supabase in the background
      if (userId) {
        const syncData = async () => {
          for (const company of newCompanies) {
            const { error } = await supabase
              .from('companies')
              .upsert({ 
                id: company.id, 
                owner_id: company.ownerId, 
                data: company 
              });
            if (error) {
              console.error('Error syncing company to Supabase:', error);
            }
          }
        };
        syncData();
      }
      
      return newCompanies;
    });
  };

  return [companies, setCompanies, loading];
}
