// app.js - Frontend JavaScript

const API_URL = 'http://localhost:3000/api';
let currentHouseId = null;
let houses = [];
let people = [];
let items = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadHouses();
    setupTabs();
    setupForms();
});

// Load houses
async function loadHouses() {
    try {
        const response = await fetch(`${API_URL}/houses`);
        houses = await response.json();
        
        const select = document.getElementById('houseSelect');
        select.innerHTML = houses.map(h => 
            `<option value="${h.id}">${h.name}</option>`
        ).join('');
        
        if (houses.length > 0) {
            currentHouseId = houses[0].id;
            select.value = currentHouseId;
            loadAllData();
        }
        
        select.addEventListener('change', (e) => {
            currentHouseId = e.target.value;
            loadAllData();
        });
    } catch (err) {
        console.error('Error loading houses:', err);
    }
}

// Load all data for current house
async function loadAllData() {
    if (!currentHouseId) return;
    
    await Promise.all([
        loadPeople(),
        loadItems(),
        loadPurchases(),
        loadMeals(),
        loadDashboard()
    ]);
}

// Load people
async function loadPeople() {
    try {
        const response = await fetch(`${API_URL}/houses/${currentHouseId}/members`);
        people = await response.json();
        renderPeople();
    } catch (err) {
        console.error('Error loading people:', err);
    }
}

// Render people
function renderPeople() {
    const container = document.getElementById('peopleList');
    
    if (people.length === 0) {
        container.innerHTML = '<p>No people found. Add someone to get started!</p>';
        return;
    }
    
    container.innerHTML = people.map(person => `
        <div class="list-item">
            <div class="item-header">
                <h3>${person.name}</h3>
                <div class="item-actions">
                    <button class="btn btn-danger btn-small" onclick="deletePerson(${person.id})">Delete</button>
                </div>
            </div>
            <div class="item-details">
                <p><strong>Email:</strong> ${person.email}</p>
                <p><strong>ID:</strong> ${person.id}</p>
            </div>
        </div>
    `).join('');
}

// Load items
async function loadItems() {
    try {
        const response = await fetch(`${API_URL}/items?house_id=${currentHouseId}`);
        items = await response.json();
        renderItems();
    } catch (err) {
        console.error('Error loading items:', err);
    }
}

// Render items
function renderItems() {
    const container = document.getElementById('inventoryList');
    
    if (items.length === 0) {
        container.innerHTML = '<p>No items found. Add items to your inventory!</p>';
        return;
    }
    
    container.innerHTML = items.map(item => `
        <div class="list-item">
            <div class="item-header">
                <h3>${item.item_name}</h3>
                <div class="item-actions">
                    <button class="btn btn-secondary btn-small" onclick="updateItemCount(${item.item_id}, -1)">-</button>
                    <button class="btn btn-secondary btn-small" onclick="updateItemCount(${item.item_id}, 1)">+</button>
                    <button class="btn btn-danger btn-small" onclick="deleteItem(${item.item_id})">Delete</button>
                </div>
            </div>
            <div class="item-details">
                <p><strong>Quantity:</strong> <span class="badge ${item.count < 2 ? 'badge-warning' : 'badge-success'}">${item.count}</span></p>
                <p><strong>Cost per unit:</strong> $${item.cost_per_ct.toFixed(2)}</p>
                <p><strong>Total value:</strong> $${(item.count * item.cost_per_ct).toFixed(2)}</p>
            </div>
        </div>
    `).join('');
}

// Load purchases
async function loadPurchases() {
    try {
        const response = await fetch(`${API_URL}/purchases?house_id=${currentHouseId}`);
        const purchases = await response.json();
        
        // Get detailed info for each purchase
        const detailedPurchases = await Promise.all(
            purchases.map(p => 
                fetch(`${API_URL}/purchases/${p.p_id}?house_id=${currentHouseId}`)
                    .then(r => r.json())
            )
        );
        
        renderPurchases(detailedPurchases);
    } catch (err) {
        console.error('Error loading purchases:', err);
    }
}

