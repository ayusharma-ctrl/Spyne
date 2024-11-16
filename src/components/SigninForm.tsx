'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from 'sonner'
import { useStore } from '@/store'
// import { useRouter } from 'next/navigation'

const formSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(6, {
        message: "Password is required.",
    }),
});

const SigninForm = () => {
    // const router = useRouter()
    const [isLoading, setIsLoading] = useState(false);

    const setUserId = useStore((state) => state.setUserId);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': process.env.NEXT_PUBLIC_X_API_KEY!,
                },
                body: JSON.stringify(values),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Welcome back!');
                form.reset();
                setUserId(data?.userId);
                window.location.href = '/';
                // router.push('/')
            } else {
                toast.error(data?.error || 'Login failed');
            }
        } catch (error: unknown) {
            console.log(error);
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex justify-center items-center bg-gray-100">
            <div className="w-full max-w-2xl p-8 space-y-3 rounded-xl bg-white shadow-lg">
                <h1 className="text-2xl font-bold text-center">Login</h1>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="Enter your email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Enter your password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Logging in...' : 'Login'}
                        </Button>
                        
                    </form>
                </Form>
            </div>
        </div>
    )
}

export default SigninForm