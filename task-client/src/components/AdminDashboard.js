import React, { useState, useEffect } from 'react';
import { getSocket } from '../services/socketService';

const AdminDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTasks();
        const socket = getSocket();

        socket.on('taskCreated', (task) => {
            setTasks(prev => [task, ...prev]);
        });

        socket.on('taskAccepted', (updatedTask) => {
            setTasks(prev => prev.map(task => 
                task._id === updatedTask._id ? updatedTask : task
            ));
        });

        socket.on('taskRejected', (updatedTask) => {
            setTasks(prev => prev.map(task => 
                task._id === updatedTask._id ? updatedTask : task
            ));
        });

        socket.on('taskStatusUpdated', (updatedTask) => {
            setTasks(prev => prev.map(task => 
                task._id === updatedTask._id ? updatedTask : task
            ));
        });

        return () => {
            socket.off('taskCreated');
            socket.off('taskAccepted');
            socket.off('taskRejected');
            socket.off('taskStatusUpdated');
        };
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/tasks', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch tasks');
            const data = await response.json();
            setTasks(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (taskId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/tasks/${taskId}/accept`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error('Failed to accept task');
            const updatedTask = await response.json();
            setTasks(prev => prev.map(task => 
                task._id === updatedTask._id ? updatedTask : task
            ));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleReject = async (taskId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/tasks/${taskId}/reject`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error('Failed to reject task');
            const updatedTask = await response.json();
            setTasks(prev => prev.map(task => 
                task._id === updatedTask._id ? updatedTask : task
            ));
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div className="loading">Loading tasks...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="admin-dashboard">
            <h2>Admin Dashboard</h2>
            <div className="task-list">
                {tasks.map(task => (
                    <div key={task._id} className={`task-card ${task.status}`}>
                        <h3>{task.title}</h3>
                        <p>{task.description}</p>
                        <span className="status">{task.status}</span>
                        {task.status === 'pending' && (
                            <div className="task-actions">
                                <button onClick={() => handleAccept(task._id)}>Accept</button>
                                <button onClick={() => handleReject(task._id)}>Reject</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
