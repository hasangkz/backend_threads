const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/tokenProcess');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const Post = require('../models/postModel');

// SIGNUP USER
const signupUser = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
    });
    await newUser.save();

    if (newUser) {
      generateToken(newUser._id, res);
      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        bio: newUser.bio,
        email: newUser.email,
        profilePic: newUser?.profilePic,
        followers: user?.followers,
        following: user?.following,
      });
    } else {
      res.status(400).json({ error: 'Invalid user!' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log('Error in signup => ', error);
  }
};

// LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res
        .status(400)
        .json({ error: 'Please enter your username and password' });

    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ''
    );

    if (!user || !isPasswordCorrect)
      return res.status(400).json({ error: 'Invalid username or password' });

    if (user.isFrozen) {
      user.isFrozen = false;
      await user.save();
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      bio: user.bio,
      profilePic: user?.profilePic,
      followers: user?.followers,
      following: user?.following,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log('Error in login: ', error.message);
  }
};

// LOGOUT USER
const logoutUser = (req, res) => {
  try {
    res.cookie('jwt', '', { maxAge: 1 });
    res.status(200).json({ message: 'User logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log('Error in logout: ', err.message);
  }
};

// FOLLOW USER
const followUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString())
      return res.status(400).json({ error: 'You cannot follow yourself' });

    const opposedUser = await User.findById(id);

    const currentUser = await User.findById(req.user._id);

    if (!opposedUser || !currentUser)
      return res.status(400).json({ error: 'User not found' });

    const isAlreadyFollowing = currentUser.following.includes(id);

    if (isAlreadyFollowing) {
      res.status(400).json({ error: 'You already followed this user!' });
    } else {
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      res.status(200).json({ message: 'User followed successfully' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log('Error in follow: ', err.message);
  }
};

// GET USER
const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);

    if (!user) return res.status(400).json({ error: 'User not found!' });

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log('Error in follow: ', err.message);
  }
};

// UNFOLLOW USER
const unfollowUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString())
      return res.status(400).json({ error: 'You cannot unfollow yourself' });

    const opposedUser = await User.findById(id);

    const currentUser = await User.findById(req.user._id);

    if (!opposedUser || !currentUser)
      return res.status(400).json({ error: 'User not found' });

    const isAlreadyFollowing = currentUser.following.includes(id);

    if (isAlreadyFollowing) {
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      res.status(200).json({ message: 'User unfollowed successfully' });
    } else {
      res.status(400).json({ error: 'You are not follow this user already!' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log('Error in unfollow: ', err.message);
  }
};

// UPDATE USER
const updateUser = async (req, res) => {
  let { name, email, username, password, bio, profilePic } = req.body;

  const userId = req.user._id;

  try {
    let user = await User.findById(userId);

    if (!user) return res.status(400).json({ error: 'User not found!' });

    if (req.params.id !== userId.toString())
      return res
        .status(400)
        .json({ error: "You cannot update other user's profile" });

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }

    if (profilePic) {
      if (user.profilePic) {
        await cloudinary.uploader.destroy(
          user.profilePic.split('/').pop().split('.')[0]
        );
      }

      const uploadedResponse = await cloudinary.uploader.upload(profilePic);
      profilePic = uploadedResponse.secure_url;
    }
    user.name = name || user.name;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.profilePic = profilePic || user.profilePic;

    await user.save();

    await Post.updateMany(
      { 'replies.userId': userId },
      {
        $set: {
          'replies.$[reply].username': user.username,
          'replies.$[reply].userProfilePic': user.profilePic,
        },
      },
      { arrayFilters: [{ 'reply.userId': userId }] }
    );

    user.password = null;

    res.status(200).json({ message: 'Profile updated succesfully!', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log('Error in update: ', error.message);
  }
};

// FREEZE USER
const freezeUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    user.isFrozen = true;
    await user.save();

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log('Error in freeze: ', error.message);
  }
};

// SUGGEST USER
const getSuggestedUsers = async (req, res) => {
  try {
    // exclude the current user from suggested users array and exclude users that current user is already following
    const userId = req.user._id;

    const usersFollowedByYou = await User.findById(userId).select('following');

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {
        $sample: { size: 10 },
      },
    ]);
    const filteredUsers = users.filter(
      (user) => !usersFollowedByYou.following.includes(user._id)
    );
    const suggestedUsers = filteredUsers.slice(0, 4);

    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json({ suggestedUsers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET USER PROFILE
const getUserProfile = async (req, res) => {
  const { query } = req.params;
  try {
    let user;

    if (mongoose.Types.ObjectId.isValid(query)) {
      user = await User.findOne({ _id: query }).select('-password');
    } else {
      user = await User.findOne({ username: query }).select('-password');
    }

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log('Error in getUser: ', error.message);
  }
};

module.exports = {
  signupUser,
  loginUser,
  logoutUser,
  getSuggestedUsers,
  followUser,
  unfollowUser,
  getUser,
  updateUser,
  freezeUser,
  getUserProfile,
};
