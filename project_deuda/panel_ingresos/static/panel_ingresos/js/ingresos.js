// Configuración de Estados
let fechaActual = new Date();
let registros = JSON.parse(localStorage.getItem('registros_ingresos')) || [];

// Meses en Español
const nombresMeses = [
    "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", 
    "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
];

// Opciones para Selects
const opcionesMetodo = ["Efectivo", "Banco", "Tarjeta", "Transferencia"];
const opcionesConceptoIngreso = ["Salario", "Venta", "Intereses", "Honorarios", "Regalo", "Inversión", "Otro"];
// Combinados para el select concepto simple
const opcionesConcepto = [...opcionesConceptoIngreso];

// Variables de paginación
let paginaActual = 1;
const registrosPorPagina = 5;

// Elementos del DOM
const nombreMesEl = document.getElementById('nombreMes');
const cuerpoTabla = document.getElementById('cuerpoTabla');
const btnAgregar = document.getElementById('btnAgregar');
const btnGuardar = document.getElementById('btnGuardar');
const pickerCalendario = document.getElementById('pickerCalendario');
const abrirPicker = document.getElementById('abrirPicker');
const gridMeses = document.getElementById('gridMeses');
const listaAnios = document.getElementById('listaAnios');
const btnAplicarFiltro = document.getElementById('btnAplicarFiltro');
const btnLimpiarFiltro = document.getElementById('btnLimpiarFiltro');
const anioArriba = document.getElementById('anioArriba');
const anioAbajo = document.getElementById('anioAbajo');
const inputAnioManual = document.getElementById('inputAnioManual');
const errorAnio = document.getElementById('errorAnio');
const listaAniosDropdown = document.getElementById('listaAniosDropdown');
const modalAviso = document.getElementById('modalAviso');
const mensajeAviso = document.getElementById('mensajeAviso');
const btnCerrarAviso = document.getElementById('btnCerrarAviso');
const modalConfirmacion = document.getElementById('modalConfirmacion');
const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar');
const btnCancelarEliminar = document.getElementById('btnCancelarEliminar');

// Estado temporal del picker
let idAEliminar = null;
let anioEnEdicion = fechaActual.getFullYear();
let mesEnEdicion = fechaActual.getMonth();
let estaAgregando = false;
const mesesAbreviados = ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sept.", "oct.", "nov.", "dic."];

const resumenIngresosEl = document.getElementById('resumenIngresos');
const analisisIngresosEl = document.getElementById('analisisIngresos');

// Controles paginación
const btnPrevPag = document.getElementById('btnPrevPag');
const btnNextPag = document.getElementById('btnNextPag');
const infoPaginacion = document.getElementById('infoPaginacion');

