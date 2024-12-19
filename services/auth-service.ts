import { createClient } from "@/utils/supabase/client";

export const authService = {
    async signUp(email: string, password: string) {
        const supabase = createClient();

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) throw error;
        return data;
    },

    async signIn(email: string, password: string) {
        const supabase = createClient();

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return data;
    },
}; 