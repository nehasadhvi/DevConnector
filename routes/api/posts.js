const express = require("express");
const router = express.Router();
const passport = require("passport");

// Load user and post model
const Profile = require("../../models/Profile");
const Post = require("../../models/Post");

//Load Post Input Validator
const validatePostInput = require("../../validation/post");

router.get("/test", (req, res) => res.json({ msg: "Posts Success" }));

// @route   POST api/posts
// @desc    Display all post
// @access  Public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err =>
      res.status(404).json({ nopostsfound: "There is no post to display" })
    );
});

// @route   POST api/posts/:id
// @desc    Display single post
// @access  Private
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err =>
      res
        .status(404)
        .json({ nopostfound: "There is no post with the given ID" })
    );
});

// @route   POST api/posts
// @desc    Create new post
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check Validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    newPost.save().then(post => res.json(post));
  }
);

// @route   DELETE api/posts/:id
// @desc    Delete single post
// @access  Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.id)
          .then(post => {
            if (post.user.toString() !== req.user.id) {
              return res
                .status(401)
                .json({ notauthorized: "Not authorized to delete this post" });
            }
            post.remove().then(() => res.json({ success: true }));
          })
          .catch(err =>
            res.status(404).json({ postnotfound: "No Post found" })
          );
      })
      .catch(err =>
        res
          .status(404)
          .json({ nopostfound: "There is no post with the given ID" })
      );
  }
);

// @route   POST api/posts/like/:id
// @desc    Like a post
// @access  Private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          )
            return res
              .status(400)
              .json({ alreadyliked: "User already liked this post" });

          post.likes.unshift({ user: req.user.id });
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: "No post found" }));
    });
  }
);

// @route   POST api/posts/unlike/:id
// @desc    unlike a post
// @access  Private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          )
            return res
              .status(400)
              .json({ notliked: "You have not liked the post yet" });

          // Get remove index
          const removeIndex = post.likes
            .map(like => like.user.toString())
            .indexOf(req.params.id);

          // Splice off the like
          post.likes.splice(removeIndex, 1);

          // Save
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: "No post found" }));
    });
  }
);

// @route   POST api/posts/comment/:id
// @desc    Comment on a post
// @access  Private
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check Validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          user: req.user.id,
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar
        };
        post.comments.unshift(newComment);
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: "No post found" }));
  }
);

// @route   POST api/posts/uncomment/:id
// @desc    Delete a comment on a post
// @access  Private
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          user: req.user.id,
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar
        };
        post.comments.unshift(newComment);
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: "No post found" }));
  }
);

// @route   DELETE api/posts/uncomment/:id/:comment:id
// @desc    Delete a comment on a post
// @access  Private
router.delete(
  "/uncomment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        const removeIndex = post.comments
          .map(comment => comment._id.toString())
          .indexOf(req.params.comment_id);
        if (removeIndex !== -1) {
          post.comments.splice(removeIndex, 1);
          post.save().then(post => res.json(post));
        } else return res.status(404).json({ nocomment: "No comment found" });
      })
      .catch(err => res.status(404).json({ postnotfound: "No post found" }));
  }
);

module.exports = router;
