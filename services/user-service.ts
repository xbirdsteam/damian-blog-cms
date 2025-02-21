import { createClient } from "@/utils/supabase/client";

export interface User {
  id: string;
  email: string;
  fullname: string | null;
  avatar_url: string | null;
  created_at: string;
}

export const userService = {
  async getUsers() {
    const supabase = createClient();
    
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return users as User[];
  },
  
  async updateUser(userId: string, data: Partial<User>) {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('users')
      .update(data)
      .eq('id', userId);
      
    if (error) throw error;
    
    return true;
  },
}; 