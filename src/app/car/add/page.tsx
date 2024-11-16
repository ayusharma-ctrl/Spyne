"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
import Image from "next/image"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import Container from "@/components/common/Container"
import { useState } from "react"
import Loader from "@/components/common/Loader"
import Link from "next/link"

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
    images: z.array(z.object({
        file: z.any(),
        preview: z.string(),
    })).optional(),
});

const AddCar = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const form = useForm<z.infer<typeof formSchema>>({
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

    // method to handle image upload
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (files && files.length > 0) {
            const file = files[files.length - 1]

            if (file.size > maxFileSize) return toast.error("Image exceeds the 5MB Limit");

            if (!allowedFileTypes.includes(file.type)) return toast.error("Invalid file type. Please upload a JPG, PNG, or WebP image.")

            const recentUploadedFile = {
                file,
                preview: URL.createObjectURL(file),
            }

            const restFiles = form.getValues().images || []

            form.setValue('images', [...restFiles, recentUploadedFile])
        }
    }

    // method to remove an image
    const removeImage = (index: number) => {
        const files = form.getValues().images || []
        form.setValue('images', files.filter((_, i) => i !== index))
    }

    // method to handle form submit
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);

        const formData = new FormData();

        Object.entries(values).forEach(([key, value]) => {
            if (key !== 'images') {
                formData.append(key, value as string)
            }
        });

        // add images to formData
        values.images?.forEach((image, index) => {
            formData.append(`image-${index}`, image.file)
        });

        try {
            const response = await fetch('/api/cars/add', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-API-Key': process.env.NEXT_PUBLIC_X_API_KEY!,
                },
                credentials: 'include',
            });

            if (response.ok) {
                toast.success('Successfully added a new Car!')
                form.reset();
                // Reset form or redirect user
            } else {
                toast.error('Failed to add car');
            }
        } catch (error) {
            toast.error(`Error: ${error}`);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Container>
            <div className="w-full mb-8">
                <BreadcrumbWithCustomSeparator />
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 flex flex-col w-full max-w-xl">

                    <h1 className="text-2xl lg:text-4xl font-medium">Add New Post</h1>

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
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Select engine type"  {...field} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="petrol">Petrol</SelectItem>
                                                <SelectItem value="diesel">Diesel</SelectItem>
                                                <SelectItem value="electric">Electric</SelectItem>
                                                <SelectItem value="hybrid">Hybrid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
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
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Select segment"  {...field} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sedan">Sedan</SelectItem>
                                                <SelectItem value="suv">SUV</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
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
                        render={({ }) => (
                            <FormItem>
                                <FormLabel className="font-medium text-base">Images</FormLabel>
                                <FormControl>
                                    <Input
                                        type="file"
                                        accept="image/jpeg, image/png, image/webp"
                                        multiple
                                        onChange={handleImageUpload}
                                        disabled={
                                            (form?.getValues()?.images ?? []).length >= 10
                                        }
                                        className="cursor-pointer"
                                    />
                                </FormControl>
                                <FormDescription>
                                    Upload up to 10 images (max 5MB each, .jpg, .png, or .webp)
                                </FormDescription>
                                <FormMessage />
                                <div className="grid grid-cols-2 gap-4">
                                    {(form?.getValues()?.images ?? []).map((image, index) => (
                                        <div key={index} className="flex justify-start items-center gap-2 p-2">
                                            <Image
                                                src={image.preview}
                                                alt={`Preview image number ${index + 1}`}
                                                width={100}
                                                height={100}
                                                className="object-cover rounded-lg"
                                            />
                                            <Button
                                                type="button"
                                                variant={'ghost'}
                                                onClick={() => removeImage(index)}
                                            >
                                                <Trash2 size={16} strokeWidth={1} className="text-red-500" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={isLoading}>{isLoading ? <Loader /> : 'Add'}</Button>
                </form>
            </Form>
        </Container>
    )
}

export default AddCar

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
                    <BreadcrumbPage>Add Car</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    )
}
