// src/components/MySavedPlanning.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/planning.css';

const MySavedPlanning = () => {
    const [plannings, setPlannings] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const getAuthHeader = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
        }
    });

    useEffect(() => {
        if (!localStorage.getItem('jwtToken')) navigate('/login');

        const fetchSaved = async () => {
            try {
                const response = await axios.get(
                    'http://127.0.0.1:8000/planification/my-saved-planification',
                    getAuthHeader()
                );
                setPlannings(response.data);
            } catch (error) {
                setError('Error fetching saved plannings');
            }
        };
        fetchSaved();
    }, [navigate]);

    const toggleSave = async (planningId) => {
        try {
            await axios.post(
                `http://127.0.0.1:8000/planification/${planningId}/toggle-save`,
                {},
                getAuthHeader()
            );
            // Optimistic update with proper state management
            setPlannings(prev => prev.filter(p => p.id !== planningId));
        } catch (error) {
            setError('Error updating saved status');
            // Consider refetching data here to ensure sync
        }
    };

    return (
        <div className="planning-container">
            <h2>My Saved Planifications</h2>
            {error && <div className="error">{error}</div>}
            
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
                                Unsave
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MySavedPlanning;
