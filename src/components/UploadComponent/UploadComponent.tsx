import React, { useRef, useState } from 'react';
import styles from './UploadComponent.module.scss';
import ErrorsComponent from '../ErrorsComponent/ErrorsComponent';

type UploadProps = {
    onFilesSelected: (files: File | null ) => void;
    accept?: string;
    maxSizeMB?: number;
    error: string
}

const UploadComponent: React.FC<UploadProps> = ({onFilesSelected, accept, maxSizeMB=5, error}) => {
    const [dragOver, setDragOver] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);

        const uploadedFile = e.dataTransfer.files[0];
        uploadFile(uploadedFile);
    }

    const uploadFile = (newFile: File) => {
        if(accept && !newFile.type.match(accept.replace('*', '.*'))){
            console.log(`File type not allowed: ${newFile.name}`)
            return;
        }
        setFile(newFile);
        onFilesSelected(newFile);
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files && e.target.files[0]){
            uploadFile(e.target.files[0]);
        }
    }

    const removeFile = () => {
        setFile(null);
        onFilesSelected(null);
    }

    return (
        <div className={styles.uploadInputContainer}>
            <p className={styles.header}>Photo</p>
            <div className={`${styles.uploadInputCtn} ${error ? styles.errorUpload : ''}`}>
                <div 
                    className={`${styles.dropContainer} ${dragOver ? styles.dragOver : ''}`}
                    onDragOver={e => {
                        e.preventDefault();
                        setDragOver(true)
                    }}
                    onDragLeave={e => {
                        setDragOver(false)
                    }}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {
                        !file && <p className={styles.text}><span>Upload file</span> or drag and drop here</p>
                    }
                    <input 
                        ref={fileInputRef}
                        type='file'
                        accept={accept}
                        onChange={handleFileChange}
                        style={{display: 'none'}}
                    />
                </div>

                {
                    file && (
                        <div className={styles.fileNamePreview}>
                            <span className={styles.fileNameText}>{file.name}</span>
                            <button type='button' onClick={removeFile} className={styles.closeIcon}>
                                {/* <img src='/icons/close.svg' alt='Close icon' /> */}
                            </button>
                        </div>
                    )
                }
            </div>

                {
                    error && <ErrorsComponent error={error} />
                }
        </div>
    )
}

export default UploadComponent
