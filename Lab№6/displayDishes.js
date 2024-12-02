function displayDishes(dishes) {
    const categories = ['soup', 'main_dish', 'drink', 'salad', 'dessert'];
    categories.forEach(category => {
        const categoryDishes = dishes.filter(dish => dish.category === category);
        categoryDishes.sort((a, b) => a.name.localeCompare(b.name));

        const categorySection = document.createElement('section');
        categorySection.className = 'dishes';
        categorySection.innerHTML = `<h2>Выберите ${getCategoryTitle(category)}</h2>`;

        const filtersDiv = document.createElement('div');
        filtersDiv.className = 'filters';
        const filterButtons = getFilterButtons(category);
        filterButtons.forEach(filter => {
            const button = document.createElement('button');
            button.textContent = filter.label;
            button.setAttribute('data-kind', filter.kind);
            filtersDiv.appendChild(button);
        });
        categorySection.appendChild(filtersDiv);

        const menuDiv = document.createElement('div');
        menuDiv.className = 'menu';

        categoryDishes.forEach(dish => {
            const dishDiv = document.createElement('div');
            dishDiv.className = 'dish';
            dishDiv.setAttribute('data-dish', dish.keyword);
            dishDiv.setAttribute('data-kind', dish.kind);
            dishDiv.innerHTML = `
                <img src="${dish.image}.jpg" alt="${dish.name}">
                <p class="price">${dish.price}Р</p>
                <p class="name">${dish.name}</p>
                <p class="weight">${dish.count}</p>
                <button>Добавить</button>
            `;
            menuDiv.appendChild(dishDiv);
        });

        categorySection.appendChild(menuDiv);
        document.querySelector('main').appendChild(categorySection);

        addFilterListeners(categorySection);
    });
}

function getCategoryTitle(category) {
    switch (category) {
        case 'soup': return 'суп';
        case 'main_dish': return 'главное блюдо';
        case 'drink': return 'напиток';
        case 'salad': return 'салат или стартер';
        case 'dessert': return 'десерт';
        default: return category;
    }
}

function getFilterButtons(category) {
    switch (category) {
        case 'soup': return [
            { label: 'Рыбный', kind: 'fish' },
            { label: 'Мясной', kind: 'meat' },
            { label: 'Вегетарианский', kind: 'vegetarian' }
        ];
        case 'main_dish': return [
            { label: 'Рыбное', kind: 'fish' },
            { label: 'Мясное', kind: 'meat' },
            { label: 'Вегетарианское', kind: 'vegetarian' }
        ];
        case 'drink': return [
            { label: 'Холодный', kind: 'cold' },
            { label: 'Горячий', kind: 'hot' }
        ];
        case 'salad': return [
            { label: 'Рыбный', kind: 'fish' },
            { label: 'Мясной', kind: 'meat' },
            { label: 'Вегетарианский', kind: 'vegetarian' }
        ];
        case 'dessert': return [
            { label: 'Маленькая порция', kind: 'small' },
            { label: 'Средняя порция', kind: 'medium' },
            { label: 'Большая порция', kind: 'large' }
        ];
        default: return [];
    }
}

function addFilterListeners(categorySection) {
    const filtersDiv = categorySection.querySelector('.filters');
    const menuDiv = categorySection.querySelector('.menu');

    filtersDiv.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
            const kind = event.target.getAttribute('data-kind');
            const buttons = filtersDiv.querySelectorAll('button');
            buttons.forEach(button => button.classList.remove('active'));

            if (event.target.classList.contains('active')) {
                event.target.classList.remove('active');
                menuDiv.querySelectorAll('.dish').forEach(dish => {
                    dish.style.display = 'flex';
                });
            } else {
                event.target.classList.add('active');
                menuDiv.querySelectorAll('.dish').forEach(dish => {
                    if (dish.getAttribute('data-kind') === kind) {
                        dish.style.display = 'flex';
                    } else {
                        dish.style.display = 'none';
                    }
                });
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    displayDishes(dishes);
});