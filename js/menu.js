const start = () => {

}

if (localStorage.getItem('register')) {
    start();
} else {
    window.location.pathname = `/index.html`;
}