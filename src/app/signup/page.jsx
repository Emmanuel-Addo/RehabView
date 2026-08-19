"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function Signup() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(false);

    // Password validation flags
    const hasMinLength = password.length >= 8;
    const hasNumber = /[0-9]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    const isPasswordStrong = hasMinLength && hasNumber && hasUpper && hasLower && hasSpecial;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isPasswordStrong) {
            setErrorMsg("Please choose a stronger password matching all the criteria below.");
            return;
        }

        setErrorMsg("");
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName
                    }
                }
            });

            if (error) {
                setErrorMsg(error.message);
            } else {
                router.push("/dashboard");
            }
        } catch (err) {
            setErrorMsg("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full bg-white flex items-center justify-center text-gray-900">

            {/* Back Button */}
            <Link
                href="/"
                className="absolute top-6 left-6 flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors group"
            >
                <svg
                    className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                >
                    <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                <span>Back</span>
            </Link>

            {/* Centered Form */}
            <form className="w-full max-w-sm flex flex-col items-center px-6" onSubmit={handleSubmit}>
                <h2 className="text-4xl text-gray-900 font-bold tracking-tight">Sign up</h2>
                <p className="text-sm text-gray-500 mt-3 text-center">
                    Register to start monitoring vegetation health.
                </p>

                {errorMsg && (
                    <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg p-3 w-full mt-4 text-center">
                        {errorMsg}
                    </p>
                )}

                {/* Name Field */}
                <div className="flex items-center mt-6 w-full bg-transparent border border-gray-300 h-12 rounded-full overflow-hidden pl-6 gap-2 focus-within:border-black transition-colors">
                    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 8c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#6B7280"/>
                    </svg>
                    <input 
                        type="text" 
                        placeholder="Full Name" 
                        className="bg-transparent text-gray-800 placeholder-gray-400 outline-none text-sm w-full h-full" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required 
                        disabled={loading}
                    />                
                </div>

                {/* Email Field */}
                <div className="mt-4 flex items-center w-full bg-transparent border border-gray-300 h-12 rounded-full overflow-hidden pl-6 gap-2 focus-within:border-black transition-colors">
                    <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z" fill="#6B7280"/>
                    </svg>
                    <input 
                        type="email" 
                        placeholder="Email id" 
                        className="bg-transparent text-gray-800 placeholder-gray-400 outline-none text-sm w-full h-full" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                        disabled={loading}
                    />                
                </div>

                {/* Password Field */}
                <div className="flex items-center mt-4 w-full bg-transparent border border-gray-300 h-12 rounded-full overflow-hidden pl-6 gap-2 focus-within:border-black transition-colors">
                    <svg width="13" height="17" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="#6B7280"/>
                    </svg>
                    <input 
                        type="password" 
                        placeholder="Password" 
                        className="bg-transparent text-gray-800 placeholder-gray-400 outline-none text-sm w-full h-full" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                        disabled={loading}
                    />
                </div>

                {/* Password Strength Indicators */}
                {password && (
                    <div className="w-full mt-3 px-2 flex flex-col gap-1 text-xs">
                        <p className="text-gray-500 font-medium mb-1">Password requirements:</p>
                        <div className="flex items-center gap-1.5">
                            <span className={hasMinLength ? "text-green-600" : "text-gray-400"}>✓</span>
                            <span className={hasMinLength ? "text-green-600" : "text-gray-400"}>At least 8 characters</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className={hasUpper ? "text-green-600" : "text-gray-400"}>✓</span>
                            <span className={hasUpper ? "text-green-600" : "text-gray-400"}>At least one uppercase letter (A-Z)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className={hasLower ? "text-green-600" : "text-gray-400"}>✓</span>
                            <span className={hasLower ? "text-green-600" : "text-gray-400"}>At least one lowercase letter (a-z)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className={hasNumber ? "text-green-600" : "text-gray-400"}>✓</span>
                            <span className={hasNumber ? "text-green-600" : "text-gray-400"}>At least one number (0-9)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className={hasSpecial ? "text-green-600" : "text-gray-400"}>✓</span>
                            <span className={hasSpecial ? "text-green-600" : "text-gray-400"}>At least one special character</span>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <button 
                    type="submit" 
                    disabled={loading || (password.length > 0 && !isPasswordStrong)}
                    className={`mt-6 w-full h-11 rounded-full text-white font-medium transition-colors ${
                        loading || (password.length > 0 && !isPasswordStrong)
                        ? "bg-gray-300 cursor-not-allowed text-gray-500" 
                        : "bg-black hover:bg-neutral-800 cursor-pointer"
                    }`}
                >
                    {loading ? "Creating account..." : "Sign up"}
                </button>

                {/* Link to Login */}
                <p className="text-gray-500 text-sm mt-6">
                    Already have an account?{" "}
                    <Link href="/login" className="text-black hover:underline font-semibold">
                        Login
                    </Link>
                </p>
            </form>
        </div>
    );
}