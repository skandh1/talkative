// src/services/settings.service.ts
import { User as UserModel } from "../models/User";
import mongoose from "mongoose";
import createError from "http-errors";

export const getSettings = async (uid: string) => {
  const user = await UserModel.findOne({ uid })
    .select("settings blocked friends isProfilePublic username displayName profilePic")
    .lean();
  if (!user) throw createError(404, "User not found");
  
  return {
    ...user.settings,
    blocked: user.blocked?.map(String) || []
  };
};

export const updateSettings = async (uid: string, payload: any) => {
  if (!payload || typeof payload !== "object") {
    throw createError(400, "Invalid payload");
  }

  const update: any = {};
  if (payload.settings) {
    update["settings"] = payload.settings;
  } else {
    Object.keys(payload).forEach((k) => update[`settings.${k}`] = payload[k]);
  }

  const updated = await UserModel.findOneAndUpdate(
    { uid },
    { $set: update },
    { new: true }
  ).select("settings").lean();
  
  if (!updated) throw createError(404, "User not found");
  return updated.settings;
};

export const unblockUser = async (uid: string, targetUid: string) => {
  // First find the target user to get their _id if needed
  const targetUser = await UserModel.findOne({ uid: targetUid }).select("_id").lean();
  if (!targetUser) throw createError(404, "Target user not found");

  // Remove from blocked array using uid
  await UserModel.findOneAndUpdate(
    { uid },
    { $pull: { blocked: targetUser._id } }
  );
  
  // Optionally remove from target's blockedBy
  await UserModel.findOneAndUpdate(
    { uid: targetUid },
    { $pull: { blockedBy: uid } }
  );
  
  return;
};

export const deactivateAccount = async (uid: string) => {
  await UserModel.findOneAndUpdate(
    { uid },
    {
      $set: {
        profileStatus: "inactive",
        "settings.privacy.isProfilePublic": false,
        "settings.communication.allowCalls": false,
        "settings.communication.allowChatRequests": false
      }
    }
  );
  return;
};

export const deleteAccount = async (uid: string) => {
  await UserModel.findOneAndDelete({ uid });
  // TODO: enqueue cleanup jobs to remove chats, files, references
  return;
};