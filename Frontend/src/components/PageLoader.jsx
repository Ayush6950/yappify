import React from 'react'
import { Loader } from 'lucide-react';

function PageLoader() {
  return (
    <div className='flex flex-col items-center justify-center h-screen bg-[#0a0e1a] relative overflow-hidden w-full'>
      {/* Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-violet-600/10 rounded-full blur-[120px] animate-pulse" />
      
      <div className="relative flex flex-col items-center z-10">
        {/* Animated Loading Spinner */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin-fast" />
          <Loader className="absolute w-6 h-6 text-indigo-400 animate-pulse" />
        </div>
        
        {/* Pulsing Brand Label */}
        <h2 className="text-3xl font-black bg-gradient-to-r from-indigo-400 via-violet-500 to-indigo-400 bg-clip-text text-transparent animate-pulse select-none tracking-wider">
          yappify
        </h2>
        <p className="text-slate-500 text-xs mt-2 select-none tracking-widest uppercase">
          Initializing Aurora
        </p>
      </div>
    </div>
  );
}

export default PageLoader;
