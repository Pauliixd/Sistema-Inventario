Sistema de Presupuestos y Control de Stock (CSV)

Este es un sistema web simple diseñado para gestionar un inventario y generar presupuestos o cotizaciones para clientes.

El proyecto está desarrollado completamente en HTML, CSS (Bootstrap) y JavaScript vainilla, y utiliza la funcionalidad de publicación CSV de Google Sheets para cargar el inventario sin necesidad de una clave API compleja.

Características

Carga de Datos: Carga el inventario directamente desde una Hoja de Cálculo de Google (requiere que la hoja esté configurada como "Publicada en la web" en formato CSV).

Modo Offline/Mock: Si la hoja de cálculo no está configurada o falla la conexión, utiliza datos de prueba (js/mock_data.js) automáticamente.

Control de Stock: Resalta productos con bajo stock o sin stock.

Presupuestos: Permite añadir productos al presupuesto y genera un total final.

Exportación: Posibilidad de imprimir (a PDF) o exportar el presupuesto como archivo CSV.
