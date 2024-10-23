import React, { useState } from 'react';
import './LoginPage.css';
import { supabase } from '../supabase.jsx';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage('');

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setMessage(`Error: ${error.message}`);
        } else {
            localStorage.setItem('userEmail', email);
            // setMessage('Login successful!');
            window.location.href = '/dashboard';
        }
    };

    return (
        <div className='maint'>
            <div className="lcontainer">
                <h1>Login to Teletrack Admin</h1>
                <form onSubmit={handleLogin}>
                    <input 
                        type="email" 
                        placeholder="Email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                    <button className="lgbtn" type="submit">Login</button>
                </form>
                {message && <div id="message">{message}</div>}
            </div>
        </div>
    );
};

export default Login;


