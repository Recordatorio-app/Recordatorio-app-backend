import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ msg: "No token" });

  const parts = header.split(" ");
  if (parts.length !== 2) return res.status(401).json({ msg: "Token mal formado" });

  const token = parts[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // @ts-ignore
    req.userId = (decoded as any).id;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token inválido" });
  }
};
