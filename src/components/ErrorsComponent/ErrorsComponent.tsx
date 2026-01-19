import React from 'react';
import styles from './ErrorsComponent.module.scss'

type ErrorsProps = {
    error: string
}

const ErrorsComponent: React.FC<ErrorsProps> = ({ error }) => {
  return (
    <div className={styles.errorCtn}>
        <img src="/icons/error.svg" alt="Error icon" />
        <span className={styles.errorMessage}>{error}</span>
    </div>
  )
}

export default ErrorsComponent