// Render purchases
function renderPurchases(purchases) {
    const container = document.getElementById('purchasesList');
    
    if (purchases.length === 0) {
        container.innerHTML = '<p>No purchases found. Add your first purchase!</p>';
        return;
    }
    
    container.innerHTML = purchases.map(purchase => `
        <div class="list-item">
            <div class="item-header">
                <h3>Purchase #${purchase.p_id}</h3>
                <div class="item-actions">
                    <button class="btn btn-danger btn-small" onclick="deletePurchase(${purchase.p_id})">Delete</button>
                </div>
            </div>
            <div class="item-details">
                <p><strong>Buyer:</strong> ${purchase.buyer_name}</p>
                <p><strong>Date:</strong> ${purchase.purchase_at}</p>
                <p><strong>Total:</strong> $${purchase.total.toFixed(2)}</p>
                <div style="margin-top: 10px;">
                    <strong>Items:</strong>
                    ${purchase.lines.map(line => `
                        <p style="margin-left: 10px;">• ${line.item_name} x${line.quantity} @ $${line.cost_per_ct.toFixed(2)} = $${line.line_total.toFixed(2)}</p>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// Load meals
async function loadMeals() {
    try {
        const response = await fetch(`${API_URL}/meals?house_id=${currentHouseId}`);
        const meals = await response.json();
        
        // Get detailed info for each meal
        const detailedMeals = await Promise.all(
            meals.map(m => 
                fetch(`${API_URL}/meals/${m.meal_id}?house_id=${currentHouseId}`)
                    .then(r => r.json())
            )
        );
        
        renderMeals(detailedMeals);
    } catch (err) {
        console.error('Error loading meals:', err);
    }
}

// Render meals
function renderMeals(meals) {
    const container = document.getElementById('mealsList');
    
    if (meals.length === 0) {
        container.innerHTML = '<p>No meals found. Log your first meal!</p>';
        return;
    }
    
    container.innerHTML = meals.map(meal => `
        <div class="list-item">
            <div class="item-header">
                <h3>${meal.meal_name}</h3>
                <div class="item-actions">
                    <button class="btn btn-danger btn-small" onclick="deleteMeal(${meal.meal_id})">Delete</button>
                </div>
            </div>
            <div class="item-details">
                <p><strong>Date:</strong> ${meal.made_on}</p>
                <p><strong>Total Cost:</strong> $${meal.total_cost.toFixed(2)}</p>
                <p><strong>Cost per Person:</strong> $${meal.cost_per_person.toFixed(2)}</p>
                <p><strong>Attendees:</strong> ${meal.attendees.map(a => a.name).join(', ')}</p>
                <div style="margin-top: 10px;">
                    <strong>Ingredients:</strong>
                    ${meal.ingredients.map(ing => `
                        <p style="margin-left: 10px;">• ${ing.item_name} x${ing.quant_used} @ $${ing.cost_per_ct.toFixed(2)}</p>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// Load dashboard
async function loadDashboard() {
    try {
        const [membersRes, itemsRes, purchasesRes, mealsRes] = await Promise.all([
            fetch(`${API_URL}/houses/${currentHouseId}/members`),
            fetch(`${API_URL}/items?house_id=${currentHouseId}`),
            fetch(`${API_URL}/purchases?house_id=${currentHouseId}`),
            fetch(`${API_URL}/meals?house_id=${currentHouseId}`)
        ]);
        
        const members = await membersRes.json();
        const items = await itemsRes.json();
        const purchases = await purchasesRes.json();
        const meals = await mealsRes.json();
        
        // House summary
        document.getElementById('houseSummary').innerHTML = `
            <div class="stat">
                <span class="stat-label">Members:</span>
                <span class="stat-value">${members.length}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Items in Stock:</span>
                <span class="stat-value">${items.length}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Total Purchases:</span>
                <span class="stat-value">${purchases.length}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Total Meals:</span>
                <span class="stat-value">${meals.length}</span>
            </div>
        `;
        
        // Recent purchases
        const recentPurchases = purchases.slice(0, 3);
        document.getElementById('recentPurchases').innerHTML = recentPurchases.length > 0
            ? recentPurchases.map(p => `
                <div class="stat">
                    <span class="stat-label">Purchase #${p.p_id}</span>
                    <span class="stat-value">${p.purchase_at}</span>
                </div>
            `).join('')
            : '<p>No recent purchases</p>';
        
        // Recent meals
        const recentMeals = meals.slice(0, 3);
        document.getElementById('recentMeals').innerHTML = recentMeals.length > 0
            ? recentMeals.map(m => `
                <div class="stat">
                    <span class="stat-label">${m.meal_name}</span>
                    <span class="stat-value">${m.made_on}</span>
                </div>
            `).join('')
            : '<p>No recent meals</p>';
        
        // Low stock items
        const lowStock = items.filter(i => i.count < 2);
        document.getElementById('lowStockItems').innerHTML = lowStock.length > 0
            ? lowStock.map(i => `
                <div class="stat">
                    <span class="stat-label">${i.item_name}</span>
                    <span class="stat-value badge badge-warning">${i.count} left</span>
                </div>
            `).join('')
            : '<p>All items in stock</p>';
        
    } catch (err) {
        console.error('Error loading dashboard:', err);
    }
}

// Setup tabs
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked
            btn.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });
}

// Setup forms
function setupForms() {
    document.getElementById('addPurchaseForm').addEventListener('submit', handleAddPurchase);
    document.getElementById('addMealForm').addEventListener('submit', handleAddMeal);
    document.getElementById('addItemForm').addEventListener('submit', handleAddItem);
    document.getElementById('addPersonForm').addEventListener('submit', handleAddPerson);
}

// Show/hide modals
function showAddPurchaseModal() {
    // Populate buyers
    document.getElementById('purchaseBuyer').innerHTML = 
        '<option value="">Select buyer...</option>' +
        people.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    
    // Populate items
    const itemSelects = document.querySelectorAll('.item-select');
    itemSelects.forEach(select => {
        select.innerHTML = 
            '<option value="">Select item...</option>' +
            items.map(i => `<option value="${i.item_id}">${i.item_name}</option>`).join('');
    });
    
    // Set today's date
    document.getElementById('purchaseDate').valueAsDate = new Date();
    
    document.getElementById('addPurchaseModal').style.display = 'block';
}

function showAddMealModal() {
    // Populate attendees checkboxes
    document.getElementById('mealAttendees').innerHTML = people.map(p => `
        <label class="checkbox-label">
            <input type="checkbox" name="attendee" value="${p.id}">
            ${p.name}
        </label>
    `).join('');
    
    // Set today's date
    document.getElementById('mealDate').valueAsDate = new Date();
    
    document.getElementById('addMealModal').style.display = 'block';
}

function showAddItemModal() {
    document.getElementById('addItemModal').style.display = 'block';
}

function showAddPersonModal() {
    document.getElementById('addPersonModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Add purchase line
function addPurchaseLine() {
    const container = document.getElementById('purchaseLines');
    const newLine = document.createElement('div');
    newLine.className = 'purchase-line';
    newLine.innerHTML = `
        <label>
            Item:
            <select class="item-select" required>
                <option value="">Select item...</option>
                ${items.map(i => `<option value="${i.item_id}">${i.item_name}</option>`).join('')}
            </select>
        </label>
        <label>
            Quantity:
            <input type="number" class="quantity-input" placeholder="Qty" min="1" required>
        </label>
        <label>
            Cost per Unit:
            <input type="number" class="cost-input" placeholder="Cost per unit" step="0.01" min="0" required>
        </label>
    `;
    container.appendChild(newLine);
}

// Handle add purchase
async function handleAddPurchase(e) {
    e.preventDefault();
    
    const buyerId = document.getElementById('purchaseBuyer').value;
    const date = document.getElementById('purchaseDate').value;
    
    try {
        // Create purchase
        const purchaseRes = await fetch(`${API_URL}/purchases`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                house_id: currentHouseId,
                buyer_id: buyerId,
                purchase_at: date
            })
        });
        
        const purchase = await purchaseRes.json();
        
        // Add lines
        const lines = document.querySelectorAll('.purchase-line');
        for (const line of lines) {
            const itemId = line.querySelector('.item-select').value;
            const quantity = line.querySelector('.quantity-input').value;
            const cost = line.querySelector('.cost-input').value;
            
            if (itemId && quantity && cost) {
                await fetch(`${API_URL}/purchases/${purchase.p_id}/lines`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        house_id: currentHouseId,
                        item_id: itemId,
                        quantity: parseInt(quantity),
                        cost_per_ct: parseFloat(cost)
                    })
                });
            }
        }
        
        closeModal('addPurchaseModal');
        loadPurchases();
        alert('Purchase added successfully!');
    } catch (err) {
        console.error('Error adding purchase:', err);
        alert('Error adding purchase');
    }
}

