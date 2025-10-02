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
import { useSignUp } from "@/hooks/useSignUp";
import { useState } from "react";
import useActivateAcc from "@/hooks/useActivateAcc";

export const registerSchema = z
  .object({
    username: z.string().trim().min(1, { message: "Username is required" }),
    firstName: z.string().trim().min(1, { message: "First name is required" }),
    lastName: z.string().trim().min(1, { message: "Last name is required" }),
    email: z.email({ message: "Invalid email" }),
    phoneNum: z
      .string()
      .trim()
      .regex(/^\+?[0-9\s-]{7,15}$/, {
        message: "Invalid phone number format",
      }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirm: z.string().min(6, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

const verificationSchema = z.object({
  code: z.string().length(6, { message: "Code must be 6 digits" }),
});

export default function RegisterForm() {
  const registerMutation = useSignUp();
  const activate = useActivateAcc();
  const [step, setStep] = useState<"register" | "verify">("register");
  const [email, setEmail] = useState("");

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      phoneNum: "",
      password: "",
      confirm: "",
    },
  });
  const verifyForm = useForm<z.infer<typeof verificationSchema>>({
    resolver: zodResolver(verificationSchema),
    defaultValues: { code: "" },
  });
  const { isSubmitting } = form.formState;
  const { isSubmitting: isVerifying } = verifyForm.formState;

  const handleRegister = async (values: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(
      {
        username: values.username, // simple username fallback
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNum: values.phoneNum, // you can add phone field in schema if needed
      },
      {
        onSuccess: () => {
          setEmail(values.email);
          setStep("verify");
        },
      },
    );
  };

  const handleVerify = async (values: z.infer<typeof verificationSchema>) => {
    activate.mutate(values.code);
  };

  return (
    <>
      {step === "register" && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleRegister)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field}></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input placeholder="Paul" {...field}></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="abc" {...field}></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              name="phoneNum"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="xxxxxxxx" {...field}></Input>
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
            <FormField
              control={form.control}
              name="confirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
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
              {isSubmitting ? "Processing..." : "Register"}
            </Button>
          </form>
        </Form>
      )}
      {step === "verify" && (
        <Form {...verifyForm}>
          <form
            onSubmit={verifyForm.handleSubmit(handleVerify)}
            className="space-y-4"
          >
            <h2 className="text-lg font-semibold">
              Enter the 6-digit code sent to {email}
            </h2>
            <FormField
              control={verifyForm.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input placeholder="123456" maxLength={6} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={isVerifying}
            >
              {isVerifying ? "Verifying..." : "Verify Account"}
            </Button>
          </form>
        </Form>
      )}
    </>
  );
}
