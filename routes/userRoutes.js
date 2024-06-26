const express = require('express');
const {
  signupUser,
  loginUser,
  logoutUser,
  unfollowUser,
  followUser,
  updateUser,
  freezeUser,
  getUserProfile,
  getSuggestedUsers,
  getUser,
} = require('../controllers/userContoller');
const handleAuth = require('../middlewares/handleAuth');
const router = express.Router();

router.get('/profile/:query', getUserProfile);
router.get('/suggest', handleAuth, getSuggestedUsers);
router.get('/:id', handleAuth, getUser);
router.post('/signup', signupUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/freeze/:id', handleAuth, freezeUser);
router.post('/follow/:id', handleAuth, followUser);
router.post('/unfollow/:id', handleAuth, unfollowUser);
router.put('/update/:id', handleAuth, updateUser);

module.exports = router;
