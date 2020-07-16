const express = require('express');
const router = express.Router();
const { create, list, listAllBlogsCategoriesTags, read, remove, update, photo, listRelated } = require('../controllers/blog');
const { requireSignin, adminMiddlemare } = require('../controllers/auth');

router.post('/blog', requireSignin, adminMiddlemare, create);
router.get('/blogs', list);
router.post('/blogs-categories-tags', listAllBlogsCategoriesTags);
router.get('/blog/:slug', read);
router.delete('/blog/:slug', requireSignin, adminMiddlemare, remove);
router.put('/blog/:slug', requireSignin, adminMiddlemare, update);
router.get('/blog/photo/:slug', photo);
router.post('/blogs/related', listRelated);

module.exports = router;