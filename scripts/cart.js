// cart.js

const cart = [];

// --- Утилиты ---
function parsePrice(priceText) {
    const cleanPrice = priceText.replace(/\s+/g, '').replace(',', '.').replace(/[^\d.-]/g, '');
    return parseFloat(cleanPrice) || 0;
}

// Функция для показа корзины в мобильном меню
function toggleMobileCartPopup() {
    const cartPopup = document.querySelector('.mobile-menu .cart-popup');
    if (cartPopup) {
        cartPopup.classList.toggle('active');

        if (cartPopup.classList.contains('active')) {
            updateCartDisplay(); // Обновляем содержимое
        }
    }
}

// --- Добавление в корзину ---
function addToCart(itemName, itemPrice, itemImg, article) {
    const existingItem = cart.find(item => item.article === article);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ title: itemName, price: itemPrice, image: itemImg, article, quantity: 1 });
    }

    updateCartDisplay();
    saveCartToLocalStorage();
}

// --- Обновление корзины на странице ---
function updateCartDisplay() {
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Обновляем счетчики во всех местах
    const cartCircles = document.querySelectorAll('.circle');
    cartCircles.forEach(circle => {
        circle.textContent = cartCount;
    });

    // Обновляем все попапы корзины
    const cartPopups = document.querySelectorAll('.cart-popup');
    cartPopups.forEach(popup => {
        renderCartPopup(popup, cart, cartTotal);
    });
}

