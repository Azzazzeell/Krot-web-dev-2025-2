let orders = [];
let products = [];

function Product(actualPrice, createdAt, discountPrice, id, imageUrl, mainCategory, name, rating, subCategory) {
    this.id = id;
    this.actualPrice = actualPrice;
    this.createdAt = createdAt;
    this.discountPrice = discountPrice;
    this.imageUrl = imageUrl;
    this.mainCategory = mainCategory;
    this.name = name;
    this.rating = rating;
    this.subCategory = subCategory;
}

const apiKey = '74d57e6f-5451-4f58-87d7-821086ab82a6';

function showNotification(message, type) {
    const notificationSection = document.querySelector('.notification-section');
    const notificationText = document.querySelector('.notification-text');
    notificationText.textContent = message;

    if (type === 'success') {
        notificationSection.style.backgroundColor = 'lightgreen';
    } else if (type === 'error') {
        notificationSection.style.backgroundColor = 'red';
    }
    notificationSection.style.display = 'flex';

    setTimeout(() => {
        notificationSection.style.display = 'none';
    }, 5000);
}

document.querySelector('.notification-close-button').addEventListener('click', () => {
    document.querySelector('.notification-section').style.display = 'none';
});

async function loadOrders() {
    try {
        const response = await fetch(`http://api.std-900.ist.mospolytech.ru/exam-2024-1/api/orders?api_key=${apiKey}`);
        if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
        orders = await response.json();
        orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        renderOrdersInTable();
    } catch (error) {
        showNotification(`Ошибка загрузки данных: ${error.message}`, 'error');
    }
}

async function getProduct(id) {
    if (products[id]) return products[id];

    try {
        const response = await fetch(`http://api.std-900.ist.mospolytech.ru/exam-2024-1/api/goods/${id}?api_key=${apiKey}`);
        if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
        const productData = await response.json();
        const product = new Product(
            productData.actual_price,
            productData.created_at,
            productData.discount_price,
            productData.id,
            productData.image_url,
            productData.main_category,
            productData.name,
            productData.rating,
            productData.sub_category
        );
        products[id] = product;
        return product;
    } catch (error) {
        showNotification(`Ошибка загрузки товара: ${error.message}`, 'error');
    }
}

function isWeekend(dateString) {
    const date = new Date(dateString);
    return date.getDay() === 0 || date.getDay() === 6;
}

function calculateDeliveryPrice(deliveryDate, deliveryInterval) {
    const BASE_DELIVERY_COST = 200;
    const EVENING_ADDITION = 200;
    const WEEKEND_ADDITION = 300;
    let deliveryCost = BASE_DELIVERY_COST;

    if (isWeekend(deliveryDate)) deliveryCost += WEEKEND_ADDITION;
    if (deliveryInterval === '18:00-22:00' && !isWeekend(deliveryDate)) {
        deliveryCost += EVENING_ADDITION;
    }
    return deliveryCost;
}

async function calculateOrderTotal(order) {
    const productDetails = await Promise.all(order.good_ids.map(getProduct));
    const total = productDetails.reduce((sum, product) => {
        const price = product.discountPrice || product.actualPrice;
        return sum + price;
    }, 0);
    return total + calculateDeliveryPrice(order.delivery_date, order.delivery_interval);
}

