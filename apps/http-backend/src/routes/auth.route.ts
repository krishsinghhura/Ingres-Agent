// src/routes/auth.route.ts
import { Router } from "express";
import { signupController } from "../controllers/auth/signup.controller";
import { signinController } from "../controllers/auth/signin.controller";

const router = Router();

router.post("/signup", signupController);

router.post("/signin", signinController);

export default router;
