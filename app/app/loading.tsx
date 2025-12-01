import React from 'react'
import { Loader2 } from 'lucide-react'
export default function loading() {
  return (
    <div className='flex items-center justify-center h-screen bg-transparent'>
        <Loader2 className='w-8 h-8 animate-spin' />
    </div>
  )
}