// Gráficos
let graficoBarras, graficoCircular;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    actualizarInterfaz();
    
    document.getElementById('mesPrevio').addEventListener('click', () => cambiarMes(-1));
    document.getElementById('mesSiguiente').addEventListener('click', () => cambiarMes(1));
    btnAgregar.addEventListener('click', agregarFilaVacia);
    btnGuardar.addEventListener('click', guardarCambios);
    btnGuardar.disabled = true;
    
    if (btnPrevPag) btnPrevPag.addEventListener('click', () => cambiarPagina(-1));
    if (btnNextPag) btnNextPag.addEventListener('click', () => cambiarPagina(1));

    // Lógica selector premium
    if (abrirPicker) {
        abrirPicker.addEventListener('click', (e) => {
            e.stopPropagation();
            pickerCalendario.classList.toggle('activo');
            if (pickerCalendario.classList.contains('activo')) {
                anioEnEdicion = fechaActual.getFullYear();
                mesEnEdicion = fechaActual.getMonth();
                renderizarPicker();
            }
        });
    }

    // Cerrar al hacer clic fuera del picker
    document.addEventListener('click', (e) => {
        if (pickerCalendario && !pickerCalendario.contains(e.target) && abrirPicker && !abrirPicker.contains(e.target)) {
            pickerCalendario.classList.remove('activo');
        }
    });

    // Cerrar modales al hacer clic en el backdrop (el área fuera del contenido)
    if (modalAviso) {
        modalAviso.addEventListener('click', (e) => {
            if (e.target === modalAviso) {
                modalAviso.classList.remove('activo');
            }
        });
    }

    if (modalConfirmacion) {
        modalConfirmacion.addEventListener('click', (e) => {
            if (e.target === modalConfirmacion) {
                modalConfirmacion.classList.remove('activo');
                idAEliminar = null;
            }
        });
    }

    btnAplicarFiltro.addEventListener('click', () => {
        fechaActual.setFullYear(anioEnEdicion);
        fechaActual.setMonth(mesEnEdicion);
        paginaActual = 1;
        actualizarInterfaz();
        pickerCalendario.classList.remove('activo');
    });

    // Botones de Exportar
    document.getElementById('btnExportarExcel').addEventListener('click', exportarExcel);
    document.getElementById('btnExportarPDF').addEventListener('click', exportarPDF);

    btnLimpiarFiltro.addEventListener('click', () => {
        fechaActual = new Date(); // Reset a hoy
        anioEnEdicion = fechaActual.getFullYear();
        mesEnEdicion = fechaActual.getMonth();
        paginaActual = 1;
        actualizarInterfaz();
        pickerCalendario.classList.remove('activo');
    });

    if (inputAnioManual) {
        inputAnioManual.addEventListener('focus', () => {
            poblarDropdownAnios();
            listaAniosDropdown.classList.add('activo');
        });

        inputAnioManual.addEventListener('input', (e) => {
            const valStr = e.target.value;
            
            // Validar si solo hay números
            if (valStr !== "" && !/^\d+$/.test(valStr)) {
                inputAnioManual.classList.add('input-error');
                if (errorAnio) errorAnio.textContent = 'Solo se permiten números';
                btnAplicarFiltro.disabled = true;
                poblarDropdownAnios(""); // Mostrar todo si hay error de letras
                return;
            }

            const val = parseInt(valStr);
            const esValido = !isNaN(val) && val >= 1900 && val <= 2100;
            
            if (esValido) {
                anioEnEdicion = val;
                inputAnioManual.classList.remove('input-error');
                if (errorAnio) errorAnio.textContent = '';
                btnAplicarFiltro.disabled = false;
                renderizarPicker();
            } else {
                inputAnioManual.classList.add('input-error');
                if (errorAnio) {
                    if (valStr.length >= 4) {
                        errorAnio.textContent = 'Año inválido (1900-2100)';
                    } else if (valStr.length > 0) {
                        errorAnio.textContent = 'Ingresa un año (1900-2100)';
                    } else {
                        errorAnio.textContent = '';
                    }
                }
                btnAplicarFiltro.disabled = true;
            }
            
            // Filtrar dropdown
            poblarDropdownAnios(valStr);
        });

        // Cerrar al hacer clic fuera del contenedor
        document.addEventListener('click', (e) => {
            if (!inputAnioManual.contains(e.target) && !listaAniosDropdown.contains(e.target)) {
                listaAniosDropdown.classList.remove('activo');
            }
        });
    }

    if (btnCerrarAviso) {
        btnCerrarAviso.addEventListener('click', () => {
            modalAviso.classList.remove('activo');
        });
    }

    if (btnCancelarEliminar) {
        btnCancelarEliminar.addEventListener('click', () => {
            modalConfirmacion.classList.remove('activo');
            idAEliminar = null;
        });
    }

    if (btnConfirmarEliminar) {
        btnConfirmarEliminar.addEventListener('click', () => {
            if (idAEliminar) {
                registros = registros.filter(r => r.id !== idAEliminar);
                localStorage.setItem('registros_ingresos', JSON.stringify(registros));
                actualizarInterfaz();
                modalConfirmacion.classList.remove('activo');
                idAEliminar = null;
                estaAgregando = false; // Reset state if the new row was deleted
                mostrarAviso("Registro eliminado correctamente");
            }
        });
    }
});


