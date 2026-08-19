import Link from 'next/link';

export default function CallToAction() {
    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
            
                * {
                    font-family: 'Poppins', sans-serif;
                }
            `}</style>
            
            <div className="max-w-6xl mt-20 py-24 md:w-full mx-2 md:mx-auto flex flex-col items-center justify-center text-center bg-black border border-white/10 rounded-2xl p-10 text-white">
                <p className="px-6 py-2 rounded-full text-sm border border-neutral-800 bg-white text-black font-medium">
                    Get Started
                </p>
                <h1 className="text-4xl md:text-5xl md:leading-[60px] font-semibold max-w-2xl mt-5">
                    Ready to track vegetation health and NDVI changes?
                </h1>
                <p className="text-white/60 text-sm mt-4 max-w-md">
                    Access high-resolution historical satellite data and generate detailed reports for your region in Ghana.
                </p>
                <Link href="/signup" className="px-12 py-3 mt-8 rounded-full text-sm font-semibold bg-white text-black hover:bg-neutral-200 transition-all active:scale-95 inline-block">
                    Get Started
                </Link>
            </div>
        </>
    );
};