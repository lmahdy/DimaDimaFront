import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/planning.css';

const Planning = () => {
    const [plannings, setPlannings] = useState([]);
    const [notes, setNotes] = useState([]);
    const [newPlanning, setNewPlanning] = useState({
        note_id: '',
        date_planifie: '',
        heure_debut: '',
        heure_fin: '',
        statut: 'planifié'
    });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();

    const getAuthHeader = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
            'Content-Type': 'application/json'
        }
    });

    useEffect(() => {
        if (!localStorage.getItem('jwtToken')) navigate('/login');

        const roles = JSON.parse(localStorage.getItem('userRoles') || '[]');
        setIsAdmin(roles.includes('ROLE_ADMIN'));
        setUserId(parseInt(localStorage.getItem('userId')));
        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        try {
          const [planningsRes, notesRes] = await Promise.all([
            axios.get('http://127.0.0.1:8000/planification', getAuthHeader())
              .catch(handle500),
            axios.get('http://127.0.0.1:8000/note', getAuthHeader())
          ]);
          setPlannings(planningsRes.data);
          setNotes(notesRes.data);
        } catch (error) {
          handleError(error, 'fetching data');
        }
      };
      
      const handle500 = (error) => {
        if (error.response?.status === 500) {
          navigate('/login');
        }
        throw error;
      };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingId
                ? `http://127.0.0.1:8000/planification/${editingId}`
                : 'http://127.0.0.1:8000/planification/new';

            const method = editingId ? 'put' : 'post';

            await axios[method](url, newPlanning, getAuthHeader());
            fetchData();
            resetForm();
        } catch (error) {
            handleError(error, 'saving planning');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/planification/${id}`, getAuthHeader());
            fetchData();
        } catch (error) {
            handleError(error, 'deleting planning');
        }
    };

    const handleEdit = (planning) => {
        setEditingId(planning.id);
        setNewPlanning({
            note_id: planning.note.id,
            date_planifie: planning.date_planifie.split('T')[0],
            heure_debut: planning.heure_debut.substring(0, 5),
            heure_fin: planning.heure_fin.substring(0, 5),
            statut: planning.statut
        });
    };

    const resetForm = () => {
        setEditingId(null);
        setNewPlanning({
            note_id: '',
            date_planifie: '',
            heure_debut: '',
            heure_fin: '',
            statut: 'planifié'
        });
    };

    const handleError = (error, action) => {
        if (error.response?.status === 401) navigate('/login');
        setError(`Error ${action}: ${error.message}`);
        setTimeout(() => setError(''), 3000);
    };

    const handleNotePreview = (noteId) => {
        const note = notes.find(n => n.id === noteId);
        setSelectedNote(note);
        setIsModalOpen(true);
    };

    const toggleSave = async (planningId) => {
        try {
            await axios.post(
                `http://127.0.0.1:8000/planification/${planningId}/toggle-save`,
                {},
                getAuthHeader()
            );
            setPlannings(prev => prev.map(p =>
                p.id === planningId ? { ...p, isSaved: !p.isSaved } : p
            ));
        } catch (error) {
            handleError(error, 'toggling save');
        }
    };

    const renderNoteSelection = () => {
        const filteredNotes = isAdmin
            ? notes
            : notes.filter(note => note.createdBy?.id === userId);

        return (
            <div className="custom-dropdown">
                <div
                    className="dropdown-header"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                    {newPlanning.note_id
                        ? notes.find(n => n.id === newPlanning.note_id)?.title
                        : 'Select Note'}
                </div>
                {dropdownOpen && (
                    <div className="dropdown-list">
                        {filteredNotes.map(note => (
                            <div
                                key={note.id}
                                className="dropdown-item"
                                onClick={() => {
                                    setNewPlanning(prev => ({ ...prev, note_id: note.id }));
                                    setDropdownOpen(false);
                                }}
                            >
                                <span className="note-title">{note.title}</span>
                                <button
                                    className="preview-button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleNotePreview(note.id);
                                    }}
                                    title="Preview note"
                                >
                                    👁️
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderNoteModal = () => (
        isModalOpen && (
            <div className="note-modal-overlay">
                <div className="note-modal-content">
                    <div className="modal-header">
                        <h3>Note Preview</h3>
                        <button className="close-button" onClick={() => setIsModalOpen(false)}>&times;</button>
                    </div>
                    <div className="modal-body">
                        {selectedNote && (
                            <>
                                <h4>{selectedNote.title}</h4>
                                <p className="note-content">{selectedNote.content}</p>
                                <div className="note-meta">
                                    <p><strong>Created by:</strong> {selectedNote.createdBy?.email}</p>
                                    <p><strong>Assigned to:</strong> {selectedNote.assignedTo?.email || 'None'}</p>
                                    <p><strong>Date:</strong> {new Date(selectedNote.date).toLocaleDateString()}</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        )
    );

    return (
        <div className="planning-container">
            <h2>Planning Management</h2>
            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit} className="planning-form">
                {renderNoteSelection()}

                <input
                    type="date"
                    value={newPlanning.date_planifie}
                    onChange={e => setNewPlanning({ ...newPlanning, date_planifie: e.target.value })}
                    required
                />

                <input
                    type="time"
                    value={newPlanning.heure_debut}
                    onChange={e => setNewPlanning({ ...newPlanning, heure_debut: e.target.value })}
                    required
                />

                <input
                    type="time"
                    value={newPlanning.heure_fin}
                    onChange={e => setNewPlanning({ ...newPlanning, heure_fin: e.target.value })}
                    required
                />

                <select
                    value={newPlanning.statut}
                    onChange={e => setNewPlanning({ ...newPlanning, statut: e.target.value })}
                >
                    <option value="planifié">Planifié</option>
                    <option value="en cours">En Cours</option>
                    <option value="terminé">Terminé</option>
                </select>

                <div className="form-buttons">
                    <button type="submit">{editingId ? 'Update' : 'Create'}</button>
                    {editingId && <button type="button" onClick={resetForm}>Cancel</button>}
                </div>
            </form>

            {renderNoteModal()}

            <div className="planning-list">
                {plannings.map(planning => (
                    <div key={planning.id} className="planning-card">
                        <h3>{planning.note.title}</h3>
                        <p>{planning.note.content}</p>

                        <div className="user-info">
                            <small>Created by: {planning.note.createdBy?.email}</small><br />
                            <small>Assigned to: {planning.note.assignedTo?.email || 'None'}</small>
                        </div>

                        <div className="planning-details">
                            <span>Date: {new Date(planning.date_planifie).toLocaleDateString()}</span>
                            <span>Start: {planning.heure_debut.substring(0, 5)}</span>
                            <span>End: {planning.heure_fin.substring(0, 5)}</span>
                            <span className={`status ${planning.statut.replace(' ', '-')}`}>{planning.statut}</span>
                        </div>

                        <div className="actions">
                            <button onClick={() => toggleSave(planning.id)}>
                                {planning.isSaved ? 'Unsave' : 'Save'}
                            </button>
                            <button onClick={() => handleEdit(planning)}>Edit</button>
                            <button onClick={() => handleDelete(planning.id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Planning;