function mostrarAviso(mensaje) {
    if (mensajeAviso && modalAviso) {
        mensajeAviso.textContent = mensaje;
        modalAviso.classList.add('activo');
    } else {
        alert(mensaje); // Fallback
    }
}

function renderizarPicker() {
    // Sincronizar input manual
    if (inputAnioManual) {
        inputAnioManual.value = anioEnEdicion;
    }
    
    // Renderizar meses
    gridMeses.innerHTML = '';
    mesesAbreviados.forEach((nombre, index) => {
        const btn = document.createElement('div');
        btn.className = `mes-btn ${index === mesEnEdicion ? 'seleccionado' : ''}`;
        btn.textContent = nombre;
        btn.onclick = (e) => {
            e.stopPropagation();
            mesEnEdicion = index;
            renderizarPicker();
        };
        gridMeses.appendChild(btn);
    });
}

function cambiarPagina(direccion) {
    const registrosMes = obtenerRegistrosMesActual();
    const totalPaginas = Math.ceil(registrosMes.length / registrosPorPagina) || 1;
    let nuevaPagina = paginaActual + direccion;
    
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
        paginaActual = nuevaPagina;
        renderizarTabla();
    }
}

// Funciones de Meses
function cambiarMes(direccion) {
    fechaActual.setMonth(fechaActual.getMonth() + direccion);
    paginaActual = 1; // reset page on month change
    actualizarInterfaz();
}

function actualizarInterfaz() {
    const mesIdx = fechaActual.getMonth();
    const anio = fechaActual.getFullYear();
    nombreMesEl.textContent = `${nombresMeses[mesIdx]} ${anio}`;
    
    renderizarTabla();
    actualizarResumen();
    actualizarGraficos();
    validarEstadoGuardar();
}

