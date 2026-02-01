import { Router } from "express";
import { UsersService } from "@repo/users"

const router = Router();
const users = new UsersService();

router.post("/", async (req, res, next) => {
    try {
        const { phone } = req.body;
        const user = await users.createUser(phone);
        res.json(user);
    } catch (err) {
        next(err);
    }
});

export default router;