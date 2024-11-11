// orderForm.js
document.addEventListener('DOMContentLoaded', () => {
    const orderDetails = document.querySelector('.order-details');
    const totalCostElement = document.createElement('div');
    totalCostElement.className = 'total-cost';
    totalCostElement.innerHTML = `<h3>Стоимость заказа</h3><p id="total-cost">0Р</p>`;
    orderDetails.appendChild(totalCostElement);

    const categories = ['soup', 'main_dish', 'drink'];
    const selectedDishes = { soup: null, main_dish: null, drink: null };

    document.querySelectorAll('.dish button').forEach(button => {
        button.addEventListener('click', () => {
            const dishDiv = button.parentElement;
            const dishKeyword = dishDiv.getAttribute('data-dish');
            const dish = dishes.find(d => d.keyword === dishKeyword);

            selectedDishes[dish.category] = dish;
            updateOrderForm();
        });
    });

    function updateOrderForm() {
        categories.forEach(category => {
            const categoryElement = document.querySelector(`#${category}`);
            const selectedDish = selectedDishes[category];
            if (selectedDish) {
                categoryElement.value = selectedDish.name;
                categoryElement.parentElement.querySelector('label').textContent = `${selectedDish.name}: ${selectedDish.price}Р`;
            } else {
                categoryElement.value = '';
                categoryElement.parentElement.querySelector('label').textContent = `Выберите ${category === 'soup' ? 'суп' : category === 'main_dish' ? 'главное блюдо' : 'напиток'}`;
            }
        });

        const totalCost = Object.values(selectedDishes).reduce((sum, dish) => dish ? sum + dish.price : sum, 0);
        document.getElementById('total-cost').textContent = `${totalCost}Р`;
    }
});