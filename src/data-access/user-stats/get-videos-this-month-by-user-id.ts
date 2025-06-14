import { createClient } from "@/lib/supabase/server";

export async function getVideosThisMonthByUserId(userId: string): Promise<number> {
    const supabase = await createClient();
    
    // Get the start of current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    try {
        // For billing purposes, count ALL videos (including soft-deleted)
        // This prevents users from deleting data to reset their monthly usage limits
        const { count, error } = await supabase
            .from('videos')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('created_at', startOfMonth.toISOString());

        if (error) {
            console.error('Error fetching monthly video count:', error);
            return 0;
        }

        return count || 0;
    } catch (error) {
        console.error('Error fetching monthly video count:', error);
        return 0;
    }
}
