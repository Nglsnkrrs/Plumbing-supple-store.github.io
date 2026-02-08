// cartModule.js - Единый модуль для управления корзиной

const CartModule = (function() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Вспомогательные функции
    const parsePrice = (priceText) => {
        if (!priceText) return 0;
        const cleanPrice = priceText.toString()
            .replace(/\s+/g, '')
            .replace(',', '.')
            .replace(/[^\d.-]/g, '');
        return parseFloat(cleanPrice) || 0;
    };

    const saveToStorage = () => {
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    const findCartItem = (article) => cart.find(item => item.article === article);

    const getCartItemIndex = (article) => cart.findIndex(item => item.article === article);

    // Основные методы
    const add = (product) => {
        const { title, priceNew, image, article } = product;
        const existingItem = findCartItem(article);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                title,
                price: parsePrice(priceNew),
                image,
                article,
                quantity: 1
            });
        }

        saveToStorage();
        return findCartItem(article);
    };

    const updateQuantity = (article, action) => {
        const item = findCartItem(article);
        if (!item) return null;

        if (action === 'increase') {
            item.quantity += 1;
        } else if (action === 'decrease') {
            item.quantity -= 1;

            if (item.quantity <= 0) {
                const index = getCartItemIndex(article);
                if (index !== -1) {
                    cart.splice(index, 1);
                }
            }
        }

        saveToStorage();
        return item;
    };

    const remove = (article) => {
        const index = getCartItemIndex(article);
        if (index !== -1) {
            cart.splice(index, 1);
            saveToStorage();
            return true;
        }
        return false;
    };

    const clear = () => {
        cart.length = 0;
        saveToStorage();
    };

    const getCart = () => [...cart];

    const getTotalCount = () => cart.reduce((total, item) => total + item.quantity, 0);

    const getTotalAmount = () => cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    return {
        add,
        updateQuantity,
        remove,
        clear,
        getCart,
        getTotalCount,
        getTotalAmount,
        parsePrice,
        findCartItem
    };
})();