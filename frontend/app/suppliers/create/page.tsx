'use client';

import { useRouter } from 'next/navigation';
import {Navigation} from "@/components/Navigation.tsx";
import {SupplierForm} from "@/components/SupplierForm.tsx";

export default function CreateSupplierPage() {
    const router = useRouter();

    return (
        <>
            <Navigation />
            <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '20px' }}>
                <h1>➕ Додати постачальника</h1>
                <SupplierForm onSuccess={() => router.push('/suppliers')} />
            </main>
        </>
    );
}