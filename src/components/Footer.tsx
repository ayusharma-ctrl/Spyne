import React from 'react';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="flex flex-col gap-2 sm:flex-row py-6 items-center h-24 px-4 md:px-6 lg:px-8 border-t bg-gray-800 text-white text-xs lg:text-sm">
            <div className="text-gray-400 hover:text-gray-200 transition-colors">
                <p>© 2024 Spyne<span className='text-2xl font-bold text-red-500'>.</span>ai</p>
                <p>All rights reserved.</p>
            </div>
            <nav className="sm:ml-auto flex gap-4 sm:gap-6">
                <Link className="hover:underline underline-offset-4" href="/">
                    Terms of Service
                </Link>
                <Link className="hover:underline underline-offset-4" href="/">
                    Privacy
                </Link>
            </nav>
        </footer>
    )
}

export default Footer;