const express = require('express');
const handleAuth = require('../middlewares/handleAuth');
const {
  createPost,
  deletePost,
  likePost,
  unlikePost,
  getPost,
  getUserPosts,
  replyToPost,
} = require('../controllers/postController');

const router = express.Router();

router.post('/create', handleAuth, createPost);
router.delete('/:id', handleAuth, deletePost);
router.put('/like/:id', handleAuth, likePost);
router.put('/unlike/:id', handleAuth, unlikePost);
router.put('/reply/:id', handleAuth, replyToPost);
router.get('/user/:username', getUserPosts);
router.get('/:id', getPost);

module.exports = router;
