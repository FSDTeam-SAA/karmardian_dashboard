"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Redirect = () => {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.push("/dashboard");
        }, 500);
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-md">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                <p className="text-lg font-medium text-gray-700">
                    Redirecting to your dashboard...
                </p>
            </div>
        </div>
    );
};

export default Redirect;