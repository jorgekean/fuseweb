import React, { ReactNode } from 'react';
import Header from './Header';
import Navigation from './Navigation';

interface AdminLayoutProps {
    children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-700 text-fusedarktext">
            {/* Left Navigation */}
            <Navigation />
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <Header />
                {/* Main Content */}
                <main className="p-4 bg-gray-100 dark:bg-gray-700 flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
