import { Router } from "express";
import { SilverService } from "@repo/silver";
import { Decimal } from "@repo/utils";

console.log("SILVER ROUTE LOADED");

const router = Router();
const silver = new SilverService();

import { asyncHandler } from "../utils/asyncHandler";

router.post(
    "/buy",
    asyncHandler(async (req: any, res: any) => {
        const { userId, inrAmount, referenceId } = req.body;

        const result = await silver.buySilver({
            userId,
            inrAmount: new Decimal(inrAmount),
            referenceId,
        });

        res.json(result);
    })
);


router.post(
    "/sell",
    asyncHandler(async (req: any, res: any) => {
        const { userId, silverQty, referenceId } = req.body;

        const result = await silver.sellSilver({
            userId,
            silverQty: new Decimal(silverQty),
            referenceId,
        });

        res.json(result);
    })
);

export default router;
