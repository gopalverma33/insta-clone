const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const auth = require("../middleware/authMiddleware");


router.post("/", auth, async (req, res) => {
  try {
    const { image, caption } = req.body;

    if (!image) {
      return res.status(400).json({ message: "Image URL is required" });
    }

    const newPost = new Post({
      user: req.userId,
      image,
      caption,
    });

    await newPost.save();

    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});



router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});





router.put("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    
    if (post.likes.includes(req.userId)) {
      await post.updateOne({
        $pull: { likes: req.userId },
      });

      return res.json({ message: "Post unliked" });
    }

  
    await post.updateOne({
      $push: { likes: req.userId },
    });

    res.json({ message: "Post liked" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/:id/comment", auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      user: req.userId,
      text,
    });

    await post.save();

    res.json({ message: "Comment added successfully", comments: post.comments });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});



router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }


    if (post.user.toString() !== req.userId) {
      return res.status(403).json({ message: "You can delete only your own post" });
    }

    await post.deleteOne();

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/feed", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    const posts = await Post.find({
      user: { $in: [...user.following, req.userId] },
    })
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
