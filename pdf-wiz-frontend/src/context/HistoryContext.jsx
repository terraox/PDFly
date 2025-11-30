import React, { createContext, useContext, useState, useEffect } from 'react';

const HistoryContext = createContext();

export const useHistory = () => {
    const context = useContext(HistoryContext);
    if (!context) {
        throw new Error('useHistory must be used within a HistoryProvider');
    }
    return context;
};

export const HistoryProvider = ({ children }) => {
    const [history, setHistory] = useState([]);

    // Load history from localStorage on mount
    useEffect(() => {
        const savedHistory = localStorage.getItem('pdfly_history');
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error('Failed to parse history', e);
            }
        }
    }, []);

    // Save history to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('pdfly_history', JSON.stringify(history));
    }, [history]);

    const addToHistory = (item) => {
        const newItem = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            ...item, // Expected: fileName, toolName, status, originalSize, etc.
        };

        setHistory(prev => [newItem, ...prev].slice(0, 50)); // Keep last 50 items
    };

    const clearHistory = () => {
        setHistory([]);
    };

    const removeHistoryItem = (id) => {
        setHistory(prev => prev.filter(item => item.id !== id));
    };

    return (
        <HistoryContext.Provider value={{ history, addToHistory, clearHistory, removeHistoryItem }}>
            {children}
        </HistoryContext.Provider>
    );
};