async function renderOrdersInTable() {
    const ordersListElement = document.getElementById('orders-list');
    ordersListElement.innerHTML = '';

    for (const [index, order] of orders.entries()) {
        const productDetails = await Promise.all(order.good_ids.map(getProduct));
        const productNames = productDetails.map(product => product?.name || 'Неизвестный товар');
        const productNamesString = productNames.join(', ');

        const deliveryDateFormatted = `${order.delivery_date} (${order.delivery_interval})`;
        const createdAtFormatted = new Date(order.created_at).toLocaleString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });

        let orderRow = document.createElement('tr');
        ordersListElement.append(orderRow);

        orderRow.outerHTML = `
            <tr data-id="${order.id}">
                <td>${index + 1}</td>
                <td>${createdAtFormatted}</td>
                <td class="product-names" title="${productNamesString}">${productNamesString}</td>
                <td>${await calculateOrderTotal(order)} ₽</td>
                <td>${deliveryDateFormatted}</td>
                <td>
                    <div class='dflex'>
                        <div class="view-button" data-order-id="${order.id}">
                            <svg data-order-id="${order.id}" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
                                <path data-order-id="${order.id}" d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
                                <path data-order-id="${order.id}" d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
                            </svg>
                        </div>
                        <div class="edit-button" data-order-id="${order.id}">
                            <svg data-order-id="${order.id}" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-fill" viewBox="0 0 16 16">
                                <path data-order-id="${order.id}" d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"/>
                            </svg>
                        </div>
                        <div class="delete-button" data-order-id="${order.id}">
                            <svg data-order-id="${order.id}" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
                                <path data-order-id="${order.id}" d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
                            </svg>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }

    document.querySelectorAll('.view-button').forEach(button => {
        button.addEventListener('click', event => {
            let orderId = event.target.dataset.orderId;
            openOrderModal(orderId);
        });
    });

    document.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', event => {
            let orderId = event.target.dataset.orderId;
            openEditOrderModal(orderId);
        });
    });

    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', event => {
            let orderId = event.target.dataset.orderId;
            openDeleteModal(orderId);
        });
    });
}

async function openOrderModal(orderId) {
    const order = orders.find(o => o.id == orderId);
    if (!order) {
        showNotification(`Заказ с ID ${orderId} не найден`, 'error');
        return;
    }

    document.getElementById('order-date').textContent = new Date(order.created_at).toLocaleString('ru-RU');
    document.getElementById('order-name').textContent = order.full_name;
    document.getElementById('order-phone').textContent = order.phone;
    document.getElementById('order-email').textContent = order.email;
    document.getElementById('order-address').textContent = order.delivery_address;
    document.getElementById('order-delivery-date').textContent = order.delivery_date;
    document.getElementById('order-delivery-time').textContent = order.delivery_interval;
    document.getElementById('order-items').textContent = order.good_ids.map(id => products[id]?.name || 'Неизвестный товар').join(', ');
    document.getElementById('order-cost').textContent = await calculateOrderTotal(order) + ' ₽';
    document.getElementById('order-comment').textContent = order.comment || 'Нет комментария';

    document.getElementById('order-modal').style.display = 'block';
}

async function openEditOrderModal(orderId) {
    const order = orders.find(o => o.id == orderId);
    if (!order) {
        showNotification(`Заказ с ID ${orderId} не найден`, 'error');
        return;
    }

    document.getElementById('edit-order-date').value = new Date(order.created_at).toLocaleString('ru-RU');
    document.getElementById('edit-order-name').value = order.full_name;
    document.getElementById('edit-order-phone').value = order.phone;
    document.getElementById('edit-order-email').value = order.email;
    document.getElementById('edit-order-address').value = order.delivery_address;
    document.getElementById('edit-order-delivery-date').value = order.delivery_date;
    document.getElementById('edit-order-delivery-time').value = order.delivery_interval;
    document.getElementById('orderList').textContent = order.good_ids.map(id => products[id]?.name || 'Неизвестный товар').join(', ');
    document.getElementById('edit-price').textContent = await calculateOrderTotal(order) + ' ₽';
    document.getElementById('edit-order-comment').value = order.comment;

    document.getElementById('edit-order-modal').style.display = 'block';
}

async function submitEditOrder(event) {
    event.preventDefault();
    const orderId = document.querySelector('#edit-order-modal').dataset.orderId;
    const order = orders.find(o => o.id == orderId);
    if (!order) {
        showNotification(`Заказ с ID ${orderId} не найден`, 'error');
        return;
    }

    const updatedFields = {};
    const formElements = document.querySelector('#edit-order-form').elements;

    if (formElements['name'].value !== order.full_name) updatedFields.full_name = formElements['name'].value;
    if (formElements['phone'].value !== order.phone) updatedFields.phone = formElements['phone'].value;
    if (formElements['email'].value !== order.email) updatedFields.email = formElements['email'].value;
    if (formElements['address'].value !== order.delivery_address) updatedFields.delivery_address = formElements['address'].value;
    if (formElements['delivery_date'].value !== order.delivery_date) updatedFields.delivery_date = formElements['delivery_date'].value;
    if (formElements['delivery_time'].value !== order.delivery_interval) updatedFields.delivery_interval = formElements['delivery_time'].value;
    if (formElements['comment'].value !== order.comment) updatedFields.comment = formElements['comment'].value;

    if (Object.keys(updatedFields).length === 0) {
        showNotification('Нет изменений для сохранения', 'info');
        document.getElementById('edit-order-modal').style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`http://api.std-900.ist.mospolytech.ru/exam-2024-1/api/orders/${orderId}?api_key=${apiKey}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedFields),
        });
        if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
        Object.assign(order, updatedFields);
        renderOrdersInTable();
        document.getElementById('edit-order-modal').style.display = 'none';
        showNotification('Заказ обновлен', 'success');
    } catch (error) {
        showNotification(`Ошибка: ${error.message}`, 'error');
    }
}

function openDeleteModal(orderId) {
    document.getElementById('delete-order-modal').dataset.orderId = orderId;
    document.getElementById('delete-order-modal').style.display = 'block';
}

async function submitDeleteOrder(event) {
    const orderId = document.getElementById('delete-order-modal').dataset.orderId;
    try {
        const response = await fetch(`http://api.std-900.ist.mospolytech.ru/exam-2024-1/api/orders/${orderId}?api_key=${apiKey}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
        orders = orders.filter(o => o.id != orderId);
        renderOrdersInTable();
        document.getElementById('delete-order-modal').style.display = 'none';
        showNotification('Заказ удален', 'success');
    } catch (error) {
        showNotification(`Ошибка: ${error.message}`, 'error');
    }
}

document.getElementById('edit-order-form').addEventListener('submit', submitEditOrder);
document.getElementById('delete-confirm').addEventListener('click', submitDeleteOrder);

document.getElementById('modal-close').addEventListener('click', () => {
    document.getElementById('order-modal').style.display = 'none';
});

document.getElementById('close-edit-order-modal').addEventListener('click', () => {
    document.getElementById('edit-order-modal').style.display = 'none';
});

document.getElementById('close-delete-order-modal').addEventListener('click', () => {
    document.getElementById('delete-order-modal').style.display = 'none';
});

document.querySelectorAll('.close-button').forEach(button => {
    button.addEventListener('click', event => {
        event.target.closest('.modal').style.display = 'none';
    });
});

document.addEventListener('DOMContentLoaded', loadOrders);