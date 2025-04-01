
function Product(actual_price, created_at, discount_price, id, image_url,
    main_category, name, rating, sub_category) {
    this.id = id;
    this.actual_price = actual_price;
    this.created_at = created_at;
    this.discount_price = discount_price;
    this.image_url = image_url;
    this.main_category = main_category;
    this.name = name;
    this.rating = rating;
    this.sub_category = sub_category;
}

let products = [];
let choosenGoods = JSON.parse(localStorage.getItem('choosenGoods')) || [];
let isFindFiltered = false;
let nowInFindFilter = [];

function showNotification(message, type) {
    const notificationSection = document.querySelector('.notification-section');
    const notificationText = document.querySelector('.notification-text');

    notificationText.textContent = message;

    console.log(type, message);

    // Добавляем класс в зависимости от типа уведомления
    if (type === 'success') {
        notificationSection.style.backgroundColor = 'lightgreen';
    } else if (type === 'error') {
        notificationSection.style.backgroundColor = 'red';
    } else if (type === 'info') {
        notificationSection.style.backgroundColor = 'lightblue';
    }

    notificationSection.style.display = 'flex'; // Показываем уведомление

    // Закрытие уведомления через 5 сек
    setTimeout(() => {
        notificationSection.style.display = 'none';
    }, 5000);
}

document.querySelector('.notification-close-button')
    .addEventListener('click', function () {
        document.querySelector('.notification-section').style.display = 'none';
    });

function higlightChoosenCards() {
    for (let prId of choosenGoods) {

        let productCard = 
        document.querySelector(`.product-card[data-id="${prId}"]`);
        console.log(`Trying to highlight: ${prId}`, productCard);

        if (productCard) {
            productCard.classList.add("active-card");
        } else {
            console.error(`Element not found for ${prId}`);
        }
    }
}

function addCardToChoosen(event) {
    let productCard = event.target.parentNode;
    let productId = productCard.getAttribute('data-id');
    if (choosenGoods.includes(productId)) {
        return;
    }
    choosenGoods.push(productId);
    console.log(choosenGoods);

    localStorage.setItem('choosenGoods', JSON.stringify(choosenGoods));
    productCard.classList.add('active-card');

}

function renderCards() {
    let isHidden = Boolean(nowInFindFilter.length);
    let catalogProducts = document.querySelector('.catalog-products');
    catalogProducts.innerHTML = '';
    for (let product of products) {
        let divCard = document.createElement('div');
        divCard.classList.add('product-card');

        if (isHidden && !nowInFindFilter.includes(product.id)) {
            divCard.style.display = 'none';
        }

        let divImg = document.createElement('div');
        divImg.classList.add('product-img');

        let productImg = document.createElement('img');
        productImg.src = product.image_url;
        productImg.alt = product.name;

        let productName = document.createElement('p');
        productName.classList.add('product-name');
        productName.textContent = product.name;
        productName.title = product.name; // Полный текст для подсказки

        let rating = document.createElement('p');
        rating.textContent = product.rating;

        let divProductPriceInfo = document.createElement('div');
        divProductPriceInfo.classList.add('product-price-info');

        let actualPrice = document.createElement('p');
        actualPrice.classList.add('product-current-price');
        actualPrice.textContent = product.actual_price;

        divCard.append(divImg);
        divImg.append(productImg);
        divCard.append(productName);
        divCard.append(rating);
        divCard.append(divProductPriceInfo);

        divProductPriceInfo.append(actualPrice);

        if (product.discount_price) {
            let discountPrice = document.createElement('p');
            discountPrice.classList.add('product-previous-price');
            discountPrice.textContent = product.actual_price;
            actualPrice.textContent = product.discount_price;

            let discount = document.createElement('p');
            discount.classList.add('product-discount');

            let discountProcentage = 100 - product.discount_price / 
            product.actual_price * 100;
            discount.textContent = '-' + Math.floor(discountProcentage) + '%';

            divProductPriceInfo.append(discountPrice);
            divProductPriceInfo.append(discount);
        }

        divCard.setAttribute("data-id", product.id);

        let button = document.createElement('button');
        button.classList.add('product-button-add');
        button.textContent = 'Добавить';

        divCard.append(button);

        button.addEventListener('click', addCardToChoosen);
        catalogProducts.append(divCard);
    }

    let buttonLoadMode = document.createElement('button');
    buttonLoadMode.classList.add('load-more-button');
    buttonLoadMode.textContent = 'Загрузить еще';

    catalogProducts.append(buttonLoadMode);
    higlightChoosenCards();
}

