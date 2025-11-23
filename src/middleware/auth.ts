import { Request, Response, NextFunction } from "express";

const RBLX_SECRET = process.env.SERVER_SECRET;
const ACTION_SECRET = process.env.REGISTER_SECRET;

export function requireRoblox(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authentication;

  if (auth === RBLX_SECRET || auth === ACTION_SECRET) {
    return next();
  }

  return res.status(401).json({ message: "invalid or missing authentication" });
}

export function requireWrite(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authentication;

  if (auth === ACTION_SECRET) {
    return next();
  }

  return res.status(403).json();
}

export function requireAny(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authentication;

  if (auth === ACTION_SECRET || auth === RBLX_SECRET) {
    return next();
  }

  console.log("failed");

  return res.status(403).json();
}