// Handle add meal
async function handleAddMeal(e) {
    e.preventDefault();
    
    const name = document.getElementById('mealName').value;
    const date = document.getElementById('mealDate').value;
    const attendeeCheckboxes = document.querySelectorAll('input[name="attendee"]:checked');
    const attendeeIds = Array.from(attendeeCheckboxes).map(cb => cb.value);
    
    try {
        // Create meal
        const mealRes = await fetch(`${API_URL}/meals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                house_id: currentHouseId,
                meal_name: name,
                made_on: date
            })
        });
        
        const meal = await mealRes.json();
        
        // Add attendees
        for (const userId of attendeeIds) {
            await fetch(`${API_URL}/meals/${meal.meal_id}/attendees`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    house_id: currentHouseId,
                    user_id: userId
                })
            });
        }
        
        closeModal('addMealModal');
        loadMeals();
        alert('Meal added successfully!');
    } catch (err) {
        console.error('Error adding meal:', err);
        alert('Error adding meal');
    }
}

// Handle add item
async function handleAddItem(e) {
    e.preventDefault();
    
    const name = document.getElementById('itemName').value;
    const count = document.getElementById('itemCount').value;
    const cost = document.getElementById('itemCost').value;
    
    try {
        await fetch(`${API_URL}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                item_name: name,
                count: parseInt(count),
                house_id: currentHouseId,
                cost_per_ct: parseFloat(cost)
            })
        });
        
        closeModal('addItemModal');
        loadItems();
        alert('Item added successfully!');
    } catch (err) {
        console.error('Error adding item:', err);
        alert('Error adding item');
    }
}

