import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuestionnaireList } from '../components/admin/QuestionnaireList';

interface Admin {
    username: string;
    name: string;
}

export const AdminDashboard: React.FC = () => {
    const [admin, setAdmin] = useState<Admin | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if admin is logged in
        const savedAdmin = localStorage.getItem('paramount_admin_session');
        if (savedAdmin) {
            try {
                const adminData = JSON.parse(savedAdmin);
                setAdmin(adminData);
            } catch (error) {
                console.error('Failed to parse saved admin session:', error);
                localStorage.removeItem('paramount_admin_session');
                navigate('/admin');
            }
        } else {
            navigate('/admin');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('paramount_admin_session');
        navigate('/admin');
    };

    if (!admin) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-900">
                                Paramount Launchpad - Admin Panel
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                                Welcome, {admin.name}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="text-sm text-gray-600 hover:text-gray-900"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>


            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <QuestionnaireList />
            </main>
        </div>
    );
};
