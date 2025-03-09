import React, { useState, useEffect } from 'react';
import { getSocket } from '../services/socketService';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0
    });

    useEffect(() => {
        // Fetch initial statistics
        fetchStats();

        // Listen for task updates
        let socket;
        try {
            socket = getSocket();
        } catch (error) {
            console.error(error);
            return;
        }

        socket.on('taskUpdated', () => fetchStats());
        socket.on('taskCreated', () => fetchStats());
        socket.on('taskDeleted', () => fetchStats());
        socket.on('taskStatusUpdated', () => fetchStats());

        return () => {
            socket.off('taskUpdated');
            socket.off('taskCreated');
            socket.off('taskDeleted');
            socket.off('taskStatusUpdated');
        };
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/tasks/stats', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    return (
        <div className="dashboard">
            <h2>Dashboard</h2>
            <div className="stats-grid">
                <div className="stat-card total">
                    <h3>Total Tasks</h3>
                    <p>{stats.total}</p>
                </div>
                <div className="stat-card in-progress">
                    <h3>In Progress</h3>
                    <p>{stats.inProgress}</p>
                </div>
                <div className="stat-card completed">
                    <h3>Completed</h3>
                    <p>{stats.completed}</p>
                </div>
                <div className="stat-card cancelled">
                    <h3>Cancelled</h3>
                    <p>{stats.cancelled}</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
