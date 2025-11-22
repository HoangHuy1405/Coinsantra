"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/shadcn/card";
import LoginForm from "./LoginForm";
import { Separator } from "../../../ui/shadcn/separator";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { GoogleButton, GithubButton } from "./OAuth2Button";


export default function LoginCard() {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      await signIn("google", { redirect: false, callbackUrl: "/" });
      router.push("/");
      toast.success("Logged in successfully");
    } catch (error: any) {
      console.error("Login failed:", error);
      toast.error("Failed to login. Please try again.");
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          layout
        >
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-2xl font-bold">
              Welcome Back
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LoginForm />

            <p className="text-center text-sm text-muted-foreground mt-4">
              Don’t have an account?{" "}
              <Link
                href="/register"
                className="text-foreground hover:underline"
              >
                Sign up
              </Link>
            </p>
            <div className="my-4 flex items-center">
              <Separator className="flex-1 border-t" />
              <span className="px-2 bg-card text-sm text-muted-foreground">
                or continue with
              </span>
              <Separator className="flex-1 border-t border-dashed" />
            </div>

            <div className="flex justify-center gap-4 mt-3">
              <GoogleButton onClick={handleGoogleLogin} />
              <GithubButton onClick={() => { }} />
            </div>
          </CardContent>
        </motion.div>
      </AnimatePresence>
    </Card>
  );
}
