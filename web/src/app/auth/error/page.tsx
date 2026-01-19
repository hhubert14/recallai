import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ message: string }>;
}) {
    const params = await searchParams;

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
            <div className="w-full max-w-sm animate-fade-up">
                <div className="flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">
                                Sorry, something went wrong.
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {params?.message ? (
                                <p className="text-sm text-muted-foreground mb-4">
                                    Code error: {params.message}
                                </p>
                            ) : (
                                <p className="text-sm text-muted-foreground mb-4">
                                    An unspecified error occurred.
                                </p>
                            )}
                            <div className="space-y-3">
                                <p className="text-sm text-muted-foreground">
                                    If this error persists, please contact our
                                    support team:
                                </p>
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                >
                                    <Link href="mailto:hubert@recallai.io?subject=Error Report">
                                        Contact Support
                                    </Link>
                                </Button>
                                <Button asChild size="sm" className="w-full">
                                    <Link href="/">Return to Home</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
