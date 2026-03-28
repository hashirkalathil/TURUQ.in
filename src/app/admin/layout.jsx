'use client';

import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";
import { NotificationProvider } from "@/components/ui/notification/NotificationProvider";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { LoaderCircle } from "lucide-react";

export default function Layout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const isAuthPage = pathname === '/admin/login' || pathname === '/admin/register';

    useEffect(() => {
        if (isAuthPage) {
            setIsInitialLoading(false);
            return;
        }

        const fetchCurrentUser = async () => {
            try {
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                    const userData = await response.json();
                    setCurrentUser(userData);
                } else {
                    router.push('/admin/login');
                }
            } catch (error) {
                console.error('Failed to fetch current user:', error);
                router.push('/admin/login');
            } finally {
                setIsInitialLoading(false);
            }
        };

        if (!currentUser) {
            fetchCurrentUser();
        } else {
            setIsInitialLoading(false);
        }
        
    }, []);

    if (isInitialLoading && !isAuthPage) {
        return (
            <NotificationProvider>
                <div className="flex bg-background min-h-screen items-center justify-center">
                    <LoaderCircle className="animate-spin h-8 w-8 text-black" />
                </div>
            </NotificationProvider>
        );
    }

    return (
        <NotificationProvider>
            <div className="flex flex-col bg-background min-h-screen">
                {isAuthPage ? (
                    <div className="min-h-screen w-full">{children}</div>
                ) : (
                    <>
                        <Header 
                            currentUser={currentUser} 
                            isSidebarOpen={isSidebarOpen} 
                            setIsSidebarOpen={setIsSidebarOpen} 
                        />
                        
                        <div 
                            className="flex w-[90%] max-w-[1400px] mx-auto mt-[150px] gap-10"
                            style={{ height: 'calc(100vh - 150px)' }} 
                        >
                            {isSidebarOpen && <Sidebar />}

                            <main className="flex-1 p-6 overflow-y-auto pb-20 scrollbar-hide">
                                {children}
                            </main>
                        </div>
                    </>
                )}
            </div>
        </NotificationProvider>
    );
}