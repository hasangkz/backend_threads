const Post = require('../models/postModel');

// CREATE POST
const createPost = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log('Error in createPost => ', error);
  }
};

// DELETE POST
const deletePost = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log('Error in deletePost => ', error);
  }
};

// LIKE POST
const likePost = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log('Error in likePost => ', error);
  }
};

// UNLIKE POST
const unlikePost = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log('Error in unlikePost => ', error);
  }
};

// GET USER'S POST
const getUserPosts = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log('Error in getUserPosts => ', error);
  }
};

// GET POST
const getPost = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log('Error in getPost => ', error);
  }
};

// REPLY POST
const replyToPost = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log('Error in replyToPost => ', error);
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
};
