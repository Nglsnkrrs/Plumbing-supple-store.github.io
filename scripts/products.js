// products.js

// Глобальные переменные фильтров
window.currentLabelFilter = 'all';
window.isLabelFilterActive = false;

// ===== Рендер одной карточки товара =====
function renderProductCard(data) {
    const hasSale = data.labels.includes("sale");
    const priceColor = hasSale ? "#e60000" : "#1d2d5f";

    // Проверяем, есть ли товар в корзине
    const cartItem = cart.find(item => item.article === data.article);
    const buttonHTML = cartItem
        ? `<div class="cart-counter" data-article="${data.article}">
              <button class="counter-btn counter-minus" data-action="decrease">-</button>
              <span class="counter-value">${cartItem.quantity}</span>
              <button class="counter-btn counter-plus" data-action="increase">+</button>
           </div>`
        : `<button class="btn btn-primary" data-add-to-cart data-article="${data.article}">В корзину</button>`;

    return `
        <div class="card" data-product-id="${data.article}">
            <div class="card-clickable-area" onclick="openProductPage('${data.article}')">
                <div class="labels">
                    ${data.labels.includes("new") ? '<div class="label label-new">Новинка</div>' : ''}
                    ${data.labels.includes("sale") ? '<div class="label label-sale">Акция</div>' : ''}
                    ${data.labels.includes("hit") ? '<div class="label label-hit">Хит</div>' : ''}
                </div>
                <img src="${data.image}" class="product-img" alt="${data.title}" />
                <div class="status-article">
                    <div class="status ${data.status==="Нет в наличии"?"status-text-out":"status-text-in"}">
                        ${data.status==="Нет в наличии"?`<span class="status-icon status-out"></span>${data.status}`:`<span class="status-icon status-in"></span>${data.status}`}
                    </div>
                    <div class="article">Артикул: ${data.article}</div>
                </div>
                <div class="title">${data.title}</div>
                <div class="collection">Коллекция: ${data.collection}</div>
                <div class="price-block">
                    <span class="price-new" style="color:${priceColor}">${data.priceNew} руб./шт</span>
                    ${data.priceOld?`<span class="price-old">${data.priceOld} руб./шт</span>`:''}
                </div>
            </div>
            <div class="btn-block">
                ${buttonHTML}
                <button class="btn btn-light" data-buy-now data-article="${data.article}">Купить в 1 клик</button>
            </div>
        </div>
    `;
}

// ===== Открытие страницы товара =====
function openProductPage(article) {
    window.location.href = `/Plumbing-supple-store.github.io/Pages/product.html?article=${article}`;
}

// ===== Определяем тип текущей страницы =====
function getCurrentPageType() {
    const title = document.querySelector('[data-nav-title]').textContent.toLowerCase();
    const map = { 'смесители':'mixers','душевые системы':'shower systems','душевые стойки':'shower racks','изливы':'spouts','аксессуары':'accessories' };
    return map[title] || 'all';
}

// ===== Рендер всех товаров =====
function renderAllProducts(list) {
    const container = document.getElementById("products-container");
    if (!container) return;
    container.innerHTML = "";

    const pageType = getCurrentPageType();
    let filtered = pageType !== 'all' ? list.filter(p => p.typeProduct===pageType) : list;

    if (!filtered.length) {
        container.innerHTML = '<div class="no-products">Товары не найдены</div>';
        return;
    }

    filtered.forEach(p => container.innerHTML += renderProductCard(p));
    initCartButtons();
}

// ===== Рендер фильтрованных товаров =====
function renderFilteredProducts(filteredList) {
    const container = document.getElementById("products-container");
    if (!container) return;
    container.innerHTML = "";

    if (!filteredList.length) {
        container.innerHTML = '<div class="no-products">Товары не найдены</div>';
        return;
    }

    filteredList.forEach(p => container.innerHTML += renderProductCard(p));
    initCartButtons();
}

// ===== Инициализация кнопок корзины =====
function initCartButtons() {
    // "В корзину"
     document.querySelectorAll('[data-add-to-cart]').forEach(btn => {
        btn.addEventListener('click', function(e){
            e.stopPropagation();
            const article = this.dataset.article;
            const card = this.closest('.card');
            if (!card) return;

            const name = card.querySelector('.title').textContent;
            const price = parsePrice(card.querySelector('.price-new').textContent);
            const img = card.querySelector('.product-img').src;

            addToCart(name, price, img, article);

            // ОБНОВЛЯЕМ КНОПКИ ЭТОЙ КАРТОЧКИ СРАЗУ
            updateCatalogCardButton(article);
        });
    });

    // "Купить в 1 клик"
    document.querySelectorAll('[data-buy-now]').forEach(btn => {
        btn.addEventListener('click', function(e){
            e.stopPropagation();
            const article = this.dataset.article;
            const card = this.closest('.card');
            if (!card) return;

            const name = card.querySelector('.title').textContent;
            const price = parsePrice(card.querySelector('.price-new').textContent);
            const img = card.querySelector('.product-img').src;

            addToCart(name, price, img, article);
            setTimeout(goToCheckout, 300);
        });
    });

    // Внутри initCartButtons() добавьте:
document.addEventListener('click', function(e) {
    const counterBtn = e.target.closest('.cart-counter .counter-btn');
    if (counterBtn && e.target.closest('.card')) {
        const article = counterBtn.closest('.cart-counter').dataset.article;
        const action = counterBtn.dataset.action;

        updateCartItemQuantity(article, action);

        // Обновляем кнопки этой карточки
        updateCatalogCardButton(article);
    }
});
}

