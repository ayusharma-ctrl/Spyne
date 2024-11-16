"use client";
import Container from '@/components/common/Container'
import { Button } from '@/components/ui/button';
import { capitalizeFirstLetter, formatDate } from '@/lib/utils';
import { useStore } from '@/store';
import React, { useState } from 'react'
import Link from "next/link"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import ImageCarousel from '@/components/common/ImageCarousel';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const DetailsPage = () => {
    const selectedCar = useStore((state) => state.selectedCar);
    const setSelectedCar = useStore((state) => state.setSelectedCar);
    const userId = useStore((state) => state.userId);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();

    // method to delete a post
    const handleDelete = async () => {
        if(userId !== selectedCar?.userId) return;
        setIsLoading(true);

        try {
            const response = await fetch(`/api/cars/${selectedCar.id}`, {
                method: 'DELETE',
                headers: {
                    'X-API-Key': process.env.NEXT_PUBLIC_X_API_KEY!,
                },
                credentials: 'include',
            })

            if(!response.ok) throw new Error('Failed to delete');

            setIsLoading(false);
            setSelectedCar(null);
            toast.success("Successfully deleted a post!");
            router.push('/');
        } catch (error) {
            toast.error(`Failed to delete: ${error}`);
            setIsLoading(false);
        }
    }

    return (
        <Container>
            <section className='w-full md:-mt-0 lg:-mt-8 xl:-mt-20'>
                <BreadcrumbWithCustomSeparator title={selectedCar?.title || ''} />
            </section>

            <section className='grid grid-cols-1 md:grid-cols-2 gap-8 px-4 py-6 w-full'>

                <div className='flex justify-center items-center'>
                    <ImageCarousel images={selectedCar?.images || []} />
                </div>

                <div className='flex flex-col flex-wrap items-start space-y-2'>
                    <p className='text-gray-400 font-bold'>{selectedCar?.company}</p>
                    <p className='text-2xl font-bold'>{selectedCar?.title}</p>
                    <p className='italic'>All new in {selectedCar?.segment} segment.</p>

                    <p className='pt-4'>Available in: <span className='text-blue-600 font-bold'>{selectedCar?.engine} variant</span></p>
                    <p className='pt-4'>Available at: <span className='text-red-600 font-bold'>{selectedCar?.dealer}</span></p>

                    <p className='pt-2 text-sm'>{selectedCar?.description}</p>

                    {
                        selectedCar && <p className='pt-2'> Shared By: {capitalizeFirstLetter(selectedCar.User.username)}, <span className='italic text-xs font-bold'>{formatDate(selectedCar.createdAt)}</span></p>
                    }

                    {
                        userId === selectedCar?.userId && (
                            <div className='flex flex-wrap justify-center items-center gap-2 py-4'>
                                <Button variant={'destructive'} disabled={isLoading} onClick={handleDelete}>{isLoading ? "Deleting..." : "Delete"}</Button>
                                <Link href={'/car/edit'}>
                                    <Button variant={'outline'}>Edit</Button>
                                </Link>
                            </div>
                        )
                    }

                </div>

            </section>
        </Container>
    )
}

export default DetailsPage


function BreadcrumbWithCustomSeparator({ title }: { title: string }) {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/">Home</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/car">Cars</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>{title}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    )
}