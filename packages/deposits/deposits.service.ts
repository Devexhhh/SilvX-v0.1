import prisma from "@repo/db";
import { LedgerService } from "@repo/ledger";
import { Decimal } from "@repo/utils";

export class DepositsService {
    private ledger = new LedgerService();
    /**
     * Mock UPI deposit.
     * Moves INR from SYSTEM_INR → USER_INR
     */
    async depositINR(params: {
        userId: string;
        amount: Decimal;
        referenceId: string;
    }) {
        if (params.amount.lte(0)) {
            throw new Error("Deposit amount must be > 0");
        }

        const [systemInr, userInr] = await Promise.all([
            prisma.account.findFirst({ where: { type: "SYSTEM_INR" } }),
            prisma.account.findFirst({
                where: {
                    userId: params.userId,
                    type: "USER_INR",
                },
            }),
        ]);

        if (!systemInr) throw new Error("SYSTEM_INR account missing");
        if (!userInr) throw new Error("USER_INR account missing");

        await this.ledger.createEntry({
            debitAccountId: systemInr.id,
            creditAccountId: userInr.id,
            amount: params.amount,
            asset: "INR",
            referenceType: "UPI_DEPOSIT",
            referenceId: params.referenceId,
        });
    }
}
