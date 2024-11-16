"use client"
import React from 'react'
import Container from '@/components/common/Container'
import { Input } from '@/components/ui/input';
import { Ellipsis, SearchIcon } from 'lucide-react';
import { toast } from 'sonner';
import { ICarResult } from '@/lib/types';
import { useIntersectionObserver } from '@/hooks/useIntersection';
import CarCard from '@/components/common/CarCard';

const Cars = () => {
    const [searchQuery, setSearchQuery] = React.useState<string>('');
    const [page, setPage] = React.useState<number>(1);
    const limit = 2;
    const [isFetching, setIsFetching] = React.useState<boolean>(false);
    const [carsData, setCarsData] = React.useState<ICarResult>({
        cars: [],
        currentPage: 0,
        totalPages: 1,
        totalCount: 0
    });

    const infiniteScrollDivRef = React.useRef<HTMLDivElement>(null);
    const isIntersecting = useIntersectionObserver(infiniteScrollDivRef);

    // method to handle input change
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
        setPage(1);
        setCarsData({ cars: [], currentPage: 0, totalPages: 1, totalCount: 0 });
    }

    // method to fetch all the cars
    const fetchAllCars = async () => {
        if (page > carsData.totalPages) return;

        try {
            const response = await fetch(`/api/cars/all?page=${page}&limit=${limit}&q=${searchQuery}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': process.env.NEXT_PUBLIC_X_API_KEY!,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch data from server');

            const data = await response.json();

            setCarsData(prevData => ({
                cars: [...prevData.cars, ...data.result.cars],
                currentPage: data.result.currentPage,
                totalCount: data.result.totalCount,
                totalPages: data.result.totalPages,
            }));

            setPage(prevPage => prevPage + 1);
        } catch (error) {
            toast.error(`Failed to fetch data from server!`);
            console.error(error);
        } finally {
            setIsFetching(false);
        }
    };

    // handle debounce on input field
    React.useEffect(() => {
        if (searchQuery) setIsFetching(true)
        const timeoutId = setTimeout(() => {
            if (searchQuery) fetchAllCars();
        }, 2000);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    React.useEffect(() => {
        if (isIntersecting && !isFetching && page <= carsData.totalPages) {
            setIsFetching(true);
            fetchAllCars();
        }
    }, [isIntersecting, isFetching, page, carsData.totalPages]);

    return (
        <Container>
            <main className='w-full flex flex-col items-center space-y-8 flex-1'>
                <div className='w-full max-w-3xl flex justify-start items-center gap-0 mt-4'>
                    <Input
                        type='text'
                        placeholder='Search'
                        value={searchQuery}
                        onChange={handleInputChange}
                    />
                    <SearchIcon className='relative right-8' />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-8 w-full flex-1'>
                    {
                        (!isFetching && carsData.cars?.length === 0) ? <p>No data found!</p> : (
                            carsData.cars.map((item) => <CarCard key={item.id} car={item} />)
                        )
                    }

                </div>

                {isFetching && <Ellipsis className='animate-bounce' size={48} />}

                <div ref={infiniteScrollDivRef} />

            </main>
        </Container>
    )
}

export default Cars