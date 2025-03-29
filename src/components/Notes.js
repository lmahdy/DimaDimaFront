import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/notes.css';

const Notes = () => {
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState({ title: '', content: '', assignedTo: '' });
    const [editingNote, setEditingNote] = useState(null);
    const [error, setError] = useState('');
    const [users, setUsers] = useState([]);
    const [recommendedUser, setRecommendedUser] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const recognition = useRef(null);
    const navigate = useNavigate();

    const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
    const isAdmin = userRoles.includes('ROLE_ADMIN');

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
        fetchRecommendedUser();
    }, [navigate]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/users', getAuthHeader());
                setUsers(response.data);
            } catch (error) {
                handleError(error, 'fetching users');
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognition.current = new SpeechRecognition();
            recognition.current.continuous = true;
            recognition.current.interimResults = true;
            recognition.current.lang = 'en-US';

            recognition.current.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');

                if (event.results[0].isFinal) {
                    setNewNote(prev => ({
                        ...prev,
                        content: prev.content + ' ' + transcript
                    }));
                }
            };

            recognition.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
            };
        } else {
            console.warn('Speech recognition not supported in this browser');
        }
    }, []);

    const fetchNotes = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/note', getAuthHeader());
            setNotes(response.data);
        } catch (error) {
            handleError(error, 'fetching notes');
        }
    };

    const fetchRecommendedUser = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/users/recommended', getAuthHeader());
            setRecommendedUser(response.data);
            setNewNote(prev => ({
                ...prev,
                assignedTo: response.data.id
            }));
        } catch (error) {
            console.error('Error fetching recommended user:', error);
        }
    };

    const handleCreateNote = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://127.0.0.1:8000/note/new', newNote, getAuthHeader());
            fetchNotes();
            setNewNote({ title: '', content: '', assignedTo: recommendedUser?.id || '' });
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
        setEditingNote(note);
        setNewNote({ title: note.title, content: note.content, assignedTo: note.assignedTo?.id || '' });
    };

    const handleUpdateNote = async (e) => {
        e.preventDefault();
        if (!editingNote) return;

        try {
            await axios.put(`http://127.0.0.1:8000/note/${editingNote.id}`, newNote, getAuthHeader());
            fetchNotes();
            setEditingNote(null);
            setNewNote({ title: '', content: '', assignedTo: recommendedUser?.id || '' });
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

    const toggleRecording = () => {
        if (isRecording) {
            recognition.current.stop();
        } else {
            recognition.current.start();
        }
        setIsRecording(!isRecording);
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
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    required
                />
                
                <div className="voice-input-container">
                    <textarea
                        placeholder="Note content"
                        value={newNote.content}
                        onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                        required
                    />
                    <button 
                        type="button" 
                        onClick={toggleRecording}
                        className={`record-button ${isRecording ? 'recording' : ''}`}
                    >
                        {isRecording ? '⏹ Stop Recording' : '⏵ Start Recording'}
                    </button>
                </div>

                <select
                    value={newNote.assignedTo}
                    onChange={(e) => setNewNote({ ...newNote, assignedTo: e.target.value })}
                >
                    <option value="">Assign to...</option>
                    {recommendedUser && (
                        <option value={recommendedUser.id} style={{ fontWeight: 'bold' }}>
                            {recommendedUser.email} (Recommended)
                        </option>
                    )}
                    {users.map(user => (
                        <option key={user.id} value={user.id}>
                            {user.email}
                        </option>
                    ))}
                </select>
                
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
                                {note.assignedTo && <small>Assigned to: {note.assignedTo.email}</small>}
                                {(note.createdBy?.id === parseInt(localStorage.getItem('userId')) || isAdmin) && (
                                    <>
                                        <button onClick={() => handleEditNote(note)} className="edit-btn">Edit</button>
                                        <button onClick={() => handleDeleteNote(note.id)} className="delete-btn">Delete</button>
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
