import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface AuthPayload extends JwtPayload {
  id: string;
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token missing" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    // safely check the decoded value
    if (typeof decoded === "object" && "id" in decoded) {
      (req as any).user = decoded as AuthPayload;
      return next();
    }

    return res.status(401).json({ error: "Invalid token payload" });
  } catch (error) {
    console.error("JWT verification failed:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
