document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'http://lab8-api.std-900.ist.mospolytech.ru';
    const apiKey = '74d57e6f-5451-4f58-87d7-821086ab82a6';

    function loadOrders() {
        fetch(`${apiUrl}/api/orders?api_key=${apiKey}`)
            .then(response => response.json())
            .then(orders => {
                displayOrders(orders);
            })
            .catch(error => console.error('Error loading orders:', error));
    }

    function displayOrders(orders) {
        const ordersList = document.getElementById('orders-list');
        ordersList.innerHTML = '';

        orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        orders.forEach((order, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${new Date(order.created_at).toLocaleString()}</td>
                <td>${getOrderComposition(order)}</td>
                <td>${order.total_cost}Р</td>
                <td>${order.delivery_type === 'now' ? 'Как можно скорее (с 7:00 до 23:00)' : order.delivery_time}</td>
                <td>
                    <button class="view-order" data-id="${order.id}">Подробнее</button>
                    <button class="edit-order" data-id="${order.id}">Редактировать</button>
                    <button class="delete-order" data-id="${order.id}">Удалить</button>
                </td>
            `;
            ordersList.appendChild(row);
        });

        document.querySelectorAll('.view-order').forEach(button => {
            button.addEventListener('click', () => viewOrder(button.dataset.id));
        });

        document.querySelectorAll('.edit-order').forEach(button => {
            button.addEventListener('click', () => editOrder(button.dataset.id));
        });

        document.querySelectorAll('.delete-order').forEach(button => {
            button.addEventListener('click', () => deleteOrder(button.dataset.id));
        });
    }

    function getOrderComposition(order) {
        const dishes = [order.soup_id, order.main_course_id, order.salad_id, order.drink_id, order.dessert_id];
        return dishes.filter(id => id).join(', ');
    }

    function viewOrder(orderId) {
        fetch(`${apiUrl}/api/orders/${orderId}?api_key=${apiKey}`)
            .then(response => response.json())
            .then(order => {
                const modal = createModal(`
                    <h2>Просмотр заказа</h2>
                    <p><strong>Дата оформления:</strong> ${new Date(order.created_at).toLocaleString()}</p>
                    <p><strong>Имя получателя:</strong> ${order.full_name}</p>
                    <p><strong>Адрес доставки:</strong> ${order.delivery_address}</p>
                    <p><strong>Время доставки:</strong> ${order.delivery_type === 'now' ? 'Как можно скорее' : order.delivery_time}</p>
                    <p><strong>Телефон:</strong> ${order.phone}</p>
                    <p><strong>Email:</strong> ${order.email}</p>
                    <p><strong>Комментарий:</strong> ${order.comment}</p>
                    <p><strong>Состав заказа:</strong></p>
                    <ul>
                        <li>Основное блюдо: ${order.main_course_id} (${order.main_course_price}Р)</li>
                        <li>Напиток: ${order.drink_id} (${order.drink_price}Р)</li>
                        <li>Десерт: ${order.dessert_id} (${order.dessert_price}Р)</li>
                    </ul>
                    <p><strong>Стоимость:</strong> ${order.total_cost}Р</p>
                `);
                modal.querySelector('.modal-footer').innerHTML = `
                    <button class="modal-close">Ок</button>
                `;
                document.body.appendChild(modal);
                modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
            })
            .catch(error => console.error('Error viewing order:', error));
    }

    function editOrder(orderId) {
        fetch(`${apiUrl}/api/orders/${orderId}?api_key=${apiKey}`)
            .then(response => response.json())
            .then(order => {
                const modal = createModal(`
                    <h2>Редактирование заказа</h2>
                    <form id="edit-order-form">
                        <label for="full_name">Имя получателя:</label>
                        <input type="text" id="full_name" name="full_name" value="${order.full_name}" required>

                        <label for="email">Email:</label>
                        <input type="email" id="email" name="email" value="${order.email}" required>

                        <label for="phone">Телефон:</label>
                        <input type="tel" id="phone" name="phone" value="${order.phone}" required>

                        <label for="delivery_address">Адрес доставки:</label>
                        <input type="text" id="delivery_address" name="delivery_address" value="${order.delivery_address}" required>

                        <label for="delivery_type">Тип доставки:</label>
                        <input type="radio" id="asap" name="delivery_type" value="now" ${order.delivery_type === 'now' ? 'checked' : ''}>
                        <label for="asap">Как можно скорее</label>
                        <input type="radio" id="by_time" name="delivery_type" value="by_time" ${order.delivery_type === 'by_time' ? 'checked' : ''}>
                        <label for="by_time">Ко времени</label>

                        <label for="delivery_time">Время доставки:</label>
                        <input type="time" id="delivery_time" name="delivery_time" value="${order.delivery_time}" ${order.delivery_type === 'now' ? 'disabled' : ''}>

                        <label for="comment">Комментарий:</label>
                        <textarea id="comment" name="comment">${order.comment}</textarea>
                    </form>
                `);
                modal.querySelector('.modal-footer').innerHTML = `
                    <button type="submit" form="edit-order-form" class="modal-save">Сохранить</button>
                    <button class="modal-close">Отмена</button>
                `;
                document.body.appendChild(modal);

                modal.querySelector('#edit-order-form').addEventListener('submit', (event) => {
                    event.preventDefault();
                    const formData = new FormData(event.target);
                    const updatedOrder = Object.fromEntries(formData.entries());

                    fetch(`${apiUrl}/api/orders/${orderId}?api_key=${apiKey}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(updatedOrder)
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.error) {
                            alert(data.error);
                        } else {
                            modal.remove();
                            alert('Заказ успешно изменён');
                            loadOrders();
                        }
                    })
                    .catch(error => {
                        alert('Ошибка при редактировании заказа');
                        console.error('Error editing order:', error);
                    });
                });

                modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
            })
            .catch(error => console.error('Error editing order:', error));
    }

    function deleteOrder(orderId) {
        const modal = createModal(`
            <h2>Удаление заказа</h2>
            <p>Вы уверены, что хотите удалить заказ?</p>
        `);
        modal.querySelector('.modal-footer').innerHTML = `
            <button class="modal-delete">Да</button>
            <button class="modal-close">Отмена</button>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.modal-delete').addEventListener('click', () => {
            fetch(`${apiUrl}/api/orders/${orderId}?api_key=${apiKey}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    modal.remove();
                    alert('Заказ успешно удалён');
                    loadOrders();
                }
            })
            .catch(error => {
                alert('Ошибка при удалении заказа');
                console.error('Error deleting order:', error);
            });
        });

        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    }

    function createModal(content) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <div class="modal-body">${content}</div>
                <div class="modal-footer"></div>
            </div>
        `;
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        return modal;
    }

    loadOrders();
});