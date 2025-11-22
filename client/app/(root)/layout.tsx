import React from 'react'
import Header from './_components/Header/Header'
import Footer from './_components/Footer/Footer';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className="flex-1">
            <Header />
            <div className="container mx-auto pb-10">
                {children}
            </div>
            <Footer />
        </main>
    )
}
