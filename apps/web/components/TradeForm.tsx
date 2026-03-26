"use client";

import { useState } from "react";
import { apiPost } from "../lib/api";

export default function TradeForm({
    userId,
    onSuccess,
}: {
    userId: string;
    onSuccess?: () => void;
}) {
    const [type, setType] = useState<"buy" | "sell">("buy");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function submit() {
        setError(null);
        if (!amount) {
            setError("Please enter an amount");
            return;
        }

        setLoading(true);
        try {
            if (type === "buy") {
                await apiPost("/silver/buy", {
                    userId,
                    inrAmount: Number(amount),
                    referenceId: `BUY_${Date.now()}`,
                });
            } else {
                await apiPost("/silver/sell", {
                    userId,
                    silverQty: Number(amount),
                    referenceId: `SELL_${Date.now()}`,
                });
            }
            setAmount("");
            onSuccess?.();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-lg shadow-black/40">
            <h3 className="mb-5 text-lg font-semibold text-[var(--foreground)]">Trade Silver</h3>

            <div className="mb-5 flex gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-1">
                <button 
                    onClick={() => { setType('buy'); setError(null); }}
                    className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                        type === 'buy'
                          ? 'text-black [background-image:var(--emerald-gradient)]'
                          : 'bg-transparent text-zinc-400'
                    }`}
                >
                    Buy
                </button>
                <button 
                    onClick={() => { setType('sell'); setError(null); }}
                    className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                        type === 'sell'
                          ? 'text-black [background-image:var(--silver-gradient)]'
                          : 'bg-transparent text-zinc-400'
                    }`}
                >
                    Sell
                </button>
            </div>

            <div className="mb-4">
                <label className="mb-2 block text-sm text-zinc-400">
                    {type === 'buy' ? 'Amount (INR)' : 'Quantity (g)'}
                </label>
                <input
                    type="number"
                    className="mb-3 w-full rounded-lg border border-[var(--card-border)] bg-[#09090b] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--emerald-primary)] focus:ring-2 focus:ring-[var(--emerald-light)]"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={type === 'buy' ? 'Enter INR amount' : 'Enter Silver quantity'}
                />
                
                <input 
                    type="range"
                    min={type === 'buy' ? "100" : "1"}
                    max={type === 'buy' ? "100000" : "1000"}
                    step="1"
                    value={amount || (type === 'buy' ? "100" : "1")}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`w-full cursor-pointer ${
                        type === 'buy'
                          ? '[&::-webkit-slider-thumb]:bg-[var(--emerald-primary)]'
                          : '[&::-webkit-slider-thumb]:bg-zinc-400'
                    }`}
                />
                <div className="mt-1 flex justify-between text-[0.8rem] text-zinc-500">
                    <span>{type === 'buy' ? '₹100' : '1g'}</span>
                    <span>{type === 'buy' ? '₹1,00,000' : '1,000g'}</span>
                </div>
            </div>

            {error && (
                <div className="mb-4 rounded-lg bg-[var(--danger-light)] p-3 text-sm text-[var(--danger)]">
                    {error}
                </div>
            )}

            <button
                className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-black transition btn-motion-emerald ${
                    type === 'buy'
                      ? 'hover:-translate-y-px hover:opacity-90'
                      : 'hover:-translate-y-px hover:opacity-90 btn-motion-silver'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                onClick={submit}
                disabled={loading}
            >
                {loading ? "Processing..." : type === "buy" ? "Confirm Buy" : "Confirm Sell"}
            </button>
        </div>
    );
}
