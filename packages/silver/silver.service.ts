import prisma from "@repo/db";
import { LedgerService } from "@repo/ledger";
import { Decimal } from "@repo/utils";

export class SilverService {
    private ledger = new LedgerService();

    async buySilver(params: {
        userId: string;
        inrAmount: Decimal;
        pricePerGram: Decimal;
        referenceId: string;
    }) {
        const { userId, inrAmount, pricePerGram, referenceId } = params;

        if (inrAmount.lte(0)) {
            throw new Error("INR amount must be > 0");
        }

        if (pricePerGram.lte(0)) {
            throw new Error("Invalid silver price");
        }

        const silverQty = inrAmount.div(pricePerGram);

        const [
            userInr,
            userSilver,
            systemInr,
            systemSilver,
        ] = await Promise.all([
            prisma.account.findFirst({
                where: { userId, type: "USER_INR" },
            }),
            prisma.account.findFirst({
                where: { userId, type: "USER_SILVER" },
            }),
            prisma.account.findFirst({
                where: { type: "SYSTEM_INR" },
            }),
            prisma.account.findFirst({
                where: { type: "SYSTEM_SILVER" },
            }),
        ]);

        if (!userInr || !userSilver) {
            throw new Error("User accounts missing");
        }
        if (!systemInr || !systemSilver) {
            throw new Error("System accounts missing");
        }

        // INR leg: user pays system
        await this.ledger.createEntry({
            debitAccountId: userInr.id,
            creditAccountId: systemInr.id,
            amount: inrAmount,
            asset: "INR",
            referenceType: "BUY_SILVER",
            referenceId,
        });

        // SILVER leg: system gives silver
        await this.ledger.createEntry({
            debitAccountId: systemSilver.id,
            creditAccountId: userSilver.id,
            amount: silverQty,
            asset: "SILVER",
            referenceType: "BUY_SILVER",
            referenceId,
        });

        return {
            silverQty,
        };
    }

    async sellSilver(params: {
        userId: string;
        silverQty: Decimal;
        pricePerGram: Decimal;
        referenceId: string;
    }) {
        const { userId, silverQty, pricePerGram, referenceId } = params;

        if (silverQty.lte(0)) {
            throw new Error("Silver quantity must be > 0");
        }

        if (pricePerGram.lte(0)) {
            throw new Error("Invalid silver price");
        }

        const inrAmount = silverQty.mul(pricePerGram);

        const [
            userInr,
            userSilver,
            systemInr,
            systemSilver,
        ] = await Promise.all([
            prisma.account.findFirst({ where: { userId, type: "USER_INR" } }),
            prisma.account.findFirst({ where: { userId, type: "USER_SILVER" } }),
            prisma.account.findFirst({ where: { type: "SYSTEM_INR" } }),
            prisma.account.findFirst({ where: { type: "SYSTEM_SILVER" } }),
        ]);

        if (!userInr || !userSilver) {
            throw new Error("User accounts missing");
        }
        if (!systemInr || !systemSilver) {
            throw new Error("System accounts missing");
        }

        // SILVER leg: user gives silver to system
        await this.ledger.createEntry({
            debitAccountId: userSilver.id,
            creditAccountId: systemSilver.id,
            amount: silverQty,
            asset: "SILVER",
            referenceType: "SELL_SILVER",
            referenceId,
        });

        // INR leg: system gives INR to user
        await this.ledger.createEntry({
            debitAccountId: systemInr.id,
            creditAccountId: userInr.id,
            amount: inrAmount,
            asset: "INR",
            referenceType: "SELL_SILVER",
            referenceId,
        });

        return {
            inrAmount,
        };
    }
}
