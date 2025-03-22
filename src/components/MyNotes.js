import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/notes.css';

const MyNotes = () => {
    const [notes, setNotes] = React.useState([]);
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!localStorage.getItem('jwtToken')) navigate('/login');
        fetchNotes();
    }, [navigate]);

    const fetchNotes = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/my-notes', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
                }
            });
            setNotes(response.data);
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    };

    return (
        <div className="notes-container">
            <h2>My Notes</h2>
            <div className="notes-list">
                {notes.length > 0 ? (
                    notes.map(note => (
                        <div key={note.id} className="note-card">
                            <h3>{note.title}</h3>
                            <p>{note.content}</p>
                            <div className="note-meta">
                                <span>Created by: {note.createdBy?.email}</span>
                                <span>Assigned to: {note.assignedTo?.email || 'None'}</span>
                                <span>Date: {new Date(note.date).toLocaleDateString()}</span>
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

export default MyNotes;
