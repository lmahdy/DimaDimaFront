import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/notes.css';


const Notes = () => {
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState({ title: '', content: '' });
    const [editingNote, setEditingNote] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const getAuthHeader = () => {
        const token = localStorage.getItem('jwtToken');
        return {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
    };

    useEffect(() => {
        if (!localStorage.getItem('jwtToken')) {
            navigate('/login');
        }
        fetchNotes();
    }, [navigate]);

    const fetchNotes = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/note', getAuthHeader());
            setNotes(response.data);
        } catch (error) {
            handleError(error, 'fetching notes');
        }
    };

    const handleCreateNote = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://127.0.0.1:8000/note/new', newNote, getAuthHeader());
            fetchNotes();
            setNewNote({ title: '', content: '' });
        } catch (error) {
            handleError(error, 'creating note');
        }
    };

    const handleDeleteNote = async (id) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/note/${id}`, getAuthHeader());
            fetchNotes();
        } catch (error) {
            handleError(error, 'deleting note');
        }
    };

    const handleEditNote = (note) => {
        setEditingNote(note); // Set the note to be edited
        setNewNote({ title: note.title, content: note.content });
    };

    const handleUpdateNote = async (e) => {
        e.preventDefault();
        if (!editingNote) return;

        try {
            await axios.put(`http://127.0.0.1:8000/note/${editingNote.id}`, newNote, getAuthHeader());
            fetchNotes();
            setEditingNote(null);
            setNewNote({ title: '', content: '' });
        } catch (error) {
            handleError(error, 'updating note');
        }
    };

    const handleError = (error, action) => {
        const status = error.response?.status;
        if (status === 401) {
            navigate('/login');
        } else if (status === 403) {
            setError('You can only modify your own notes');
        } else {
            setError(`Error ${action}: ${error.message}`);
        }
        setTimeout(() => setError(''), 3000);
    };

    return (
        <div className="notes-container">
            <h2>Notes</h2>
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={editingNote ? handleUpdateNote : handleCreateNote} className="note-form">
                <input
                    type="text"
                    placeholder="Note title"
                    value={newNote.title}
                    onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                    required
                />
                <textarea
                    placeholder="Note content"
                    value={newNote.content}
                    onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                    required
                />
                <button type="submit">{editingNote ? 'Update Note' : 'Create Note'}</button>
                {editingNote && <button onClick={() => setEditingNote(null)}>Cancel</button>}
            </form>

            <div className="notes-list">
                {notes.length > 0 ? (
                    notes.map(note => (
                        <div key={note.id} className="note-card">
                            <h3>{note.title}</h3>
                            <p>{note.content}</p>
                            <div className="note-footer">
                                <small>Created by: {note.createdBy?.email}</small>
                                {note.createdBy?.id === parseInt(localStorage.getItem('userId')) && (
                                    <>
                                        <button onClick={() => handleEditNote(note)} className="edit-btn">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDeleteNote(note.id)} className="delete-btn">
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No notes available</p>
                )}
            </div>
        </div>
    );
};

export default Notes;
