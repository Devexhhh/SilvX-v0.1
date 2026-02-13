import { Router } from "express";
import { SilverService } from "@repo/silver";
import { Decimal } from "@repo/utils";

console.log("SILVER ROUTE LOADED");

const router = Router();
const silver = new SilverService();

router.post("/buy", async (req, res, next) => {
    try {
        const { userId, inrAmount, referenceId } = req.body;

        const result = await silver.buySilver({
            userId,
            inrAmount: new Decimal(inrAmount),
            referenceId,
        });

        res.json(result);
    } catch (err) {
        next(err);
    }
});

router.post("/sell", async (req, res, next) => {
    try {
        const { userId, silverQty, referenceId } = req.body;

        const result = await silver.sellSilver({
            userId,
            silverQty: new Decimal(silverQty),
            referenceId,
        });

        res.json(result);
    } catch (err) {
        next(err);
    }
});

export default router;
