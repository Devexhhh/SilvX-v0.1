import express from "express";
import cors from "cors";

import users from "./routes/users";
import deposits from "./routes/deposits";
import silver from "./routes/silver";
import balances from "./routes/balances";
import transactions from "./routes/transactions";
import admin from "./routes/admin";
import pricing from "./routes/pricing";

console.log("APP FILE LOADED");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_, res) => {
    res.send("API is running");
});

app.get("/health", (_, res) => {
    res.json({ status: "ok" });
});

app.use("/users", users);
app.use("/deposits", deposits);
app.use("/silver", silver);
app.use("/balances", balances);
app.use("/transactions", transactions);
app.use("/admin", admin);
app.use("/pricing", pricing);

app.use((err: any, req: any, res: any, next: any) => {
    console.error("ERROR:", err.message);

    res.status(400).json({
        success: false,
        message: err.message || "Something went wrong",
    });
});

export default app;