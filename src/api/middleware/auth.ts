import { Request, Response, NextFunction } from "express";
import { WRITE_SECRET, RBLX_SERVER_SECRET } from "../../constants/Secrets";

export function requireRoblox(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authentication;

  if (auth === RBLX_SERVER_SECRET || auth === WRITE_SECRET) {
    return next();
  }

  return res.status(401).json({ message: "invalid or missing authentication" });
}

export function requireWrite(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authentication;

  if (auth === WRITE_SECRET) {
    return next();
  }

  return res.status(403).json();
}

export function requireAny(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authentication;

  if (auth === WRITE_SECRET || auth === RBLX_SERVER_SECRET) {
    return next();
  }

  return res.status(403).json();
}
