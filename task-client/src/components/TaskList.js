import React, { useState, useEffect } from 'react';
import { getSocket } from '../services/socketService';
import './TaskList.css';

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [newTask, setNewTask] = useState({ title: '', description: '' });

    // Fetch tasks from API
    useEffect(() => {
        fetchTasks();
        const socket = getSocket();

        socket.on('taskCreated', (task) => {
            setTasks(prev => {
                if (!prev.some(t => t._id === task._id)) {
                    return [task, ...prev];  // Only add the task if it's not already in the list
                }
                return prev;
            });
        });

        socket.on('taskUpdated', (updatedTask) => {
            setTasks(prev => prev.map(task =>
                task._id === updatedTask._id ? updatedTask : task
            ));
        });

        socket.on('taskDeleted', (taskId) => {
            setTasks(prev => prev.filter(task => task._id !== taskId));
        });

        socket.on('taskStatusUpdated', (updatedTask) => {
            setTasks(prev => prev.map(task =>
                task._id === updatedTask._id ? updatedTask : task
            ));
        });

        // Cleanup the socket listeners on component unmount
        return () => {
            socket.off('taskCreated');
            socket.off('taskUpdated');
            socket.off('taskDeleted');
            socket.off('taskStatusUpdated');
        };
    }, []);

    // Fetch tasks function
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

    // Handle adding a new task
    const handleAddTask = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newTask)
            });
            if (!response.ok) throw new Error('Failed to add task');
            const task = await response.json();
            setTasks(prev => {
                if (!prev.some(t => t._id === task._id)) {
                    return [task, ...prev];  // Only add the task if it's not already in the list
                }
                return prev;
            });
            setNewTask({ title: '', description: '' });
        } catch (err) {
            setError(err.message);
        }
    };

    // Handle form changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewTask(prev => ({ ...prev, [name]: value }));
    };

    // Filter and sort tasks
    const filteredAndSortedTasks = tasks
        .filter(task => filter === 'all' ? true : task.status === filter)
        .sort((a, b) => {
            if (sortBy === 'date') return new Date(b.createdAt) - new Date(a.createdAt);
            return a.title.localeCompare(b.title);
        });

    // Handle autofocus
    useEffect(() => {
        const titleInput = document.querySelector('input[name="title"]');
        if (titleInput) {
            titleInput.focus();
        }
    }, []); // This ensures autofocus is triggered after component mounts

    if (loading) return <div className="loading">Loading tasks...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="task-list">
            <div className="task-controls">
                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="all">All Tasks</option>
                    <option value="en cours">In Progress</option>
                    <option value="terminé">Completed</option>
                    <option value="annulé">Cancelled</option>
                </select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="date">Sort by Date</option>
                    <option value="title">Sort by Title</option>
                </select>
            </div>
            <h2>Tasks</h2>
            <form onSubmit={handleAddTask} className="task-form">
                <input
                    type="text"
                    name="title"
                    value={newTask.title}
                    onChange={handleChange}
                    placeholder="Task title"
                    required
                />
                <textarea
                    name="description"
                    value={newTask.description}
                    onChange={handleChange}
                    placeholder="Task description"
                />
                <button type="submit">Add Task</button>
            </form>
            {filteredAndSortedTasks.map(task => (
                <div key={task._id} className={`task-card ${task.status}`}>
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
                    <span className="status">{task.status}</span>
                </div>
            ))}
        </div>
    );
};

export default TaskList;
