import React, { useState } from 'react';
import { getSocket } from '../services/socketService';
import './TaskForm.css';

const TaskForm = ({ task, onClose }) => {
    const [formData, setFormData] = useState({
        title: task?.title || '',
        description: task?.description || '',
        status: task?.status || 'en cours'
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const url = task?._id 
                ? `http://localhost:5000/api/tasks/${task._id}`
                : 'http://localhost:5000/api/tasks';
            
            const response = await fetch(url, {
                method: task?._id ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to save task');
            
            const savedTask = await response.json();
            const socket = getSocket();
            socket.emit(task?._id ? 'updateTask' : 'newTask', savedTask);
            if (task?._id) {
                socket.emit('taskStatusUpdated', savedTask);
            }
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="task-form">
            {error && <div className="error">{error}</div>}
            <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Task title"
                required
            />
            <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Task description"
            />
            <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
                <option value="en cours">In Progress</option>
                <option value="terminé">Completed</option>
                <option value="annulé">Cancelled</option>
            </select>
            <button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (task?._id ? 'Update Task' : 'Create Task')}
            </button>
        </form>
    );
};

export default TaskForm;
