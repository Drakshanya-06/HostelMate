const API_URL = '/api/auth';

export const authService = {
    async register(userData) {
        // Only students register publicly
        const response = await fetch('/api/student/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            throw new Error(`Unexpected server response: ${text.substring(0, 100)}`);
        }

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Registration failed');
        return data;
    },

    async verifyOtp(email, otp) {
        // Assuming student verification for now
        const response = await fetch('/api/student/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp })
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            throw new Error(`Unexpected server response: ${text.substring(0, 100)}`);
        }

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Verification failed');
        return data;
    },

    async login(role, email, password) {
        const endpoint = role === 'STUDENT' ? '/api/student/login' : '/api/admin/login';

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            throw new Error(`Unexpected server response: ${text.substring(0, 100)}`);
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        return data; // Returns user object + token
    },

    async forgotPassword(email) {
        const response = await fetch(`${API_URL}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            throw new Error(`Unexpected server response: ${text.substring(0, 100)}`);
        }

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to send reset OTP');
        }
        return data;
    },

    async verifyResetOtp(email, otp) {
        const response = await fetch(`${API_URL}/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            throw new Error(`Unexpected server response: ${text.substring(0, 100)}`);
        }

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'OTP verification failed');
        }
        return data;
    },

    async resetPassword(resetData) {
        const response = await fetch(`${API_URL}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resetData),
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            throw new Error(`Unexpected server response: ${text.substring(0, 100)}`);
        }

        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(responseData.message || 'Password reset failed');
        }
        return responseData;
    }
};

export default authService;
