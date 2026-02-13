import app from "./app";

const PORT = 4000;

process.on("unhandledRejection", (err: any) => {
    console.error("UNHANDLED REJECTION:", err);
});

app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
});