// ===== Breadcrumbs =====
function initBreadcrumbs() {
    const namePage = document.querySelector('[data-nav-title]').textContent;
    const nav = document.querySelector('[data-nav-items]');
    if (!nav) return;

    if (namePage === 'Каталог') {
        nav.innerHTML = `<a href="../index.html" class="navigation__item nav-unactive">Главная</a><span>/</span><a href="#" class="navigation__item navigation__item--current nav-active">${namePage}</a>`;
    } else {
        nav.innerHTML = `<a href="../index.html" class="navigation__item nav-unactive">Главная</a><span>/</span><a href="catalog.html" class="navigation__item nav-unactive">Каталог</a><span>/</span><a href="#" class="navigation__item navigation__item--current nav-active">${namePage}</a>`;
    }
}

// ===== Фильтры по меткам =====
function displaysOfCertainProducts(filterType) {
    const isSame = window.currentLabelFilter===filterType && window.isLabelFilterActive;
    if(isSame) {
        filterType='all';
        window.isLabelFilterActive=false;
        window.currentLabelFilter='all';
    } else {
        window.isLabelFilterActive=true;
        window.currentLabelFilter=filterType;
    }

    const pageType=getCurrentPageType();
    let filtered=pageType!=='all'? productData.filter(p=>p.typeProduct===pageType) : productData;

    if(filterType!=='all') filtered = filtered.filter(p=>p.labels.includes(filterType));

    // Классы кнопок
    document.querySelectorAll('.btn_type').forEach(b=>b.classList.remove('active'));
    if(filterType!=='all'){
        const activeBtn=document.querySelector(`.btn_type.${filterType}`);
        if(activeBtn) activeBtn.classList.add('active');
    } else {
        const allBtn=document.querySelector('.btn_type.all');
        if(allBtn) allBtn.classList.add('active');
    }

    renderFilteredProducts(filtered);
}
function updateCatalogCardButton(article) {
    const card = document.querySelector(`.card[data-product-id="${article}"]`);
    if (!card) return;

    const cartItem = cart.find(item => item.article === article);
    const btnBlock = card.querySelector('.btn-block');
    if (!btnBlock) return;

    if (cartItem) {
        btnBlock.innerHTML = `
            <div class="cart-counter" data-article="${article}">
                <button class="counter-btn counter-minus" data-action="decrease">-</button>
                <span class="counter-value">${cartItem.quantity}</span>
                <button class="counter-btn counter-plus" data-action="increase">+</button>
            </div>
            <button class="btn btn-light" data-buy-now data-article="${article}">Купить в 1 клик</button>
        `;
    } else {
        btnBlock.innerHTML = `
            <button class="btn btn-primary" data-add-to-cart data-article="${article}">В корзину</button>
            <button class="btn btn-light" data-buy-now data-article="${article}">Купить в 1 клик</button>
        `;
    }

    // Нужно заново навесить обработчики на кнопки внутри этой карточки
    initCartButtons();
}

// ===== Обновление количества товаров в категориях =====
function updateProductCounts(products) {
    const categoryElements=document.querySelectorAll('.catalog__top-element');
    categoryElements.forEach(el=>{
        const cls=Array.from(el.classList).find(c=>c!=='catalog__top-element');
        if(!cls) return;
        const category=cls.replace(/_/g,' ');
        const count=products.filter(p=>p.typeProduct===category).length;
        const countSpan=el.querySelector('.catalog__top-element__count');
        if(countSpan) countSpan.textContent=count;
    });
}

// ===== Назначение обработчиков и инициализация =====
document.addEventListener('DOMContentLoaded', function(){
    // Стили для "Товары не найдены"
    const style=document.createElement('style');
    style.textContent=`.no-products{text-align:center;padding:40px;font-size:18px;color:#666;grid-column:1/-1}.card-clickable-area{cursor:pointer}`;
    document.head.appendChild(style);

    initBreadcrumbs();
    if(typeof productData!=='undefined') renderAllProducts(productData);
    else console.error('productData is not defined');

    // Кнопки фильтров
    ['new','sale','hit','all'].forEach(label=>{
        const btn=document.querySelector(`.btn_type.${label}`);
        if(btn) btn.addEventListener('click',()=>displaysOfCertainProducts(label));
    });

    updateProductCounts(productData);


});



// ===== Поиск в каталоге =====
function searchInCatalog(query) {
    const lowerQuery = query.trim().toLowerCase();
    if (!lowerQuery) {
        // если пустой запрос, показываем все
        renderAllProducts(productData);
        return;
    }

    const pageType = getCurrentPageType();
    let filtered = pageType !== 'all'
        ? productData.filter(p => p.typeProduct === pageType)
        : productData;

    filtered = filtered.filter(p => {
        // поиск по названию, коллекции, типу продукта и описанию
        return (
            p.title.toLowerCase().includes(lowerQuery) ||
            p.collection.toLowerCase().includes(lowerQuery) ||
            p.typeProduct.toLowerCase().includes(lowerQuery) ||
            (p.description && p.description.toLowerCase().includes(lowerQuery))
        );
    });

    renderFilteredProducts(filtered);
}
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search__form-txt');
    const searchBtn = document.querySelector('.search__form-btn');

    if (searchInput && searchBtn) {
        // По кнопке
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            searchInCatalog(searchInput.value);
        });

        // По Enter
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchInCatalog(searchInput.value);
            }
        });
    }
});


