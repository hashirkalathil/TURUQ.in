"use client";

import React, { useEffect, useState } from 'react';
import {
    Plus,
    FileText,
    Package,
    List,
    MonitorPlay,
    Loader2,
    Users,
    FolderOpen,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import Skeleton from '@/components/admin/ui/Skeleton';

const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/stats');
                if (res.ok) {
                    const json = await res.json();
                    setStats(json.data);
                }
            } catch (error) {
                console.error("Failed to fetch stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();

        // Update time every minute
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const statCards = [
        { label: 'Total Posts', value: stats?.totalPosts, icon: FileText, href: '/admin/posts' },
        { label: 'Total Authors', value: stats?.totalAuthors, icon: Users, href: '/admin/authors' },
        { label: 'Total categories', value: stats?.totalCategories, icon: FolderOpen, href: '/admin/categories' },
    ];

    const shortcuts = [
        { label: 'New Post', icon: FileText, href: '/admin/posts' },
        { label: 'New Webzine', icon: Package, href: '/admin/webzines' },
        { label: 'View Comments', icon: List, href: '/admin/comments' },
        { label: 'New Slide', icon: MonitorPlay, href: '/admin/slides' },
    ];

    return (
        <main className="flex flex-col flex-1 transition-all duration-300 space-y-8">
            {/* Welcome Section */}
            <section className="welcome-section">
                <h1 className="font-poppins font-bold text-[24px] text-black m-0 leading-tight">
                    <span className='uppercase text-gray-500 text-sm block mb-1'>Welcome back,</span>
                    Admin User
                </h1>
                <p className="font-poppins text-[12px] px-3 py-1 mt-2 w-fit rounded-full bg-[#f2cfa6] uppercase font-bold text-black border border-black/10">
                    {currentTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
            </section>

            {/* Statistics Section */}
            <section className="stats-section grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading ? (
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="bg-background border border-black rounded-2xl p-6 h-32 flex flex-col justify-between">
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-10 w-16" />
                        </div>
                    ))
                ) : (
                    statCards.map((card, i) => (
                        <Link 
                            key={i} 
                            href={card.href}
                            className="bg-background border border-black rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1 group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-poppins text-[12px] bg-[#f2cfa6] uppercase px-2 py-1 rounded text-black font-bold border border-black/5">
                                    {card.label}
                                </h3>
                                <card.icon className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                            </div>
                            <p className="font-poppins text-[32px] font-bold text-black leading-none">
                                {card.value ?? 0}
                            </p>
                        </Link>
                    ))
                )}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity Section */}
                <section className="flex flex-col space-y-4">
                    <div className="flex items-center gap-2">
                        <h2 className="font-poppins text-[20px] uppercase font-bold text-black m-0">
                            Recent Posts
                        </h2>
                    </div>
                    <div className="bg-background border border-black rounded-2xl overflow-hidden">
                        {loading ? (
                            <div className="p-4 space-y-3">
                                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                            </div>
                        ) : stats?.recentPosts?.length > 0 ? (
                            <div className="divide-y divide-black/10">
                                {stats.recentPosts.map((post) => (
                                    <div key={post._id} className="p-4 hover:bg-orange-100/50 transition-colors flex justify-between items-center group">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm truncate max-w-[200px] sm:max-w-[300px]">{post.title}</span>
                                            <span className="text-[10px] text-gray-500 uppercase">
                                                {post.author_id?.name || 'Unknown'} • {new Date(post.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border border-black/10 font-bold uppercase
                                                ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {post.status}
                                            </span>
                                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-black opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-500 text-sm">No recent activity</div>
                        )}
                        <Link href="/admin/posts" className="block p-3 text-center text-xs font-bold uppercase bg-[#f2cfa6] border-t border-black hover:bg-orange-300 transition-colors">
                            View All Posts
                        </Link>
                    </div>
                </section>

                {/* Quick Shortcuts Section */}
                <section className="flex flex-col space-y-4">
                    <div className="flex items-center gap-2">
                        <h2 className="font-poppins text-[20px] uppercase font-bold text-black m-0">
                            Quick Shortcuts
                        </h2>
                        <Plus className="w-5 h-5 text-black cursor-pointer hover:rotate-90 transition-transform duration-300" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {shortcuts.map((item, i) => (
                            <Link 
                                key={i} 
                                href={item.href}
                                className="bg-background border border-black rounded-2xl flex items-center p-5 gap-3 hover:bg-[#f2cfa6] hover:shadow-lg transition-all hover:-translate-y-1 group"
                            >
                                <div className="p-2 bg-white rounded-lg border border-black/5 group-hover:bg-black group-hover:text-white transition-colors">
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <p className="font-poppins text-[16px] font-bold text-black">
                                    {item.label}
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default DashboardPage;