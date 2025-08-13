// src/routes/settings.router.ts
import express from "express";
import * as controller from "../controllers/settings.controller";
import { authenticate as authMiddleware } from "../middleware/auth"; // existing middleware
import { validate } from "../middleware/validate"; // optional validator middleware
import { settingsPatchSchema } from "../validators/settings.validator";

const router = express.Router();

router.use(authMiddleware);

// GET current user's settings
router.get("/users/me/settings", controller.getMySettings);

// PATCH update settings
router.patch("/users/me/settings", validate(settingsPatchSchema), controller.patchMySettings);

// POST unblock user
router.post("/users/me/unblock/:userId", controller.unblockUser);

// POST deactivate (soft)
router.post("/users/me/deactivate", controller.deactivateAccount);

// DELETE account (hard)
router.delete("/users/me/delete", controller.deleteAccount);

export default router;
