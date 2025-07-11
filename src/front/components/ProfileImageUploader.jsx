import React, { useState, useEffect } from 'react';
import '../styles/cloudinary-widget.css';

const ProfileImageUploader = ({
    onUploadSuccess,
    onUploadError,
    currentImageUrl = null,
    size = "large", // "small", "medium", "large"
    disabled = false
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [cloudinaryReady, setCloudinaryReady] = useState(false);

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    // Definir tamaños
    const sizes = {
        small: { width: '60px', height: '60px', fontSize: '24px' },
        medium: { width: '80px', height: '80px', fontSize: '32px' },
        large: { width: '120px', height: '120px', fontSize: '48px' }
    };

    const currentSize = sizes[size] || sizes.large;

    // Cargar el script de Cloudinary
    useEffect(() => {
        if (!window.cloudinary) {
            setIsLoading(true);
            const script = document.createElement('script');
            script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
            script.async = true;
            script.onload = () => {
                setCloudinaryReady(true);
                setIsLoading(false);
            };
            script.onerror = () => {
                setIsLoading(false);
                onUploadError && onUploadError('Error al cargar el widget de Cloudinary');
            };
            document.head.appendChild(script);
        } else {
            setCloudinaryReady(true);
        }
    }, [onUploadError]);

    const handleUploadClick = () => {
        if (!cloudinaryReady || isUploading || disabled) return;

        if (!cloudName || !uploadPreset) {
            onUploadError && onUploadError('Configuración de Cloudinary incompleta');
            return;
        }

        setIsUploading(true);

        const uploadWidget = window.cloudinary.createUploadWidget(
            {
                cloudName: cloudName,
                uploadPreset: uploadPreset,
                preBatch: (cb, data) => {
                    // Añadir clase CSS al widget cuando se abre
                    setTimeout(() => {
                        const widget = document.querySelector('.cloudinary-widget');
                        if (widget) {
                            widget.classList.add('modern-widget');
                        }
                    }, 100);
                    cb(data);
                },
                sources: ['local', 'url', 'camera'],
                multiple: false,
                cropping: true,
                croppingAspectRatio: 1, // Forzar aspect ratio 1:1 (cuadrado)
                croppingDefaultSelectionRatio: 1,
                croppingShowDimensions: true,
                folder: 'sae_profiles',
                resourceType: 'image',
                clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
                maxFileSize: 5000000, // 5MB
                maxImageWidth: 800,
                maxImageHeight: 800,
                croppingValidateDimensions: true,
                showUploadMoreButton: false,
                showCompletedButton: false,
                showSkipCropButton: false,
                theme: 'modern',
                showPoweredBy: false,
                styles: {
                    palette: {
                        window: "#FFFFFF",
                        windowBorder: "#4dabf7",
                        tabIcon: "#4dabf7",
                        menuIcons: "#6C757D",
                        textDark: "#212529",
                        textLight: "#FFFFFF",
                        link: "#4dabf7",
                        action: "#4dabf7",
                        inactiveTabIcon: "#ADB5BD",
                        error: "#DC3545",
                        inProgress: "#4dabf7",
                        complete: "#198754",
                        sourceBg: "#F8F9FA"
                    },
                    fonts: {
                        default: null,
                        "'Inter', 'Segoe UI', sans-serif": {
                            url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
                            active: true
                        }
                    },
                    frame: {
                        background: "#FFFFFF"
                    }
                },
                buttonClass: 'modern-upload-btn'
            },
            (error, result) => {
                setIsUploading(false);

                if (error) {
                    console.error('Error en upload de Cloudinary:', error);
                    onUploadError && onUploadError('Error al subir la imagen');
                    return;
                }

                if (result && result.event === "success") {
                    // Imagen de perfil subida exitosamente
                    onUploadSuccess && onUploadSuccess(result.info.secure_url, result.info);
                }
            }
        );

        uploadWidget.open();
    };

    return (
        <div className="profile-image-uploader d-flex flex-column align-items-center">
            {/* Avatar circular */}
            <div
                className="profile-avatar position-relative shadow-sm"
                style={{
                    width: currentSize.width,
                    height: currentSize.height,
                    borderRadius: '50%',
                    border: '3px solid #e9ecef',
                    overflow: 'hidden',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    backgroundColor: '#f8f9fa',
                    transition: 'all 0.3s ease'
                }}
                onClick={handleUploadClick}
                onMouseEnter={(e) => {
                    if (!disabled) {
                        e.currentTarget.querySelector('.profile-overlay').style.opacity = '1';
                    }
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.querySelector('.profile-overlay').style.opacity = '0';
                }}
            >
                {currentImageUrl ? (
                    <img
                        src={currentImageUrl}
                        alt="Imagen de perfil"
                        className="w-100 h-100"
                        style={{
                            objectFit: 'cover',
                            objectPosition: 'center'
                        }}
                    />
                ) : (
                    <div
                        className="w-100 h-100 d-flex align-items-center justify-content-center"
                        style={{ color: '#6c757d' }}
                    >
                        <i
                            className="bi bi-person-circle"
                            style={{ fontSize: currentSize.fontSize }}
                        ></i>
                    </div>
                )}

                {/* Overlay de edición */}
                <div
                    className="profile-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        opacity: 0,
                        transition: 'opacity 0.3s ease'
                    }}
                >
                    {isLoading || isUploading ? (
                        <div className="spinner-border spinner-border-sm text-white" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                    ) : (
                        <i className="bi bi-camera-fill text-white" style={{ fontSize: '20px' }}></i>
                    )}
                </div>
            </div>

            {/* Botón de acción */}
            <button
                type="button"
                className="btn btn-outline-primary btn-sm mt-2"
                onClick={handleUploadClick}
                disabled={isLoading || isUploading || disabled}
                style={{ fontSize: '12px', minWidth: '100px' }}
            >
                {isLoading ? (
                    <>
                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                        Cargando...
                    </>
                ) : isUploading ? (
                    <>
                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                        Subiendo...
                    </>
                ) : currentImageUrl ? (
                    <>
                        <i className="bi bi-camera me-1"></i>
                        Cambiar
                    </>
                ) : (
                    <>
                        <i className="bi bi-plus-circle me-1"></i>
                        Agregar foto
                    </>
                )}
            </button>

            {/* Estilos CSS integrados */}
            <style>{`
                .profile-avatar:hover .profile-overlay {
                    opacity: 1 !important;
                }
                
                .profile-avatar:hover {
                    border-color: #0d6efd !important;
                    transform: scale(1.02);
                }
                
                .profile-avatar:active {
                    transform: scale(0.98);
                }
                
                .profile-image-uploader {
                    user-select: none;
                }
            `}</style>
        </div>
    );
};

export default ProfileImageUploader; 