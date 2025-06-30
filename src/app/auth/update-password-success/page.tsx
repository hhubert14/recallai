"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function RecoverySuccessPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                    </div>
                    <CardTitle className="text-2xl">
                        Password Reset Successful
                    </CardTitle>
                    <CardDescription>
                        Your password has been successfully reset.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-gray-600">
                        You can now use your new password to log in to your
                        account.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button asChild className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                        <Link href="/auth/login">Continue to Log In</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
