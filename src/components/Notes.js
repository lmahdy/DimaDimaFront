import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Notes = () => {
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState({ title: '', content: '' });

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/note');
            setNotes(response.data);
        } catch (error) {
            console.error('Error fetching notes', error);
        }
    };

    const handleCreateNote = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://127.0.0.1:8000/note/new', newNote);
            fetchNotes();
            setNewNote({ title: '', content: '' });
        } catch (error) {
            console.error('Error creating note', error);
        }
    };

    const handleDeleteNote = async (id) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/note/${id}`);
            fetchNotes();
        } catch (error) {
            console.error('Error deleting note', error);
        }
    };

    return (
        <div>
            <h2>Notes</h2>
            <form onSubmit={handleCreateNote}>
                <input
                    type="text"
                    placeholder="Title"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    required
                />
                <textarea
                    placeholder="Content"
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    required
                />
                <button type="submit">Create Note</button>
            </form>

            <h3>All Notes</h3>
            {notes.length > 0 ? (
                <ul>
                    {notes.map((note) => (
                        <li key={note.id}>
                            <h4>{note.title}</h4>
                            <p>{note.content}</p>
                            <button onClick={() => handleDeleteNote(note.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No notes available.</p>
            )}
        </div>
    );
};

export default Notes;
