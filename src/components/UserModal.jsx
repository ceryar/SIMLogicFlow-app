import { useState, useEffect } from 'react';
import axios from 'axios';
import './UserModal.css';

export default function UserModal({ isOpen, onClose, onSuccess, editUser = null, currentUserRole = '' }) {
    const initialFormState = {
        firstName: '',
        middleName: '',
        lastname: '',
        secondlasname: '',
        email: '',
        password: '',
        documentNumber: '',
        roleId: 4, // Default Estudiante
        documentTypeId: 1, // Default Cedula
        active: true
    };

    const roleMap = {
        1: 'ADMINISTRADOR',
        2: 'COORACAD',
        3: 'TECNICO',
        4: 'ESTUDIANTE'
    };

    const docTypeMap = {
        1: 'CEDULA',
        2: 'PASAPORTE'
    };

    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [roles, setRoles] = useState([]);
    const [documentTypes, setDocumentTypes] = useState([]);

    // Populate form when editUser changes or modal opens
    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const [rolesRes, docTypesRes] = await Promise.all([
                        axios.get('/api/v1/roles', { headers: { Authorization: `Bearer ${token}` } }),
                        axios.get('/api/v1/document-types', { headers: { Authorization: `Bearer ${token}` } })
                    ]);
                    setRoles(rolesRes.data);
                    setDocumentTypes(docTypesRes.data);
                } catch (err) {
                    console.error('Error fetching modal data:', err);
                }
            };
            fetchData();

            if (editUser) {
                setFormData({
                    firstName: editUser.firstName || '',
                    middleName: editUser.middleName || '',
                    lastname: editUser.lastname || '',
                    secondlasname: editUser.secondlasname || '',
                    email: editUser.email || '',
                    password: '', // Don't pre-fill password for security
                    documentNumber: editUser.documentNumber || '',
                    roleId: editUser.role?.id || 4,
                    documentTypeId: editUser.documentType?.id || 1,
                    active: editUser.active !== undefined ? editUser.active : true
                });
            } else {
                setFormData(initialFormState);
            }
            setError(null);
        }
    }, [isOpen, editUser]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const isEdit = !!editUser;

            // Ensure numeric IDs are sent as numbers
            const payload = {
                ...formData,
                roleId: parseInt(formData.roleId, 10),
                documentTypeId: parseInt(formData.documentTypeId, 10)
            };

            // If editing and password is empty, remove it from payload
            if (isEdit && !payload.password) {
                delete payload.password;
            }

            let response;
            let resultData;

            if (isEdit) {
                response = await axios.put(`/api/v1/users/${editUser.id}`, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // If API returns no content (204 or empty 200), reconstruct object for UI update
                if (!response.data || Object.keys(response.data).length === 0) {
                    resultData = {
                        ...payload,
                        id: editUser.id,
                        role: { id: payload.roleId, name: roleMap[payload.roleId] },
                        documentType: { id: payload.documentTypeId, name: docTypeMap[payload.documentTypeId] }
                    };
                } else {
                    resultData = response.data;
                }
            } else {
                response = await axios.post('/api/v1/users', payload, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                resultData = response.data;
            }

            onSuccess(resultData, isEdit);
            onClose();
            setFormData(initialFormState);
        } catch (err) {
            console.error('Error saving user:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
            setError(`Failed to ${editUser ? 'update' : 'create'} user: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{editUser ? 'Edit User' : 'Create New User'}</h3>
                    <button className="btn-close" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {error && <div className="modal-error">{error}</div>}

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="firstName">First Name *</label>
                            <input type="text" id="firstName" name="firstName" required value={formData.firstName} onChange={handleChange} placeholder="John" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="middleName">Middle Name</label>
                            <input type="text" id="middleName" name="middleName" value={formData.middleName} onChange={handleChange} placeholder="Optional" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="lastname">Last Name *</label>
                            <input type="text" id="lastname" name="lastname" required value={formData.lastname} onChange={handleChange} placeholder="Doe" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="secondlasname">Second Last Name</label>
                            <input type="text" id="secondlasname" name="secondlasname" value={formData.secondlasname} onChange={handleChange} placeholder="Optional" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="documentTypeId">Document Type *</label>
                            <select id="documentTypeId" name="documentTypeId" required value={formData.documentTypeId} onChange={handleChange}>
                                {documentTypes.map(type => (
                                    <option key={type.id} value={type.id}>{type.name} ({type.id})</option>
                                ))}
                                {documentTypes.length === 0 && (
                                    <>
                                        <option value={1}>Cédula (1)</option>
                                        <option value={2}>Pasaporte (2)</option>
                                    </>
                                )}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="documentNumber">Document Number *</label>
                            <input type="text" id="documentNumber" name="documentNumber" required value={formData.documentNumber} onChange={handleChange} placeholder="1111739898" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email *</label>
                            <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} placeholder="john@email.com" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">
                                {editUser ? 'Cambiar Contraseña (Opcional)' : 'Contraseña (Automática)'}
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder={editUser ? "Dejar en blanco para mantener" : "Generación automática [N...D...A]"}
                                disabled={!editUser}
                                title={!editUser ? "La contraseña se genera automáticamente con la primera letra del nombre, el documento y la primera del apellido" : ""}
                            />
                            {!editUser && (
                                <small style={{ color: '#64748b', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                                    Se generará según: [Inicial Nombre] + [Documento] + [Inicial Apellido]
                                </small>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="roleId">Role *</label>
                            <select id="roleId" name="roleId" required value={formData.roleId} onChange={handleChange} disabled={currentUserRole === 'COORACAD'}>
                                {currentUserRole === 'COORACAD' ? (
                                    <option value={4}>Estudiante (4)</option>
                                ) : (
                                    roles.length > 0 ? (
                                        roles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name} ({role.id})</option>
                                        ))
                                    ) : (
                                        <>
                                            <option value={1}>Administrador (1)</option>
                                            <option value={2}>Coordinador Académico (2)</option>
                                            <option value={3}>Técnico (3)</option>
                                            <option value={4}>Estudiante (4)</option>
                                        </>
                                    )
                                )}
                            </select>
                        </div>

                        <div className="form-group switch-group">
                            <label htmlFor="active">Active Status</label>
                            <label className="switch">
                                <input type="checkbox" id="active" name="active" checked={formData.active} onChange={handleChange} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className={`btn-primary ${loading ? 'loading' : ''}`} disabled={loading}>
                            {loading ? (editUser ? 'Saving...' : 'Creating...') : (editUser ? 'Save Changes' : 'Create User')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
