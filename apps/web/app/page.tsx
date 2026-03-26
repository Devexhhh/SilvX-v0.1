"use client";

import { useState } from "react";
import { apiPost } from "../lib/api";
import BalanceCard from "../components/BalanceCard";
import TradeForm from "../components/TradeForm";
import TransactionHistory from "../components/TransactionHistory";


export default function Home() {
  const [userId, setUserId] = useState("");
  const [refresh, setRefresh] = useState(0);

  function triggerRefresh() {
    setRefresh((prev) => prev + 1);
  }

  async function createUser() {
    const res = await apiPost("/users", {
      phone: "9999999999",
    });

    setUserId(res.id);
  }

  async function deposit() {
    await apiPost("/deposits", {
      userId,
      amount: 1000,
      referenceId: `DEP_${Date.now()}`,
    });

    alert("Deposited ₹1000");
    triggerRefresh();
  }

  return (
    <main className="min-h-screen px-5 py-10">
      <div className="mx-auto mb-10 flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <h1 className="inline-block bg-clip-text text-3xl font-semibold tracking-tight text-transparent [background-image:var(--silver-gradient)]">
          Digital{" "}
          <span className="inline-block bg-clip-text text-transparent [background-image:var(--emerald-gradient)]">
            Silver
          </span>
        </h1>
        
        {userId && (
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-zinc-400">
              ID: {userId.slice(0, 8)}
            </span>
            <button
              onClick={deposit}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-zinc-700"
            >
              Quick Deposit ₹1000
            </button>
          </div>
        )}
      </div>

      <div className="mx-auto w-full max-w-7xl">
        {!userId ? (
          <div className="flex h-[60vh] items-center justify-center">
            <div className="w-full max-w-md rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 text-center shadow-lg shadow-black/40">
              <h2 className="mb-4 text-xl font-semibold text-[var(--foreground)]">
                Welcome to Digital Silver
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-zinc-400">
                Create an account to start trading premium digital silver
                instantly.
              </p>
              <button
                onClick={createUser}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-black transition hover:-translate-y-px hover:opacity-90 [background-image:var(--emerald-gradient)]"
              >
                Create Account
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-[2fr,1.4fr]">
              <TradeForm
                userId={userId}
                onSuccess={triggerRefresh}
              />
              <BalanceCard userId={userId} refreshSignal={refresh} />
            </div>

            <div className="w-full">
              <TransactionHistory userId={userId} refreshSignal={refresh} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
