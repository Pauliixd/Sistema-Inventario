// =========================
//  PRESUPUESTO - SISTEMA
// =========================

// Variables y constantes para la gestión del presupuesto 
let budgetItems = []; 
const GLOBAL_DISCOUNT_RATE = 0; // Descuento global (0% por defecto)

// Elementos del DOM
const budgetListEl = document.getElementById('budget-list');
const budgetTotalEl = document.getElementById('budget-total');
const budgetSubtotalEl = document.getElementById('budget-subtotal');
const budgetDiscountEl = document.getElementById('budget-discount');
const budgetDate = document.getElementById("budget-date");

// =========================
//  AÑADIR PRODUCTO
// =========================
function addToBudget(buttonElement) {
    const productID = buttonElement.dataset.productId;
    const productName = buttonElement.dataset.productName;
    const productPrice = parseFloat(buttonElement.dataset.productPrice);

    // Buscar el item en el inventario REAL
    const stockItem = currentInventoryData.find(p => p.ID === productID);

    if (!stockItem) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Producto no encontrado en inventario.' });
        return;
    }

    const existingItem = budgetItems.find(item => item.ID === productID);

    // Control de stock:
    if (existingItem && existingItem.quantity >= stockItem.Stock) {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: `Stock máximo alcanzado (${stockItem.Stock} unidades).`,
            showConfirmButton: false,
            timer: 1500
        });
        return;
    }

    // Límite general de seguridad
    if (existingItem && existingItem.quantity >= 999) {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: 'Cantidad máxima alcanzada.',
            showConfirmButton: false,
            timer: 1500
        });
        return;
    }

    // Si ya existe → aumentar cantidad
    if (existingItem) {
        existingItem.quantity += 1;
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'info',
            title: `Se añadió otra unidad de ${productName}.`,
            showConfirmButton: false,
            timer: 1000
        });
    } else {
        // Si no existe → agregarlo
        budgetItems.push({
            ID: productID,
            Nombre: productName,
            PrecioVenta: productPrice,
            quantity: 1
        });
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `${productName} añadido al presupuesto.`,
            showConfirmButton: false,
            timer: 1000
        });
    }

    renderBudgetList();
}



// =========================
//  REMOVER PRODUCTO
// =========================
function handleRemoveItem(event) {
    const productID = event.currentTarget.dataset.productId;
    budgetItems = budgetItems.filter(item => item.ID !== productID);
    renderBudgetList();
}



// =========================
//  RENDER LISTA DEL PRESUPUESTO
// =========================
function renderBudgetList() {
    budgetListEl.innerHTML = ''; 

    if (budgetItems.length === 0) {
        budgetListEl.innerHTML = '<li class="list-group-item text-muted">Aún no hay ítems en el presupuesto.</li>';
    }

    budgetItems.forEach(item => {
        const itemTotal = item.PrecioVenta * item.quantity;
        
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center';

        listItem.innerHTML = `
            <div class="d-flex align-items-center flex-grow-1">
                <button class="btn btn-sm btn-outline-danger remove-item-btn me-2" data-product-id="${item.ID}">
                    X
                </button>
                <div class="flex-grow-1">
                    <strong class="text-primary">${item.Nombre}</strong> 
                    <span class="d-block text-muted small">Precio: $${item.PrecioVenta.toFixed(2)} | Cant: ${item.quantity}</span>
                </div>
            </div>
            <span class="badge bg-secondary rounded-pill">$${itemTotal.toFixed(2)}</span>
        `;

        budgetListEl.appendChild(listItem);
    });

    // Re-asignación de eventos
    budgetListEl.querySelectorAll('.remove-item-btn').forEach(button =>
        button.addEventListener('click', handleRemoveItem)
    );

    calculateBudgetTotal();
}



// =========================
//  CÁLCULO DE TOTAL
// =========================
function calculateBudgetTotal() {
    let subtotal = 0;

    budgetItems.forEach(item => {
        subtotal += item.PrecioVenta * item.quantity;
    });

    const discountAmount = subtotal * GLOBAL_DISCOUNT_RATE;
    const finalTotal = subtotal - discountAmount; 
    
    budgetSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    budgetDiscountEl.textContent = `-$${discountAmount.toFixed(2)}`;
    budgetTotalEl.textContent = `$${finalTotal.toFixed(2)}`;
}



// =========================
//  EXPORTAR A CSV
// =========================
function exportBudgetToCSV() {
    if (budgetItems.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Presupuesto Vacío',
            text: 'Debes añadir productos antes de exportar a CSV.',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    const clientName = document.getElementById('client-name').value.trim() || 'Cliente General';
    const date = document.getElementById("client-date").value.trim() || "2026" ;
    
    const subtotal = budgetItems.reduce((sum, item) => sum + (item.PrecioVenta * item.quantity), 0);
    const discountAmount = subtotal * GLOBAL_DISCOUNT_RATE;
    const finalTotal = subtotal - discountAmount;

    let csvContent = "Presupuesto CSV\n";
    csvContent += `Cliente,"${clientName}"\n`;
    csvContent += `Fecha,"${date}"\n`;
    csvContent += `Subtotal,"$${subtotal.toFixed(2)}"\n`;
    csvContent += `Descuento (0%),"-$${discountAmount.toFixed(2)}"\n`;
    csvContent += `TOTAL FINAL,"$${finalTotal.toFixed(2)}"\n\n`;

    const headers = ["ID", "Nombre", "Cantidad", "Precio Unitario", "Total Item"];
    csvContent += headers.join(",") + "\n";

    budgetItems.forEach(item => {
        const itemTotal = item.PrecioVenta * item.quantity;
        const row = [
            `"${item.ID}"`,
            `"${item.Nombre.replace(/"/g, '""')}"`,
            item.quantity,
            item.PrecioVenta.toFixed(2),
            itemTotal.toFixed(2)
        ];
        csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `Presupuesto_${clientName.replace(/\s/g, '_')}_${date}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'CSV exportado con éxito.',
        showConfirmButton: false,
        timer: 1500
    });
}



// =========================
//  EXPORTAR A PDF (print)
// =========================
function handleExportBudget() {
    if (budgetItems.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Presupuesto Vacío',
            text: 'Debes añadir productos antes de exportarlo.',
            confirmButtonText: 'Entendido'
        });
        return;
    }
    const date = document.getElementById("client-date").value.trim() || "2026" ;
    const clientNameInput = document.getElementById('client-name');
    const clientNamePrint = document.getElementById('client-name-print');
    const clientName = clientNameInput.value.trim() || 'Cliente General';
    
    clientNamePrint.textContent = clientName; 
    budgetDate.textContent=date;

    document.title = `Presupuesto_${clientName.replace(/\s/g, '_')}_${date}`;

    window.print();
    
    document.title = 'Sistema de Presupuestos';
    clientNamePrint.textContent = 'N/A';
}
