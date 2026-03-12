import { useState } from 'react';
import axios from 'axios';
import './ChangePasswordModal.css';

export default function ChangePasswordModal({ userId, onPasswordChanged }) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        if (newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/v1/users/${userId}/change-password`,
                { newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            localStorage.setItem('mustChangePassword', 'false');
            onPasswordChanged();
        } catch (err) {
            console.error('Error changing password:', err);
            setError('Error al cambiar la contraseña. Intente de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content change-password-modal">
                <h2>Actualización Obligatoria</h2>
                <p>Por seguridad, debes cambiar tu contraseña inicial antes de continuar.</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nueva Contraseña</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirmar Contraseña</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repite la contraseña"
                            required
                        />
                    </div>
                    <button type="submit" className="save-btn" disabled={loading}>
                        {loading ? 'Cambiando...' : 'Actualizar Contraseña'}
                    </button>
                </form>
            </div>
        </div>
    );
}
