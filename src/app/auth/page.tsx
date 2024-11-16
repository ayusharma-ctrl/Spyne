import SigninForm from '@/components/SigninForm'
import SignupForm from '@/components/SignupForm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import React from 'react'

const Auth = () => {
    return (
        <main className="flex flex-col items-center justify-start gap-8 p-12 min-h-screen bg-gray-200">
            <h1 className="text-3xl font-bold">Taskify</h1>
            <Tabs defaultValue="signin" className="w-full max-w-2xl">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="signin">
                    <SigninForm />
                </TabsContent>
                <TabsContent value="signup">
                    <SignupForm />
                </TabsContent>
            </Tabs>
        </main>
    )
}

export default Auth