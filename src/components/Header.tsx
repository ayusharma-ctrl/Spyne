import Link from 'next/link';
import { CarIcon } from 'lucide-react';
import LoginButton from './LoginButton';

const Header = () => {

    return (
        <header className="w-full px-6 lg:px-8 h-24 flex items-center z-50 fixed bg-white text-black">
            <section className='flex justify-between items-center gap-4 w-full'>
                <Link className="flex items-center justify-center gap-2" href="/">
                    <CarIcon className="h-8 w-8 xl:h-12 xl:w-12 spin-in-180 animate-in duration-1000" strokeWidth={1} />
                    <span className="text-lg xl:text-3xl font-medium animate-in slide-in-from-right-32 duration-1000">Spyne</span>
                </Link>
                <LoginButton />
            </section>
        </header>
    )
}

export default Header;