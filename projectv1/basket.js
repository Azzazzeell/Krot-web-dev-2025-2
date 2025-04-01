let products = [];
let choosenGoods = JSON.parse(localStorage.getItem('choosenGoods')) || [];
const apiKey = '74d57e6f-5451-4f58-87d7-821086ab82a6';

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

async function updateProductsArray() {
    products = [];
    choosenGoods = JSON.parse(localStorage.getItem('choosenGoods')) || [];