import React from 'react'

export default function Authlayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main >
            <div className="min-h-screen flex items-center justify-center">
                {children}
            </div>
        </main>
    )
}
