"use client";

import { useState } from "react";
import { apiPost } from "../lib/api";

export default function TradeForm({
    userId,
    type,
    onSuccess,
}: {
    userId: string;
    type: "buy" | "sell";
    onSuccess?: () => void;
}) {
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
        <div style={{ marginTop: 20, border: "1px solid #ddd", padding: 16 }}>
            <h3>{type === "buy" ? "Buy Silver" : "Sell Silver"}</h3>

            <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={type === "buy" ? "INR amount" : "Silver qty"}
                style={{ padding: 8, width: "100%", marginBottom: 8 }}
            />

            {error && (
                <div style={{ color: "red", marginBottom: 8 }}>
                    {error}
                </div>
            )}

            <button
                onClick={submit}
                disabled={loading}
                style={{
                    padding: 8,
                    width: "100%",
                    background: loading ? "#aaa" : "#111",
                    color: "white",
                    cursor: loading ? "not-allowed" : "pointer",
                }}
            >
                {loading
                    ? "Processing..."
                    : type === "buy"
                        ? "Buy"
                        : "Sell"}
            </button>
        </div>
    );
}
