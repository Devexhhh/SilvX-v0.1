"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";

export default function TransactionHistory({ userId, refreshSignal }: { userId: string, refreshSignal: number }) {
    const [txs, setTxs] = useState<any[]>([]);

    useEffect(() => {
        async function load() {
            const data = await apiGet(`/transactions/${userId}`);
            setTxs(data);
        }
        load();
    }, [userId, refreshSignal]);

    return (
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-lg shadow-black/40">
            <h3 className="mb-5 text-lg font-semibold">Transaction History</h3>
            
            {txs.length === 0 ? (
                <div className="py-5 text-center text-sm text-zinc-400">No transactions found.</div>
            ) : (
            <div className="flex flex-col gap-4">
                {Object.values(txs.reduce((acc: any, tx: any) => {
                    if (!acc[tx.referenceId]) {
                        acc[tx.referenceId] = {
                            id: tx.referenceId,
                            referenceType: tx.referenceType,
                            createdAt: tx.createdAt,
                            entries: []
                        };
                    }
                    acc[tx.referenceId].entries.push(tx);
                    return acc;
                }, {})).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((group: any) => (
                    <div
                      key={group.id}
                      className="flex flex-col rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4"
                    >
                        <div className="mb-3 flex items-center justify-between border-b border-[var(--card-border)] pb-3">
                            <div className="text-lg font-medium capitalize text-[var(--foreground)]">
                                {group.referenceType.toLowerCase().replace('_', ' ')}
                            </div>
                            <div className="text-[0.85rem] text-zinc-400">
                                {new Date(group.createdAt).toLocaleString()}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            {group.entries.map((tx: any) => {
                                const isCredit = tx.amount > 0;
                                return (
                                    <div key={tx.id} className="flex items-center justify-between">
                                        <div className="text-[0.9rem] text-zinc-500">
                                            {tx.asset}
                                        </div>
                                        <div
                                          className={`text-[0.95rem] font-semibold ${
                                            isCredit ? 'text-[var(--emerald-primary)]' : 'text-[var(--foreground)]'
                                          }`}
                                        >
                                            {isCredit ? '+' : ''}{tx.amount} {tx.asset === 'INR' ? '₹' : 'g'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
            )}
        </div>
    );
}
