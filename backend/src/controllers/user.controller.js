import User from "../models/user.model.js";
import ApiError from "../utils/apiError.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import { successResponse } from "../utils/response.util.js";
import { privateUser, publicUser } from "../utils/userPresenter.util.js";

// GET /users/me — current user's own profile.
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return successResponse(res, "Profile fetched successfully", {
    user: privateUser(user),
  });
});

// PUT /users/me — update bio and/or avatar.
export const updateMe = asyncHandler(async (req, res) => {
  const { bio, avatar } = req.body;

  // Only apply fields that were actually provided; the validator guarantees
  // at least one is present.
  const updates = {};
  if (bio !== undefined) updates.bio = bio;
  if (avatar !== undefined) updates.avatar = avatar;

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return successResponse(res, "Profile updated successfully", {
    user: privateUser(user),
  });
});

// GET /users/:userName — public profile, no auth required.
export const getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ userName: req.params.userName });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return successResponse(res, "Profile fetched successfully", {
    user: publicUser(user),
  });
});
