// filter.js

// Глобальные переменные
let currentFilters = {
    collections: [],
    styles: [],
    colors: [],
    minPrice: 0,
    maxPrice: 100000
};

let currentLabelFilter = 'all'; // 'new', 'sale', 'hit', 'all'
let filterTimeout; // Для debounce

// Функция для обновления фильтра меток извне
function updateLabelFilter(filterType) {
    currentLabelFilter = filterType;
    applyFilters();
}

// Экспортируем функцию для использования в products.js
window.updateLabelFilter = updateLabelFilter;

// Инициализация фильтров
function initFilters() {
    populateFilters();
    setupEventListeners();
    initPriceSlider();

    // Свернуть все фильтры по умолчанию
    document.querySelectorAll('.filter-content').forEach(content => {
        content.classList.remove('expanded');
    });
}

// Заполнение фильтров уникальными значениями
function populateFilters() {
    if (!productData || productData.length === 0) return;

    // Получаем текущий тип страницы
    const currentPageType = getCurrentPageType();

    // Фильтруем товары по типу страницы и меткам
    let filteredProducts = productData;
    if (currentPageType !== 'all') {
        filteredProducts = filteredProducts.filter(item => item.typeProduct === currentPageType);
    }

    // Не применяем фильтр по меткам здесь, чтобы показывать все возможные опции
    // для текущего типа страницы, независимо от активного фильтра меток

    // Уникальные коллекции
    const collections = [...new Set(filteredProducts
        .map(p => p.collection)
        .filter(c => c && c.trim() !== ''))].sort();

    const collectionFilter = document.getElementById('collectionFilter');
    collectionFilter.innerHTML = '';
    collections.forEach(collection => {
        const label = document.createElement('label');
        label.innerHTML = `
            <input type="checkbox" name="collection" value="${collection}">
            <span>${collection}</span>
        `;
        collectionFilter.appendChild(label);
    });

    // Уникальные стили из characteristics
    const styles = [...new Set(filteredProducts
        .map(p => p.characteristics?.['Стиль'] || '')
        .filter(s => s && s.trim() !== ''))].sort();

    const styleFilter = document.getElementById('styleFilter');
    styleFilter.innerHTML = '';
    styles.forEach(style => {
        const label = document.createElement('label');
        label.innerHTML = `
            <input type="checkbox" name="style" value="${style}">
            <span>${style}</span>
        `;
        styleFilter.appendChild(label);
    });

    // Уникальные цвета
    const colors = [...new Set(filteredProducts
        .map(p => p.color)
        .filter(c => c && c.trim() !== ''))].sort();

    const colorFilter = document.getElementById('colorFilter');
    colorFilter.innerHTML = '';
    colors.forEach(color => {
        const label = document.createElement('label');
        label.innerHTML = `
            <input type="checkbox" name="color" value="${color}">
            <span>${color}</span>
        `;
        colorFilter.appendChild(label);
    });
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Кнопки фильтров
    const resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }

    // Чекбоксы фильтров - автоматическое применение
    document.addEventListener('change', function(e) {
        if (e.target.matches('#collectionFilter input[name="collection"]') ||
            e.target.matches('#styleFilter input[name="style"]') ||
            e.target.matches('#colorFilter input[name="color"]')) {
            applyFiltersDebounced();
        }
    });

    // Поля ввода цены - с debounce
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');

    if (priceMin && priceMax) {
        priceMin.addEventListener('input', () => {
            updatePriceFromInput();
            applyFiltersDebounced();
        });

        priceMax.addEventListener('input', () => {
            updatePriceFromInput();
            applyFiltersDebounced();
        });
    }

    // Слайдеры цены
    const rangeMin = document.getElementById('rangeMin');
    const rangeMax = document.getElementById('rangeMax');

    if (rangeMin && rangeMax) {
        rangeMin.addEventListener('input', () => {
            updatePriceFromSlider('min');
            applyFiltersDebounced();
        });

        rangeMax.addEventListener('input', () => {
            updatePriceFromSlider('max');
            applyFiltersDebounced();
        });
    }
}

// Функция debounce для оптимизации
function applyFiltersDebounced() {
    clearTimeout(filterTimeout);
    filterTimeout = setTimeout(() => {
        applyFilters();
    }, 300); // Задержка 300мс
}

