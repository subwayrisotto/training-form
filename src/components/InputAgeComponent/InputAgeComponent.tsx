import React from 'react';
import styles from './InputAgeComponent.module.scss';
import ErrorsComponent from '../ErrorsComponent/ErrorsComponent';

type InputAgeProps = {
    label?: string,
    min: number,
    max: number,
    value: number,
    onChange: (value: number) => void,
    error?: string
}

function InputAgeComponent(props: InputAgeProps) {
    const { label, min, max, value, onChange, error } = props;

    const percent = ((value - min) / (max - min)) * 100;

    const updateValueFromClientX = (clientX: number, track: HTMLDivElement) => {
        const rect = track.getBoundingClientRect();
        const x = clientX - rect.left;
        const clamped = Math.min(Math.max(x / rect.width, 0), 1);
        const newValue = Math.round(min + clamped * (max - min));
        onChange(newValue);
    };

    const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
        updateValueFromClientX(e.clientX, e.currentTarget);
    };

    const handleThumbMouseDown = (
        e: React.MouseEvent<HTMLDivElement>,
        track: HTMLDivElement
    ) => {
        e.preventDefault();
        e.stopPropagation();

        const onMove = (moveEvent: MouseEvent) => {
            updateValueFromClientX(moveEvent.clientX, track);
        };

        const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    };

    return (
        <div className={styles.inputAgeWrapper}>
            {label && <label className={styles.inputAgeLabel}>{label}</label>}

            <div className={styles.inputSliderContainer}>
                <div className={styles.textContent}>
                    <span className={styles.ageValue}>{min}</span>
                    <span className={styles.ageValue}>{max}</span>
                </div>

                <div className={styles.slider} onClick={handleTrackClick}>
                    <div
                        className={styles.sliderLine}
                        style={{ width: `${percent}%` }}
                    />

                    <div
                        className={styles.sliderThumb}
                        style={{ left: `${percent}%` }}
                        onMouseDown={(e) =>
                            handleThumbMouseDown(
                                e,
                                e.currentTarget.parentElement as HTMLDivElement
                            )
                        }
                    >
                        <div className={styles.sliderThumbCircle}>
                            <div className={styles.valueCtn}>
                                {/* <img src='/icons/union.svg' alt='Union icon' /> */}
                                <div className={styles.valueImg}>{value}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {error && <ErrorsComponent error={error} />}
        </div>
    );
}

export default InputAgeComponent
