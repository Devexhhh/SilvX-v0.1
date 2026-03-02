import { Router } from "express";
import { PriceService } from "@repo/pricing";

const router = Router();
const pricing = new PriceService();

router.get("/", async (req, res) => {
    const mid = await pricing.getMidPrice();
    const buy = await pricing.getBuyPrice();
    const sell = await pricing.getSellPrice();

    res.json({
        mid,
        buy,
        sell,
    });
});

export default router;