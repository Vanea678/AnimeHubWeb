document.addEventListener('DOMContentLoaded', () => {
    // --- Получение элементов DOM ---
    const videoGrid = document.getElementById('video-grid');
    const modal = document.getElementById('modal');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const closeModalButton = document.getElementById('close-modal');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');

    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const noResultsMessage = document.getElementById('no-results-message');

    const themeToggleButton = document.getElementById('theme-toggle-button');
    const loadMoreButton = document.getElementById('load-more-button');

    let allVideoItems = []; // Массив для хранения всех карточек, включая динамически добавленные

    // --- Инициализация ---
    const initializePage = () => {
        // Собираем все существующие карточки видео
        allVideoItems = Array.from(videoGrid.querySelectorAll('.video-item'));
        // Навешиваем обработчики на существующие карточки
        allVideoItems.forEach(item => attachModalListener(item));
        // Устанавливаем тему при загрузке
        applySavedTheme();
    };


    // --- Логика Модального Окна ---
    const openModal = (item) => {
        const title = item.dataset.title || 'Нет заголовка';
        const description = item.dataset.description || 'Нет описания.';
        const imgSrc = item.querySelector('img')?.src || '';

        modalTitle.textContent = title;
        modalDescription.textContent = description;
        modalImg.src = imgSrc;
        modalImg.alt = title;

        modal.classList.remove('hidden');
        modalBackdrop.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        modal.classList.add('hidden');
        modalBackdrop.classList.add('hidden');
        document.body.style.overflow = '';
    };

    // Функция для навешивания обработчиков на карточку видео
    const attachModalListener = (item) => {
         // Удаляем старый обработчик, если он был (на всякий случай)
        item.removeEventListener('click', handleItemClick);
        item.removeEventListener('keydown', handleItemKeydown);

         // Сохраняем ссылку на функцию, чтобы можно было ее удалить
        item._clickHandler = () => openModal(item);
        item._keydownHandler = (e) => {
             if (e.key === 'Enter' || e.key === ' ') {
                 openModal(item);
             }
         };

        item.addEventListener('click', item._clickHandler);
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
        item.addEventListener('keydown', item._keydownHandler);
    };


    // Слушатели для закрытия модального окна
    closeModalButton.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });

    // --- Логика Поиска ---
    const filterVideos = () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        let visibleCount = 0;

        allVideoItems.forEach(item => {
            const title = item.dataset.title?.toLowerCase() || ''; // Берем из data-* для надежности
            const description = item.dataset.description?.toLowerCase() || '';
            const isVisible = title.includes(searchTerm) || description.includes(searchTerm);

            if (isVisible) {
                item.classList.remove('hidden-item');
                visibleCount++;
            } else {
                item.classList.add('hidden-item');
            }
        });

        // Показываем/скрываем сообщение "Ничего не найдено"
        if (visibleCount === 0 && searchTerm !== '') {
            noResultsMessage.classList.remove('hidden');
        } else {
            noResultsMessage.classList.add('hidden');
        }
    };

    searchInput.addEventListener('input', filterVideos);
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // filterVideos(); // Уже вызывается при input
    });

    // --- Логика Переключения Темы ---
    const applyTheme = (theme) => {
        document.body.setAttribute('data-theme', theme);
        themeToggleButton.innerHTML = theme === 'dark'
            ? '<i class="fas fa-sun"></i>'  // Иконка солнца для темной темы
            : '<i class="fas fa-moon"></i>'; // Иконка луны для светлой темы
        localStorage.setItem('animeTheme', theme); // Сохраняем выбор
    };

    const toggleTheme = () => {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    };

    const applySavedTheme = () => {
        const savedTheme = localStorage.getItem('animeTheme') || 'dark'; // По умолчанию темная
        applyTheme(savedTheme);
    };

    themeToggleButton.addEventListener('click', toggleTheme);

    // --- Логика "Загрузить еще" (Симуляция) ---
    let loadCount = 0;
    const maxLoads = 2; // Сколько раз можно нажать "Загрузить еще"

    const loadMoreItems = () => {
        const itemsToLoad = 3; // Сколько карточек добавлять за раз
        const fragment = document.createDocumentFragment(); // Используем фрагмент для производительности

        for (let i = 0; i < itemsToLoad; i++) {
            const newItem = document.createElement('div');
            newItem.classList.add('video-item');
            // Генерируем уникальные данные (или можно дублировать существующие для простоты)
            const uniqueId = Date.now() + i;
            newItem.dataset.title = `Новое Аниме ${uniqueId}`;
            newItem.dataset.description = `Описание нового аниме ${uniqueId}. Очень интересное!`;

            newItem.innerHTML = `
                <img src="https://via.placeholder.com/320x180/${Math.random() > 0.5 ? '8e44ad' : '9b59b6'}/ffffff?text=Новое+${i + 1}" alt="Новое Аниме ${i + 1}">
                <h3>${newItem.dataset.title}</h3>
                <p>Студия Новинок</p>
                <p>${Math.floor(Math.random() * 100)}K просмотров &bull; Только что</p>
            `;

            attachModalListener(newItem); // **Важно:** Навешиваем обработчик на новый элемент
            fragment.appendChild(newItem);
            allVideoItems.push(newItem); // Добавляем в общий массив для поиска
        }

        videoGrid.appendChild(fragment); // Добавляем все новые элементы разом
        loadCount++;

        // Скрываем кнопку, если достигли лимита
        if (loadCount >= maxLoads) {
            loadMoreButton.classList.add('hidden');
        }

         // Если поиск активен, нужно перефильтровать, чтобы новые элементы тоже учитывались
         if(searchInput.value.trim() !== '') {
             filterVideos();
         }
    };

    loadMoreButton.addEventListener('click', loadMoreItems);

    // --- Запуск инициализации при загрузке ---
    initializePage();
});

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('v'); // Получаем 'aot-final' из ?v=aot-final

    if (videoId) {
        // 1. Найти информацию о видео по videoId (в реальном приложении - запрос к серверу, здесь - можно из заранее подготовленного объекта JS или data-атрибутов, если бы они были доступны)
        //    const videoData = findVideoDataById(videoId); // Симуляция

        // 2. Отобразить информацию на странице (плеер, заголовок, описание)
        //    document.getElementById('player-placeholder').innerHTML = `Воспроизведение видео ${videoId}...`;
        //    document.getElementById('video-title').textContent = videoData.title;
        //    document.getElementById('video-description').textContent = videoData.description;

        // 3. Инициализировать и загрузить комментарии для этого videoId
        initializeComments(videoId);
    } else {
        // Показать ошибку, что видео не найдено
        document.getElementById('content-area').innerHTML = '<h1>Видео не найдено!</h1>';
    }
});

function initializeComments(videoId) {
    // Тут будет код для загрузки, отображения и добавления комментариев,
    // использующий videoId в качестве ключа для localStorage
    // (очень похож на код из предыдущего примера, но привязан к videoId из URL)
    // ...
}