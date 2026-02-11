// product-page.js
document.addEventListener('DOMContentLoaded', function() {
    loadCartFromLocalStorage();
    updateCartDisplay();

    const urlParams = new URLSearchParams(window.location.search);
    const article = urlParams.get('article');
    if (!article) { showError('Товар не найден'); return; }

    const product = productData.find(p => p.article === article);
    if (!product) { showError('Товар не найден'); return; }

    renderProductPage(product);
    updateBreadcrumbs(product);
    initCollectionSlider(product.collection, product.article);
    initRecommendedSlider(product.article);

    // Синхронизация кнопки на странице товара с корзиной (даже если товар ещё не добавлен)
    updateCartButton(article);
});


// ===== Рендер страницы товара =====
function renderProductPage(product) {
    // --- Заголовок и артикул ---
    const titleEl = document.querySelector('.product-title');
    const skuEl = document.querySelector('.sku');
    if (titleEl) titleEl.textContent = product.title || 'Название отсутствует';
    if (skuEl) skuEl.textContent = `Артикул: ${product.article || '---'}`;

    // --- Статус ---
    const statusEl = document.querySelector('.available');
    if (statusEl) {
        if (product.status === "Нет в наличии") {
            statusEl.innerHTML = `<span class="status-icon status-out"></span>${product.status}`;
            statusEl.className = 'status-text-out';
        } else {
            statusEl.innerHTML = `<span class="status-icon status-in"></span>${product.status}`;
            statusEl.className = 'status-text-in';
        }
    }

    // --- Галерея и лейблы ---
    const galleryEl = document.querySelector('.product-gallery');
    if (galleryEl) {
        let labelsHTML = '';
        if (product.labels && product.labels.length) {
            labelsHTML = `<div class="labels">
                ${product.labels.map(l => `<span class="label label-${l.toLowerCase()}">${getLabelText(l)}</span>`).join('')}
            </div>`;
        }
        galleryEl.innerHTML = `
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.title}">
                ${labelsHTML}
            </div>
        `;
    }

    // --- Цвет ---
    const colorEl = document.querySelector('.name__color');
    if (colorEl) colorEl.textContent = product.color || '---';

    // --- Характеристики ---
    renderCharacteristics(product.characteristics);

    // --- Описание и комплектация ---
    renderDescriptionAndKit(product);

    // --- Цена ---
    const priceElement = document.querySelector('.price');


if (priceElement) {
    if (product.priceNew) {
        priceElement.innerHTML = product.priceOld
            ? `<span class="price-new" style="color:#e60000">${product.priceNew} руб./шт</span>
               <span class="price-old">${product.priceOld} руб./шт</span>`
            : `<span class="price-new" style="color:#213F74; font-size:22px">${product.priceNew} руб./шт</span>`;
    } else {
        priceElement.innerHTML = '<span class="price-new">Цена отсутствует</span>';
    }
}

}






// ===== Характеристики =====
function renderCharacteristics(characteristics) {
    const container = document.querySelector('.product-details-items');
    container.innerHTML = '';
    for (const [key, value] of Object.entries(characteristics)) {
        const div = document.createElement('div');
        div.className = 'product-details-item';
        div.innerHTML = `<span class="detail-name">${key}</span><span class="detail-value">${value}</span>`;
        container.appendChild(div);
    }
}

// ===== Описание и комплектация =====
function renderDescriptionAndKit(product) {
    const desc = document.querySelector('.description');
    const kit = document.querySelector('.equipment');

    if (desc && product.description) {
        desc.innerHTML = `<h2 class="section-title">Описание</h2><div class="description-content"><p>${product.description}</p></div>`;
    }

    if (kit && product.kit && product.kit.length) {
        kit.innerHTML = `<h2 class="section-title">Комплектация</h2><ul class="kit-list">${product.kit.map(i => `
        <li class="kit-item"><span class="kit-icon"><img src="/Plumbing-supple-store.github.io/icons/Vector.svg"></span>${i}</li>`).join('')}</ul>`;
    }
}

// ===== Текст лейблов =====
function getLabelText(label) {
    return { 'new':'Новинка','hit':'Хит','sale':'Акция' }[label] || label;
}

