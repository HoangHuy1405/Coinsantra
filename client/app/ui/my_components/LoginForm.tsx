"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../shadcn/form";
import { Input, PasswordInput } from "../shadcn/input";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../shadcn/button";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/authService";

export const loginSchema = z.object({
  email: z.email({ error: "Invalid email" }),
  password: z.string().trim().min(1, { message: "Required password" }),
});

export default function LoginForm() {
  const router = useRouter();

  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    const { email, password } = values;

    try {
      // Call backend login directly from browser
      const res = await AuthService.login({ email, password });

      if (res.statusCode !== 200 || !res.data) {
        toast.error(res.message ?? "Invalid credentials");
        return;
      }

      // browser will store refresh_token cookie automatically
      // Tell NextAuth to store accessToken + user data in session
      // persist data
      await signIn("credentials", {
        redirect: false,
        callbackUrl: "/", // where to redirect after login
        accessToken: res.data.accessToken,
        user: JSON.stringify(res.data.user), // send user object as string
      });

      router.push("/");
      toast.success("Logged in successfully");
    } catch (error: any) {
      console.error("Login failed:", error);
      if (error.status === 401) {
        toast.error("Invalid username or password");
      } else {
        toast.error("Failed to login. Please try again.");
      }
    }
  };

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { isSubmitting } = form.formState;
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="you@example.com"
                  type="email"
                  {...field}
                ></Input>
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
                <PasswordInput
                  placeholder="••••••••"
                  {...field}
                ></PasswordInput>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full cursor-pointer"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Login"}
        </Button>
      </form>
    </Form>
  );
}
