import prisma from "./index";

async function seed() {
    const existing = await prisma.account.findMany({
        where: {
            type: {
                in: ["SYSTEM_INR", "SYSTEM_SILVER"],
            },
        },
    });

    if (existing.length === 2) {
        console.log("System accounts already exist. Skipping seed.");
        return;
    }

    await prisma.account.createMany({
        data: [
            { type: "SYSTEM_INR" },
            { type: "SYSTEM_SILVER" },
        ],
    });

    console.log("System accounts created.");
}

seed()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
