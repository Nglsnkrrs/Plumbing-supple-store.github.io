// Модальное окно - работаем со ВСЕМИ кнопками
const modalOpenButtons = document.querySelectorAll('[data-modal-open]');
const modal = document.querySelector('.modal');
const modalClose = document.querySelector('[data-modal-close]');
const mobileMenu = document.getElementById('mobileMenu');

modalOpenButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        // Закрываем мобильное меню, если оно открыто
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = 'hidden'; // Оставляем скрытым для модального окна
        }

        // Открываем модальное окно
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    });
});

if (modalClose) {
    modalClose.addEventListener('click', function() {
        modal.classList.remove('open');
        document.body.style.overflow = 'auto';
    });
}

// Закрытие модального окна при клике вне его
modal.addEventListener('click', function(event) {
    if (event.target === modal) {
        modal.classList.remove('open');
        document.body.style.overflow = 'auto';
    }
});

// Закрытие модального окна при нажатии Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        if (modal.classList.contains('open')) {
            modal.classList.remove('open');
            document.body.style.overflow = 'auto';
        }
        // Также закрываем мобильное меню при Escape
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }
});

// Мобильное меню
const hamburger = document.getElementById('hamburger');
const mobileMenuClose = document.getElementById('mobileMenuClose');

if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function(e) {
        e.stopPropagation();

        // Закрываем модальное окно, если оно открыто
        if (modal.classList.contains('open')) {
            modal.classList.remove('open');
        }

        mobileMenu.classList.add('active-menu');
        document.body.style.overflow = 'hidden';
    });

    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', function() {
            mobileMenu.classList.remove('active-menu');
            document.body.style.overflow = 'auto';
        });
    }

    // Закрытие по клику вне меню
    document.addEventListener('click', function(e) {
        if (mobileMenu && mobileMenu.classList.contains('active-menu') &&
            !mobileMenu.contains(e.target) &&
            !hamburger.contains(e.target)) {
            mobileMenu.classList.remove('active-menu');
            document.body.style.overflow = 'auto';
        }
    });
}

// Раскрывающийся каталог в мобильном меню
document.addEventListener('DOMContentLoaded', function() {
    const catalogHeader = document.querySelector('.catalog-header');

    if (catalogHeader) {
        catalogHeader.addEventListener('click', function() {
            const catalogLinks = this.nextElementSibling;
            const isExpanded = catalogLinks.style.display === 'block';

            if (isExpanded) {
                catalogLinks.style.display = 'none';
                this.classList.remove('expanded');
            } else {
                catalogLinks.style.display = 'block';
                this.classList.add('expanded');
            }
        });
    }
});