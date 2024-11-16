import React from 'react'
import { LoaderCircle } from 'lucide-react';

const Loader = () => {
    return (
        <LoaderCircle size={20} strokeWidth={1.25} className='animate-spin' />
    )
}

export default Loader