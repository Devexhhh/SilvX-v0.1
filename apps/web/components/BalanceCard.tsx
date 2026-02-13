"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";

export default function BalanceCard({
    userId,
    refreshSignal,
}: {
    userId: string;
    refreshSignal: number;
}) {
    const [balance, setBalance] = useState<any>(null);

    async function load() {
        const data = await apiGet(`/balances/${userId}`);
        setBalance(data);
    }

    useEffect(() => {
        load();
    }, [refreshSignal]);

    if (!balance) return <div>Loading balances...</div>;

    return (
        <div style={{ border: "1px solid #ccc", padding: 16 }}>
            <h3>Balances</h3>
            <p>INR: ₹{balance.inr}</p>
            <p>Silver: {balance.silver} g</p>
        </div>
    );
}