// Handle add person
async function handleAddPerson(e) {
    e.preventDefault();
    
    const name = document.getElementById('personName').value;
    const email = document.getElementById('personEmail').value;
    
    try {
        await fetch(`${API_URL}/people`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name,
                email: email,
                house_id: currentHouseId
            })
        });
        
        closeModal('addPersonModal');
        loadPeople();
        alert('Person added successfully!');
    } catch (err) {
        console.error('Error adding person:', err);
        alert('Error adding person');
    }
}

// Update item count
async function updateItemCount(itemId, change) {
    try {
        await fetch(`${API_URL}/items/${itemId}/count`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                house_id: currentHouseId,
                change: change
            })
        });
        
        loadItems();
    } catch (err) {
        console.error('Error updating item count:', err);
        alert('Error updating item count');
    }
}

// Delete functions
async function deletePurchase(id) {
    if (!confirm('Delete this purchase?')) return;
    
    try {
        await fetch(`${API_URL}/purchases/${id}?house_id=${currentHouseId}`, {
            method: 'DELETE'
        });
        loadPurchases();
    } catch (err) {
        console.error('Error deleting purchase:', err);
    }
}

async function deleteMeal(id) {
    if (!confirm('Delete this meal?')) return;
    
    try {
        await fetch(`${API_URL}/meals/${id}?house_id=${currentHouseId}`, {
            method: 'DELETE'
        });
        loadMeals();
    } catch (err) {
        console.error('Error deleting meal:', err);
    }
}

async function deleteItem(id) {
    if (!confirm('Delete this item?')) return;
    
    try {
        await fetch(`${API_URL}/items/${id}?house_id=${currentHouseId}`, {
            method: 'DELETE'
        });
        loadItems();
    } catch (err) {
        console.error('Error deleting item:', err);
    }
}

async function deletePerson(id) {
    if (!confirm('Delete this person?')) return;
    
    try {
        await fetch(`${API_URL}/people/${id}?house_id=${currentHouseId}`, {
            method: 'DELETE'
        });
        loadPeople();
    } catch (err) {
        console.error('Error deleting person:', err);
    }
}