// Funciones CRUD
function renderizarTabla() {
    cuerpoTabla.innerHTML = '';
    const registrosMes = obtenerRegistrosMesActual();
    
    const totalPaginas = Math.ceil(registrosMes.length / registrosPorPagina) || 1;
    if (paginaActual > totalPaginas) paginaActual = totalPaginas;
    
    // Actualizar controles
    if (infoPaginacion) infoPaginacion.textContent = `${paginaActual} / ${totalPaginas}`;
    if (btnPrevPag) btnPrevPag.disabled = paginaActual === 1;
    if (btnNextPag) btnNextPag.disabled = paginaActual === totalPaginas;
    
    const indexInicio = (paginaActual - 1) * registrosPorPagina;
    const registrosPagina = registrosMes.slice(indexInicio, indexInicio + registrosPorPagina);
    
    registrosPagina.forEach((reg, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="date" value="${reg.fecha}" data-index="${reg.id}" class="input-fecha" onfocus="this.placeholder=''" placeholder="Fecha" disabled></td>
            <td><input type="text" value="${reg.descripcion}" data-index="${reg.id}" class="input-desc" placeholder="Descripción" onfocus="this.placeholder=''" disabled></td>
            <td>
                <select data-index="${reg.id}" class="input-metodo" disabled>
                     <option value="" disabled ${!reg.metodo ? 'selected' : ''}>Método</option>
                     ${opcionesMetodo.map(opt => `<option value="${opt}" ${opt === reg.metodo ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>
            </td>
            <td>
                <select data-index="${reg.id}" class="input-concepto" disabled>
                     <option value="" disabled ${!reg.concepto ? 'selected' : ''}>Concepto</option>
                     ${opcionesConcepto.map(opt => `<option value="${opt}" ${opt === reg.concepto ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>
            </td>
            <td><input type="number" value="${reg.monto !== '' ? reg.monto : ''}" data-index="${reg.id}" class="input-monto" placeholder="Monto" onfocus="this.placeholder=''" disabled></td>
            <td class="acciones">
                <button class="btn-accion" onclick="enfocarFila(this)" ${estaAgregando ? 'disabled' : ''} title="${estaAgregando ? 'Guarda el registro actual primero' : 'Editar'}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-accion btn-eliminar" onclick="eliminarRegistro('${reg.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        cuerpoTabla.appendChild(tr);

        // Añadir listeners para validación
        tr.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('input', validarEstadoGuardar);
            input.addEventListener('change', validarEstadoGuardar);
        });
    });
}

function validarEstadoGuardar() {
    const filas = cuerpoTabla.querySelectorAll('tr');
    let hayCambiosValidos = false;
    let todosValidos = true;

    filas.forEach(fila => {
        const id = fila.querySelector('.input-fecha').dataset.index;
        const regOriginal = registros.find(r => r.id === id);
        
        const fecha = fila.querySelector('.input-fecha').value;
        const desc = fila.querySelector('.input-desc').value;
        const metodo = fila.querySelector('.input-metodo').value;
        const concepto = fila.querySelector('.input-concepto').value;
        const montoStr = fila.querySelector('.input-monto').value;
        const monto = montoStr === '' ? 0 : parseFloat(montoStr);

        // Validación de campos obligatorios
        const esValido = fecha && desc.trim() !== "" && metodo !== "" && concepto !== "" && monto > 0;
        
        if (!esValido) {
            todosValidos = false;
        }

        // Verificar si hubo cambios respecto al original
        if (regOriginal) {
            const huboCambio = 
                fecha !== regOriginal.fecha ||
                desc !== regOriginal.descripcion ||
                metodo !== regOriginal.metodo ||
                concepto !== regOriginal.concepto ||
                monto !== (regOriginal.monto === '' ? 0 : parseFloat(regOriginal.monto));
            
            if (huboCambio && esValido) {
                hayCambiosValidos = true;
            }
        }
    });

    btnGuardar.disabled = !(todosValidos && (hayCambiosValidos || estaAgregando));
}

function obtenerRegistrosMesActual() {
    const mes = fechaActual.getMonth();
    const anio = fechaActual.getFullYear();
    
    return registros.filter(reg => {
        const fechaReg = new Date(reg.fecha);
        const esMismoMes = fechaReg.getMonth() === mes && fechaReg.getFullYear() === anio;
        return esMismoMes;
    });
}

function agregarFilaVacia() {
    // Validar si ya hay un registro en proceso en el mes actual
    let registrosMes = obtenerRegistrosMesActual();
    const tieneIncompleto = registrosMes.some(reg => !reg.descripcion.trim() || reg.monto === "" || parseFloat(reg.monto) === 0);
    
    if (tieneIncompleto) {
        mostrarAviso("Debes terminar de completar o guardar el registro actual antes de crear uno nuevo.");
        return;
    }

    const hoy = new Date();
    const mesAct = fechaActual.getMonth() + 1;
    const anioAct = fechaActual.getFullYear();
    const diaAct = String(hoy.getDate()).padStart(2, '0');
    const fechaStr = `${anioAct}-${String(mesAct).padStart(2, '0')}-${diaAct}`;

    const nuevoReg = {
        id: Date.now().toString(),
        fecha: fechaStr,
        descripcion: "",
        metodo: "",
        concepto: "",
        monto: ""
    };
    
    registros.push(nuevoReg);
    estaAgregando = true;
    
    // Ir a la última página al agregar si es necesario
    registrosMes = obtenerRegistrosMesActual();
    paginaActual = Math.ceil(registrosMes.length / registrosPorPagina) || 1;
    
    renderizarTabla();
    
    // Habilitar la nueva fila inmediatamente
    const ultimaFila = cuerpoTabla.lastElementChild;
    if (ultimaFila) {
        ultimaFila.querySelectorAll('input, select').forEach(c => c.disabled = false);
        const primerInput = ultimaFila.querySelector('input');
        if (primerInput) primerInput.focus();
    }
    
    validarEstadoGuardar();
}

function guardarCambios() {
    const filas = cuerpoTabla.querySelectorAll('tr');
    filas.forEach(fila => {
        const id = fila.querySelector('.input-fecha').dataset.index;
        const index = registros.findIndex(r => r.id === id);
        
        if (index !== -1) {
            registros[index].fecha = fila.querySelector('.input-fecha').value;
            registros[index].descripcion = fila.querySelector('.input-desc').value;
            registros[index].metodo = fila.querySelector('.input-metodo').value;
            registros[index].concepto = fila.querySelector('.input-concepto').value;
            registros[index].monto = fila.querySelector('.input-monto').value === '' ? 0 : parseFloat(fila.querySelector('.input-monto').value);
        }
    });
    
    estaAgregando = false;
    localStorage.setItem('registros_ingresos', JSON.stringify(registros));
    actualizarInterfaz();
    mostrarAviso("Ingresos guardados correctamente");
}

function eliminarRegistro(id) {
    idAEliminar = id;
    if (modalConfirmacion) {
        modalConfirmacion.classList.add('activo');
    } else {
        if (confirm("¿Estás seguro de eliminar este registro?")) {
            registros = registros.filter(r => r.id !== id);
            localStorage.setItem('registros_ingresos', JSON.stringify(registros));
            actualizarInterfaz();
        }
    }
}

function enfocarFila(boton) {
    const fila = boton.closest('tr');
    const controles = fila.querySelectorAll('input, select');
    controles.forEach(c => c.disabled = false);

    const primerInput = fila.querySelector('input');
    if (primerInput) primerInput.focus();

    validarEstadoGuardar();
}

// Lógica de Negocio
function actualizarResumen() {
    const mesAct = fechaActual.getMonth();
    const anioAct = fechaActual.getFullYear();
    
    let totalIngresosMes = 0;
    
    registros.forEach(reg => {
        if (!reg.fecha) return;
        const fechaReg = new Date(reg.fecha + 'T00:00:00');
        if (fechaReg.getMonth() === mesAct && fechaReg.getFullYear() === anioAct) {
            totalIngresosMes += (parseFloat(reg.monto) || 0);
        }
    });

    if (resumenIngresosEl) resumenIngresosEl.textContent = formatCurrency(totalIngresosMes);
    if (analisisIngresosEl) analisisIngresosEl.textContent = formatCurrency(totalIngresosMes);
}

function formatCurrency(valor) {
    return new Intl.NumberFormat('es-CO', { 
        style: 'currency', 
        currency: 'COP', 
        minimumFractionDigits: 0 
    }).format(valor).replace('COP', '$');
}

// Visualización de Datos
function actualizarGraficos() {
    const anioAct = fechaActual.getFullYear();
    const mesAct = fechaActual.getMonth();
    const anioPasado = mesAct === 0 ? anioAct - 1 : anioAct;
    const mesPas = mesAct === 0 ? 11 : mesAct - 1;

    let totalIngActual = 0;
    let totalIngPasado = 0;
    const conceptosContador = {};

    registros.forEach(reg => {
        if (!reg.fecha) return;
        const fechaReg = new Date(reg.fecha + 'T00:00:00');
        const mesReg = fechaReg.getMonth();
        const anioReg = fechaReg.getFullYear();
        const monto = parseFloat(reg.monto) || 0;

        if (mesReg === mesAct && anioReg === anioAct) {
            totalIngActual += monto;
            conceptosContador[reg.concepto] = (conceptosContador[reg.concepto] || 0) + monto;
        } else if (mesReg === mesPas && anioReg === anioPasado) {
            totalIngPasado += monto;
        }
    });

    const labelsCircular = Object.keys(conceptosContador);
    const dataCircular = Object.values(conceptosContador);

    // Gráfico de Barras con gradientes
    if (graficoBarras) graficoBarras.destroy();
    const ctxBarras = document.getElementById('graficoBarras').getContext('2d');
    
    let gradientePasado = ctxBarras.createLinearGradient(0, 0, 0, 300);
    gradientePasado.addColorStop(0, 'rgba(255, 248, 220, 0.4)'); 
    gradientePasado.addColorStop(1, 'rgba(255, 248, 220, 0.0)');

    let gradienteActual = ctxBarras.createLinearGradient(0, 0, 0, 300);
    gradienteActual.addColorStop(0, 'rgba(22, 163, 74, 0.9)'); 
    gradienteActual.addColorStop(1, 'rgba(22, 163, 74, 0.1)');

    graficoBarras = new Chart(ctxBarras, {
        type: 'bar',
        data: {
            labels: ['Mes Pasado', 'Mes Actual'],
            datasets: [{
                label: 'Ingresos',
                data: [totalIngPasado, totalIngActual],
                backgroundColor: [gradientePasado, gradienteActual],
                borderColor: ['#fff8dc', '#16a34a'],
                borderWidth: 2,
                borderRadius: 6,
                barPercentage: 0.55
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { 
                    beginAtZero: true, 
                    grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false }, 
                    ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { size: 11 } } 
                },
                x: { 
                    grid: { display: false },
                    ticks: { color: 'rgba(255, 255, 255, 0.7)', font: { weight: 'bold' } } 
                }
            },
            plugins: { 
                legend: { display: false }, 
                tooltip: { 
                    callbacks: {
                        label: function(context) { return '$ ' + context.parsed.y.toLocaleString(); }
                    }
                }
            }
        }
    });

    // Gráfico Circular
    if (graficoCircular) graficoCircular.destroy();
    const ctxCircular = document.getElementById('graficoCircular').getContext('2d');
    
    graficoCircular = new Chart(ctxCircular, {
        type: 'doughnut',
        data: {
            labels: labelsCircular,
            datasets: [{
                data: dataCircular,
                backgroundColor: ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#f3d989'],
                borderWidth: 3,
                borderColor: '#000c17'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: 'rgba(255, 255, 255, 0.8)', font: { size: 11 } } }
            },
            cutout: '65%'
        }
    });
}

