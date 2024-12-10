document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'http://lab8-api.std-900.ist.mospolytech.ru';
    const apiKey = '74d57e6f-5451-4f58-87d7-821086ab82a6';

    const selectedDishes = JSON.parse(localStorage.getItem('selectedDishes')) || {};
    const totalCostElement = document.getElementById('total-cost');
    const selectedDishesElement = document.getElementById('selected-dishes');

    function loadDishes() {
        fetch(`${apiUrl}/api/dishes?api_key=${apiKey}`)
            .then(response => response.json())
            .then(dishes => {
                displaySelectedDishes(dishes);
            })
            .catch(error => console.error('Error loading dishes:', error));
    }

    function displaySelectedDishes(dishes) {
        let totalCost = 0;
        selectedDishesElement.innerHTML = '';

        Object.keys(selectedDishes).forEach(category => {
            const dishId = selectedDishes[category];
            const dish = dishes.find(d => d.id === dishId);
            if (dish) {
                totalCost += dish.price;
                const dishDiv = document.createElement('div');
                dishDiv.className = 'dish';
                dishDiv.innerHTML = `
                    <img src="${dish.image}.jpg" alt="${dish.name}">
                    <p class="price">${dish.price}Р</p>
                    <p class="name">${dish.name}</p>
                    <button class="remove-dish" data-id="${dish.id}">Удалить</button>
                `;
                selectedDishesElement.appendChild(dishDiv);
            }
        });

        totalCostElement.textContent = `${totalCost}Р`;
    }

    selectedDishesElement.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-dish')) {
            const dishId = parseInt(event.target.getAttribute('data-id'));
            Object.keys(selectedDishes).forEach(category => {
                if (selectedDishes[category] === dishId) {
                    selectedDishes[category] = null;
                }
            });
            localStorage.setItem('selectedDishes', JSON.stringify(selectedDishes));
            loadDishes();
        }
    });

    document.getElementById('submit-order').addEventListener('click', (event) => {
        event.preventDefault();
        const orderData = {
            full_name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subscribe: document.getElementById('subscribe').checked ? 1 : 0,
            phone: document.getElementById('phone').value,
            delivery_address: document.getElementById('address').value,
            delivery_type: document.querySelector('input[name="delivery_time"]:checked').value === 'asap' ? 'now' : 'by_time',
            delivery_time: document.getElementById('delivery_time_specific').value,
            comment: document.getElementById('comment').value,
            drink_id: selectedDishes.drink,
            soup_id: selectedDishes.soup,
            main_course_id: selectedDishes.main_dish,
            salad_id: selectedDishes.salad,
            dessert_id: selectedDishes.dessert
        };

        fetch(`${apiUrl}/api/orders?api_key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                localStorage.removeItem('selectedDishes');
                alert('Заказ успешно оформлен!');
                window.location.href = 'index.html';
            }
        })
        .catch(error => {
            alert('Ошибка при оформлении заказа');
            console.error('Error submitting order:', error);
        });
    });

    loadDishes();
});