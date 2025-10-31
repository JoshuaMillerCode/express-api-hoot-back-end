const express = require('express');
const router = express.Router();
const Hoot = require('../models/hoot');
const verifyToken = require('../middleware/verify-token');

router.use(verifyToken);

// Base Route for this controller - /hoots

// POST /hoots - Create
router.post('/', async (req, res) => {
  try {
    // Creating the relationship between the User and the Hoot
    req.body.author = req.user._id;
    const hoot = await Hoot.create(req.body);
    hoot._doc.author = req.user;
    res.status(201).json(hoot);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// GET /hoots - Index
router.get('/', async (req, res) => {
  try {
    const hoots = await Hoot.find({})
      .populate('author')
      .sort({ createdAt: 'desc' });
    res.status(200).json(hoots);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// GET /hoots/:hootId - Show
router.get('/:hootId', async (req, res) => {
  try {
    const hoot = await Hoot.findById(req.params.hootId).populate(
      'author comments.author'
    );
    res.status(200).json(hoot);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// PUT /hoots/:hootId - Update
router.put('/:hootId', async (req, res) => {
  try {
    const hoot = await Hoot.findById(req.params.hootId, 'author');

    if (!hoot.author.equals(req.user._id)) {
      return res.status(403).send("You're not allowed to do that! GO HOME");
    }

    const updatedHoot = await Hoot.findByIdAndUpdate(
      req.params.hootId,
      req.body,
      { new: true }
    );

    updatedHoot._doc.author = req.user;

    res.status(200).json(updatedHoot);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// DELETE /hoots/:hootId - Delete
router.delete('/:hootId', async (req, res) => {
  try {
    const hoot = await Hoot.findById(req.params.hootId, 'author');

    if (!hoot.author.equals(req.user._id)) {
      return res.status(403).send("You're not allowed to do that!");
    }

    const deletedHoot = await Hoot.findByIdAndDelete(req.params.hootId);
    res.status(200).json(deletedHoot);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// POST /hoots/:hootId/comments - Create Comment
router.post('/:hootId/comments', async (req, res) => {
  try {
    req.body.author = req.user._id;
    const hoot = await Hoot.findById(req.params.hootId);
    hoot.comments.push(req.body);
    await hoot.save();

    const newComment = hoot.comments[hoot.comments.length - 1];

    newComment._doc.author = req.user;

    res.status(200).json(newComment);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;
