import express from "express";
import cors from "cors";


const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_, res) => {
    res.send("API is running");
});

app.get("/health", (_, res) => {
    res.json({ status: "ok" });
});

export default app;
