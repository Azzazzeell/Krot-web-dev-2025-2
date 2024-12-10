function loadDishes() {
    const apiUrl = 'http://lab7-api.std-900.ist.mospolytech.ru/api/dishes';

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(dishes => {
            displayDishes(dishes);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    loadDishes();
});