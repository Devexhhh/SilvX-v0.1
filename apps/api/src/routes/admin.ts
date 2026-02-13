import { Router } from "express";
import prisma, { AccountType } from "@repo/db";
import { Decimal } from "@repo/utils";

const router = Router();

router.get("/reserve-status", async (req, res, next) => {
    try {
        // Fetch relevant accounts
        const userSilverAccounts = await prisma.account.findMany({
            where: { type: AccountType.USER_SILVER },
        });

        const systemSilver = await prisma.account.findFirst({
            where: { type: AccountType.SYSTEM_SILVER },
        });

        const revenueAccount = await prisma.account.findFirst({
            where: { type: AccountType.SYSTEM_REVENUE_INR },
        });

        if (!systemSilver || !revenueAccount) {
            throw new Error("System accounts missing");
        }

        // Helper to compute balance
        async function getBalance(accountId: string, asset: "INR" | "SILVER") {
            const credits = await prisma.ledgerEntry.aggregate({
                _sum: { amount: true },
                where: { creditAccountId: accountId, asset },
            });

            const debits = await prisma.ledgerEntry.aggregate({
                _sum: { amount: true },
                where: { debitAccountId: accountId, asset },
            });

            return new Decimal(credits._sum.amount ?? 0).minus(
                new Decimal(debits._sum.amount ?? 0)
            );
        }

        // 1️⃣ Total user silver
        let totalUserSilver = new Decimal(0);

        for (const acc of userSilverAccounts) {
            const balance = await getBalance(acc.id, "SILVER");
            totalUserSilver = totalUserSilver.plus(balance);
        }

        // 2️⃣ System silver
        const systemSilverBalance = await getBalance(
            systemSilver.id,
            "SILVER"
        );

        // 3️⃣ Revenue INR
        const revenueINR = await getBalance(
            revenueAccount.id,
            "INR"
        );

        // 4️⃣ Reserve ratio
        const reserveRatio =
            totalUserSilver.eq(0)
                ? new Decimal(1)
                : systemSilverBalance.div(totalUserSilver);

        res.json({
            totalUserSilver: totalUserSilver.toString(),
            systemSilver: systemSilverBalance.toString(),
            reserveRatio: reserveRatio.toString(),
            revenueINR: revenueINR.toString(),
        });
    } catch (err) {
        next(err);
    }
});

export default router;
