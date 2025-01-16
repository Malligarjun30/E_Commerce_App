import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://127.0.0.1:8000/api'; // Backend API base URL

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_BASE_URL}/login/`, {
                username,
                password,
            });

            document.cookie = `access=${response.data.access}; path=/;`;
            document.cookie = `refresh=${response.data.refresh}; path=/;`;

            alert('Login successful!');

            navigate('/home');
        } catch (err) {
            if (err.response && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError('An unexpected error occurred.');
            }
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleLogin} style={styles.form}>
                <h2 style={styles.heading}>Login</h2>
                {error && <p style={styles.error}>{error}</p>}
                <label style={styles.label}>Username:</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={styles.input}
                    required
                />
                <label style={styles.label}>Password:</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.input}
                    required
                />
                <button type="submit" style={styles.loginButton}>
                    Login
                </button>
                <p style={styles.registerText}>
                    Don't have an account?{' '}
                    <span
                        onClick={() => navigate('/register')}
                        style={styles.registerLink}
                    >
                        Register here
                    </span>
                </p>
            </form>
        </div>
    );
}

const styles = {
    container: {
        display: 'grid',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width:'100vw',
        // backgroundColor: 'green',
    },
    form: {
        width: '400px',
        padding: '50px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: 'yellow',
        boxShadow: '5px 5px 5px 5px rgb(73, 73, 243)',
    },
    heading: {
        textAlign: 'center',
        marginBottom: '20px',
        color: 'black',
        fontSize:'35px'
    },
    label: {
        marginBottom: '10px',
        display: 'block',
        color: 'black',
        fontWeight: 'bold',
    },
    input: {
        width: '95%',
        padding: '15px',
        marginBottom: '15px',
        border: '1px solid #ccc',
        borderRadius: '10px',
        fontSize: '14px',
    },
    loginButton: {
        width: '100%',
        padding: '15px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '20px',
        fontWeight: 'bold',
        marginBottom: '10px',
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginBottom: '15px',
    },
    registerText: {
        textAlign: 'center',
        color: 'red',
        fontSize:'18px'
    },
    registerLink: {
        color: 'black',
        cursor: 'pointer',
        textDecoration: 'underline',
    },
};

export default Login;
