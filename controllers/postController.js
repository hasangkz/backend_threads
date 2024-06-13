const Post = require('../models/postModel');
const User = require('../models/userModel');
const cloudinary = require('cloudinary').v2;

// CREATE POST
const createPost = async (req, res) => {
  try {
    let { postedBy, text, img } = req.body;

    if (!postedBy || !text) {
      return res
        .status(400)
        .json({ error: 'Postedby and text fields are required' });
    }

    const user = await User.findById(postedBy);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    if (user._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: 'Unauthorized to create post' });
    }

    const maxLength = 120;

    if (text.length > maxLength) {
      return res
        .status(400)
        .json({ error: `Text must be less than ${maxLength} characters` });
    }

    const newPost = new Post({ postedBy, text, img });
    await newPost.save();

    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log('Error in createPost => ', error);
  }
};

// DELETE POST
const deletePost = async (req, res) => {
  try {
    const post = Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.postedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: 'Unauthorized to create post' });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Post deleted succesfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log('Error in deletePost => ', error);
  }
};

// LIKE POST
const likePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      res.status(400).json({ error: 'You have already liked this post!' });
    } else {
      post.likes.push(userId);
      await post.save();
      res.status(200).json({ message: 'Post liked successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log('Error in likePost => ', error);
  }
};

// UNLIKE POST
const unlikePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      res.status(200).json({ message: 'Post unliked successfully' });
    } else {
      res.status(200).json({ error: 'You did not have liked this post!' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log('Error in unlikePost => ', error);
  }
};

// GET USER'S POST
const getUserPosts = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const posts = await Post.find({ postedBy: user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log('Error in getUserPosts => ', error);
  }
};

// GET POST
const getPost = async (req, res) => {
  try {
    const post = Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json({ post });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log('Error in getPost => ', error);
  }
};

// REPLY POST
const replyToPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;
    const userProfilePic = req.user.profilePic;
    const username = req.user.username;

    if (!text) {
      return res.status(400).json({ error: 'Text field is required' });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const reply = { userId, text, userProfilePic, username };

    post.replies.push(reply);
    await post.save();

    res.status(200).json(reply);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log('Error in replyToPost => ', error);
  }
};

// FEED THE POSTS
const feedPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const followingUserIds = user.following;

    const feedPosts = await Post.find({
      postedBy: { $in: followingUserIds },
    }).sort({ createdAt: -1 });

    res.status(200).json(feedPosts);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log('Error in feedPosts => ', error);
  }
};

module.exports = {
  createPost,
  deletePost,
  likePost,
  unlikePost,
  getUserPosts,
  getPost,
  replyToPost,
  feedPosts,
};
