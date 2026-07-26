// Shopping cart state
let cart = ['Burger Menu', 'Fries']; // Pre-populated with 2 items based on mockup
let cartCountElement = document.getElementById('cart-count');

// Add item to cart
function addToCart(itemName) {
    cart.push(itemName);
    updateBadge();
    console.log(`${itemName} added to cart. Total items: ${cart.length}`);
}

// Update cart badge UI
function updateBadge() {
    if (cartCountElement) {
        cartCountElement.innerText = cart.length;
    }
}

// Calculate total (Example logic for prompt 2.4.2)
function calculateTotal(items) {
    const defaultPrice = 12.99;
    let total = items.length * defaultPrice;
    return total.toFixed(2);
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    updateBadge();
});
