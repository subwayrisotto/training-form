import React, { useEffect, useState } from 'react';
import styles from './CalendarComponent.module.scss';
import ErrorsComponent from '../ErrorsComponent/ErrorsComponent';

type CalendarProps = {
    selectedDate: Date | null;
    setSelectedDate: (date: Date | null) => void;
    selectedTime: string | null,
    setSelectedTime: (time: string | null) => void;
    dateError?: string
    timeError?: string
    isSubmitted: boolean;
}

type Holiday = {
    name: string;
    date: string;
    type: string;
}

const WEEK_DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const TIME_SLOTS = ['12:00', '14:00', '16:30', '18:30', '20:00'];
const HOLIDAY_TYPE = {
    national: "NATIONAL_HOLIDAY",
    observance: "OBSERVANCE"
};

const CalendarComponent: React.FC<CalendarProps> = (props) => {
    const { selectedDate, setSelectedDate, selectedTime, setSelectedTime, dateError, timeError, isSubmitted } = props;
    const todayDay = new Date();
    const [currentDate, setCurrentDate] = useState(todayDay);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const getDayseInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    }

    const getFirstDayOfMonth = (month: number, year: number) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1;
    }

    const monthDays = getDayseInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
        setSelectedDate(null)
    }

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
        setSelectedDate(null)
    }

    const handleSelectDate = (day: number) => {
        // const date = new Date(year, month, day)
        const dateUTC = new Date(Date.UTC(year, month, day))
        setSelectedDate(dateUTC);
    }

    const handleSelectTime = (time: string) => {
        setSelectedTime(time)
    }

    const [nationalHolidays, setNationalHolidays] = useState<Holiday[]>([]);
    const [observanceHoliday, setObservanceHoliday] = useState<Holiday[]>([]);

    useEffect(() => {
        const fetchHolidays = async () => {
            try {
                const res = await fetch('/api/holidays');
                const data: Holiday[] = await res.json();
                setNationalHolidays(data.filter(d => d.type === HOLIDAY_TYPE.national));
                setObservanceHoliday(data.filter(d => d.type === HOLIDAY_TYPE.observance));
            } catch (err) {
                console.error(err);
            }
        };

        fetchHolidays();
    }, []);

    const isPolandNationalHoliday = (date: Date) => {
        return nationalHolidays.filter(holiday => holiday.date === date.toISOString().split('T')[0])
    }    
    
    const isPolandObservanceHoliday = (date: Date) => {
        return observanceHoliday.filter(holiday => holiday.date === date.toISOString().split('T')[0])
    }

    const getPolandObservanceHolidayName = (date: Date) => {
        const holiday = observanceHoliday.find(hol => hol.date === date.toISOString().split('T')[0]);
        return holiday ? holiday.name : ''
    }

    return (
        <div className={styles.calendarContent}>
                <p className={styles.header}>Your workout</p>
            <div className={styles.ctn}>
                <p className={styles.subHeader}>Date</p>
                <div className={`${styles.calendar} ${dateError ? styles.errorUpload : ''}`}>
                    <div className={styles.calendarHeader}>
                        <button onClick={handlePrevMonth} type='button'>
                            <img src="/icons/prev.svg" alt='Prev Arrow' />
                        </button>
                        <p className={styles.monthHeader}>
                            {currentDate.toLocaleString('default', {month: 'long'})} {year}
                        </p>
                        <button onClick={handleNextMonth} type='button'>
                            <img src="/icons/next.svg" alt='Next Arrow' />
                        </button>
                    </div>

                    <div className={styles.calendarWeeks}>
                        {
                            WEEK_DAYS.map(weekDay => {
                                return <p className={styles.weekDay} key={weekDay}>{weekDay}</p>
                            })
                        }
                    </div>

                    <div className={styles.calendarDays}>
                        {
                            Array.from({length: firstDay}).map((_, index) => {
                                return <p key={index}></p>
                            })
                        }

                        {
                            Array.from({length: monthDays}, (_, index) => {
                                const day = index + 1;
                                const isDaySelected = selectedDate!== null && selectedDate?.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
                                const date = new Date(Date.UTC(year, month, day));
                                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                const nationalHoliday = isPolandNationalHoliday(date);
                                const observanceHoliday = isPolandObservanceHoliday(date)

                                return(
                                    <button disabled={isWeekend || nationalHoliday.length > 0} type='button' key={day} className={`${styles.day} ${isDaySelected ? styles.selected : ''} ${(isWeekend || nationalHoliday.length > 0) ? styles.disabledDay : ''} ${observanceHoliday.length > 0 ? styles.observanceDay : ''}`} onClick={() => handleSelectDate(day)}>{day}</button>
                                )
                            })
                        }
                    </div>
                </div>
                {
                    selectedDate && (
                        <div className={styles.observanceHolidayContainer}>
                            {
                                getPolandObservanceHolidayName(selectedDate) && (
                                    <div className={styles.observanceCtn}>
                                        <img src='/icons/info.svg' alt='Observance icon' />
                                        <p className={styles.observanceName}>It is {getPolandObservanceHolidayName(selectedDate)}</p>
                                    </div>
                                )
                            }
                        </div>
                    )
                }
            </div>

            {
                selectedDate && (
                    <div className={styles.timeSlotsContainer}>
                        <p className={styles.subHeader}>Time</p>

                        <div className={styles.timeSlots}>
                            {
                                TIME_SLOTS.map(ts => {
                                    return (
                                        <button key={ts} type='button' className={`${styles.timeSlot} ${selectedTime === ts ? styles.active : ''}`} onClick={() => handleSelectTime(ts)}>{ts}</button>
                                    )
                                })
                            }
                        </div>
                    </div>
                )
            }

            

            {
                isSubmitted && dateError && !selectedDate && <ErrorsComponent error={dateError} />
            }

            {
                isSubmitted && timeError && selectedDate && !selectedTime && <ErrorsComponent error={timeError} />
            }
        </div>
    )
}

export default CalendarComponent
