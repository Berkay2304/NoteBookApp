const authenticate = require("../middleware/auth.js");
const Note = require("../models/Note")
const express = require("express");
const router = express.Router();

router.post('/notes', authenticate, async (req, res) => {
    try {
        const { title, content } = req.body;
        const userId = req.user.id;  // veya req.user._id, token yapına göre
        if (!title || !content) return res.status(400).json({ error: "Başlık ve içerik gerekli." });

        const note = await Note.create({ user: userId, title, content });
        res.status(201).json({ message: "Note has been created.", note });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Note has not been created." });
    }
});

router.get('/notes', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const userNotes = await Note.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({ notes: userNotes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error has occured." });
  }
});

router.delete('/notes/:id', authenticate, async (req, res) => {
    const id = req.params.id;
    const userId = req.user.id;
    const note = await Note.findById(id);
    if(!note) return res.status(404).json({ error: "Note not found." });
    if(note.user.toString() !== userId) return res.status(403).json({ error: "Invalid Access." });
    await note.deleteOne();
    res.status(200).json({ message: "Note has been deleted successfully." });
});

router.put('/notes/:id', authenticate, async (req, res) => {
    const id = req.params.id;
    const userId = req.user.id;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required." });
    }

    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ error: "Note not found." });
    if (note.user.toString() !== userId) return res.status(403).json({ error: "Invalid Access." });

    note.title = title;
    note.content = content;
    await note.save();
    res.status(200).json({ message: "Note has been updated." });
});


module.exports = router;