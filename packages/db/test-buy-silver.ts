import prisma from "./index";
import { UsersService } from "@repo/users";
import { DepositsService } from "@repo/deposits";
import { SilverService } from "@repo/silver";
import { LedgerService } from "@repo/ledger";
import { Decimal } from "@repo/utils";

async function main() {
    const users = new UsersService();
    const deposits = new DepositsService();
    const silver = new SilverService();
    const ledger = new LedgerService();

    const user = await users.createUser(
        `9${Date.now().toString().slice(-9)}`
    );

    // Step 1: Deposit INR
    await deposits.depositINR({
        userId: user.id,
        amount: new Decimal(1000),
        referenceId: "UPI_BUY_SILVER_TEST",
    });

    // Step 2: Buy silver
    const result = await silver.buySilver({
        userId: user.id,
        inrAmount: new Decimal(500),
        pricePerGram: new Decimal(100),
        referenceId: "BUY_SILVER_001",
    });

    console.log("Silver bought (grams):", result.silverQty.toString());

    // Step 3: Check silver balance
    const userSilver = await prisma.account.findFirst({
        where: { userId: user.id, type: "USER_SILVER" },
    });

    if (!userSilver) throw new Error("USER_SILVER missing");

    const silverBalance = await ledger.getBalance(
        userSilver.id,
        "SILVER"
    );

    console.log("User silver balance:", silverBalance.toString());
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