async function loadCards() {
    const apiKey = '74d57e6f-5451-4f58-87d7-821086ab82a6';
    try {
        // Запрос к API
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Ошибка загрузки данных: ${response.status}`);
        }

        const data = await response.json();

        // Очистка массива dishes и заполнение новыми данными
        products = data.map(item => new Product(
            item.actual_price,
            item.created_at,
            item.discount_price,
            item.id,
            item.image_url,
            item.main_category,
            item.name,
            item.rating,
            item.sub_category,
        ));

        renderCards();
    } catch (error) {
        console.error("Ошибка при загрузке блюд:", error);
    }
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function sortProducts(sortValue) {
    switch (sortValue) {
    case 'rate_dec': // По убыванию рейтинга
        products.sort((a, b) => b.rating - a.rating);
        break;
    case 'rate_inc': // По возрастанию рейтинга
        products.sort((a, b) => a.rating - b.rating);
        break;
    case 'price_dec': // По убыванию цены
        products.sort((a, b) => {
            const priceA = a.discount_price ||
             a.actual_price;
            const priceB = b.discount_price ||
             b.actual_price;
            return priceB - priceA; // Сортируем по убыванию
        });
        break;
    case 'price_inc': // По возрастанию цены
        products.sort((a, b) => {
            const priceA = a.discount_price || 
            a.actual_price;
            const priceB = b.discount_price || 
            b.actual_price;
            return priceA - priceB; // Сортируем по возрастанию
        });
        break;
    default:
        break;
    }

    // Перерисовка каталога
    renderCards();
}

async function onFindFieldUpdate() {
    const userInput = document.querySelector('#find-text').value;
    const suggestionsContainer = document.querySelector('.suggestions-container');

    // Очищаем предыдущие результаты
    suggestionsContainer.innerHTML = '';

    if (userInput.length === 0) {
        return; // Если поле пустое, не отправляем запрос
    }

    try {
        const apiKey = 'c30ec237-05c7-4543-a3b7-abf82fe65127';
        const apiUrl = `http://api.std-900.ist.mospolytech.ru/exam-2024-1/api/autocomplete?api_key=${apiKey}&query=${userInput}`;
        
        const response = await fetch(apiUrl);
        const suggestions = await response.json();

        if (suggestions.length > 0) {
            suggestions.forEach((suggestion) => {
                const suggestionItem = document.createElement('div');
                suggestionItem.classList.add('suggestion-item');
                suggestionItem.textContent = suggestion;

                // Добавляем обработчик для выбора подсказки
                suggestionItem.addEventListener('click', () => {

                    let currentValue = document
                        .querySelector('#find-text').value;

                    let words = currentValue.split(' ');
                
                    words[words.length - 1] = suggestion;
                
                    document.querySelector('#find-text').value = 
                    words.join(' ');
                
                    suggestionsContainer.innerHTML = '';
                });

                suggestionsContainer.appendChild(suggestionItem);
            });
        } else {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = 'Ничего не найдено =(';

            // Добавляем обработчик для удаления данных о пустом результате
            suggestionItem.addEventListener('click', () => {
                suggestionsContainer.innerHTML = ''; // Очищаем подсказки
            });

            suggestionsContainer.appendChild(suggestionItem);
        }
    } catch (error) {
        console.error('Ошибка при получении данных с сервера:', error);
    }
}

function onFindButtonClicked() {
    let atLeastOneFinded = false;
    let userRequest = document.querySelector('#find-text').value.toLowerCase();
    let productCardNames = document.querySelectorAll('.product-name');

    document.querySelector('.suggestions-container').innerHTML = '';
    
    nowInFindFilter = [];

    if (!userRequest) {
        isFindFiltered = false;
    }

    for (let prodNameElement of productCardNames) {
        let productNameLowCase = prodNameElement.textContent.toLowerCase();
        if (!productNameLowCase.includes(userRequest)) {
            prodNameElement.closest('.product-card').style.display = 'none';
            isFindFiltered = true;
        } else {
            prodNameElement.closest('.product-card').style.display = 'flex';
            let id = prodNameElement.
                closest('.product-card').getAttribute('data-id');
            nowInFindFilter.push(Number(id));
            atLeastOneFinded = true;
        }
    };

    if (!atLeastOneFinded) {
        showNotification('По вашему запросу ничего не найдено', 'error');
    }

}

document.querySelector('#find-text')
    .addEventListener('input', debounce(onFindFieldUpdate, 300));

addEventListener("DOMContentLoaded", loadCards);

document.querySelector('.find-button')
    .addEventListener('click', onFindButtonClicked);

document.querySelector('#catalog-sort')
    .addEventListener('change', (event) => {
        const sortValue = event.target.value;
        sortProducts(sortValue);
    });
