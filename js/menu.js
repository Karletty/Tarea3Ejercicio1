$ = (element) => document.getElementById(element);

const shoppingBtn = $('shopping-cart');
const shoppingAside = $('shopping-aside');
let shoppingCart = [];
const btnOrder = $('send-order');
let total = 0;

const removeChildren = element => {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

const addTitles = (shopContainer) => {
    const row = document.createElement('div');
    const productDetail = document.createElement('div');
    const productCant = document.createElement('div');
    const productPrice = document.createElement('div');
    const productSubTotal = document.createElement('div');

    row.setAttribute('class', 'row-shop row-titles');
    productDetail.appendChild(document.createTextNode('Producto'));
    productPrice.appendChild(document.createTextNode('Precio'));
    productCant.appendChild(document.createTextNode('Cantidad'));
    productSubTotal.appendChild(document.createTextNode('Subtotal'));

    row.appendChild(productDetail);
    row.appendChild(productPrice);
    row.appendChild(productCant);
    row.appendChild(productSubTotal);
    shopContainer.appendChild(row);
}

const printTotal = (tot, shopContainer) => {
    const row = document.createElement('div');
    const totalDiv = document.createElement('div');
    const totalValueDiv = document.createElement('div');

    row.setAttribute('class', 'row-shop row-footer');
    totalDiv.setAttribute('class', 'w-75 text-end');
    totalValueDiv.setAttribute('class', 'w-25');

    totalDiv.appendChild(document.createTextNode('TOTAL'));
    totalValueDiv.appendChild(document.createTextNode(`$${tot.toFixed(2)}`));
    row.appendChild(totalDiv);
    row.appendChild(totalValueDiv);
    shopContainer.appendChild(row);
}

const printShoppingCart = () => {
    const shopContainer = $('shop-container');
    removeChildren(shopContainer);
    addTitles(shopContainer);
    total = 0;

    shoppingCart.forEach(product => {
        let subtotal = (Number(product.price * product.cant)).toFixed(2);
        total += Number(subtotal);
        const row = document.createElement('div');
        const productDetail = document.createElement('div');
        const productCant = document.createElement('div');
        const productPrice = document.createElement('div');
        const productSubTotal = document.createElement('div');
        const productImg = document.createElement('img');
        const productName = document.createElement('p');

        row.setAttribute('class', 'row-shop');
        productImg.setAttribute('class', 'cart-img');
        productName.setAttribute('class', 'product-name');
        productImg.setAttribute('src', product.img);
        productPrice.setAttribute('class', 'price');
        productSubTotal.setAttribute('class', 'subtotal');

        productName.appendChild(document.createTextNode(product.name));
        productCant.appendChild(document.createTextNode(product.cant));
        productPrice.appendChild(document.createTextNode(`$${product.price.toFixed(2)}`));
        productSubTotal.appendChild(document.createTextNode(`$${subtotal}`));

        productDetail.appendChild(productImg);
        productDetail.appendChild(productName);
        row.appendChild(productDetail);
        row.appendChild(productPrice);
        row.appendChild(productCant);
        row.appendChild(productSubTotal);
        shopContainer.appendChild(row);
    });
    printTotal(total, shopContainer);
}

const addToCart = (plate, cant) => {
    let name = plate.name;
    if (shoppingCart) {
        if (shoppingCart.filter(product => product.name === plate.name).length) {
            shoppingCart.map(product => {
                if (product.name === plate.name) {
                    product.cant += cant;
                }
            })
        }
        else {
            shoppingCart.push({ ...plate, cant });
        }
        printShoppingCart();
    }
}

const printPlates = (plates, container) => {
    for (const key in plates) {
        const card = document.createElement('div');
        const cardBody = document.createElement('div');
        const cardTitle = document.createElement('h3');
        const img = document.createElement('img');
        const spanPrice = document.createElement('span');
        const divAddCart = document.createElement('div');
        const btnAddCart = document.createElement('button');
        const btnImg = document.createElement('i');
        const inputCant = document.createElement('input');

        card.setAttribute('class', 'card card-plate');
        inputCant.setAttribute('type', 'number');
        inputCant.setAttribute('class', 'form-control me-2');
        inputCant.setAttribute('min', '0');
        inputCant.setAttribute('value', '0');
        cardBody.setAttribute('class', 'card-body');
        img.setAttribute('src', plates[key].img);
        spanPrice.setAttribute('class', 'span-price');
        btnAddCart.setAttribute('class', 'btn btn-primary p-1 d-flex align-items-center');
        btnImg.setAttribute('class', 'fa-solid fa-bag-shopping');

        cardTitle.textContent = plates[key].name;
        spanPrice.textContent = `$${plates[key].price.toFixed(2)}`;

        btnAddCart.appendChild(btnImg);
        divAddCart.appendChild(inputCant);
        divAddCart.appendChild(btnAddCart);
        divAddCart.appendChild(spanPrice);
        cardBody.appendChild(cardTitle);
        cardBody.appendChild(divAddCart);
        card.appendChild(img);
        card.appendChild(cardBody);
        container.appendChild(card);

        btnAddCart.addEventListener('click', () => {
            if (parseInt(inputCant.value) !== 0) {
                addToCart(plates[key], parseInt(inputCant.value));
                inputCant.value = 0;
            }
        });
    }
}

const printAllPlates = plates => {
    const containerSoup = $('container-soups');
    const containerSushi = $('container-sushi');
    const containerSeafood = $('container-seafood');
    const containerBeverages = $('container-beverages');
    const containerDesserts = $('container-desserts');

    printPlates(plates['soups'], containerSoup);
    printPlates(plates['sushi'], containerSushi);
    printPlates(plates['fish'], containerSeafood);
    printPlates(plates['beverages'], containerBeverages);
    printPlates(plates['desserts'], containerDesserts);
}

const getPlates = async () => {
    fetch('https://tarea3-acaeb-default-rtdb.firebaseio.com/plates.json').then(response => response.json()).then(data => {
        printAllPlates(data);
    });
}

const start = () => {
    getPlates();
}

if (sessionStorage.getItem('register')) {
    start();
} else {
    window.location.pathname = `/index.html`;
}

shoppingBtn.addEventListener('click', () => {
    shoppingAside.classList.toggle('show');
    shoppingBtn.classList.toggle('show');
});

btnOrder.addEventListener('click', () => {
    let order = shoppingCart.map(shopElement => {
        let name = shopElement.name;
        let cant = shopElement.cant;
        return { name, cant }
    })
    if (shoppingCart.length > 0) {
        let idCliente = sessionStorage.getItem('id');
        const options = {
            method: 'POST',
            body: JSON.stringify({ order, idCliente, total })
        }
        fetch(`https://tarea3-acaeb-default-rtdb.firebaseio.com/orders.json`, options).then(() => {
            alert('Se ha realizado el pedido');
        });

        shoppingCart = [];
        printShoppingCart();
    }
})