// Инициализация слайдера цены
function initPriceSlider() {
    if (!productData || productData.length === 0) return;

    const currentPageType = getCurrentPageType();
    let filteredProducts = productData;
    if (currentPageType !== 'all') {
        filteredProducts = productData.filter(item => item.typeProduct === currentPageType);
    }

    // Не применяем фильтр по меткам при инициализации слайдера,
    // чтобы слайдер всегда показывал полный диапазон для текущей страницы

    // Получаем минимальную и максимальную цены
    const prices = filteredProducts.map(p => {
        return parseInt(p.priceNew.replace(/\s/g, '')) || 0;
    });

    if (prices.length === 0) {
        console.warn('No products available for price slider');
        return;
    }

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Устанавливаем значения слайдеров
    const rangeMin = document.getElementById('rangeMin');
    const rangeMax = document.getElementById('rangeMax');
    const priceMinInput = document.getElementById('priceMin');
    const priceMaxInput = document.getElementById('priceMax');

    if (!rangeMin || !rangeMax || !priceMinInput || !priceMaxInput) {
        console.warn('Price slider elements not found');
        return;
    }

    rangeMin.min = minPrice;
    rangeMin.max = maxPrice;
    rangeMin.value = minPrice;

    rangeMax.min = minPrice;
    rangeMax.max = maxPrice;
    rangeMax.value = maxPrice;

    priceMinInput.placeholder = minPrice;
    priceMinInput.min = minPrice;
    priceMinInput.max = maxPrice;

    priceMaxInput.placeholder = maxPrice;
    priceMaxInput.min = minPrice;
    priceMaxInput.max = maxPrice;

    // Сохраняем текущие фильтры
    currentFilters.minPrice = minPrice;
    currentFilters.maxPrice = maxPrice;
}

// Обновление цены из полей ввода
function updatePriceFromInput() {
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    const rangeMin = document.getElementById('rangeMin');
    const rangeMax = document.getElementById('rangeMax');

    if (!priceMin || !priceMax || !rangeMin || !rangeMax) return;

    let minValue = parseInt(priceMin.value) || parseInt(priceMin.placeholder);
    let maxValue = parseInt(priceMax.value) || parseInt(priceMax.placeholder);

    // Проверяем границы
    if (minValue < parseInt(rangeMin.min)) minValue = parseInt(rangeMin.min);
    if (minValue > parseInt(rangeMax.max)) minValue = parseInt(rangeMax.max);
    if (maxValue > parseInt(rangeMax.max)) maxValue = parseInt(rangeMax.max);
    if (maxValue < parseInt(rangeMin.min)) maxValue = parseInt(rangeMin.min);

    // Убеждаемся, что min <= max
    if (minValue > maxValue) {
        minValue = maxValue;
    }

    // Обновляем значения
    priceMin.value = minValue;
    priceMax.value = maxValue;
    rangeMin.value = minValue;
    rangeMax.value = maxValue;

    // Обновляем фильтры
    currentFilters.minPrice = minValue;
    currentFilters.maxPrice = maxValue;
}

// Обновление цены из слайдеров
function updatePriceFromSlider(type) {
    const rangeMin = document.getElementById('rangeMin');
    const rangeMax = document.getElementById('rangeMax');
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');

    if (!rangeMin || !rangeMax || !priceMin || !priceMax) return;

    let minValue = parseInt(rangeMin.value);
    let maxValue = parseInt(rangeMax.value);

    // Убеждаемся, что ползунки не пересекаются
    if (type === 'min' && minValue > maxValue) {
        minValue = maxValue;
        rangeMin.value = minValue;
    }
    if (type === 'max' && maxValue < minValue) {
        maxValue = minValue;
        rangeMax.value = maxValue;
    }

    // Обновляем поля ввода
    priceMin.value = minValue;
    priceMax.value = maxValue;

    // Обновляем фильтры
    currentFilters.minPrice = minValue;
    currentFilters.maxPrice = maxValue;
}

// Переключение видимости фильтров
function toggleFilter(filterType) {
    const filterContent = document.getElementById(filterType + 'Filter');
    const arrow = filterContent.previousElementSibling.querySelector('.filter-arrow');

    filterContent.classList.toggle('expanded');
    arrow.style.transform = filterContent.classList.contains('expanded') ? 'rotate(180deg)' : 'rotate(0deg)';
}

// Сбор текущих фильтров
function updateCurrentFilters() {
    // Коллекции
    currentFilters.collections = Array.from(
        document.querySelectorAll('#collectionFilter input[name="collection"]:checked')
    ).map(cb => cb.value);

    // Стили
    currentFilters.styles = Array.from(
        document.querySelectorAll('#styleFilter input[name="style"]:checked')
    ).map(cb => cb.value);

    // Цвета
    currentFilters.colors = Array.from(
        document.querySelectorAll('#colorFilter input[name="color"]:checked')
    ).map(cb => cb.value);

    // Цена
    const rangeMin = document.getElementById('rangeMin');
    const rangeMax = document.getElementById('rangeMax');

    if (rangeMin && rangeMax) {
        currentFilters.minPrice = parseInt(rangeMin.value) || 0;
        currentFilters.maxPrice = parseInt(rangeMax.value) || 100000;
    }
}

