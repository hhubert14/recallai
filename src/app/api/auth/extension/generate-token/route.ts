// src/app/api/auth/generate-extension-token/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Handle preflight requests
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        
        // Get the current user session
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
            return NextResponse.json({ 
                error: 'Not authenticated. Please sign in first.' 
            }, { 
                status: 401,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                }
            });
        }
        
        // Generate a random token for the extension
        const extensionToken = generateRandomToken();
        
        // Set expiration to 30 days from now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        
        // Check if user exists in our users table
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .single();
        
        if (!existingUser) {
            // Create user in our users table if they don't exist
            const { error: userCreateError } = await supabase
                .from('users')
                .insert({
                    id: user.id,
                    email: user.email || '',
                    created_at: new Date().toISOString()
                });
            
            if (userCreateError) {
                console.error('Error creating user:', userCreateError);
                return NextResponse.json({ 
                    error: 'Failed to create user profile' 
                }, { 
                    status: 500,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    }
                });
            }
        }
        
        // Delete any existing extension tokens for this user
        await supabase
            .from('extension_tokens')
            .delete()
            .eq('user_id', user.id);
        
        // Create new extension token
        const { data: tokenData, error: tokenError } = await supabase
            .from('extension_tokens')
            .insert({
                user_id: user.id,
                token: extensionToken,
                expires_at: expiresAt.toISOString(),
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (tokenError) {
            console.error('Error creating extension token:', tokenError);
            return NextResponse.json({ 
                error: 'Failed to create extension token' 
            }, { 
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                }
            });
        }
        
        return NextResponse.json({ 
            success: true,
            token: extensionToken,
            user: {
                id: user.id,
                email: user.email
            },
            expiresAt: expiresAt.toISOString()
        }, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
        });
        
    } catch (error) {
        console.error('Extension auth error:', error);
        return NextResponse.json({ 
            error: 'Authentication failed' 
        }, { 
            status: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
        });
    }
}

// Generate a random token for extension authentication
function generateRandomToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 64; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}