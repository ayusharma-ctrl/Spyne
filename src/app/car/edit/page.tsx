"use client";
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { Trash2, Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { allowedFileTypes, maxFileSize, validEngines, validSegments } from "@/lib/utils"
import Container from "@/components/common/Container"
import Loader from "@/components/common/Loader"
import { useStore } from '@/store/index'
import Link from 'next/link';

const formSchema = z.object({
    title: z.string().min(2, {
        message: "Title must be at least 2 characters.",
    }),
    description: z.string().min(100, {
        message: "Description must be at least 100 characters.",
    }),
    company: z.string().min(2, {
        message: "Company name must be at least 2 characters.",
    }),
    engine: z.enum(validEngines, {
        message: "Engine type is required.",
    }),
    segment: z.enum(validSegments, {
        message: "Segment type is required.",
    }),
    dealer: z.string(),
    images: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>

const EditCar = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [newImages, setNewImages] = useState<File[]>([]);
    const router = useRouter();

    // access states from the store
    const { selectedCar, setSelectedCar, userId } = useStore();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            company: "",
            dealer: "",
            images: [],
            segment: undefined,
            engine: undefined,
        },
    });

    // fill form fields from saved data
    useEffect(() => {
        if (selectedCar) {
            form.reset({
                title: selectedCar.title,
                description: selectedCar.description,
                company: selectedCar.company,
                engine: selectedCar.engine,
                segment: selectedCar.segment,
                dealer: selectedCar.dealer,
                images: selectedCar.images,
            })
        }
    }, [selectedCar, form]);

    // method to handle image upload
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (files) {
            const validFiles = Array.from(files).filter(file => {
                if (file.size > maxFileSize) {
                    toast.error(`${file.name} exceeds the 5MB limit`)
                    return false
                }
                if (!allowedFileTypes.includes(file.type)) {
                    toast.error(`${file.name} is not a valid file type`)
                    return false
                }
                return true
            })

            setNewImages(prevImages => [...prevImages, ...validFiles])
        }
    }

    // method to remove an image
    const removeImage = (index: number, isNewImage: boolean) => {
        if (isNewImage) {
            setNewImages(prevImages => prevImages.filter((_, i) => i !== index))
        } else {
            const currentImages = form.getValues().images
            form.setValue('images', currentImages?.filter((_, i) => i !== index))
        }
    }

    // method to handle form submit
    const onSubmit = async (values: FormData) => {
        if (!selectedCar) return toast.error('No car selected for update');

        setIsLoading(true);
        const formData = new FormData();

        // read values from form
        Object.entries(values).forEach(([key, value]) => {
            if (key !== 'images') {
                formData.append(key, value as string)
            }
        });

        // add existing images
        values.images?.forEach((image, index) => {
            formData.append(`existing-image-${index}`, image)
        });

        // add newly added images
        newImages.forEach((file, index) => {
            formData.append(`new-image-${index}`, file)
        });

        try {
            const response = await fetch(`/api/cars/${selectedCar.id}`, {
                method: 'PUT',
                body: formData,
                headers: {
                    'X-API-Key': process.env.NEXT_PUBLIC_X_API_KEY!,
                },
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Failed to update car');

            // const updatedCar = await response.json();
            setSelectedCar(null);
            toast.success('Car updated successfully');
            router.push(`/car`);
        } catch (error) {
            toast.error('Failed to update car')
            console.error(error);
        } finally {
            setIsLoading(false)
        }
    }

    // handle if user try to update someone else post
    useEffect(() => {
        if (selectedCar?.userId !== userId) return router.push('/');
    }, [selectedCar, userId]);

    if (!selectedCar) {
        return <Container><div>No car selected for update</div></Container>
    }

    return (
        <Container>
            <div className="w-full mb-8">
                <BreadcrumbWithCustomSeparator />
            </div>
            
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 flex flex-col w-full max-w-xl">
                    <h1 className="text-2xl lg:text-4xl font-medium">Update Car</h1>

                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-medium text-base">Title*</FormLabel>
                                <FormControl>
                                    <Input placeholder="Car Title" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-medium text-base">Company*</FormLabel>
                                <FormControl>
                                    <Input placeholder="Manufacturer name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-medium text-base">Description*</FormLabel>
                                <FormControl>
                                    <Textarea rows={5} placeholder="Describe your car..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex flex-col space-y-8 md:flex-row md:justify-between md:space-y-0">
                        <FormField
                            control={form.control}
                            name="engine"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-medium text-base">Engine*</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Select engine type" {...field} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {validEngines.map((engine) => (
                                                <SelectItem key={engine} value={engine}>
                                                    {engine.charAt(0).toUpperCase() + engine.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="segment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-medium text-base">Segment*</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Select segment" {...field} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {validSegments.map((segment) => (
                                                <SelectItem key={segment} value={segment}>
                                                    {segment.charAt(0).toUpperCase() + segment.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="dealer"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-medium text-base">Dealer</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormDescription>
                                    Name of the dealership where this car is available for test drive.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="images"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-medium text-base">Images*</FormLabel>
                                <FormControl>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            {field.value?.map((image, index) => (
                                                <div key={index} className="relative">
                                                    <Image
                                                        src={image}
                                                        alt={`Car image ${index + 1}`}
                                                        width={200}
                                                        height={200}
                                                        className="object-cover rounded-lg"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute top-2 right-2"
                                                        onClick={() => removeImage(index, false)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            {newImages.map((file, index) => (
                                                <div key={`new-${index}`} className="relative">
                                                    <Image
                                                        src={URL.createObjectURL(file)}
                                                        alt={`New car image ${index + 1}`}
                                                        width={200}
                                                        height={200}
                                                        className="object-cover rounded-lg"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute top-2 right-2"
                                                        onClick={() => removeImage(index, true)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center">
                                            <Input
                                                type="file"
                                                accept="image/jpeg, image/png, image/webp"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                id="image-upload"
                                                multiple
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => document.getElementById('image-upload')?.click()}
                                            >
                                                <Plus className="mr-2 h-4 w-4" /> Add Images
                                            </Button>
                                        </div>
                                    </div>
                                </FormControl>
                                <FormDescription>
                                    Upload up to 10 images (max 5MB each, .jpg, .png, or .webp)
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? <Loader /> : 'Update Car'}
                    </Button>
                </form>
            </Form>
        </Container>
    )
}

export default EditCar


function BreadcrumbWithCustomSeparator() {
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
                    <BreadcrumbPage>Edit Car Details</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    )
}
