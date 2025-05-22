// Auth middleware for protecting routes
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
  // Create a Supabase client configured to use cookies
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey, {
    cookies: {
      get: (name: string) => request.cookies.get(name)?.value,
      set: (_name: string, _value: string, _options) => {}, // Not used in middleware
      remove: (_name: string, _options) => {}, // Not used in middleware
    },
  });

  const { data: { session } } = await supabase.auth.getSession();

  // If the user is not signed in and the current path is not /sign-in or /sign-up,
  // redirect the user to /sign-in
  if (!session && 
      !request.nextUrl.pathname.startsWith('/sign-in') && 
      !request.nextUrl.pathname.startsWith('/sign-up') &&
      request.nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // If the user is signed in and the current path is /sign-in or /sign-up,
  // redirect the user to /dashboard
  if (session && 
      (request.nextUrl.pathname.startsWith('/sign-in') || 
       request.nextUrl.pathname.startsWith('/sign-up'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/sign-in',
    '/sign-up',
    '/profile/:path*'
  ],
};
