"use client";

import { useState } from "react";
import { apiPost } from "../lib/api";

export default function TradeForm({
    userId,
    type,
}: {
    userId: string;
    type: "buy" | "sell";
}) {
    const [amount, setAmount] = useState("");

    async function submit() {
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

        alert("Success");
    }

    return (
        <div style={{ marginTop: 20 }}>
            <h3>{type === "buy" ? "Buy Silver" : "Sell Silver"}</h3>
            <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={type === "buy" ? "INR amount" : "Silver qty"}
            />
            <button onClick={submit}>
                {type === "buy" ? "Buy" : "Sell"}
            </button>
        </div>
    );
}
