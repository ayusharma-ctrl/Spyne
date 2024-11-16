import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();
    const clearUserId = useStore((state) => state.clearUserId);

    useEffect(() => {
        // method to verify the token
        const checkAuth = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/auth/verify', {
                    method: 'GET',
                    credentials: 'include', 
                });

                if (response.ok) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    // method to handle logout functionality
    const logout = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                clearUserId();
                setIsAuthenticated(false);
                router.push('/auth');
            }
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isAuthenticated,
        logout,
        isLoading,
    };
};