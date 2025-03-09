import React, { useState, useEffect } from 'react';
import './UserProfile.css';

const UserProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        currentPassword: '',
        newPassword: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch profile');
            const data = await response.json();
            setProfile(data);
            setFormData({
                username: data.username,
                email: data.email,
                currentPassword: '',
                newPassword: ''
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error('Failed to update profile');
            const updatedProfile = await response.json();
            setProfile(updatedProfile);
            setEditing(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading profile...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="user-profile">
            {editing ? (
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        placeholder="Username"
                    />
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="Email"
                    />
                    <input
                        type="password"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                        placeholder="Current Password"
                    />
                    <input
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                        placeholder="New Password (optional)"
                    />
                    <button type="submit">Save Changes</button>
                    <button type="button" onClick={() => setEditing(false)}>Cancel</button>
                </form>
            ) : (
                <div className="profile-info">
                    <h2>{profile.username}</h2>
                    <p>{profile.email}</p>
                    <button onClick={() => setEditing(true)}>Edit Profile</button>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
