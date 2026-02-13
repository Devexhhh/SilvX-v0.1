"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";

export default function TransactionHistory({ userId }: { userId: string }) {
    const [txs, setTxs] = useState<any[]>([]);

    useEffect(() => {
        async function load() {
            const data = await apiGet(`/transactions/${userId}`);
            setTxs(data);
        }
        load();
    }, [userId]);

    return (
        <div style={{ marginTop: 30 }}>
            <h3>Transaction History</h3>
            {txs.map(tx => (
                <div key={tx.id} style={{ borderBottom: "1px solid #ddd", padding: 8 }}>
                    <div>{tx.referenceType}</div>
                    <div>Asset: {tx.asset}</div>
                    <div>Amount: {tx.amount}</div>
                    <div>{new Date(tx.createdAt).toLocaleString()}</div>
                </div>
            ))}
        </div>
    );
}
