// src/controllers/settings.controller.ts
import { Request, Response, NextFunction } from "express";
import * as service from "../services/settings.services";

export const getMySettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.uid;

    const settings = await service.getSettings(userId);
    res.json({ settings, userId });
  } catch (err) { next(err); }
};

export const patchMySettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.uid;

    const payload = req.body;
    const updated = await service.updateSettings(userId, payload);
    res.json({ settings: updated });
  } catch (err) { next(err); }
};

export const unblockUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.uid;
    const targetId = req.params.userId;
    await service.unblockUser(userId, targetId);
    res.json({ ok: true });
  } catch (err) { next(err); }
};

export const deactivateAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.uid;
    await service.deactivateAccount(userId);
    res.json({ ok: true });
  } catch (err) { next(err); }
};

export const deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.uid;
    await service.deleteAccount(userId);
    res.json({ ok: true });
  } catch (err) { next(err); }
};