// Применение фильтров
function applyFilters() {
    updateCurrentFilters();

    const currentPageType = getCurrentPageType();
    let filteredProducts = productData;

    // 1. Фильтр по типу страницы
    if (currentPageType !== 'all') {
        filteredProducts = filteredProducts.filter(item => item.typeProduct === currentPageType);
    }

    // 2. Фильтр по меткам, коллекциям, стилям, цветам и цене одновременно
    filteredProducts = filteredProducts.filter(item => {
        const price = parseInt(item.priceNew.replace(/\s/g, '')) || 0;

        // Метки
        const labelMatch = (currentLabelFilter === 'all') || (item.labels && item.labels.includes(currentLabelFilter));

        // Коллекции
        const collectionMatch = currentFilters.collections.length === 0 || currentFilters.collections.includes(item.collection);

        // Стили
        const styleMatch = currentFilters.styles.length === 0 || currentFilters.styles.includes(item.characteristics?.['Стиль'] || '');

        // Цвета
        const colorMatch = currentFilters.colors.length === 0 || currentFilters.colors.includes(item.color);

        // Цена
        const priceMatch = price >= currentFilters.minPrice && price <= currentFilters.maxPrice;

        return labelMatch && collectionMatch && styleMatch && colorMatch && priceMatch;
    });

    // Рендерим отфильтрованные товары
    renderFilteredProducts(filteredProducts);

    // Обновляем кнопки фильтров
    updateFilterButtons();

    if (typeof updateProductCounts === 'function') {
        updateProductCounts(filteredProducts);
    }
}



// Сброс фильтров
// Сброс боковых фильтров (не затрагивает фильтр меток)
function resetFilters() {
    // 1. Сбрасываем все чекбоксы боковых фильтров
    document.querySelectorAll('.filter-content input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });

    // 2. Сбрасываем текущие боковые фильтры
    currentFilters.collections = [];
    currentFilters.styles = [];
    currentFilters.colors = [];

    // 3. Сбрасываем поля и слайдеры цены, но учитываем текущие товары с фильтром меток
    const currentPageType = getCurrentPageType();
    let filteredProducts = productData;

    if (currentPageType !== 'all') {
        filteredProducts = productData.filter(item => item.typeProduct === currentPageType);
    }

    if (currentLabelFilter && currentLabelFilter !== 'all') {
        filteredProducts = filteredProducts.filter(item =>
            item.labels && item.labels.includes(currentLabelFilter)
        );
    }

    // Устанавливаем цену слайдера на основе отфильтрованных товаров
    if (filteredProducts.length > 0) {
        const prices = filteredProducts.map(p => parseInt(p.priceNew.replace(/\s/g, '')) || 0);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        updatePriceSliders(minPrice, maxPrice);
    } else {
        // Если товаров нет, используем полный диапазон текущей страницы
        let allProductsForSlider = productData;
        if (currentPageType !== 'all') {
            allProductsForSlider = productData.filter(item => item.typeProduct === currentPageType);
        }

        if (allProductsForSlider.length > 0) {
            const prices = allProductsForSlider.map(p => parseInt(p.priceNew.replace(/\s/g, '')) || 0);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);

            updatePriceSliders(minPrice, maxPrice);
        }
    }

    // 4. Применяем фильтры (с учётом текущего фильтра меток)
    applyFilters();
}

// Вспомогательная функция для обновления слайдеров и полей цены
function updatePriceSliders(minPrice, maxPrice) {
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    const rangeMin = document.getElementById('rangeMin');
    const rangeMax = document.getElementById('rangeMax');

    if (!priceMin || !priceMax || !rangeMin || !rangeMax) return;

    // Сбрасываем значения полей ввода
    priceMin.value = '';
    priceMax.value = '';

    // Обновляем слайдеры и placeholder
    rangeMin.min = minPrice;
    rangeMin.max = maxPrice;
    rangeMin.value = minPrice;

    rangeMax.min = minPrice;
    rangeMax.max = maxPrice;
    rangeMax.value = maxPrice;

    priceMin.placeholder = minPrice;
    priceMax.placeholder = maxPrice;

    // Обновляем текущие фильтры
    currentFilters.minPrice = minPrice;
    currentFilters.maxPrice = maxPrice;
}


// Обновление кнопок фильтров (новинки, акции, хиты)
function updateFilterButtons() {
    // Снимаем активный класс со всех кнопок
    document.querySelectorAll('.btn_type').forEach(btn => btn.classList.remove('active'));

    // Находим кнопку для текущего фильтра меток
    let filterButton = document.querySelector(`.btn_type.${currentLabelFilter}`);

    // Если кнопка не найдена (например, currentLabelFilter = 'all'), включаем кнопку "all"
    if (!filterButton) {
        filterButton = document.querySelector('.btn_type.all');
    }

    if (filterButton) {
        filterButton.classList.add('active');
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация фильтров
    if (document.querySelector('.filters')) {
        setTimeout(() => {
            initFilters();
            // Применяем текущие фильтры после инициализации
            applyFilters();
        }, 100);
    }
});