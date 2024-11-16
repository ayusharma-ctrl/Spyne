import React from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { ICar } from '@/lib/types'
import Image from 'next/image'
import { capitalizeFirstLetter, formatDate } from '@/lib/utils'
import { useStore } from '@/store'
import { Edit, Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface IProps {
    car: ICar
}

const CarCard: React.FC<IProps> = (props) => {
    const userId = useStore((state) => state.userId);
    const setSelectedCar = useStore((state) => state.setSelectedCar);
    const router = useRouter();

    const handleViewCarDetails = () => {
        try {
            setSelectedCar(props.car);
            router.push(`/car/${props.car.id}`);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <Card className='bg-stone-50 transition-opacity hover:opacity-90'>
            <CardHeader className='flex-row flex-wrap justify-between gap-2'>
                <div>
                    <CardTitle>{props.car.title}</CardTitle>
                    <CardDescription>{props.car.company}</CardDescription>
                </div>
                {
                    props.car.userId === userId && (
                        <div onClick={handleViewCarDetails} className='flex gap-4'>
                            <Edit size={18} className='text-blue-500 cursor-pointer' />
                            <Trash size={18} className='text-red-500 cursor-pointer' />
                        </div>
                    )
                }
            </CardHeader>
            <CardContent>
                {props.car.images[0]?.length &&
                    <Image loading='lazy' src={props.car.images[0]} alt={`${props.car.title}-car-image`} width={400} height={300} className='mx-auto rounded-lg w-full' />
                }
            </CardContent>
            <CardFooter className='flex flex-col flex-wrap items-end space-y-2 text-sm'>
                <p>{props.car.userId === userId ? 'Me' : capitalizeFirstLetter(props.car.User.username)}, <span className='italic text-xs font-bold'>{formatDate(props.car.createdAt)}</span></p>
                <p className='hover:underline underline-offset-4 font-bold text-red-500 cursor-pointer' onClick={handleViewCarDetails}>Check Details</p>
            </CardFooter>
        </Card>

    )
}

export default CarCard