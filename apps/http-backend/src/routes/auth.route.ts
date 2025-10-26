import { Router } from "express";
import { signupController } from "../controllers/auth/signup.controller";
import { signinController } from "../controllers/auth/signin.controller";

const Authrouter = Router();

Authrouter.post("/signup", signupController);

Authrouter.post("/signin", signinController);

export default Authrouter;
