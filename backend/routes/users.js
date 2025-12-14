const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");


router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});









// FOLLOW USER
router.put("/:id/follow", auth, async (req, res) => {
  try {
    // cannot follow yourself
    if (req.params.id === req.userId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.userId);

    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!currentUser.following.includes(req.params.id)) {
      await currentUser.updateOne({
        $push: { following: req.params.id },
      });

      await userToFollow.updateOne({
        $push: { followers: req.userId },
      });

      res.json({ message: "User followed successfully" });
    } else {
      res.status(400).json({ message: "Already following this user" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// UNFOLLOW USER
router.put("/:id/unfollow", auth, async (req, res) => {
  try {
    if (req.params.id === req.userId) {
      return res.status(400).json({ message: "You cannot unfollow yourself" });
    }

    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.userId);

    if (!userToUnfollow) {
      return res.status(404).json({ message: "User not found" });
    }

    if (currentUser.following.includes(req.params.id)) {
      await currentUser.updateOne({
        $pull: { following: req.params.id },
      });

      await userToUnfollow.updateOne({
        $pull: { followers: req.userId },
      });

      res.json({ message: "User unfollowed successfully" });
    } else {
      res.status(400).json({ message: "You are not following this user" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
