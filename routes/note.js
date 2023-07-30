const express = require('express');
const router  = express.Router();
const Notes = require('../models/Notes'); // Mongoose model for notes
const { validationResult, body } = require('express-validator'); // Form validation of names and email etc.
const fetchUser = require('../middlewares/fetchuser')// Middleware to fetch user data from authToken

// ROUTE:1 - Fetch all notes. method GET. Login required. endpoint: api/notes/fetchallnotes
router.get('/fetchallnotes', fetchUser, async (req,res)=>{
    try {
        // Fetching all the notes of the user
        const notes = await Notes.find({user: req.user.id});
        res.json(notes)
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE:2 - Adding notes. method POST. Login required. endpoint: api/notes/addnote

// Validation format while adding notes
const notesValidation = [
    body('title', 'Enter a valid title').isLength({min: 3}),
    body('description', 'Enter a valid description').isLength({min: 5})
];

router.post('/addnote', fetchUser, notesValidation, async (req,res)=>{
    try {
        // Prevent empty values
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()}); 
        }
        // Adding a new note and saving to db
        const {title,description,tag} = req.body;
        const note = new Notes({
            title, description, tag, user: req.user.id
        })
        const saveNote = await note.save();
        res.json(saveNote);
    } catch(error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE:3 - Update existing notes. method PUT. Login required. endpoint: api/notes/updatenote/:id
router.put('/updatenote/:id', fetchUser, async (req,res)=>{
    try {
        // Data written in the new note
        const {title, description, tag} = req.body;
        const updatedNote = {};
        if(title){updatedNote.title = title};
        if(description){updatedNote.description = description};
        if(tag){updatedNote.tag = tag};

        // Search the note to be updated and update it
        // Checking valid id and user
        let note_for_update = await Notes.findById(req.params.id);
        if(!note_for_update){
            return res.status(404).send("Not Found");
        }
        if(note_for_update.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        // Updating the previous note with the updatedNote
        note_for_update = await Notes.findByIdAndUpdate(req.params.id, {$set: updatedNote}, {new: true});
        res.json({note_for_update});

    } catch(error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
})


// ROUTE:4 - Delete notes. method DELETE. Login required. endpoint: api/notes/deletenote/:id
router.delete('/deletenote/:id', fetchUser, async (req,res)=>{
    try {
        // Search the note to be deleted and delete it
        // Checking valid id and user
        let note_for_delete = await Notes.findById(req.params.id);
        if(!note_for_delete){
            return res.status(404).send("Not Found");
        }
        if(note_for_delete.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        // Deleting the note with respect to the given id
        note_for_delete = await Notes.findByIdAndDelete(req.params.id);
        res.json({"Success": "Successfully deleted the note", "Note": note_for_delete});

    } catch(error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
})


module.exports = router;
