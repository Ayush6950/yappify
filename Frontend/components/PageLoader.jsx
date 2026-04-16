import React from 'react'
import { Loader } from 'lucide-react';
function PageLoader() {
  return (
      <div className='flex items-center justify-center h-screen'>
        <Loader className='animate-spin text-4xl text-red-500' />
      </div>
  
  )
}

export default PageLoader;
