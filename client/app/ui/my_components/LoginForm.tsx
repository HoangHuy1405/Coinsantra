'use client';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../shadcn/form";
import { Input, PasswordInput } from "../shadcn/input";
import * as z from "zod";
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "../shadcn/button";

export const loginSchema = z.object({
    email: z.email({ error: "Invalid email" }),
    password: z.string().trim().min(1, { message: "Required password" })
})

export default function LogginForm({
    onSubmit
}: {
    onSubmit: (values: z.infer<typeof loginSchema>) => void
}) {
    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    })
    const { isSubmitting } = form.formState
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="you@example.com" type="email" {...field}></Input>
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
                                <PasswordInput placeholder="••••••••"{...field}></PasswordInput>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full cursor-pointer" disabled={isSubmitting}>
                    {isSubmitting ? "Processing..." : "Login"}
                </Button>
            </form>
        </Form >

    )
}