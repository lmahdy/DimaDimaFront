import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/planning.css';

const MyPlanning = () => {
    const [plannings, setPlannings] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const getAuthHeader = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
            'Content-Type': 'application/json'
        }
    });

    useEffect(() => {
        if (!localStorage.getItem('jwtToken')) navigate('/login');
        fetchMyPlannings();
    }, [navigate]);

    const fetchMyPlannings = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/planification/my-planification', getAuthHeader());
            setPlannings(response.data);
        } catch (error) {
            handleError(error, 'fetching your plannings');
        }
    };

    const handleError = (error, action) => {
        if (error.response?.status === 401) navigate('/login');
        setError(`Error ${action}: ${error.message}`);
        setTimeout(() => setError(''), 3000);
    };

    return (
        <div className="planning-container">
            <h2>My Plannings</h2>
            {error && <div className="error">{error}</div>}

            <div className="planning-list">
                {plannings.length > 0 ? (
                    plannings.map(planning => (
                        <div key={planning.id} className="planning-card">
                            <h3>{planning.note.title}</h3>
                            <p>{planning.note.content}</p>

                            <div className="planning-details">
                                <span>Date: {new Date(planning.date_planifie).toLocaleDateString()}</span>
                                <span>Start: {planning.heure_debut.substring(0, 5)}</span>
                                <span>End: {planning.heure_fin.substring(0, 5)}</span>
                                <span className={`status ${planning.statut.replace(' ', '-')}`}>{planning.statut}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No plannings assigned to you.</p>
                )}
            </div>
        </div>
    );
};

export default MyPlanning;
