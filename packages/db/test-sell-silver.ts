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

    await deposits.depositINR({
        userId: user.id,
        amount: new Decimal(1000),
        referenceId: "UPI_SELL_TEST",
    });

    await silver.buySilver({
        userId: user.id,
        inrAmount: new Decimal(500),
        pricePerGram: new Decimal(100),
        referenceId: "BUY_FIRST",
    });

    const sell = await silver.sellSilver({
        userId: user.id,
        silverQty: new Decimal(2),
        pricePerGram: new Decimal(100),
        referenceId: "SELL_001",
    });

    console.log("INR received:", sell.inrAmount.toString());

    const userInr = await prisma.account.findFirst({
        where: { userId: user.id, type: "USER_INR" },
    });

    const balance = await ledger.getBalance(userInr!.id, "INR");
    console.log("Final INR balance:", balance.toString());
}

main().finally(() => prisma.$disconnect());
