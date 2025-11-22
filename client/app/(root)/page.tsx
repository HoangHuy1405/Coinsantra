import React from 'react'
import FAQs from './_components/FAQs/FAQs'
import Hero from './_components/Hero/Hero'
import Pricing from '../ui/my_components/Pricing'

export default function page() {
    return (
        <div>
            <Hero />
            <Pricing />
            <FAQs />
        </div>
    )
}
