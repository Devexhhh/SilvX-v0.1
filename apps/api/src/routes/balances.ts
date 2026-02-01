import { Router } from "express";
import prisma from "@repo/db";
import { LedgerService } from "@repo/ledger";

const router = Router();
const ledger = new LedgerService();

router.get("/:userId", async (req, res, next) => {
    try {
        const { userId } = req.params;

        const [userInr, userSilver] = await Promise.all([
            prisma.account.findFirst({ where: { userId, type: "USER_INR" } }),
            prisma.account.findFirst({ where: { userId, type: "USER_SILVER" } }),
        ]);
        if (!userInr || !userSilver) {
            throw new Error("Accounts missing");
        }
        const [inr, silver] = await Promise.all([
            ledger.getBalance(userInr.id, "INR"),
            ledger.getBalance(userSilver.id, "SILVER"),
        ]);
        res.json({
            inr: inr.toString(),
            silver: silver.toString()
        });
    } catch (err) {
        next(err);
    }
});

export default router;