// ===== Breadcrumbs =====
function updateBreadcrumbs(product) {
    const nav = document.querySelector('[data-nav-items]');
    if (!nav) return;

    const categoryMap = { 'mixers':'Смесители','shower systems':'Душевые системы','shower racks':'Душевые стойки','spouts':'Изливы','accessories':'Аксессуары' };
    const categoryName = categoryMap[product.typeProduct] || 'Каталог';
    const categoryUrl = getCategoryUrl(product.typeProduct);

    nav.innerHTML = `<a href="../index.html" class="navigation__item nav-unactive">Главная</a><span>/</span><a href="catalog.html" class="navigation__item nav-unactive">Каталог</a><span>/</span><a href="${categoryUrl}" class="navigation__item nav-unactive">${categoryName}</a><span>/</span><a href="#" class="navigation__item navigation__item--current nav-active">${product.title}</a>`;
}

function getCategoryUrl(type) {
    return { 'mixers':'mixers.html','shower systems':'shower_systems.html','shower racks':'shower_racks.html','spouts':'spouts.html','accessories':'accessories.html' }[type] || 'catalog.html';
}

// ===== Слайдер коллекции =====
let collectionSwiper;
function initCollectionSlider(collection, currentArticle) {
    const products = productData.filter(p => p.collection === collection && p.article !== currentArticle);
    const section = document.querySelector('.collection__items');

    if (!products.length) return section.style.display='none';

    section.querySelector('h1').textContent = `Коллекция ${collection}`;
    const wrapper = section.querySelector('.swiper-wrapper');
    wrapper.innerHTML = '';

    products.forEach(p=>{
        const slide = document.createElement('a');
        slide.className = 'swiper-slide';
        slide.href = `/Plumbing-supple-store.github.io/Pages/product.html?article=${p.article}`;
        slide.innerHTML = `<div class="slide-image-container"><img src="${p.image}" alt="${p.title}"></div><div class="slide-text"><h3 class="swiper__title">${p.title}</h3><div class="swiper__btn"><p class="swiper__btn-txt">Смотреть</p><img src="/Plumbing-supple-store.github.io/icons/arrow-right-blue.svg"></div></div>`;
        wrapper.appendChild(slide);
    });

    if(collectionSwiper) collectionSwiper.destroy(true,true);
    collectionSwiper = new Swiper(".mySwiper",{ slidesPerView:4,spaceBetween:20,freeMode:false,navigation:{nextEl:'.collection-button-next',prevEl:'.collection-button-prev'},pagination:{el:".swiper-pagination",clickable:true},breakpoints:{320:{slidesPerView:1,spaceBetween:15,navigation:{enabled:false}},768:{slidesPerView:2,spaceBetween:20,navigation:{enabled:false}},1024:{slidesPerView:3,spaceBetween:20,navigation:{enabled:true}},1280:{slidesPerView:4,spaceBetween:20,navigation:{enabled:true}}}});
}
// product-page.js
function updateProductPageCartButton(article) {
    const cartItem = cart.find(item => item.article === article);
    const container = document.querySelector('.product-buy');
    if (!container) return;

    const priceElement = container.querySelector('.price');
    if (!priceElement) return;

    // --- Удаляем только старые кнопки, не трогаем цену ---
    const existingButtons = container.querySelectorAll('.cart-counter, .btn');
    existingButtons.forEach(el => el.remove());

    const product = productData.find(p => p.article === article);
    if (!product) return;

    // --- Формируем новые кнопки ---
    let buttonsHTML = '';
    if (cartItem) {
        buttonsHTML = `
            <div class="cart-counter" data-article="${article}">
                <button class="counter-btn" data-action="decrease">-</button>
                <span class="counter-value">${cartItem.quantity}</span>
                <button class="counter-btn" data-action="increase">+</button>
            </div>
            <button class="btn btn-light" data-buy-now data-article="${article}">Купить в 1 клик</button>
        `;
    } else {
        buttonsHTML = `
            <button class="btn btn-primary" data-add-to-cart data-article="${article}">В корзину</button>
            <button class="btn btn-light" data-buy-now data-article="${article}">Купить в 1 клик</button>
        `;
    }

    // --- Вставляем кнопки после цены ---

    priceElement.insertAdjacentHTML('afterend', buttonsHTML);
}





