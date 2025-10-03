import React, { createContext, useContext, useState } from 'react';

// Tạo context
const AuthContext = createContext(null);

// Hook sử dụng AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth phải được dùng trong AuthProvider');
    }
    return context;
};

// Mock user data (demo)
const mockUsers = [
    { id: '1', name: 'John Smith', email: 'john@serviceauto.com', password: 'password', role: 'sc-staff', organization: 'AutoService Plus' },
    { id: '2', name: 'Mike Tech', email: 'mike@serviceauto.com', password: 'password', role: 'sc-technician', organization: 'AutoService Plus' },
    { id: '3', name: 'Sarah Wilson', email: 'sarah@evmotors.com', password: 'password', role: 'evm-staff', organization: 'EV Motors Corp' },
    { id: '4', name: 'David Admin', email: 'admin@evmotors.com', password: 'password', role: 'admin', organization: 'EV Motors Corp' }
];

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState(mockUsers);

    // Đăng nhập
    const login = (email, password) => {
        const foundUser = users.find(u => u.email === email && u.password === password);
        if (foundUser) {
            const { password: _, ...userWithoutPassword } = foundUser;
            setUser(userWithoutPassword);
            return true;
        }
        return false;
    };

    // Đăng xuất
    const logout = () => {
        setUser(null);
    };

    // Đăng ký
    const register = (userData) => {
        const exists = users.find(u => u.email === userData.email);
        if (exists) return false;

        const newUser = {
            id: Date.now().toString(),
            name: userData.name,
            email: userData.email,
            password: userData.password,
            role: userData.role,
            organization: userData.organization
        };

        setUsers(prev => [...prev, newUser]);

        const { password, ...userWithoutPassword } = newUser;
        setUser(userWithoutPassword);

        return true;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};
