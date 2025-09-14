'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../shadcn/card'
import LogginForm, { loginSchema } from './LoginForm'
import RegisterForm, { registerSchema } from './RegisterForm'
import z from 'zod'
import { Separator } from '../shadcn/separator'
import { motion, AnimatePresence } from "framer-motion"
import { GithubButton, GoogleButton } from './OAuth2Button'

type mode = "login" | "register"

export default function LoginCard() {
    const [mode, setMode] = useState<mode>("login")

    const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {

    }

    const onRegisterSubmit = (values: z.infer<typeof registerSchema>) => {

    }
    return (
        <Card className="w-full max-w-sm">
            <AnimatePresence mode="wait">
                <motion.div
                    key={mode}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    layout
                >
                    <CardHeader className="pb-4">
                        <CardTitle className="text-center text-2xl font-bold">
                            {mode === "login" ? "Welcome Back" : "Create Account"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {mode === "login" ? (
                            <LogginForm onSubmit={onLoginSubmit} />
                        ) : (
                            <RegisterForm onSubmit={onRegisterSubmit} />
                        )}

                        <p className="text-center text-sm text-gray-500 mt-4">
                            {mode === "login" ? (
                                <>
                                    Don’t have an account?{" "}
                                    <span
                                        onClick={() => setMode("register")}
                                        className="text-black hover:underline cursor-pointer"
                                    >
                                        Sign up
                                    </span>
                                </>
                            ) : (
                                <>
                                    Already have an account?{" "}
                                    <span
                                        onClick={() => setMode("login")}
                                        className="text-black hover:underline cursor-pointer"
                                    >
                                        Login
                                    </span>
                                </>
                            )}
                        </p>
                        <div className="my-4 flex items-center">
                            <Separator className="flex-1 border-t" />
                            <span className="px-2 bg-card text-sm text-muted-foreground">
                                or continue with
                            </span>
                            <Separator className="flex-1 border-t border-dashed" />
                        </div>


                        <div className="flex justify-center gap-4 mt-3">
                            <GoogleButton onClick={() => { }} />
                            <GithubButton onClick={() => { }} />
                        </div>
                    </CardContent>
                </motion.div >
            </AnimatePresence >
        </Card>
    )
}
