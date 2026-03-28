// src/app/admin/login/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/ui/notification/NotificationProvider";
import Button from "@/components/ui/button/Button";
import { LoaderCircle, Mail, Lock, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginForm() {
    const [loading, setLoading] = useState(false);
    const { addNotification } = useNotification();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const router = useRouter();
    
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch("/api/auth/login", {
                method: 'POST',
                headers: {
                    'x-api-key': "itstheprivateKeY",
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const result = await response.json();
            console.log(result);
            if (response.ok) {
                addNotification("success", "Login successful!");
                router.push("/admin");
            } else {
                addNotification("error", result.message || "Login failed. Please try again.");
            }
        } catch (error) {
            console.error("An error occurred:", error);
            addNotification("error", "An error occurred. Please try again.");
        }
    };
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            {/* Animated background elements */}
            <motion.div
                className="absolute top-20 left-20 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
                animate={{
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            <motion.div
                className="absolute bottom-20 right-20 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
                animate={{
                    x: [0, -100, 0],
                    y: [0, 50, 0],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            <motion.div
                className="absolute top-1/2 left-1/2 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
                animate={{
                    x: [-100, 100, -100],
                    y: [-50, 50, -50],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Login Form Container */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-md px-4"
            >
                <motion.form
                    onSubmit={handleSubmit}
                    className="bg-white/80 backdrop-blur-lg p-10 rounded-3xl shadow-2xl border border-white/20"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    {/* Header with Icon */}
                    <motion.div
                        className="flex flex-col items-center mb-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <motion.div
                            className="bg-linear-to-br from-orange-400 to-amber-500 p-4 rounded-2xl mb-4 shadow-lg"
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <Shield className="w-8 h-8 text-white" />
                        </motion.div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-1">Welcome Back</h2>
                        <p className="text-gray-600 text-sm">Please sign in to continue</p>
                    </motion.div>

                    {/* Email Input */}
                    <motion.div
                        className="mb-6"
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                id="email"
                                name="email"
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all duration-300"
                                placeholder="john.doe@example.com"
                                required
                            />
                        </div>
                    </motion.div>

                    {/* Password Input */}
                    <motion.div
                        className="mb-8"
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                id="password"
                                name="password"
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all duration-300"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div
                        className="flex items-center justify-between"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7 }}
                    >
                        <motion.div
                            className="w-full"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                type="submit"
                                onClick={() => setLoading(true)}
                                variant="secondary"
                                className="w-full"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <span>Signing in</span>
                                        <LoaderCircle className="animate-spin w-5 h-5" />
                                    </div>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                        </motion.div>
                    </motion.div>
                </motion.form>

                {/* Decorative Footer */}
                <motion.div
                    className="text-center mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    <p className="text-sm text-gray-600">
                        Secured with enterprise-grade encryption
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}