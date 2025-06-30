import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProviderWrapper } from "@/components/providers/AuthProviderWrapper";
import { QuizCompletionProvider } from "@/components/providers/QuizCompletionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "RecallAI - AI-Powered Video Summaries",
    description:
        "Transform video learning with AI-powered summaries and active recall questions, helping you retain knowledge better.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <ThemeProvider>
                    <AuthProviderWrapper>
                        <QuizCompletionProvider>
                            {children}
                        </QuizCompletionProvider>
                    </AuthProviderWrapper>
                </ThemeProvider>
            </body>
        </html>
    );
}
