import React, { useEffect } from "react";

interface LoginProps {
    onClickLogin: () => void;
}

const LoginPage = ({ onClickLogin }: LoginProps) => {
    const loginButtonRef = React.createRef<HTMLButtonElement>();

    useEffect(() => {
        loginButtonRef.current?.click();
    }, []);

    return (
        <div
            className="flex items-center justify-center h-screen bg-gray-100"
        >
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-center text-xl font-bold text-gray-800 mb-4">
                    Welcome to Fuse!
                </h3>
                <p className="text-center text-gray-600 mb-6">
                    Please login to fully utilize Fuse features.
                </p>
                <button
                    ref={loginButtonRef}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 mb-4"
                    onClick={onClickLogin}
                >
                    Login
                </button>
            </div>
        </div>
    );
};

export default LoginPage;
