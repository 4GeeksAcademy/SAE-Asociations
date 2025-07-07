import React, { useState, useEffect } from 'react';
import '../styles/cloudinary-widget.css';

const ImageUploader = ({
    onUploadSuccess,
    onUploadError,
    buttonText = "Subir Imagen",
    buttonClass = "btn btn-primary",
    acceptedFormats = "image/*",
    maxFileSize = 10485760, // 10MB
    multiple = false,
    currentImageUrl = null,
    showPreview = true
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [cloudinaryReady, setCloudinaryReady] = useState(false);

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    // Cargar el script de Cloudinary
    useEffect(() => {
        if (!window.cloudinary) {
            setIsLoading(true);
            const script = document.createElement('script');
            script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
            script.async = true;
            script.onload = () => {
                console.log('Cloudinary widget loaded');
                setCloudinaryReady(true);
                setIsLoading(false);
            };
            script.onerror = () => {
                console.error('Failed to load Cloudinary widget');
                setIsLoading(false);
            };
            document.body.appendChild(script);

            return () => {
                if (document.body.contains(script)) {
                    document.body.removeChild(script);
                }
            };
        } else {
            setCloudinaryReady(true);
        }
    }, []);

    const openUploadWidget = () => {
        // Verificar que las variables de entorno estén configuradas
        if (!cloudName || !uploadPreset) {
            console.error('Cloudinary credentials not configured');
            if (onUploadError) {
                onUploadError(new Error('Configuración de Cloudinary incompleta'));
            }
            return;
        }

        if (!cloudinaryReady) {
            console.error('Cloudinary widget not ready');
            return;
        }

        setIsUploading(true);

        // Crear el widget de Cloudinary
        window.cloudinary.openUploadWidget(
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
                multiple: multiple,
                maxFileSize: maxFileSize,
                clientAllowedFormats: [acceptedFormats],
                sources: ['local', 'url', 'camera'],
                showAdvancedOptions: false,
                cropping: false,
                folder: 'sae_associations',
                tags: ['sae', 'profile', 'event'],
                context: {
                    alt: 'SAE Associations Upload',
                    caption: 'Uploaded via SAE platform'
                },
                theme: 'modern',
                showPoweredBy: false,
                showSkipCropButton: false,
                showCompletedButton: false,
                showUploadMoreButton: false,
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
                    console.error('Error uploading to Cloudinary:', error);
                    if (onUploadError) {
                        onUploadError(error);
                    }
                } else if (result && result.event === "success") {
                    console.log('Upload successful:', result.info);
                    if (onUploadSuccess) {
                        onUploadSuccess(result.info.secure_url, result.info);
                    }
                }
            }
        );
    };

    return (
        <div className="image-uploader-modern">
            <div className="upload-section">
                {/* Área de subida principal */}
                <div className="upload-area">
                    {currentImageUrl && showPreview ? (
                        <div className="image-preview-container">
                            <img
                                src={currentImageUrl}
                                alt="Vista previa"
                                className="preview-image"
                            />
                            <div className="preview-overlay">
                                <button
                                    type="button"
                                    className="btn btn-outline-light btn-sm change-image-btn"
                                    onClick={openUploadWidget}
                                    disabled={isLoading || isUploading}
                                >
                                    <i className="bi bi-pencil me-1"></i>
                                    Cambiar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="upload-placeholder">
                            <div className="upload-icon">
                                {isLoading ? (
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Cargando...</span>
                                    </div>
                                ) : isUploading ? (
                                    <div className="spinner-border text-success" role="status">
                                        <span className="visually-hidden">Subiendo...</span>
                                    </div>
                                ) : (
                                    <i className="bi bi-cloud-upload display-4 text-muted"></i>
                                )}
                            </div>
                            <div className="upload-text">
                                {isLoading ? (
                                    <p className="text-muted mb-0">Cargando widget...</p>
                                ) : isUploading ? (
                                    <p className="text-success mb-0">Subiendo imagen...</p>
                                ) : (
                                    <>
                                        <p className="mb-2 fw-medium">Arrastra tu imagen aquí</p>
                                        <p className="small text-muted mb-0">
                                            JPG, PNG, GIF hasta {Math.round(maxFileSize / 1024 / 1024)}MB
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Botón de subida */}
                <div className="upload-actions">
                    <button
                        type="button"
                        className={`btn ${buttonClass} upload-btn`}
                        onClick={openUploadWidget}
                        disabled={isLoading || isUploading}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Cargando...
                            </>
                        ) : isUploading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Subiendo...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-cloud-upload me-2"></i>
                                {buttonText}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Estado de la imagen */}
            {currentImageUrl && (
                <div className="upload-status">
                    <div className="alert alert-success py-2 mb-0">
                        <i className="bi bi-check-circle me-2"></i>
                        <small>Imagen seleccionada correctamente</small>
                    </div>
                </div>
            )}

            {/* Estilos CSS integrados */}
            <style jsx>{`
                .image-uploader-modern {
                    max-width: 100%;
                }

                .upload-section {
                    background: #f8f9fa;
                    border: 2px dashed #dee2e6;
                    border-radius: 12px;
                    padding: 1.5rem;
                    text-align: center;
                    transition: all 0.3s ease;
                    position: relative;
                }

                .upload-section:hover {
                    border-color: #0d6efd;
                    background: #f0f8ff;
                }

                .upload-area {
                    margin-bottom: 1.5rem;
                }

                .upload-placeholder {
                    padding: 1.5rem 0;
                }

                .upload-icon {
                    margin-bottom: 1rem;
                }

                .upload-text p {
                    margin: 0;
                }

                .upload-actions {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                }

                .upload-btn {
                    padding: 0.75rem 2rem;
                    border-radius: 8px;
                    font-weight: 500;
                    transition: all 0.2s ease;
                }

                .upload-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                .image-preview-container {
                    position: relative;
                    display: inline-block;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
                    margin-bottom: 1rem;
                }

                .preview-image {
                    width: 400px;
                    height: 280px;
                    object-fit: cover;
                    display: block;
                    border-radius: 12px;
                }

                .preview-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .image-preview-container:hover .preview-overlay {
                    opacity: 1;
                }

                .change-image-btn {
                    border: 2px solid white;
                    padding: 0.6rem 1.2rem;
                    border-radius: 8px;
                    font-weight: 500;
                    font-size: 0.9rem;
                }

                .upload-status {
                    margin-top: 1rem;
                }

                .upload-status .alert {
                    border-radius: 8px;
                    border: none;
                    background: #d1e7dd;
                    color: #0a3622;
                }

                /* Ajustes cuando hay imagen */
                .upload-section:has(.image-preview-container) {
                    padding: 1.25rem;
                    border-style: solid;
                    border-color: #198754;
                    background: #f8fff9;
                }

                @media (max-width: 768px) {
                    .upload-section {
                        padding: 1.25rem;
                    }
                    
                    .upload-placeholder {
                        padding: 1rem 0;
                    }
                    
                    .upload-btn {
                        padding: 0.65rem 1.5rem;
                        font-size: 0.9rem;
                    }
                    
                    .preview-image {
                        width: 100%;
                        max-width: 350px;
                        height: 250px;
                    }
                    
                    .upload-section:has(.image-preview-container) {
                        padding: 1rem;
                    }
                }

                @media (max-width: 480px) {
                    .preview-image {
                        max-width: 280px;
                        height: 200px;
                    }
                }
            `}</style>
        </div>
    );
};

export default ImageUploader; 