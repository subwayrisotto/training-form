import React, { useEffect, useState } from 'react';
import styles from './FormComponent.module.scss';
import InputComponent from '../InputComponent/InputComponent';
import InputAgeComponent from '../InputAgeComponent/InputAgeComponent';
import CalendarComponent from '../CalendarComponent/CalendarComponent';
import UploadComponent from '../UploadComponent/UploadComponent';

type InputName = 'firstName' | 'lastName' | 'email' | 'age' | 'photo' | 'reservationDate' | 'reservationTime';

type FormValues = {
    firstName: string,
    lastName: string,
    email: string,
    age: number,
    photo: File | null,
    reservationDate: string,
    reservationTime: string
}

type FormErrors = {
    [key in InputName]: string
};

const MAX_AGE = 100;
const MIN_AGE = 8;
const MAX_FILE_SIZE = 2;

type Validator<T> = (value: T, dateValue?: any) => string; 

const validation: {
    [K in keyof FormValues]: Validator<FormValues[K]>
} = {
    firstName: value => {
        if(value.length <= 3) return "First name should have more that 3 characters!";
        if(/\d/.test(value)) return "First name cannot contain numbers!";
        return '';
    },
    lastName: value => {
        if(value.length <= 3) return "Last name should have more that 3 characters!";
        if(/\d/.test(value)) return "Last name cannot contain numbers!";
        return '';
    },
    email: value => {
        if(!value) return "E-mail is required!";
        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) return 'Please use correct formatting. Example: address@email.com';
        return '';
    },
    age: value => {
        if(value > MAX_AGE) return "You're too old to have an workout!";
        if(value < MIN_AGE) return "You're too young to have an workout!";
        return '';
    },
    photo: value => {
        if(!value) return 'Photo is required!'
        if(value.size > MAX_FILE_SIZE * 1024 * 1024) return `Photo must be smaller than ${MAX_FILE_SIZE}MB`
        return '';
    },
    reservationDate: value => {
        if(!value) return 'Please select a date!'
        return ''
    },
    reservationTime: (value: string, dateValue?: string) => {
        if(!dateValue) return '';
        if(!value) return 'Please pick a time which suit you well!';
        return ''
    }
};

