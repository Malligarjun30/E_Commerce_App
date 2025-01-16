import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://127.0.0.1:8000/api'; // Backend API base URL

function Registration() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/register/`, {
                username,
                email,
                password,
            });
            alert('Registration successful!');
            navigate('/'); // Redirect to login page
        } catch (err) {
            if (err.response && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError('An unexpected error occurred.');
            }
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleRegister} style={styles.form}>
                <h2 style={styles.heading}>Register</h2>
                {error && <p style={styles.error}>{error}</p>}
                <label style={styles.label}>Username:</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={styles.input}
                    required
                />
                <label style={styles.label}>Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                <button type="submit" style={styles.registerButton}>
                    Register
                </button>
                <p style={styles.loginText}>
                    Already have an account?{' '}
                    <span
                        onClick={() => navigate('/')}
                        style={styles.loginLink}
                    >
                        Login here
                    </span>
                </p>
            </form>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width:'100vw',
        // backgroundColor:'green',
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
    registerButton: {
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
    loginText: {
        textAlign: 'center',
        color: 'red',
        fontSize:'18px'
    },
    loginLink: {
        color: 'black',
        cursor: 'pointer',
        textDecoration: 'underline',
    },
};

export default Registration;
