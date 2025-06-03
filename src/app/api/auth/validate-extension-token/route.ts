"use server";

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing or invalid token' }, { status: 401 });
        }
        
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        const supabase = await createClient();
        
        // Look up the token in our extension_tokens table
        const { data: tokenData, error } = await supabase
            .from('extension_tokens')
            .select('user_id, expires_at')
            .eq('token', token)
            .single();
        
        if (error || !tokenData) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }
        
        // Check if token is expired
        if (new Date(tokenData.expires_at) < new Date()) {
            // Clean up expired token
            await supabase
                .from('extension_tokens')
                .delete()
                .eq('token', token);
            
            return NextResponse.json({ error: 'Token expired' }, { status: 401 });
        }
        
        // Update last_used_at (or updated_at if you kept that column name)
        await supabase
            .from('extension_tokens')
            .update({ updated_at: new Date().toISOString() })
            .eq('token', token);
        
        // Get user info
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, email')
            .eq('id', tokenData.user_id)
            .single();
        
        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        return NextResponse.json({ 
            valid: true, 
            user: {
                id: user.id,
                email: user.email
            }
        });
        
    } catch (error) {
        console.error('Token validation error:', error);
        return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
    }
}