import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Account = {
  id: string;
  user_id?: string;
  name: string;
  type: 'bank' | 'e-wallet' | 'cash';
  balance: number;
};

export async function getAccounts() {
  const { data, error } = await supabase.from('accounts').select('*');
  if (error) throw error;
  return data as Account[];
}

export async function addAccount(account: Omit<Account, 'id'>) {
  const { data, error } = await supabase.from('accounts').insert([account]);
  if (error) throw error;
  return data;
}