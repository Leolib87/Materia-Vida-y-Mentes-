document.addEventListener('DOMContentLoaded', () => {
    const itemNombreInput = document.getElementById('item-nombre');
    const itemValorInput = document.getElementById('item-valor');
    const agregarItemBtn = document.getElementById('agregar-item-btn');
    const limpiarListaBtn = document.getElementById('limpiar-lista-btn');
    const listaCompraUl = document.getElementById('lista-compra');
    const valorTotalSpan = document.getElementById('valor-total');

    let purchaseList = [];
    let totalValue = 0;

    // Cargar desde localStorage si existe
    loadFromLocalStorage();

    agregarItemBtn.addEventListener('click', addItemToList);
    limpiarListaBtn.addEventListener('click', clearList);

    // Permitir agregar con "Enter" en los campos de input
    itemValorInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            addItemToList();
        }
    });
    itemNombreInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            if (itemValorInput.value.trim() === '') {
                itemValorInput.focus();
            } else {
                addItemToList();
            }
        }
    });

    function addItemToList() {
        const itemName = itemNombreInput.value.trim();
        const itemValue = parseFloat(itemValorInput.value);

        if (itemName === '') {
            alert('Por favor, ingrese el nombre del item.');
            itemNombreInput.focus();
            return;
        }
        if (isNaN(itemValue) || itemValue <= 0) {
            alert('Por favor, ingrese un valor numérico válido y positivo para el item.');
            itemValorInput.value = '';
            itemValorInput.focus();
            return;
        }

        const item = {
            id: Date.now(), // ID único simple basado en timestamp
            name: itemName,
            value: itemValue
        };

        purchaseList.push(item);
        updatePurchaseDisplay();
        saveToLocalStorage();

        itemNombreInput.value = '';
        itemValorInput.value = '';
        itemNombreInput.focus();
    }

    function updatePurchaseDisplay() {
        listaCompraUl.innerHTML = ''; // Limpiar lista actual en la UI
        totalValue = 0;

        purchaseList.forEach(item => {
            const listItem = document.createElement('li');

            const nameSpan = document.createElement('span');
            nameSpan.className = 'item-name';
            nameSpan.textContent = item.name;

            const valueSpan = document.createElement('span');
            valueSpan.className = 'item-value';
            valueSpan.textContent = `CLP ${item.value.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

            const removeButton = document.createElement('button');
            removeButton.className = 'remove-item';
            removeButton.textContent = 'Eliminar';
            
            removeButton.addEventListener('click', () => {
                removeItem(item.id);
            });

            listItem.appendChild(nameSpan);
            listItem.appendChild(valueSpan);
            listItem.appendChild(removeButton);
            listaCompraUl.appendChild(listItem);

            totalValue += item.value;
        });

        valorTotalSpan.textContent = totalValue.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function removeItem(itemId) {
        purchaseList = purchaseList.filter(item => item.id !== itemId);
        updatePurchaseDisplay();
        saveToLocalStorage();
    }

    function clearList() {
        if (purchaseList.length === 0) {
            alert("La lista de compra ya está vacía.");
            return;
        }
        if (confirm('¿Está seguro de que desea limpiar toda la lista de compra?')) {
            purchaseList = [];
            totalValue = 0;
            updatePurchaseDisplay();
            localStorage.removeItem('purchaseListData');
            itemNombreInput.focus();
        }
    }

    function saveToLocalStorage() {
        localStorage.setItem('purchaseListData', JSON.stringify({ list: purchaseList }));
    }

    function loadFromLocalStorage() {
        const storedData = localStorage.getItem('purchaseListData');
        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                purchaseList = Array.isArray(parsedData.list) ? parsedData.list : [];
                if (purchaseList.length > 0) {
                    updatePurchaseDisplay();
                }
            } catch (error) {
                console.error("Error al cargar datos de localStorage:", error);
                localStorage.removeItem('purchaseListData'); // Limpiar si está corrupto
            }
        }
    }

    // Poblar inventario con items de ejemplo
    const populateExampleInventory = () => {
        const areasConfig = {
            'laboratorio-histologia': {
                name: 'Histología',
                items: {
                    'Materiales': ['Portaobjetos de vidrio esmerilado', 'Cubreobjetos (22x22mm)', 'Cuchillas de micrótomo (bajo perfil)', 'Placas de Petri estériles (90mm)'],
                    'Reactivos': ['Formaldehído tamponado al 10%', 'Etanol (70%, 95%, absoluto)', 'Hematoxilina de Harris', 'Eosina Y (solución alcohólica)'],
                    'Insumos': ['Guantes de nitrilo (tallas S, M, L)', 'Cassettes de inclusión tisular', 'Moldes de inclusión (varios tamaños)', 'Parafina histológica (punto de fusión 56-58°C)'],
                    'Equipos': ['Micrótomo rotatorio manual', 'Procesador automático de tejidos', 'Baño de flotación de tejidos', 'Placa calefactora de laboratorio']
                }
            },
            'laboratorio-biologia-celular': {
                name: 'Biología Celular',
                items: {
                    'Materiales': ['Placas de cultivo celular (6, 12, 24, 96 pocillos, tratadas)', 'Frascos de cultivo celular (T25, T75, T175, con filtro)', 'Pipetas serológicas estériles (5ml, 10ml, 25ml)', 'Puntas de micropipeta estériles con filtro'],
                    'Reactivos': ['Medio de cultivo DMEM (alto en glucosa, con L-Glutamina)', 'Suero Fetal Bovino (SFB, calidad estándar, inactivado por calor)', 'Tripsina-EDTA (0.05%)', 'PBS (Phosphate Buffered Saline, estéril)'],
                    'Insumos': ['Tubos cónicos estériles (15ml, 50ml)', 'Crioviales estériles (1.8ml)', 'Filtros de jeringa estériles (0.22µm)', 'Hemocitómetro (Cámara de Neubauer)'],
                    'Equipos': ['Cabina de bioseguridad Clase II', 'Incubadora de CO2 (5% CO2, 37°C)', 'Microscopio invertido con contraste de fases', 'Centrífuga refrigerada de sobremesa con rotores para tubos y placas']
                }
            },
            'laboratorio-biologia-molecular': {
                name: 'Biología Molecular',
                items: {
                    'Materiales': ['Tubos de PCR de pared fina (0.2ml, tiras de 8)', 'Placas de PCR de 96 pocillos (compatibles con termociclador)', 'Gradillas para microtubos de 1.5/2.0ml', 'Micropipetas de volumen variable (P2, P10, P20, P100, P200, P1000)'],
                    'Reactivos': ['ADN Polimerasa Taq (alta fidelidad)', 'dNTPs mix (10mM cada uno)', 'Primers específicos (síntesis bajo demanda)', 'Agarosa (grado biología molecular)'],
                    'Insumos': ['Puntas de micropipeta con filtro (libres de RNasa/DNasa)', 'Kits de extracción de ADN/ARN (plásmidos, genómico, ARN total)', 'Marcadores de peso molecular de ADN (ladder 100bp, 1kb)', 'Buffer TAE (50X) / TBE (10X)'],
                    'Equipos': ['Termociclador con gradiente', 'Sistema de electroforesis horizontal en gel', 'Transiluminador UV/Luz Azul', 'Espectrofotómetro NanoDrop para cuantificación de ácidos nucleicos']
                }
            }
        };

        for (const areaId in areasConfig) {
            const areaElement = document.getElementById(areaId);
            if (!areaElement) {
                console.warn(`Elemento del área con ID '${areaId}' no encontrado.`);
                continue;
            }

            const areaData = areasConfig[areaId];
            const categoryElements = areaElement.querySelectorAll('.categoria');

            categoryElements.forEach(categoryDiv => {
                const h3 = categoryDiv.querySelector('h3');
                if (!h3) return;

                const categoryName = h3.textContent.trim();
                const itemsForCategory = areaData.items[categoryName];

                if (itemsForCategory) {
                    let ul = categoryDiv.querySelector('ul');
                    if (!ul) { // Si el ul no existe en el HTML, lo crea
                        ul = document.createElement('ul');
                        categoryDiv.appendChild(ul);
                    }
                    ul.innerHTML = ''; // Limpiar ítems de ejemplo existentes

                    itemsForCategory.forEach(itemName => {
                        const li = document.createElement('li');
                        li.className = 'inventory-item';
                        li.textContent = itemName;
                        li.title = `Click para agregar "${itemName}" a la calculadora de compras`;
                        li.setAttribute('role', 'button'); // Para accesibilidad
                        li.tabIndex = 0; // Para que sea focusable con teclado

                        const addItemToCalc = () => {
                            itemNombreInput.value = itemName;
                            itemValorInput.value = '';
                            itemValorInput.focus();
                            document.getElementById('calculadora-compras').scrollIntoView({ behavior: 'smooth', block: 'start' });
                        };

                        li.addEventListener('click', addItemToCalc);
                        li.addEventListener('keypress', (event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                addItemToCalc();
                            }
                        });
                        ul.appendChild(li);
                    });
                }
            });
        }
    };

    populateExampleInventory(); // Llenar el inventario con ejemplos al cargar la página
});
