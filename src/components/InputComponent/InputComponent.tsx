import React from 'react';
import styles from './InputComponent.module.scss';
import ErrorsComponent from '../ErrorsComponent/ErrorsComponent';

type InputProps = {
    label: string,
    error: string
} & React.InputHTMLAttributes<HTMLInputElement>;

const InputComponent = React.forwardRef<HTMLInputElement, InputProps> ((props, ref) => {
        const { label, error } = props;

        return(
            <div className={styles.inputWrapper}>
                {
                    label && <label htmlFor={`input-${label}`} className={styles.inputLabel}>{label}</label>
                }

                <input id={`input-${label}`} className={`${styles.inputField} ${error ? styles.errorInput : ''}`} {...props}/>

                {
                    error && <ErrorsComponent error={error} />
                }
            </div>
        )
    }
)


export default InputComponent
