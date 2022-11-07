class User {
    constructor(email, pass, pass2) {
        this.email = email;
        this.pass = pass;
        this.pass2 = pass2;
    }
    verifyPass() {
        const rxPass = /^(?=\w*\d)(?=\w*[A-Z])(?=\w*[a-z])\S{8,16}$/;
        return [rxPass.test(this.pass), this.pass === this.pass2];
    }
}

const frmRegister = document.getElementById('frm-register');
const btnLogin = document.getElementById('login');

const mapToArray = (object) => {
    const array = [];
    for (const elem in object) {
        array.push({
            ...object[elem],
            id: elem,
        });
    }
    return array;
};

const pushUser = async (user) => {
    const options1 = {
        method: 'POST',
        body: JSON.stringify({ email: user.email, pass: user.pass })
    }
    const options2 = {
        method: 'POST',
        body: JSON.stringify({ email: user.email })
    }

    fetch('https://tarea3-acaeb-default-rtdb.firebaseio.com/emails.json', options2);
    return await fetch('https://tarea3-acaeb-default-rtdb.firebaseio.com/users.json', options1);
}

const verifyEmail = async (searchedEmail) => {
    const response = await fetch('https://tarea3-acaeb-default-rtdb.firebaseio.com/emails.json');
    const data = await response.json();
    let emails = await mapToArray(data);
    let valid = true;
    emails.forEach(email => {
        if (email.email === searchedEmail) {
            valid = false;
        }
    })
    return valid;
}

const verifyUser = async (email, pass) => {
    const response = await fetch('https://tarea3-acaeb-default-rtdb.firebaseio.com/users.json');
    const data = await response.json();
    let users = await mapToArray(data);
    let valid = false;
    users.forEach(user => {
        if (user.email === email && user.pass === pass) {
            valid = true;
            sessionStorage.setItem('id', user.id);
        }
    })
    return valid;
}

const setInvalid = (element, name) => {
    const invalid = document.getElementById(`invalid-${name}`);

    invalid.classList.remove('d-none');
    invalid.classList.add('d-block');
    element && element.classList.add('invalid');
}

const removeInvalid = (element, name) => {
    const invalid = document.getElementById(`invalid-${name}`);

    invalid.classList.add('d-none');
    invalid.classList.remove('d-block');
    element && element.classList.remove('invalid');
}

const registerUser = async (email, pass, pass2) => {
    let user = new User(email.value, pass.value, pass2.value);
    let verify = user.verifyPass();
    let valid = true;
    let verifyE = await verifyEmail(email.value);

    if (!user.email || !verifyE) {
        setInvalid(email, 'email');
        valid = false;
    } else {
        removeInvalid(email, 'email');
    }

    if (!user.pass) {
        setInvalid(pass, 'pass');
        valid = false;
    } else {
        if (!verify[0]) {
            setInvalid(pass, 'pass');
            valid = false;
        }
        else {
            removeInvalid(pass, 'pass');
        }
    }

    if (!user.pass2) {
        setInvalid(pass2, 'pass2');
        valid = false;
    } else {
        if (!verify[1]) {
            setInvalid(pass2, 'pass2');
            valid = false;
        }
        else {
            removeInvalid(pass2, 'pass2');
        }
    }
    if (valid) {
        pushUser(user).then(data => {
            alert('El usuario se ha registrado con éxito, ingrese sesión');
            email.value = '';
            pass.value = '';
            pass2.value = '';
        })
    }
}

const signupUser = async (email, pass) => {
    let verify = await verifyUser(email.value, pass.value);
    if (verify) {
        sessionStorage.setItem('register', true);
        window.location.pathname = `/pages/home.html`;
    }
    else {
        alert('Verifique las credenciales');
    }
}


btnLogin.addEventListener('click', (e) => {
    e.preventDefault();
    const frmType = document.getElementById('frmType');
    const containerRepeatPass = document.getElementById('container-repeat-pass');
    const info = document.getElementById('info');

    if (frmType.textContent === 'Login') {
        frmType.innerText = 'SignUp';
        info.innerText = '¿Ya tiene cuenta?';
        btnLogin.innerText = 'Iniciar sesión';
    } else {
        frmType.innerText = 'Login';
        info.innerText = '¿No tiene cuenta?';
        btnLogin.innerText = 'Registrarse';
    }

    containerRepeatPass.classList.toggle('d-none');
})

frmRegister.addEventListener('submit', (e) => {
    e.preventDefault();
    const frmType = document.getElementById('frmType');
    if (frmType.textContent === 'Login') {
        signupUser(e.target['email'], e.target['pass']);
    }
    else {
        registerUser(e.target['email'], e.target['pass'], e.target['pass2']);
    }

});

if (sessionStorage.getItem('register')) {
    window.location.pathname = `/pages/home.html`;
}