// ===== Слайдер рекомендуемых =====
function initRecommendedSlider(currentArticle) {
    const recommendedProducts = productData
        .filter(p => p.article !== currentArticle && p.status === "В наличии")
        .sort(() => 0.5 - Math.random())
        .slice(0, 7);

    const wrapper = document.querySelector('.mySwiperRecommended .swiper-wrapper');
    if (!recommendedProducts.length) return document.querySelector('.recommended__items').style.display = 'none';

    wrapper.innerHTML = '';

    recommendedProducts.forEach(p => {
        const hasSale = p.labels.includes("sale");
        const priceColor = hasSale ? "#FF0000" : "#1d2d5f";

        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.innerHTML = `
            <div class="slide-content" style="display:flex; flex-direction:column; height:100%;">
                <a href="/Plumbing-supple-store.github.io/Pages/product.html?article=${p.article}" class="slide-link">
                    <div class="slide-image-container">
                        <img src="${p.image}" alt="${p.title}">
                        <div class="labels">
                            ${p.labels.includes("new") ? '<div class="label label-new">Новинка</div>' : ''}
                            ${p.labels.includes("sale") ? '<div class="label label-sale">Акция</div>' : ''}
                            ${p.labels.includes("hit") ? '<div class="label label-hit">Хит</div>' : ''}
                        </div>
                    </div>
                    <div class="slide-text">
                        <div class="status-article">
                            <div class="status ${p.status === "Нет в наличии" ? "status-text-out" : "status-text-in"}">
                                ${p.status === "Нет в наличии" ? `<span class="status-icon status-out"></span>${p.status}` : `<span class="status-icon status-in"></span>${p.status}`}
                            </div>
                            <div class="article">Арт: ${p.article}</div>
                        </div>
                        <h3 class="swiper__title">${p.title}</h3>
                        <div class="price-block">
                            <span class="price-new" style="color:${priceColor}">${p.priceNew} руб.</span>
                            ${p.priceOld ? `<span class="price-old">${p.priceOld} руб.</span>` : ''}
                        </div>
                    </div>
                </a>
                <div class="slide-buttons">
                    <button class="btn btn-primary" data-add-to-cart data-article="${p.article}">В корзину</button>
                    <button class="btn btn-light" data-buy-now data-article="${p.article}">Купить в 1 клик</button>
                </div>
            </div>
        `;
        wrapper.appendChild(slide);
    });

    new Swiper(".mySwiperRecommended", {
        slidesPerView: 4,
        spaceBetween: 20,
        navigation: {
            nextEl: '.recommended-button-next',
            prevEl: '.recommended-button-prev'
        },
        pagination: {
            el: ".recommended-pagination",
            clickable: true
        },
        breakpoints: {
            320: { slidesPerView: 1, spaceBetween: 15, navigation: { enabled: false } },
            768: { slidesPerView: 2, spaceBetween: 20, navigation: { enabled: false } },
            1024: { slidesPerView: 3, spaceBetween: 20, navigation: { enabled: true } },
            1280: { slidesPerView: 4, spaceBetween: 20, navigation: { enabled: true } }
        }
    });
}



// ===== Кнопки на странице товара =====
function initProductPageCartButtons() {
    const container = document.querySelector('.product-page');
    if (!container) return;

    container.addEventListener('click', function(e) {
        // Добавление в корзину
        const addBtn = e.target.closest('[data-add-to-cart]');
        if (addBtn) { handleAddToCart(addBtn); return; }

        // Купить в 1 клик
        const buyBtn = e.target.closest('[data-buy-now]');
        if (buyBtn) { handleBuyNow(buyBtn); return; }

        // Кнопки счетчика
        const counterBtn = e.target.closest('.cart-counter .counter-btn');
        if (counterBtn){
            const article = counterBtn.closest('.cart-counter').dataset.article;
            const action = counterBtn.dataset.action;
            updateCartItemQuantity(article, action);

            // Обновляем кнопки после изменения количества
            updateProductPageCartButton(article);
        }
    });
}


function handleAddToCart(button){
    const article = button.dataset.article;
    const product = productData.find(p => p.article === article);
    if(!product) return;

    addToCart(product.title, parsePrice(product.priceNew), product.image, article);
    updateProductPageCartButton(article);
}



function handleBuyNow(button){
    handleAddToCart(button);
    setTimeout(goToCheckout,300);
}

function showError(msg){
    const container=document.querySelector('.product-page-container');
    if(container) container.innerHTML=`<div class="error">${msg}</div>`;
}




