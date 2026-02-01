import { Router } from "express";
import { DepositsService } from "@repo/deposits";
import { Decimal } from "@repo/utils";

const router = Router();
const deposits = new DepositsService();

router.post("/", async (req, res, next) => {
    try {
        const { userId, amount, referenceId } = req.body;
        await deposits.depositINR({
            userId,
            amount: new Decimal(amount),
            referenceId,
        });
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
});

export default router;