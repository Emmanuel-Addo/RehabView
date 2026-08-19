"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
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
        <div className="flex min-h-screen w-full bg-white text-gray-900">
            {/* Left Side Image */}
            <div className="w-1/2 hidden md:block relative">
                <img 
                    className="w-full h-full object-cover absolute inset-0" 
                    src="https://images.unsplash.com/photo-1736258329532-be8e1684f2e2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8R0lTfGVufDB8fDB8fHww" 
                    alt="GIS Vegetation Analysis" 
                />
            </div>
        
            {/* Right Side Content Form */}
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-white px-6">
                <form className="md:w-96 w-80 flex flex-col items-center justify-center" onSubmit={handleSubmit}>
                    <h2 className="text-4xl text-gray-900 font-bold tracking-tight">
                        Login
                    </h2>
                    <p className="text-sm text-gray-500 mt-3 text-center">
                        Welcome back! Please login to continue.
                    </p>

                    {errorMsg && (
                        <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg p-3 w-full mt-4 text-center">
                            {errorMsg}
                        </p>
                    )}

                    {/* Email Field */}
                    <div className="mt-8 flex items-center w-full bg-transparent border border-gray-300 h-12 rounded-full overflow-hidden pl-6 gap-2 focus-within:border-black transition-colors">
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
                    <div className="flex items-center mt-6 w-full bg-transparent border border-gray-300 h-12 rounded-full overflow-hidden pl-6 gap-2 focus-within:border-black transition-colors">
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
        
                    {/* Extra Field Options */}
                    <div className="w-full flex items-center justify-between mt-6 text-gray-500">
                        <div className="flex items-center gap-2">
                            <input className="h-4 w-4 cursor-pointer" type="checkbox" id="checkbox" />
                            <label className="text-sm cursor-pointer select-none" htmlFor="checkbox">Remember me</label>
                        </div>
                        <a className="text-sm hover:underline" href="#">Forgot password?</a>
                    </div>
        
                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="mt-8 w-full h-11 rounded-full text-white bg-black hover:bg-neutral-800 transition-colors font-medium cursor-pointer"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                    {/* Link to Signup */}
                    <p className="text-gray-500 text-sm mt-6">
                        Don’t have an account?{" "}
                        <Link href="/signup" className="text-black hover:underline font-semibold">
                            Sign up
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
