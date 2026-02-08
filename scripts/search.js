document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.querySelector(".search__form-txt");
    const resultsContainer = document.querySelector(".search-results");

    function searchProducts(query) {
        const lowerQuery = query.trim().toLowerCase();
        if (!lowerQuery) return [];

        return productData.filter(product => {
            return (
                product.title.toLowerCase().includes(lowerQuery) ||
                product.description.toLowerCase().includes(lowerQuery) ||
                product.collection.toLowerCase().includes(lowerQuery) ||
                product.color.toLowerCase().includes(lowerQuery)
            );
        });
    }

    function displayResults(results) {
    resultsContainer.innerHTML = "";

    if (results.length === 0) {
        resultsContainer.innerHTML = "<p>Товары не найдены</p>";
        return;
    }

    results.forEach(product => {
        const productEl = document.createElement("div");
        productEl.classList.add("search-result-item");
        productEl.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <div>
                <h4>${product.title}</h4>
                <p>Цена: ${product.priceNew} руб</p>
                <p>Коллекция: ${product.collection}</p>
            </div>
        `;

        // --- Переход на страницу товара при клике ---
        productEl.addEventListener("click", () => {
            // Скрываем подсказку
            resultsContainer.style.display = "none";

            // Переходим на страницу товара с артикулом в URL
            window.location.href = `/Pages/product.html?article=${product.article}`;
        });

        resultsContainer.appendChild(productEl);
    });
}


    searchInput.addEventListener("input", () => {
        const query = searchInput.value;
        if (query.trim() === "") {
            resultsContainer.style.display = "none"; // скрываем, если поле пустое
            return;
        }

        const results = searchProducts(query);
        displayResults(results);
        resultsContainer.style.display = "flex"; // показываем подсказку
    });

    // Скрываем при клике вне поля поиска
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".search")) {
            resultsContainer.style.display = "none";
        }
    });
});
