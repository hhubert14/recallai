"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LogoutPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleSignOut = async () => {
      try {
        await supabase.auth.signOut();
        // Redirect to home page after sign out
        router.push("/");
        router.refresh();
      } catch (error) {
        console.error("Error signing out:", error);
        // Still redirect even if there's an error
        router.push("/");
      }
    };

    handleSignOut();
  }, [router, supabase]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Signing out...</p>
      </div>
    </div>
  );
}