function FormComponent() {
    const [inputData, setInputData] = useState<FormValues>({
        firstName: '',
        lastName: '',
        email: '',
        age: MIN_AGE,
        photo: null,
        reservationDate: '',
        reservationTime: ''
    });

    const [errors, setErrors] = useState<FormErrors>({
        firstName: '',
        lastName: '',
        email: '',
        age: '',
        photo: '',
        reservationDate: '',
        reservationTime: ''
    });
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);
    const [isDisabled, setIsDisabled] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittingError, setSubmittingError] = useState('')

 
    const handleChange = (input: InputName) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputData(prevInput => ({...prevInput, [input]: value}));

         if (errors[input]) {
            setErrors(prev => ({
            ...prev,
            [input]: ''
            }));
        }
    }

    const handleAge = (age: number) => {
        setInputData(prevInput => ({
            ...prevInput, 
            age: age
        }));

        if (errors.age) {
        setErrors(prev => ({
            ...prev,
            age: ''
        }));
    }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsFormSubmitted(true);

        const newErrors = {
            firstName: validation.firstName(inputData.firstName),
            lastName: validation.lastName(inputData.lastName),
            email: validation.email(inputData.email),
            age: validation.age(inputData.age),
            photo: validation.photo(inputData.photo),
            reservationDate: validation.reservationDate(inputData.reservationDate),
            reservationTime: validation.reservationTime(inputData.reservationTime, inputData.reservationDate)
        };

        setErrors(newErrors);

        const isError = Object.values(newErrors).some((err) => err !== '');
        if(isError) return

        try{
            setIsSubmitting(true);

            const formData = new FormData();
            formData.append('firstName', inputData.firstName)
            formData.append('lastName', inputData.lastName)
            formData.append('email', inputData.email)
            formData.append('age', inputData.age.toString())
            formData.append('reservationDate', inputData.reservationDate)
            formData.append('reservationTime', inputData.reservationTime)
            if(inputData.photo) formData.append('photo', inputData.photo);

            const res = await fetch('http://letsworkout.pl/submit',{
                method: 'POST',
                body: formData
            });

            if(!res.ok) throw new Error('Failed submit!');

            const result = await res.json();
            console.log('Server response:', result);

        }catch(e){
            console.log(e);
            setSubmittingError('Something went wrong, maybe they allowed us to made this error :)')
        }finally{
            setIsSubmitting(false);
        }
    }

    const handleFileSelected = (file: File | null) => {
        setInputData(prevFile => ({
            ...prevFile,
            photo: file
        }));

        if(errors.photo){
            setErrors(prevError => ({
                ...prevError,
                photo: ''
            }))
        }
    }

    useEffect(() => {
        const hasErrors = Object.values(errors).some(err => err !== '');

        const hasEmptyRequiredFields =
            !inputData.firstName ||
            !inputData.lastName ||
            !inputData.email ||
            !inputData.photo ||
            !inputData.reservationDate ||
            !inputData.reservationTime;

        setIsDisabled(hasErrors || hasEmptyRequiredFields);
    }, [errors, inputData]);

  return (
    <div className={styles.formWrapper}>
        <p className={styles.header}>Personal info</p>
        <form onSubmit={handleSubmit}>
            <InputComponent
                type='text'
                label='First Name'
                value={inputData.firstName}
                onChange={handleChange('firstName')}
                error={isFormSubmitted ? errors.firstName : ''}
            />

            <InputComponent
                type='text'
                label='Last Name'
                value={inputData.lastName}
                onChange={handleChange('lastName')}
                error={isFormSubmitted ? errors.lastName : ''}
            />

            <InputComponent
                type='text'
                label='E-mail'
                value={inputData.email}
                onChange={handleChange('email')}
                error={isFormSubmitted ? errors.email : ''}
            />

            <InputAgeComponent 
                label='Age'
                min={MIN_AGE}
                max={MAX_AGE}
                value={inputData.age}
                onChange={handleAge}
                error={isFormSubmitted ? errors.age : ''}
            />

            <UploadComponent
                accept="image/*"
                maxSizeMB={MAX_FILE_SIZE}
                onFilesSelected={handleFileSelected}
                error={isFormSubmitted ? errors.photo : ''}
            />

            <CalendarComponent
                selectedDate={inputData.reservationDate ? new Date(inputData.reservationDate) : null}
                setSelectedDate={
                    (date: Date | null) => {
                        setInputData(prevData => ({
                            ...prevData,
                            reservationDate: date ? date.toISOString() : ''
                        }))
                    }
                }
                selectedTime={inputData.reservationTime || null}
                setSelectedTime={
                    (time: string | null) => {
                        setInputData(prevTime => ({...prevTime, reservationTime: time || ''}))
                    }
                }
                isSubmitted={isFormSubmitted}
                dateError={errors.reservationDate}
                timeError= {errors.reservationTime}
            />

            <button type='submit' className={`${styles.submitBtn} ${isDisabled ? styles.disabled : ''}`} disabled={isDisabled}>
                {
                    isSubmitting ? 'Sending...' : 'Send Application'
                }
            </button>
        </form>
        {submittingError && (
            <div className={styles.submitError}>
                {submittingError}

                <p>But don't worry, this is data which we tried to send 1 sec ago:</p>
                <p>First Name: {inputData.firstName}</p>
                <p>Last Name: {inputData.lastName}</p>
                <p>Email: {inputData.email}</p>
                <p>Age: {inputData.age}</p>
                <p>Reservation Date: {inputData.reservationDate}</p>
                <p>Reservation Time: {inputData.reservationTime}</p>
                <p>Photo: {inputData.photo?.name}</p>
            </div>
            )}
    </div>
  )
}

export default FormComponent
