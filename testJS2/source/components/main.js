const API = 'https://raw.githubusercontent.com/GeekBrainsTutorial/online-store-api/master/responses'


// let getRequest = (url) => {
//     return new Promise((resolve, reject) => {
//         let xhr = new XMLHttpRequest();
//         xhr.open('GET', url, true);
//         xhr.onreadystatechange = () => {
//           if (xhr.readyState === 4) {
//             if (xhr.status !== 200) {
//               reject('Error');
//             } else {
//               resolve(xhr.responseText);
//             }
//           }
//         };
//         xhr.send();
//     })
//   };

// Базовые классы

class List {
    constructor(url, container, list = listContext) {
        this.container = container;
        this.list = list;
        this.url = url;
        this.goods = [];
        this.allProducts = [];
        this.filtered = []; //Отфильтрованные товары
        this._init();
    }

    getJson(url) {
        return fetch(url ? url : `${API + this.url}`)
        .then(result => result.json())
        .catch(error => {
            console.log(error);
        });
    }

    handleData(data) {
        this.goods = [...data];
        this.render();
    }

    calcSum() {
        return this.allProducts.reduce((accum, item) => accum += item.price, 0);
    }

    render() {
        const block = document.querySelector(this.container);
        for (let product of this.goods) {
            console.log(this.constructor.name);
            const productObj = new this.list[this.constructor.name](product);
            // if (this.constructor.name === 'ProductList') {
            //     const productObj = new ProductItem(product);
            // }
            // if (this.constructor.name === 'Cart') {
            //     const productObj = new CartItem(product);
            // }
            console.log(productObj);
            this.allProducts.push(productObj);
            block.insertAdjacentHTML('beforeend', productObj.render());
        }
    }

    filter(value) {
        const regexp = new RegExp(value, 'i');
        this.filtered = this.allProducts.filter(product => regexp.test(product.product_name));
        this.allProducts.forEach(el => {
        const block = document.querySelector(`.product__item[data-id="${el.id_product}"]`);
        if (!this.filtered.includes(el)) {
            block.classList.add('invisible');
        } else {
            block.classList.remove('invisible');
        }
    })}

    _init() {
        return false;
    }
}

class Item {
    constructor(el, img = 'https://raw.githubusercontent.com/VikPaul/JavaScript_1/master/product-img/products.jpg') {
        this.product_name = el.product_name;
        this.price = el.price;
        this.id_product = el.id_product;
        this.img = img;
    }
    render() {
        return ``;
    }
}

// Наследование от баз. классов

class ProductsList extends List {
    constructor(cart, container = '.products', url = "/catalogData.json") {
        super(url, container);
        this.cart = cart;
        this.getJson()
        .then(data => this.handleData(data));
    }

    _init(){
        document.querySelector(this.container).addEventListener('click', e => {
            if (e.target.classList.contains('products__btn_buy')) {
                this.cart.addProduct(e.target);
            }
        });
        document.querySelector('.header__search_form').addEventListener('submit', e => {
            e.preventDefault();
            this.filter(document.querySelector('.header__search_field').value)
        });
    }
}

class ProductItem extends Item {
    render() {
        return `<div class="product__item" data-id="${this.id_product}">
                    <img class="product__item_img" src="${this.img}" alt="products_img">
                    <div class="desc">
                        <h3 class="product__item_data">${this.product_name}</h3>
                        <p class="product__item_data">${this.price} \u20bd</p>
                        <button class="product__btn_buy"
                        data-id="${this.id_product}"
                        data-name="${this.product_name}"
                        data-price="${this.price}>Купить</button>
                    </div>
                </div>`;
    }
}

class Cart extends List {
    constructor(container = ".header__cart_block", url = "/getBasket.json") {
        super(url, container);
        this.getJson()
            .then(data => {
                this.handleData(data.contents);
            });
    }

