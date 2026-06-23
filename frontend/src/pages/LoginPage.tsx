
// -----------------------------------------------------------------------------
// Arquivo: src/pages/LoginPage.tsx
// -----------------------------------------------------------------------------
import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { loginUser } from '../api/authService';
import { styles } from '../styles/appStyles';
import { LoginFormData } from '../types';
// -----------------------------------------------------------------------------

export const LoginPage: React.FC = () => {
    const [formData, setFormData] = useState<LoginFormData>({
        idCasa: '',
        Chave: '',
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
            const data = await loginUser(formData.idCasa, formData.Chave);
            auth?.login(data.token, data.idCasa, data.isReadOnly);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div style={styles.loginContainer}>
            <h2>Login no Sistema de Reservas</h2>
            <form onSubmit={handleSubmit} style={styles.form} autoComplete="off">
                {/* Campos ocultos para enganar o gerenciador de senhas do navegador e evitar o prompt de salvar */}
                <input type="text" name="fakeusernameremembered" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" />
                <input type="password" name="fakepasswordremembered" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" />

                <input type="text" name="idCasa" placeholder="ID-Casa" value={formData.idCasa} onChange={handleChange} style={styles.input} required autoComplete="nope" />
                <input type="password" name="Chave" placeholder="Chave" value={formData.Chave} onChange={handleChange} style={styles.input} required autoComplete="new-password" />
                <button type="submit" style={styles.button}>Login</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
        </div>
    );
};

