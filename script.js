document.addEventListener('DOMContentLoaded', function () {
    // --- Inicialización de Elementos de la Calculadora ---
    const calcItemNombreInput = document.getElementById('calc-item-nombre');
    const calcItemCantidadInput = document.getElementById('calc-item-cantidad');
    const calcItemPrecioInput = document.getElementById('calc-item-precio');
    const calcAddItemBtn = document.getElementById('calc-add-item-btn');
    const calcClearListBtn = document.getElementById('calc-clear-list-btn');
    const tablaCalculadoraBody = document.getElementById('tabla-calculadora').querySelector('tbody');
    const calcGrandTotalSpan = document.getElementById('calc-grand-total');

    let calculatorPurchaseList = [];

    // --- Funciones de la Calculadora ---
    function renderCalculatorTable() {
        tablaCalculadoraBody.innerHTML = '';
        let grandTotal = 0;

        calculatorPurchaseList.forEach((item, index) => {
            const row = tablaCalculadoraBody.insertRow();
            row.className = `calc-item-row-${item.id}`;

            const itemTotalCost = item.cantidad * item.precio;
            grandTotal += itemTotalCost;

            row.innerHTML = `
                <td>${escapeHTML(item.nombre)}</td>
                <td class="text-center">${item.cantidad}</td>
                <td class="text-right">${item.precio.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</td>
                <td class="text-right">${itemTotalCost.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</td>
                <td class="text-center">
                    <button class="btn-remove-row" data-id="${item.id}" title="Eliminar ítem">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            // Add event listener to new remove button
            row.querySelector('.btn-remove-row').addEventListener('click', handleRemoveCalcItem);
        });
        calcGrandTotalSpan.textContent = grandTotal.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
    }
    
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    function handleAddCalcItem() {
        const nombre = calcItemNombreInput.value.trim();
        const cantidad = parseInt(calcItemCantidadInput.value);
        const precio = parseFloat(calcItemPrecioInput.value);

        if (!nombre) {
            alert('Por favor, ingrese el nombre del ítem.');
            calcItemNombreInput.focus();
            return;
        }
        if (isNaN(cantidad) || cantidad <= 0) {
            alert('Por favor, ingrese una cantidad válida (mayor a 0).');
            calcItemCantidadInput.focus();
            return;
        }
        if (isNaN(precio) || precio < 0) { // Permitir precio 0 si es necesario, pero no negativo
            alert('Por favor, ingrese un precio unitario válido.');
            calcItemPrecioInput.focus();
            return;
        }

        const newItem = {
            id: Date.now(),
            nombre: nombre,
            cantidad: cantidad,
            precio: precio
        };

        calculatorPurchaseList.push(newItem);
        saveCalculatorListToLocalStorage();
        renderCalculatorTable();

        // Limpiar campos y resetear cantidad a 1
        calcItemNombreInput.value = '';
        calcItemPrecioInput.value = '';
        calcItemCantidadInput.value = '1';
        calcItemNombreInput.focus();
    }

    function handleRemoveCalcItem(event) {
        const itemId = parseInt(event.currentTarget.dataset.id);
        calculatorPurchaseList = calculatorPurchaseList.filter(item => item.id !== itemId);
        saveCalculatorListToLocalStorage();
        renderCalculatorTable();
    }

    function handleClearCalcList() {
        if (calculatorPurchaseList.length === 0) return;
        if (confirm('¿Está seguro de que desea limpiar toda la lista de la calculadora?')) {
            calculatorPurchaseList = [];
            saveCalculatorListToLocalStorage();
            renderCalculatorTable();
        }
    }

    function saveCalculatorListToLocalStorage() {
        localStorage.setItem('calculatorLabPurchaseList', JSON.stringify(calculatorPurchaseList));
    }

    function loadCalculatorListFromLocalStorage() {
        const storedList = localStorage.getItem('calculatorLabPurchaseList');
        if (storedList) {
            try {
                calculatorPurchaseList = JSON.parse(storedList);
                if (!Array.isArray(calculatorPurchaseList)) calculatorPurchaseList = [];
            } catch (e) {
                console.error("Error parsing calculator list from localStorage", e);
                calculatorPurchaseList = [];
            }
        }
        renderCalculatorTable();
    }

    // Event Listeners para la Calculadora
    calcAddItemBtn.addEventListener('click', handleAddCalcItem);
    calcClearListBtn.addEventListener('click', handleClearCalcList);
     // Permitir agregar con Enter en el último campo de la calculadora
    calcItemPrecioInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            handleAddCalcItem();
            event.preventDefault();
        }
    });


    // --- Lógica de Población de Inventario de Ejemplo ---
    const populateExampleInventory = () => {
        const areasConfig = {
            'laboratorio-histologia': {
                items: {
                    'Materiales': ['Portaobjetos (Caja 50u)', 'Cubreobjetos (22x22mm, Caja 100u)', 'Cuchillas Micrótomo (Paq. 50u)', 'Cassettes Inclusión (Bolsa 500u)'],
                    'Reactivos': ['Formalina Tamponada 10% (1L)', 'Etanol Absoluto PA (2.5L)', 'Hematoxilina de Harris (500ml)', 'Eosina Y Sol. Alcohólica (500ml)', 'Xileno PA (2.5L)'],
                    'Insumos': ['Guantes Nitrilo (Caja 100u)', 'Parafina Histológica (1Kg)', 'Papel de Filtro (Paq. 100u)'],
                    'Equipos': ['Micrótomo Rotatorio Manual', 'Baño de Flotación Digital', 'Estufa de Secado 50L']
                }
            },
            'laboratorio-biologia-celular': {
                items: {
                    'Materiales': ['Placas Petri 90mm (Paq. 20u)', 'Frascos Cultivo T75 (Paq. 5u)', 'Pipetas Serológicas 10ml (Paq. 25u)', 'Puntas Micropipeta P200 con filtro (Rack 96u)'],
                    'Reactivos': ['Medio DMEM Alto Glucosa (500ml)', 'Suero Fetal Bovino (SFB, 100ml)', 'Tripsina-EDTA 0.25% (100ml)', 'PBS 1X Estéril (1L)'],
                    'Insumos': ['Tubos Cónicos 15ml (Bolsa 50u)', 'Crioviales 1.8ml (Bolsa 100u)','Azul de Tripano 0.4% (20ml)'],
                    'Equipos': ['Cabina Flujo Laminar Clase II', 'Incubadora CO2 150L', 'Microscopio Invertido Contraste Fases']
                }
            },
            'laboratorio-biologia-molecular': {
                items: {
                    'Materiales': ['Tubos PCR 0.2ml Tira 8 (Paq. 120 tiras)', 'Placas PCR 96 pocillos (Paq. 25u)', 'Gradilla Microtubos 1.5ml', 'Micropipetas (Set P20,P200,P1000)'],
                    'Reactivos': ['Taq Polimerasa (500U)', 'dNTPs Mix 10mM (1ml)', 'Agarosa LE (100g)', 'Buffer TBE 10X (1L)'],
                    'Insumos': ['Puntas Micropipeta P10 con filtro (Rack 96u)', 'Kit Extracción ADN Plasmídico (50 prep)', 'Etanol Grado Molecular (1L)'],
                    'Equipos': ['Termociclador 96 Pocillos', 'Fuente Poder Electroforesis', 'Transiluminador UV/Luz Azul']
                }
            }
        };

        for (const areaId in areasConfig) {
            const areaElement = document.getElementById(areaId);
            if (!areaElement) continue;

            const areaData = areasConfig[areaId];
            const categoriaDetailElements = areaElement.querySelectorAll('.area-content .categoria-details');

            categoriaDetailElements.forEach(categoryDetail => {
                const categoryName = categoryDetail.dataset.category;
                if (!categoryName) return;

                const itemsForCategory = areaData.items[categoryName];
                if (itemsForCategory) {
                    const ul = categoryDetail.querySelector('ul.inventory-list');
                    if (!ul) return;
                    ul.innerHTML = '';

                    itemsForCategory.forEach(itemName => {
                        const li = document.createElement('li');
                        li.textContent = itemName;
                        li.title = `Click para agregar "${itemName}" a la calculadora`;
                        li.setAttribute('role', 'button');
                        li.tabIndex = 0;

                        li.addEventListener('click', () => {
                            calcItemNombreInput.value = itemName;
                            calcItemCantidadInput.value = '1'; // Reset quantity
                            calcItemPrecioInput.value = ''; // Clear price for user input
                            calcItemPrecioInput.focus();
                            // Scroll to calculator for better UX
                            document.getElementById('calculadora-compras').scrollIntoView({ behavior: 'smooth', block: 'start' });
                        });
                        li.addEventListener('keypress', (event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                li.click(); event.preventDefault();
                            }
});
                        ul.appendChild(li);
                    });
                }
            });
        }
    };

    // --- Inicialización General ---
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    populateExampleInventory();
    loadCalculatorListFromLocalStorage(); // Cargar datos de la calculadora al inicio
});
