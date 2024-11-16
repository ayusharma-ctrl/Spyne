"use client"
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Button } from './ui/button';
import Loader from './common/Loader';

const LoginButton = () => {
    const { isAuthenticated, logout, isLoading } = useAuth();

    return (
        <div>
            {isAuthenticated ? (
                <Button onClick={logout} variant={'link'}>
                    {isLoading ? <Loader /> : "Sign Out"}
                </Button>
            ) : (
                <Link href={"/auth"}>
                    <Button variant={'link'}>
                        {isLoading ? <Loader /> : "Sign In"}
                    </Button>
                </Link>
            )}
        </div>
    );
};

export default LoginButton;