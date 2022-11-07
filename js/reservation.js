const $ = element => document.getElementById(element);
const parseDate = date => `${date.getFullYear()}-${(date.getMonth() + 1) < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}`

let today1 = new Date();
let monthFromToday1 = new Date(today1.getTime() + (24 * 60 * 60 * 1000 * 30));

const inputdate = $('date');

inputdate.setAttribute('min', parseDate(today1));
inputdate.setAttribute('max', parseDate(monthFromToday1));

const validateDate = (date, hour) => {
    const oneDayMiliseconds = 24 * 60 * 60 * 1000;
    let today = new Date();
    let monthFromToday = new Date(today.getTime() + (24 * 60 * 60 * 1000 * 30));
    if (today > date) {
        alert('Debe seleccionar una fecha posterior a la actual');
        return false;
    } else if ((date.getTime() - today.getTime()) < oneDayMiliseconds) {
        alert('Debe reservar con al menos 24h de anticipación');
        return false;
    } else if ((monthFromToday.getTime() - date.getTime()) < 0) {
        alert('Las mesas solo se pueden reservar con un mes de anticipación');
        return false;
    }
    else if (hour < 12 || hour > 19 || (hour === 19 && hour > 0)) {
        alert('Las reservas solo se pueden hacer entre 12:00 y 19:00');
        return false;
    }
    return true;
}

const modifyHour = (key, hourString, cantPeople, cantTables, previousClients) => {
    if (previousClients.includes({ id: localStorage.getItem('id'), cant: cantPeople })) {
        alert('Ya tiene una reservación a esta hora');
    } else {
        let newCant = cantTables - 1;
        previousClients.push({ id: localStorage.getItem('id'), cant: cantPeople })
        const options1 = {
            method: 'PUT',
            body: JSON.stringify({ cant: newCant })
        };
        const options2 = {
            method: 'PUT',
            body: JSON.stringify(previousClients)
        };

        fetch(`https://tarea3-acaeb-default-rtdb.firebaseio.com/reservations/${key}/hours/${hourString}/availableTables/tableFor${cantPeople}.json`, options1).then(() => {
            alert('Reservación exitosa');
        });
        fetch(`https://tarea3-acaeb-default-rtdb.firebaseio.com/reservations/${key}/hours/${hourString}/idClients.json`, options2);
    }
}

const addHour = (key, hourString, cantPeople, initialData) => {
    let mesas = {
        tableFor2: { cant: 5 },
        tableFor4: { cant: 5 },
        tableFor6: { cant: 2 }
    };
    mesas[`tableFor${cantPeople}`].cant--;

    let reservation = {
        ...initialData,
        [hourString]: {
            availableTables: mesas,
            idClients: [{ id: localStorage.getItem('id'), cant: cantPeople }]
        },
    }
    const options = {
        method: 'PUT',
        body: JSON.stringify(reservation)
    }
    fetch(`https://tarea3-acaeb-default-rtdb.firebaseio.com/reservations/${key}/hours.json`, options).then(() => {
        alert('Reservación exitosa');
    });
}

const addDay = (dateString, hourString, cantPeople) => {
    let mesas = {
        tableFor2: { cant: 5 },
        tableFor4: { cant: 5 },
        tableFor6: { cant: 2 }
    };
    mesas[`tableFor${cantPeople}`].cant--;

    let reservation = {
        day: dateString,
        hours: {
            [hourString]: {
                availableTables: mesas,
                idClients: [{ id: localStorage.getItem('id'), cant: cantPeople }]
            }
        }
    }
    const options = {
        method: 'POST',
        body: JSON.stringify(reservation)
    }
    fetch('https://tarea3-acaeb-default-rtdb.firebaseio.com/reservations.json', options).then(() => {
        alert('Reservación exitosa');
    });
}

const seeAvailable = async (date, hour, cantPeople) => {
    let dateParsed = new Date(date.split('-'));
    let dateString = parseDate(dateParsed);
    let hourString = `${hour}:00`;
    if (validateDate(dateParsed, hour)) {
        let data = await fetch('https://tarea3-acaeb-default-rtdb.firebaseio.com/reservations.json').then(response => response.json())
        let dayExist = false
        if (data) {
            for (const key in data) {
                if (data[key].day === dateString) {
                    let hourExist = false;

                    dayExist = true;

                    for (const hour in data[key].hours) {
                        if (hour === hourString) {
                            hourExist = true;
                            let cantTables = data[key].hours[hour].availableTables[`tableFor${cantPeople}`].cant;
                            if (cantTables > 0) {
                                modifyHour(key, hour, cantPeople, cantTables, data[key].hours[hour].idClients);
                            }
                            else {
                                alert('No hay suficientes mesas para la hora seleccionada');
                            }
                        }
                    }

                    if (!hourExist) {
                        addHour(key, hourString, cantPeople, data[key].hours);
                    }
                }
            }
        }
        if (!dayExist) {
            addDay(dateString, hourString, cantPeople);
        }
    }
}

const start = () => {
    const frmReservation = $('frmReservation');

    frmReservation.addEventListener('submit', (e) => {
        e.preventDefault();
        seeAvailable(e.target['date'].value, e.target['hour'].value, e.target['cant-people'].value);
    })
}

if (localStorage.getItem('register')) {
    start();
} else {
    window.location.pathname = `/index.html`;
}