document.addEventListener('DOMContentLoaded', () => {
    const orderDetails = document.querySelector('.order-details');
    const totalCostElement = document.createElement('div');
    totalCostElement.className = 'total-cost';
    totalCostElement.innerHTML = `<h3>Стоимость заказа</h3><p id="total-cost">0Р</p>`;
    orderDetails.appendChild(totalCostElement);

    const categories = ['soup', 'main_dish', 'drink', 'salad', 'dessert'];
    const selectedDishes = { soup: null, main_dish: null, drink: null, salad: null, dessert: null };

    // Загрузка выбранных блюд из localStorage
    const savedDishes = JSON.parse(localStorage.getItem('selectedDishes')) || {};
    Object.keys(savedDishes).forEach(category => {
        selectedDishes[category] = savedDishes[category];
    });

    document.querySelectorAll('.dish button').forEach(button => {
        button.addEventListener('click', () => {
            const dishDiv = button.parentElement;
            const dishKeyword = dishDiv.getAttribute('data-dish');
            const dish = dishes.find(d => d.keyword === dishKeyword);

            selectedDishes[dish.category] = dish.id; // Сохраняем только id блюда
            localStorage.setItem('selectedDishes', JSON.stringify(selectedDishes));
            updateOrderForm();
        });
    });

    function updateOrderForm() {
        categories.forEach(category => {
            const categoryElement = document.querySelector(`#${category}`);
            const selectedDishId = selectedDishes[category];
            const selectedDish = dishes.find(d => d.id === selectedDishId);
            if (selectedDish) {
                categoryElement.value = selectedDish.name;
                categoryElement.parentElement.querySelector('label').textContent = `${selectedDish.name}: ${selectedDish.price}Р`;
            } else {
                categoryElement.value = '';
                categoryElement.parentElement.querySelector('label').textContent = `Выберите ${getCategoryTitle(category)}`;
            }
        });

        const totalCost = Object.values(selectedDishes).reduce((sum, dishId) => {
            const dish = dishes.find(d => d.id === dishId);
            return dish ? sum + dish.price : sum;
        }, 0);
        document.getElementById('total-cost').textContent = `${totalCost}Р`;
    }

    updateOrderForm();

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

    function validateOrder() {
        const selectedCategories = Object.keys(selectedDishes).filter(category => selectedDishes[category]);
        const requiredCategories = ['soup', 'main_dish', 'drink', 'salad'];

        if (selectedCategories.length === 0) {
            showNotification('Ничего не выбрано. Выберите блюда для заказа');
            return false;
        }

        if (!selectedDishes.drink) {
            showNotification('Выберите напиток');
            return false;
        }

        if (selectedDishes.soup && !selectedDishes.main_dish && !selectedDishes.salad) {
            showNotification('Выберите главное блюдо/салат/стартер');
            return false;
        }

        if (selectedDishes.salad && !selectedDishes.soup && !selectedDishes.main_dish) {
            showNotification('Выберите суп или главное блюдо');
            return false;
        }

        if (!selectedDishes.soup && !selectedDishes.main_dish) {
            showNotification('Выберите главное блюдо');
            return false;
        }

        return true;
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <p>${message}</p>
            <button>Окей</button>
        `;
        document.body.appendChild(notification);

        notification.querySelector('button').addEventListener('click', () => {
            notification.remove();
        });
    }
});