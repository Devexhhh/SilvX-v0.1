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
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Digital Silver</h1>

      {!userId && (
        <button onClick={createUser}>Create User</button>
      )}

      {userId && (
        <>
          <p>User ID: {userId}</p>

          <button onClick={deposit}>
            Deposit ₹1000
          </button>

          <BalanceCard userId={userId} refreshSignal={refresh} />

          <TradeForm
            userId={userId}
            type="buy"
            onSuccess={triggerRefresh}
          />

          <TradeForm
            userId={userId}
            type="sell"
            onSuccess={triggerRefresh}
          />

          <TransactionHistory userId={userId} />

        </>
      )}
    </main>
  );
}
