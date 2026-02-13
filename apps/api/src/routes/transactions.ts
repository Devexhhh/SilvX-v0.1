import { Router } from "express";
import prisma from "@repo/db";

const router = Router();

router.get("/:userId", async (req, res, next) => {
    try {
        const { userId } = req.params;

        const accounts = await prisma.account.findMany({
            where: { userId },
        });

        const accountIds = accounts.map(a => a.id);

        const entries = await prisma.ledgerEntry.findMany({
            where: {
                OR: [
                    { debitAccountId: { in: accountIds } },
                    { creditAccountId: { in: accountIds } }
                ]
            },
            orderBy: { createdAt: "desc" }
        });

        res.json(entries);
    } catch (err) {
        next(err);
    }
});

export default router;