    addProduct(element) {
        this.getJson(`${API}/addToBasket.json`)
            .then(data => {
                if (data.result === 1) {
                    let productId = +element.dataset['id'];
                    let find = this.allProducts.find(product => product.id_product === productId);
                    if (find) {
                        find.quantity++;
                        this._updateCart(find);
                    } else {
                        let product = {
                            id_product: productId,
                            price: +element.dataset['price'],
                            product_name: element.dataset['name'],
                            quantity: 1
                        };
                        this.goods = [product];
                        this.render();
                    }
                } else {
                    alert('Error');
                }
            })
    }

    removeProduct(element) {
        this.getJson(`${API}/deleteFromBasket.json`)
            .then(data => {
                if (data.result === 1) {
                    let productId = +element.dataset['id'];
                    let find = this.allProducts.find(product => product.id_product === productId);
                    if (find.quantity > 1) {
                        find.quantity--;
                        this._updateCart(find);
                    } else {
                        this.allProducts.splice(this.allProducts.indexOf(find), 1);
                        document.querySelector(`.cart-item[data-id="${productId}"]`).remove();
                    }
                } else {
                    alert('Error');
                }
            })
    }

    _updateCart(product) {
        let block = document.querySelector(`.cart-item[data-id="${product.id_product}"]`);
        block.querySelector('.product-quantity').textContent = `Количество: ${product.quantity}`;
        block.querySelector('.product-price').textContent = `${product.quantity * product.price} ₽`;
    }

    _init() {
        document.querySelector('.header__btn_cart').addEventListener('click', () => {
            document.querySelector(this.container).classList.toggle('invisible');
        });
        document.querySelector(this.container).addEventListener('click', e => {
            if (e.target.classList.contains('del-btn')) {
                this.removeProduct(e.target);
            }
        })
    }
}

class CartItem extends Item {
    constructor(el, img = 'https://raw.githubusercontent.com/VikPaul/JavaScript_1/master/product-img/products_cart.jpg') {
        super(el, img);
        this.quantity = el.quantity;
    }

    render() {
        return `<div class="cart-item" data-id="${this.id_product}">
            <div class="product-bio">
            <img src="${this.img}" alt="Some image">
            <div class="product-desc">
            <p class="product-title">${this.product_name}</p>
            <p class="product-quantity">Количество: ${this.quantity}</p>
        <p class="product-single-price">${this.price} за ед.</p>
        </div>
        </div>
        <div class="right-block">
            <p class="product-price">${this.quantity * this.price} ₽</p>
            <button class="del-btn" data-id="${this.id_product}">&times;</button>
        </div>
        </div>`
    }
}

const listContext = {
    productsList: ProductItem,
    Cart: CartItem
};

let cart = new Cart();
new ProductsList(cart);










// class ProductList {
//     #goods
//     constructor(container = '.products') {
//         this.container = container;
//         this.#goods = [];
//         this.allProducts = [];

//         this.#getGoods()
//         .then(data => {
//             this.#goods = [...data];
//             this.#render();
//         });
//         console.log(this.sumPrice());
//     }

//     #getGoods() {
//         return fetch(`${API}/catalogData.json`)
//         .then(response => response.json())
//         .catch(err => console.log(err));
//     }



//     #render() {
//         const block = document.querySelector(this.container);

//         for(let product of this.#goods) {
//             const productObject = new ProductItem(product);
            
//             this.allProducts.push(productObject);

//             block.insertAdjacentHTML('beforeend', productObject.getHTMLString());
//         }
//     }
//     sumPrice() {
//         return this.#goods.reduce((sum, { price }) => sum + price, 0)
//     }
// }



// class ProductItem {
//     constructor(product, img ='https://raw.githubusercontent.com/VikPaul/JavaScript_1/master/product-img/products.jpg') {
//         this.title = product.product_name;
//         this.price = product.price;
//         this.id = product.id_product;
//         this.img = img;
//     }
//     getHTMLString() {
//         return `<div class="products__item" data-id="${this.id}">
//                     <img class="products__item_img" src="${this.img}" alt="products_img">
//                     <div class="desc">
//                         <h3 class="products__item_data">${this.title}</h3>
//                         <p class="products__item_data">${this.price} \u20bd</p>
//                         <button class="products__btn_buy">Купить</button>
//                     </div>
//                 </div>`;
//     }
// }
// const list = new ProductList();