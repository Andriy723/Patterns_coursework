'use client';

import { useRouter } from 'next/navigation';
import {Navigation} from "@/components/Navigation.tsx";
import {ProductForm} from "@/components/ProductForm.tsx";

export default function CreateProductPage() {
    const router = useRouter();

    return (
        <>
            <Navigation />
            <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '20px' }}>
                <h1>➕ Додати новий товар</h1>
                <ProductForm onSuccess={() => router.push('/products')} />
            </main>
        </>
    );
}