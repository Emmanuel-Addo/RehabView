const Footer = () => {
    return (
        <>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap');
                    *{ font-family: "Geist", sans-serif; }
                `}
            </style>

            <footer className='flex flex-col justify-end bg-black pt-20 px-4 sm:px-6 lg:px-8 overflow-hidden w-full'>
                <div className='w-full max-w-7xl mx-auto'>
                    <div className="flex flex-wrap justify-between gap-y-12 lg:gap-x-8">

                        <div className="w-full md:w-[45%] lg:w-[35%] flex flex-col items-start text-left">
                            <span className="text-2xl font-extrabold tracking-tight text-white">
                                RehabPulse
                            </span>
                            <div className='w-full max-w-52 h-0.5 mt-8 bg-linear-to-r from-[#24212D] to-[#24212D]/0'></div>
                            <p className='text-sm text-white/60 mt-6 max-w-[350px] leading-relaxed'>RehabPulse is a satellite-powered vegetation health monitoring platform tracking NDVI trends and land cover changes across Ghana.</p>
                        </div>

                        <div className="w-[45%] md:w-[45%] lg:w-[15%] flex flex-col items-start text-left">
                            <h3 className='text-sm text-white font-medium'>Important Links</h3>
                            <div className="flex flex-col gap-2 mt-6">
                                <a href="/" className='text-sm text-white/60 hover:text-white transition-colors'>Home</a>
                                <a href="/dashboard" className='text-sm text-white/60 hover:text-white transition-colors'>Dashboard</a>
                                <a href="/signup" className='text-sm text-white/60 hover:text-white transition-colors'>Sign up</a>
                                <a href="/login" className='text-sm text-white/60 hover:text-white transition-colors'>Login</a>
                            </div>
                        </div>

                        <div className="w-[45%] md:w-[45%] lg:w-[15%] flex flex-col items-start text-left">
                            <h3 className='text-sm text-white font-medium'>Social Links</h3>
                            <div className="flex flex-col gap-2 mt-6">
                                <a href="https://github.com/Emmanuel-Addo/RehabView" target="_blank" rel="noopener noreferrer" className='text-sm text-white/60 hover:text-white transition-colors'>GitHub</a>
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className='text-sm text-white/60 hover:text-white transition-colors'>Twitter</a>
                                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className='text-sm text-white/60 hover:text-white transition-colors'>LinkedIn</a>
                            </div>
                        </div>

                        <div className="w-full md:w-[45%] lg:w-[25%] flex flex-col items-start text-left mt-4 md:mt-0">
                            <h3 className='text-sm text-white font-medium'>Subscribe for news</h3>
                            <div className="flex items-center border gap-2 border-white/20 h-13 max-w-80 w-full rounded-full overflow-hidden mt-4">
                                <input type="email" placeholder="Enter your email.." className="w-full h-full pl-6 outline-none text-sm bg-transparent text-white placeholder-white/60 placeholder:text-xs" required />
                                <button type="submit" className="bg-white hover:opacity-80 active:scale-95 transition w-56 h-10 rounded-full text-sm text-black cursor-pointer mr-1.5 focus:outline-none border border-white/20">Subscribe</button>
                            </div>
                        </div>

                    </div>

                    <div className='w-full h-0.5 mt-16 mb-4 bg-linear-to-r from-[#24212D]/0 via-[#24212D] to-[#24212D]/0'></div>

                    <div className="flex flex-wrap sm:flex-row items-center justify-between gap-y-4 gap-x-2 relative z-10">
                        <p className='text-xs text-white/60'>© 2026 RehabPulse</p>
                        <div className="flex items-center gap-6 text-right">
                            <a href="https://github.com/Emmanuel-Addo/RehabView" target="_blank" rel="noopener noreferrer" className='text-xs text-white/60 hover:text-white transition-colors'>GitHub</a>
                        </div>
                    </div>

                    <div className="w-full flex justify-center mt-6 md:mt-12 md:mb-[-0.5%]">
                        <h1 className="text-center font-extrabold tracking-tighter leading-[0.70] text-zinc-900 text-[clamp(4.5rem,19.5vw,25rem)] pointer-events-none select-none">
                            RehabPulse
                        </h1>
                    </div>
                </div>
            </footer>
        </>
    )
}

export default Footer