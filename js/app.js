/**
 * Script de inicialización y manejo de eventos.
 * Depende de funciones definidas en inventory.js y budget.js
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Inicializar la carga del inventario (definida en inventory.js, ahora solo carga mock data)
    fetchInventory();

    // 2. Configurar el listener para los botones de Exportar
    document.getElementById('export-budget-btn').addEventListener('click', handleExportBudget); // PDF/Print
    document.getElementById('export-budget-csv-btn').addEventListener('click', exportBudgetToCSV); // CSV <-- NUEVO LISTENER

    // 3. Configurar el listener para la barra de búsqueda
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', handleSearch); 

    // 4. Configurar el listener para los botones de 'Añadir' en el inventario (Delegación de eventos)
    const inventoryBodyEl = document.getElementById('inventory-body');
    inventoryBodyEl.addEventListener('click', (event) => {
        const button = event.target.closest('.add-to-budget-btn');
        if (button) {
            addToBudget(button); 
        }
    });

    // 5. Renderiza la lista de presupuesto inicial (vacía)
    renderBudgetList();
});