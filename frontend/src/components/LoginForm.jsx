import React, { useState } from 'react';
import authService from '../services/authService';
import { useLanguage } from '../context/LanguageContext';

const LoginForm = ({ role, onLogin, onForgotPassword }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('CREDENTIALS'); // CREDENTIALS, OTP
    const [message, setMessage] = useState('');
    const { t } = useLanguage();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            if (step === 'CREDENTIALS') {
                if (role === 'STUDENT') {
                    const data = await authService.login(role, email, password);
                    onLogin(data.role || 'STUDENT', data._id, data.token);
                } else if (role === 'ADMIN' || role === 'WARDEN') {
                    const data = await authService.login('ADMIN', email, password); // Use 'ADMIN' endpoint for both
                    onLogin(data.role || 'ADMIN', data._id, data.token);
                }
            }
        } catch (error) {
            setMessage(error.message || 'Login Failed');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <input
                    type="email"
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            {step === 'CREDENTIALS' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                    <input
                        type="password"
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="flex justify-end mt-1">
                        <button type="button" onClick={onForgotPassword} className="text-xs text-indigo-600 hover:underline dark:text-indigo-400">
                            Forgot Password?
                        </button>
                    </div>
                </div>
            )}

            {step === 'OTP' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enter OTP</label>
                    <input
                        type="text"
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                </div>
            )}

            {message && <p className="text-red-500 text-sm text-center">{message}</p>}

            <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 font-medium transition-colors"
            >
                {step === 'CREDENTIALS' ? 'Login' : 'Verify OTP'}
            </button>
        </form>
    );
};

export default LoginForm;