function renderCartPopup(element, cart, cartTotal) {
    if (cart.length === 0) {
        element.innerHTML = '<div class="cart-empty">Корзина пуста</div>';
    } else {
        element.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.title}" class="cart-item-img">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">${item.price} руб. × ${item.quantity}</div>
                </div>
                <button class="cart-item-remove" data-article="${item.article}">×</button>
            </div>
        `).join('') + `
            <div class="cart-total">
                <span>Итого:</span>
                <span class="cart-total-price">${cartTotal.toFixed(2)} руб.</span>
            </div>
            <div class="cart-actions">
                <button class="btn btn-primary" onclick="goToCheckout()">Оформить заказ</button>
                <button class="btn btn-light" id="clearCartBtn">Очистить корзину</button>
            </div>
        `;
    }
}

// --- Обновление кнопки на карточках и странице товара ---
function updateCartButton(article) {
    const cartItem = cart.find(item => item.article === article);
    const urlParams = new URLSearchParams(window.location.search);
    const currentPageArticle = urlParams.get('article');

    // 1. Карточка каталога
    const card = document.querySelector(`.card[data-product-id="${article}"]`);
    if (card) {
        const btnBlock = card.querySelector('.btn-block');
        if (cartItem) {
            btnBlock.innerHTML = `
                <div class="cart-counter" data-article="${article}">
                    <button class="counter-btn" data-action="decrease">-</button>
                    <span class="counter-value">${cartItem.quantity}</span>
                    <button class="counter-btn" data-action="increase">+</button>
                </div>
                <button class="btn btn-light" data-buy-now data-article="${article}">Купить в 1 клик</button>
            `;
        } else {
            const product = productData.find(p => p.article === article);
            btnBlock.innerHTML = `
                <button class="btn btn-primary" data-add-to-cart data-article="${article}">В корзину</button>
                <button class="btn btn-light" data-buy-now data-article="${article}">Купить в 1 клик</button>
            `;
        }
    }

    // 2. Страница товара
    if (article === currentPageArticle) {
        const productBuy = document.querySelector('.product-buy-buttons');
        if (productBuy) {
            if (cartItem) {
                productBuy.innerHTML = `
                    <div class="cart-counter" data-article="${article}">
                        <button class="counter-btn" data-action="decrease">-</button>
                        <span class="counter-value">${cartItem.quantity}</span>
                        <button class="counter-btn" data-action="increase">+</button>
                    </div>
                    <button class="btn btn-light" data-buy-now data-article="${article}">Купить в 1 клик</button>
                `;
            } else {
                const product = productData.find(p => p.article === article);
                if (!product) return;
                productBuy.innerHTML = `
                    <button class="btn btn-primary" data-add-to-cart data-article="${article}">В корзину</button>
                    <button class="btn btn-light" data-buy-now data-article="${article}">Купить в 1 клик</button>
                `;
            }
        }
    }

    // 3. Обновляем кнопки в слайдерах
    updateSliderButtons(article);
}

function updateSliderButtons(article) {
    const cartItem = cart.find(item => item.article === article);
    const sliderCards = document.querySelectorAll(`.slide-buttons [data-article="${article}"]`);

    sliderCards.forEach(button => {
        const slide = button.closest('.swiper-slide');
        if (!slide) return;

        const buttonsContainer = slide.querySelector('.slide-buttons');
        if (!buttonsContainer) return;

        if (cartItem) {
            buttonsContainer.innerHTML = `
                <div class="cart-counter" data-article="${article}">
                    <button class="counter-btn" data-action="decrease">-</button>
                    <span class="counter-value">${cartItem.quantity}</span>
                    <button class="counter-btn" data-action="increase">+</button>
                </div>
                <button class="btn btn-light" data-buy-now data-article="${article}">Купить в 1 клик</button>
            `;
        } else {
            buttonsContainer.innerHTML = `
                <button class="btn btn-primary" data-add-to-cart data-article="${article}">В корзину</button>
                <button class="btn btn-light" data-buy-now data-article="${article}">Купить в 1 клик</button>
            `;
        }
    });
}

// --- Изменение количества товара ---
function updateCartItemQuantity(article, action) {
    const cartItem = cart.find(item => item.article === article);
    if (!cartItem) return;

    if (action === 'increase') {
        cartItem.quantity += 1;
    } else if (action === 'decrease') {
        cartItem.quantity -= 1;
        if (cartItem.quantity <= 0) {
            const index = cart.findIndex(i => i.article === article);
            if (index !== -1) cart.splice(index, 1);
        }
    }

    updateCartDisplay();
    updateCartButton(article);
    saveCartToLocalStorage();
}

// --- Удаление товара из корзины ---
function removeFromCart(article) {
    const index = cart.findIndex(item => item.article === article);
    if (index !== -1) cart.splice(index, 1);

    updateCartDisplay();
    updateCartButton(article);
    saveCartToLocalStorage();
}

// --- Очистка корзины ---
function clearCart() {
    const articles = cart.map(item => item.article);
    cart.length = 0;

    updateCartDisplay();
    articles.forEach(article => updateCartButton(article));
    saveCartToLocalStorage();
}

// --- Оформление заказа ---
function goToCheckout() {
    alert('Переход к оформлению заказа');
}

// --- Сохранение и загрузка корзины ---
function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromLocalStorage() {
    const saved = localStorage.getItem('cart');
    if (saved) {
        const parsed = JSON.parse(saved);
        cart.length = 0;
        cart.push(...parsed);
    }
}

// --- Делегирование событий ---
document.addEventListener('click', function(event) {
    // --- Добавление в корзину ---
    const addBtn = event.target.closest('[data-add-to-cart], [data-add-to-cart-recomendate]');
     if (addBtn) {
        const article = addBtn.dataset.article;
        const product = productData.find(p => p.article === article);
        if (!product) return;

        addToCart(product.title, parsePrice(product.priceNew), product.image, article);
        updateSliderButtons(article);

        const urlParams = new URLSearchParams(window.location.search);
        const currentPageArticle = urlParams.get('article');
        if (article === currentPageArticle) {
            updateCartButton(article);
        }
        return;
    }

    // --- Кнопки счетчика ---
    const counterBtn = event.target.closest('.counter-btn');
    if (counterBtn) {
        const counter = counterBtn.closest('.cart-counter');
        const article = counter.dataset.article;
        const action = counterBtn.dataset.action;
        updateCartItemQuantity(article, action);
        return;
    }

    // --- Удаление товара из корзины ---
    const removeBtn = event.target.closest('.cart-item-remove');
    if (removeBtn) {
        const article = removeBtn.dataset.article;
        removeFromCart(article);
        return;
    }

    // --- Очистка корзины ---
    if (event.target.id === 'clearCartBtn') {
        clearCart();
        return;
    }

    // --- Купить в 1 клик ---
    const buyBtn = event.target.closest('[data-buy-now]');
    if (buyBtn) {
        const article = buyBtn.dataset.article;
        const product = productData.find(p => p.article === article);
        if (!product) return;

        addToCart(product.title, parsePrice(product.priceNew), product.image, article);
        updateCartButton(article);
        setTimeout(goToCheckout, 300);
        return;
    }

    // --- Открытие корзины в мобильном меню ---
    const mobileCartIcon = event.target.closest('.mobile-menu .cart, .mobile-menu .cart-icon');
    if (mobileCartIcon) {
        event.preventDefault();
        event.stopPropagation();
        toggleMobileCartPopup();
        return;
    }

    // --- Закрытие корзины при клике вне ---
    const activeCartPopup = document.querySelector('.mobile-menu .cart-popup.active');
    if (activeCartPopup &&
        !event.target.closest('.mobile-menu .cart-popup') &&
        !event.target.closest('.mobile-menu .cart')) {
        activeCartPopup.classList.remove('active');
    }
});

function syncCatalogButtons() {
    const cards = document.querySelectorAll('.card[data-product-id]');
    cards.forEach(card => {
        const article = card.dataset.productId;
        updateCartButton(article);
    });
}

// --- Инициализация ---
document.addEventListener('DOMContentLoaded', function() {
    // Создаем попап для основного хедера
    const cartButton = document.querySelector('.header .cart');
    if (cartButton && !cartButton.querySelector('.cart-popup')) {
        const cartPopup = document.createElement('div');
        cartPopup.className = 'cart-popup';
        cartButton.appendChild(cartPopup);
    }

    // Создаем попап для мобильного хедера
    const cartButtonMobile = document.querySelector('.header__mobile .cart');
    if (cartButtonMobile && !cartButtonMobile.querySelector('.cart-popup')) {
        const cartPopupMobile = document.createElement('div');
        cartPopupMobile.className = 'cart-popup';
        cartButtonMobile.appendChild(cartPopupMobile);
    }

    // Создаем попап для бокового мобильного меню
    const mobileMenuCart = document.querySelector('.mobile-menu .cart');
    if (mobileMenuCart && !mobileMenuCart.querySelector('.cart-popup')) {
        const cartPopupMobileMenu = document.createElement('div');
        cartPopupMobileMenu.className = 'cart-popup';
        mobileMenuCart.appendChild(cartPopupMobileMenu);
    }

    // Обновляем корзину при открытии мобильного меню
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function() {
            // Даем время на открытие меню, затем обновляем корзину
            setTimeout(() => {
                updateCartDisplay();
            }, 300);
        });
    }

    // Также обновляем при закрытии/открытии через кнопку закрытия
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', function() {
            setTimeout(() => {
                updateCartDisplay();
            }, 300);
        });
    }

    loadCartFromLocalStorage();
    updateCartDisplay();
    syncCatalogButtons();
});