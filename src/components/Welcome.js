// components/Welcome.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/welcome.css';

const Welcome = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    const getAuthHeader = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
        }
    });

    const fetchNotifications = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/notifications', getAuthHeader());
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.put(`http://127.0.0.1:8000/notifications/${id}/read`, {}, getAuthHeader());
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    useEffect(() => {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
            navigate('/login');
        } else {
            setEmail(userEmail);
            fetchNotifications();
        }
    }, [navigate]);

    return (
        <div>
            <h2>Welcome</h2>
            <p>Hello Mr. {email}</p>
            
            <div className="notification-container">
                <button 
                    className="notification-toggle"
                    onClick={() => setShowNotifications(!showNotifications)}
                >
                    Notifications ({notifications.length})
                </button>
                
                {showNotifications && (
                    <div className="notification-dropdown">
                        {notifications.length > 0 ? (
                            notifications.map(notification => (
                                <div 
                                    key={notification.id} 
                                    className="notification-item"
                                    onClick={() => {
                                        markAsRead(notification.id);
                                        navigate(`/planification/${notification.planning.id}`);
                                    }}
                                >
                                    <div className="notification-message">{notification.message}</div>
                                    <small>{new Date(notification.createdAt).toLocaleString()}</small>
                                </div>
                            ))
                        ) : (
                            <div className="notification-empty">No new notifications</div>
                        )}
                    </div>
                )}
            </div>

            <div className="dashboard-buttons">
                <button onClick={() => navigate('/notes')}>All Notes</button>
                <button onClick={() => navigate('/my-notes')}>My Notes</button>
                <button onClick={() => navigate('/planification')}>All Planning</button>
                <button onClick={() => navigate('/my-planification')}>My Planning</button>
            </div>
        </div>
    );
};

export default Welcome;