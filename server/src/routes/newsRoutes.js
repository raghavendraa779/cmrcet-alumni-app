const express = require('express');
const router = express.Router();
const { 
  getNews, createNews, updateNews, deleteNews, 
  pinNews, toggleLike, addComment, deleteComment 
} = require('../controllers/newsController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getNews).post(protect, createNews);
router.route('/:id').put(protect, updateNews).delete(protect, deleteNews);
router.put('/:id/pin', protect, pinNews);
router.put('/:id/like', protect, toggleLike);
router.post('/:id/comment', protect, addComment);
router.delete('/:id/comment/:commentId', protect, deleteComment);

module.exports = router;
