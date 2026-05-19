// src/app/admin/not-found.js
'use client'

import Link from 'next/link'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-8">
                {/* 404 Number */}
                <div className="space-y-4">
                    <h1 className="text-9xl font-bold text-indigo-600 tracking-tight">
                        404
                    </h1>
                    <div className="h-1 w-20 bg-indigo-600 mx-auto rounded-full"></div>
                </div>

                {/* Error Message */}
                <div className="space-y-3">
                    <h2 className="text-2xl font-semibold text-gray-800">
                        Page Not Found
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                        We couldn&apos;t find the page you&apos;re looking for.
                        The page might have been moved, deleted, or you entered the wrong URL.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
                    >
                        <Home size={18} />
                        Go Home
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium border border-gray-300 transition-colors duration-200 shadow-sm hover:shadow-md"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>
                </div>

                {/* Search Suggestion */}
                <div className="pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-3">
                        Looking for something specific?
                    </p>
                    <Link
                        href="/search"
                        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors duration-200"
                    >
                        <Search size={16} />
                        Try our search
                    </Link>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-10 left-10 w-20 h-20 bg-indigo-200 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse delay-300"></div>
            </div>
        </div>
    )
}