function poblarDropdownAnios(filtro = "") {
    if (!listaAniosDropdown) return;
    const anioActual = new Date().getFullYear();
    listaAniosDropdown.innerHTML = '';
    const anios = [];
    for (let i = anioActual + 1; i >= 1900; i--) {
        if (i.toString().includes(filtro)) {
            anios.push(i);
        }
    }
    if (anios.length === 0) {
        const div = document.createElement('div');
        div.className = 'opcion-anio-premium';
        div.style.opacity = '0.5';
        div.textContent = 'Sin resultados';
        listaAniosDropdown.appendChild(div);
        return;
    }
    anios.forEach(anio => {
        const div = document.createElement('div');
        div.className = 'opcion-anio-premium';
        div.textContent = anio;
        div.onclick = () => {
            anioEnEdicion = anio;
            inputAnioManual.value = anio;
            listaAniosDropdown.classList.remove('activo');
            renderizarPicker();
        };
        listaAniosDropdown.appendChild(div);
    });
}

// Funciones de Exportación
function exportarExcel() {
    const registrosMes = obtenerRegistrosMesActual();
    if (registrosMes.length === 0) {
        mostrarAviso("No hay datos para exportar.");
        return;
    }
    const mesStr = nombresMeses[fechaActual.getMonth()];
    const anioStr = fechaActual.getFullYear();
    let csv = "Fecha,Descripción,Método,Concepto,Monto\n";
    registrosMes.forEach(reg => {
        csv += `${reg.fecha},"${reg.descripcion}",${reg.metodo},${reg.concepto},${reg.monto}\n`;
    });
    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `Ingresos_${mesStr}_${anioStr}.csv`);
    link.click();
}

function exportarPDF() {
    window.location.href = '/reportes/ingresos/pdf/';
}
