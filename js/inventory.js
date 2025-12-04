// Constante para el umbral de stock bajo
const LOW_STOCK_THRESHOLD = 10;
// Variable global para almacenar los datos cargados del inventario
let currentInventoryData = [];

// *** CONFIGURACIÓN DE LA HOJA DE CÁLCULO - REEMPLAZA EL VALOR AQUI ***
// Si este valor no se reemplaza, la app usará mockInventario (datos simulados).
const SHEET_ID = '13TuywyxHsWz7wYfUe2Insa4RgEggQ2GNgvBwiPAixYU'; // <-- ¡VERIFICA QUE ESTE SEA TU ID!
// **********************************************************************

/**
 * Función principal para cargar los datos del inventario.
 * Intenta cargar desde Google Sheet (usando el método CSV público) o usa mockData.
 * @returns {Array} Un array de objetos de inventario.
 */
async function fetchInventory() {
    // 1. Verificar configuración
    const isSheetConfigured = SHEET_ID && SHEET_ID.length > 10 && SHEET_ID !== 'TU_ID_DE_LA_HOJA_DE_CALCULO_AQUI';

    // Usar mock data si no hay ID configurado
    if (!isSheetConfigured) {
        console.warn("Falta el ID de Google Sheet. Usando datos de prueba (mockInventario).");
        currentInventoryData = typeof mockInventario !== 'undefined' ? mockInventario : [];
        renderInventory(currentInventoryData);
        return currentInventoryData;
    }
    
    // 2. Intentar conexión con la URL pública CSV
    // Usamos el parámetro gid= para forzar la primera hoja (el ID de la pestaña 'Inventario')
    const apiUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Inventario`;
    
    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
             throw new Error(`Error en la carga CSV: ${response.statusText}. ¿La hoja está publicada?`);
        }

        const csvText = await response.text();
        
        // La API devuelve el CSV completo. Procesamos las filas.
        const rows = csvText.split('\n');
        
        // Ignoramos la primera fila (encabezados)
        const inventory = [];
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row.trim()) continue; // Ignorar filas vacías
            
            // Usamos una expresión regular simple para dividir por comas, manejando campos entre comillas
            const cols = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
            
            if (cols.length >= 4) {
                inventory.push({
                    ID: cols[0].replace(/"/g, '').trim(),
                    Nombre: cols[1].replace(/"/g, '').trim(),
                    Stock: parseInt(cols[2].replace(/"/g, '').trim()) || 0, 
                    PrecioVenta: parseFloat(cols[3].replace(/[$,"]/g, '').trim()) || 0.00 // Limpia $ y comillas
                });
            }
        }

        currentInventoryData = inventory;
        renderInventory(inventory); 

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Inventario cargado desde Google Sheets!',
            showConfirmButton: false,
            timer: 1500
        });
        return inventory;

    } catch (error) {
        console.error("Fallo al cargar el inventario desde Google Sheets (CSV):", error);
         Swal.fire({
            icon: 'error',
            title: 'Error de Conexión',
            text: `No se pudo conectar con Google Sheets. Asegúrate de que está "Publicada en la web". Usando datos de prueba como respaldo.`,
            confirmButtonText: 'Cerrar'
        });
        // Si falla la conexión, usa el mock data como respaldo
        const backupData = typeof mockInventario !== 'undefined' ? mockInventario : [];
        currentInventoryData = backupData;
        renderInventory(backupData);
        return backupData;
    }
}


/**
 * Función que lee los datos y dibuja la tabla del inventario en el HTML.
 * @param {Array} inventoryData - Los datos a renderizar.
 */
function renderInventory(inventoryData) {
    const tableBody = document.getElementById('inventory-body');
    tableBody.innerHTML = ''; 

    if (inventoryData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">No se encontraron productos.</td></tr>';
        return;
    }

    inventoryData.forEach(item => {
        let rowClass = '';
        if (item.Stock === 0) {
            rowClass = 'table-danger'; // Sin stock (rojo)
        } else if (item.Stock < LOW_STOCK_THRESHOLD) {
            rowClass = 'table-warning'; // Stock bajo (amarillo)
        }

        const row = document.createElement('tr');
        row.className = rowClass;

        row.innerHTML = `
            <td>${item.ID}</td>
            <td>${item.Nombre}</td>
            <td><span class="fw-bold">${item.Stock}</span></td>
            <td>$${item.PrecioVenta.toFixed(2)}</td>
            <td>
                <button 
                    class="btn btn-sm btn-primary add-to-budget-btn" 
                    data-product-id="${item.ID}" 
                    data-product-name="${item.Nombre}" 
                    data-product-price="${item.PrecioVenta}"
                    ${item.Stock === 0 ? 'disabled' : ''} 
                    title="${item.Stock === 0 ? 'Sin stock disponible' : 'Añadir a Presupuesto'}"
                >
                    Añadir
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });

    console.log(`Inventario cargado: ${inventoryData.length} ítems.`);
}


/**
 * Maneja la lógica de búsqueda en el inventario actual.
 */
function handleSearch(event) {
    const query = event.target.value.toLowerCase().trim();
    
    if (query === "") {
        renderInventory(currentInventoryData);
        return;
    }

    const filteredData = currentInventoryData.filter(item => {
        // Buscar por ID o Nombre (case-insensitive)
        return item.ID.toLowerCase().includes(query) || item.Nombre.toLowerCase().includes(query);
    });

    renderInventory(filteredData);
}