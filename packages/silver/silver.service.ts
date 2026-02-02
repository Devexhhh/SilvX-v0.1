import prisma from "@repo/db";
import { LedgerService } from "@repo/ledger";
import { Decimal } from "@repo/utils";
import { PriceService } from "@repo/pricing";
import { LimitsService } from "@repo/limits";

export class SilverService {
    private ledger = new LedgerService();
    private pricing = new PriceService();
    private limits = new LimitsService();

    async buySilver(params: {
        userId: string;
        inrAmount: Decimal;
        referenceId: string;
    }) {
        const { userId, inrAmount, referenceId } = params;

        if (inrAmount.lte(0)) {
            throw new Error("INR amount must be > 0");
        }

        // ✅ LIMIT: INR buy limits (before DB work)
        await this.limits.validateBuyInr(inrAmount);

        // 🔒 Fetch price internally
        const pricePerGram = await this.pricing.getSilverPricePerGram();
        if (pricePerGram.lte(0)) {
            throw new Error("Invalid silver price");
        }

        const silverQty = inrAmount.div(pricePerGram);

        return prisma.$transaction(async (tx) => {
            const [
                userInr,
                userSilver,
                systemInr,
                systemSilver,
            ] = await Promise.all([
                tx.account.findFirst({ where: { userId, type: "USER_INR" } }),
                tx.account.findFirst({ where: { userId, type: "USER_SILVER" } }),
                tx.account.findFirst({ where: { type: "SYSTEM_INR" } }),
                tx.account.findFirst({ where: { type: "SYSTEM_SILVER" } }),
            ]);

            if (!userInr || !userSilver) {
                throw new Error("User accounts missing");
            }
            if (!systemInr || !systemSilver) {
                throw new Error("System accounts missing");
            }

            // INR leg: user → system
            await this.ledger.createEntryTx(tx, {
                debitAccountId: userInr.id,
                creditAccountId: systemInr.id,
                amount: inrAmount,
                asset: "INR",
                referenceType: "BUY_SILVER",
                referenceId,
            });

            // SILVER leg: system → user
            await this.ledger.createEntryTx(tx, {
                debitAccountId: systemSilver.id,
                creditAccountId: userSilver.id,
                amount: silverQty,
                asset: "SILVER",
                referenceType: "BUY_SILVER",
                referenceId,
            });

            return {
                silverQty,
                pricePerGram,
            };
        });
    }

    async sellSilver(params: {
        userId: string;
        silverQty: Decimal;
        referenceId: string;
    }) {
        const { userId, silverQty, referenceId } = params;

        if (silverQty.lte(0)) {
            throw new Error("Silver quantity must be > 0");
        }

        // 🔒 Fetch price internally
        const pricePerGram = await this.pricing.getSilverPricePerGram();
        if (pricePerGram.lte(0)) {
            throw new Error("Invalid silver price");
        }

        const inrAmount = silverQty.mul(pricePerGram);

        return prisma.$transaction(async (tx) => {
            const [
                userInr,
                userSilver,
                systemInr,
                systemSilver,
            ] = await Promise.all([
                tx.account.findFirst({ where: { userId, type: "USER_INR" } }),
                tx.account.findFirst({ where: { userId, type: "USER_SILVER" } }),
                tx.account.findFirst({ where: { type: "SYSTEM_INR" } }),
                tx.account.findFirst({ where: { type: "SYSTEM_SILVER" } }),
            ]);

            if (!userInr || !userSilver) {
                throw new Error("User accounts missing");
            }
            if (!systemInr || !systemSilver) {
                throw new Error("System accounts missing");
            }

            // ✅ LIMIT: cannot sell more silver than owned
            const userSilverBalance = await this.ledger.getBalanceTx(
                tx,
                userSilver.id,
                "SILVER"
            );

            await this.limits.validateSellSilver(
                silverQty,
                userSilverBalance
            );

            // SILVER leg: user → system
            await this.ledger.createEntryTx(tx, {
                debitAccountId: userSilver.id,
                creditAccountId: systemSilver.id,
                amount: silverQty,
                asset: "SILVER",
                referenceType: "SELL_SILVER",
                referenceId,
            });

            // INR leg: system → user
            await this.ledger.createEntryTx(tx, {
                debitAccountId: systemInr.id,
                creditAccountId: userInr.id,
                amount: inrAmount,
                asset: "INR",
                referenceType: "SELL_SILVER",
                referenceId,
            });

            return {
                inrAmount,
                pricePerGram,
            };
        });
    }
}
