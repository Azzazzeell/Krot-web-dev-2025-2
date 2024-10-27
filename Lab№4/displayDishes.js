function displayDishes(dishes) {
    const categories = ['soup', 'main_dish', 'drink'];
    categories.forEach(category => {
        const categoryDishes = dishes.filter(dish => dish.category === category);
        categoryDishes.sort((a, b) => a.name.localeCompare(b.name));

        const categorySection = document.createElement('section');
        categorySection.className = 'dishes';
        categorySection.innerHTML = `<h2>Выберите ${category === 'soup' ? 'суп' : category === 'main_dish' ? 'главное блюдо' : 'напиток'}</h2>`;

        const menuDiv = document.createElement('div');
        menuDiv.className = 'menu';

        categoryDishes.forEach(dish => {
            const dishDiv = document.createElement('div');
            dishDiv.className = 'dish';
            dishDiv.setAttribute('data-dish', dish.keyword);
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
    });
}

document.addEventListener('DOMContentLoaded', () => {
    displayDishes(dishes);
});