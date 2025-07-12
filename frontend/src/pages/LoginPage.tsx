
// -----------------------------------------------------------------------------
// Arquivo: src/pages/LoginPage.tsx
// -----------------------------------------------------------------------------
import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { loginUser, registerUser } from '../api/authService';
import { styles } from '../styles/appStyles';
import { RegisterFormData } from '../types';
// -----------------------------------------------------------------------------

export const LoginPage: React.FC = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [formData, setFormData] = useState<RegisterFormData>({
        nomeCompleto: '', idCasa: '', email: '', senha: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const auth = useContext(AuthContext);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            if (isRegistering) {
                await registerUser(formData);
                setSuccess('Registo efetuado com sucesso! Por favor, faça o login.');
                setIsRegistering(false);
            } else {
                const data = await loginUser(formData.idCasa, formData.senha);
                auth?.login(data.token, data.idCasa);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div style={styles.loginContainer}>
            <h2>{isRegistering ? 'Registar Nova Conta' : 'Login no Sistema de Reservas'}</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                {isRegistering && (
                    <>
                        <input type="text" name="nomeCompleto" placeholder="Nome Completo" onChange={handleChange} style={styles.input} required />
                        <input type="email" name="email" placeholder="Email" onChange={handleChange} style={styles.input} required />
                    </>
                )}
                <input type="text" name="idCasa" placeholder="ID-Casa" onChange={handleChange} style={styles.input} required />
                <input type="password" name="senha" placeholder="Senha" onChange={handleChange} style={styles.input} required />
                <button type="submit" style={styles.button}>{isRegistering ? 'Registar' : 'Login'}</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <button onClick={() => setIsRegistering(!isRegistering)} style={styles.toggleButton}>
                {isRegistering ? 'Já tem uma conta? Faça o login' : 'Não tem uma conta? Registe-se'}
            </button>
        </div>
    );
};

