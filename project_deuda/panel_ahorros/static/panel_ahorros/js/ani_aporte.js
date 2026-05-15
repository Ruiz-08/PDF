document.addEventListener('DOMContentLoaded', () => {
    /* ===============================
       MODAL DE AVISO Y CIERRE GLOBAL
    =============================== */
    const modalAviso = document.getElementById("modalAviso");
    const mensajeAviso = document.getElementById("mensajeAviso");
    const btnAceptarAviso = document.getElementById("btnAceptarAviso");
    let onAlertaClose = null;

    function mostrarAlerta(mensaje, callback) {
        if (modalAviso && mensajeAviso) {
            mensajeAviso.textContent = mensaje;
            modalAviso.classList.add("activo");
            onAlertaClose = callback;
        } else {
            alert(mensaje);
            if (callback) callback();
        }
    }

    if (btnAceptarAviso && modalAviso) {
        btnAceptarAviso.addEventListener("click", () => {
            modalAviso.classList.remove("activo");
            if (onAlertaClose) {
                onAlertaClose();
                onAlertaClose = null;
            }
        });
    }

    // Cierre de modal al hacer clic fuera del contenido
    document.addEventListener("click", (e) => {
        if (modalAviso && e.target === modalAviso) {
            modalAviso.classList.remove("activo");
            if (onAlertaClose) {
                onAlertaClose();
                onAlertaClose = null;
            }
        }
    });

    // 1. Datos iniciales y Meta Seleccionada
    const goalTitleEl = document.querySelector('.goal-title');
    const goalImageEl = document.querySelector('.goal-image');
    
    let metaTitulo = localStorage.getItem("metaSeleccionadaTitulo") || "Mi Meta";

    // 2. Renderizar el Calendario Real
    const calendarGrid = document.getElementById('calendar-grid');
    const monthTitle = document.querySelector('.cal-month-title');
    const navBtns = document.querySelectorAll('.cal-nav-btn');
    const dateText = document.querySelector('.date-text');
    
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    let selectedDayInfo = { day: currentDate.getDate(), month: currentMonth, year: currentYear };
 
    const monthNames = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
    const monthNamesCapitalized = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const daysHeader = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

    function renderCalendar(month, year) {
        calendarGrid.innerHTML = '';
        
        // Cargar historial de aportes para esta meta
        const historyKey = `historial_meta_${metaTitulo}`;
        const savedHistory = JSON.parse(localStorage.getItem(historyKey)) || [];

        // Render Headers
        daysHeader.forEach(day => {
            const span = document.createElement('span');
            span.className = 'calendar-grid-header';
            span.textContent = day;
            calendarGrid.appendChild(span);
        });

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const prevMonthDays = new Date(year, month, 0).getDate();
        
        monthTitle.textContent = `${monthNames[month]} ${year}`;

        // Fillers del mes anterior
        for(let i = firstDay - 1; i >= 0; i--) {
            const cell = document.createElement('div');
            cell.className = 'cal-day-muted';
            cell.textContent = prevMonthDays - i;
            calendarGrid.appendChild(cell);
        }

        // Dias del mes en curso
        for(let day = 1; day <= daysInMonth; day++) {
            const cell = document.createElement('div');
            
            // Construir ID de fecha para verificar en el historial: "D-M-Y"
            const dateID = `${day}-${month}-${year}`;
            const hasAporte = savedHistory.includes(dateID);
            
            let innerHTML = `<span class="cal-num">${day}</span>`;
            if(hasAporte) {
                cell.classList.add('cal-has-aporte');
                innerHTML += `<i class="far fa-check-circle cal-check-icon"></i>`;
            }

            if(day === selectedDayInfo.day && month === selectedDayInfo.month && year === selectedDayInfo.year) {
                cell.classList.add('cal-selected');
                updateSelectionText(day, month);
            }

            cell.innerHTML = innerHTML;

            // Selección Visual
            cell.addEventListener('click', () => {
                selectedDayInfo = { day, month, year };
                document.querySelectorAll('.cal-selected').forEach(el => el.classList.remove('cal-selected'));
                cell.classList.add('cal-selected');
                updateSelectionText(day, month);
            });

            calendarGrid.appendChild(cell);
        }

        // Fillers del siguiente mes
        const totalFilled = firstDay + daysInMonth;
        const remainingSlots = 42 - totalFilled;
        for(let i = 1; i <= remainingSlots; i++) {
             const cell = document.createElement('div');
             cell.className = 'cal-day-muted';
             cell.textContent = i;
             calendarGrid.appendChild(cell);
        }
    }

    function updateSelectionText(day, month) {
        if(dateText) dateText.textContent = `${day} de ${monthNamesCapitalized[month]}`;
    }

    if(navBtns.length >= 2) {
        navBtns[0].addEventListener('click', () => { 
            currentMonth--;
            if(currentMonth < 0) { currentMonth = 11; currentYear--; }
            renderCalendar(currentMonth, currentYear);
        });
        navBtns[1].addEventListener('click', () => { 
            currentMonth++;
            if(currentMonth > 11) { currentMonth = 0; currentYear++; }
            renderCalendar(currentMonth, currentYear);
        });
    }

    renderCalendar(currentMonth, currentYear);

    // 3. Interactividad de Input y Montos
    const inputAporte = document.getElementById('aporte-input');
    const quickAmountsContainer = document.getElementById('quick-amounts-container');
    const btnAportar = document.getElementById('btn-aportar');
    const btnCancelar = document.querySelector('.btn-secondary');

    const parseMonto = (val) => {
        if (typeof val === 'number') return val;
        // Eliminar todo lo que no sea dígito para procesar el número puro
        const cleanVal = val.replace(/\D/g, '');
        return parseFloat(cleanVal) || 0;
    };
    const formatMonto = (num) => num.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

    function updateMainButton(monto) {
        if(btnAportar) btnAportar.innerHTML = `<i class="fas fa-coins" style="margin-right: 8px;"></i> APORTAR ${formatMonto(monto)}`;
    }

    // Obtener sugerencias de aporte
    const baseAporte = parseFloat(localStorage.getItem('metaSeleccionadaAporte')) || 150;
    const freqAporte = localStorage.getItem('metaSeleccionadaFrecuencia') || "3";
    
    // Configurar el input inicial con el valor sugerido
    if(inputAporte) {
        inputAporte.value = formatMonto(baseAporte);
        updateMainButton(baseAporte);
    }
    
    let ultimoTipoAporte = 'manual';
    
    if (quickAmountsContainer) {
        quickAmountsContainer.innerHTML = '';
        
        const baseBtn = document.createElement('button');
        baseBtn.className = 'quick-amount-btn';
        baseBtn.setAttribute('data-amount', baseAporte);
        baseBtn.innerHTML = `${formatMonto(baseAporte)}`;
        
        const doubleBtn = document.createElement('button');
        doubleBtn.className = 'quick-amount-btn';
        doubleBtn.setAttribute('data-amount', baseAporte * 2);
        doubleBtn.innerHTML = `${formatMonto(baseAporte * 2)}`;
        
        const otherBtn = document.createElement('button');
        otherBtn.className = 'quick-amount-btn outline';
        otherBtn.innerHTML = `<span style="color: #CFB53B;">+</span> Otro`;
        
        quickAmountsContainer.appendChild(baseBtn);
        quickAmountsContainer.appendChild(doubleBtn);
        quickAmountsContainer.appendChild(otherBtn);
        
        quickAmountsContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.quick-amount-btn');
            if (btn) {
                const amountToSet = btn.getAttribute('data-amount');
                if (amountToSet) {
                    const newVal = parseFloat(amountToSet);
                    const faltante = metaTotal - metaActual;
                    const valorFinal = Math.min(newVal, faltante);
                    inputAporte.value = formatMonto(valorFinal);
                    updateMainButton(valorFinal);
                    ultimoTipoAporte = 'rápido';
                } else {
                    if (inputAporte) {
                        inputAporte.value = '';
                        inputAporte.focus();
                        ultimoTipoAporte = 'manual';
                    }
                }
            }
        });
    }

    if (inputAporte) {
        inputAporte.addEventListener('input', (e) => {
            let rawVal = e.target.value.replace(/\D/g, '');
            if (rawVal === "") {
                e.target.value = "";
                updateMainButton(0);
                if(btnAportar) btnAportar.disabled = true;
                return;
            }
            
            let num = parseInt(rawVal, 10);
            const faltante = metaTotal - metaActual;
            
            // Si intenta poner más de lo que falta, forzar al faltante
            if (num > faltante) {
                num = faltante;
                e.target.value = formatMonto(faltante);
            } else {
                e.target.value = num.toLocaleString('es-CO');
            }
            
            const finalNum = parseMonto(e.target.value);
            updateMainButton(finalNum);
            
            // Feedback visual
            let errorEl = e.target.nextElementSibling;
            if (finalNum < 1000 && faltante >= 1000) {
                e.target.classList.add("invalid");
                if (btnAportar) btnAportar.disabled = true;
                
                if (!errorEl || !errorEl.classList.contains("error-msg")) {
                    errorEl = document.createElement("span");
                    errorEl.className = "error-msg";
                    e.target.insertAdjacentElement('afterend', errorEl);
                }
                errorEl.textContent = "El monto debe ser mayor a 1.000";
            } else {
                e.target.classList.remove("invalid");
                if (errorEl && errorEl.classList.contains("error-msg")) {
                    errorEl.textContent = "";
                }
                if (btnAportar) btnAportar.disabled = false;
            }
            ultimoTipoAporte = 'manual';
        });

        inputAporte.addEventListener('blur', (e) => {
            const num = parseMonto(e.target.value);
            e.target.value = formatMonto(num);
            updateMainButton(num);
        });
    }

    // 4. Lógica Financiera y UI
    const statActualEl = document.querySelector('.stat-row:nth-child(1) .stat-value');
    const statTotalEl = document.querySelector('.stat-row:nth-child(2) .stat-value');
    const statProgresoEl = document.querySelector('.stat-row:nth-child(3) .stat-value');
    const percentageEl = document.querySelector('.percentage');
    const circleEl = document.querySelector('.circle');

    let metaActual = 0;
    let metaTotal = 0;

    function updateFinancialUI(actual, total) {
        const porcentaje = total > 0 ? Math.min(Math.round((actual / total) * 100), 100) : 0;
        if (statActualEl) statActualEl.textContent = `${actual.toLocaleString("es-CO", {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
        if (statTotalEl) statTotalEl.textContent = `${total.toLocaleString("es-CO", {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
        if (statProgresoEl) statProgresoEl.textContent = `${porcentaje}%`;
        if (percentageEl) percentageEl.textContent = `${porcentaje}%`;
        if (circleEl) {
            circleEl.style.transition = "stroke-dasharray 1.5s ease-out";
            circleEl.style.strokeDasharray = `${porcentaje}, 100`;
        }
        
        const faltante = total > actual ? total - actual : 0;
        const msgEl = document.getElementById('milestone-text-msg');
        const milestoneBar = document.querySelector('.milestone-progress-bar');
        const milestoneIcon = document.querySelector('.milestone-icon-wrapper');

        if (msgEl) {
            if (porcentaje >= 100) {
                msgEl.innerHTML = `<span class="meta-completada-texto-panel">META COMPLETADA</span>`;
                if (milestoneBar) milestoneBar.style.display = 'none';
                if (milestoneIcon) milestoneIcon.style.display = 'none';
                msgEl.parentElement.style.width = '100%';
                msgEl.parentElement.style.justifyContent = 'center';
            } else {
                msgEl.innerHTML = `Llevas <strong class="white-text">${actual.toLocaleString("es-CO", {minimumFractionDigits: 0, maximumFractionDigits: 0})}</strong> y te faltan <strong class="white-text">${faltante.toLocaleString("es-CO", {minimumFractionDigits: 0, maximumFractionDigits: 0})}</strong> para completar tu meta`;
                if (milestoneBar) milestoneBar.style.display = 'block';
                if (milestoneIcon) milestoneIcon.style.display = 'flex';
                msgEl.parentElement.style.width = '';
                msgEl.parentElement.style.justifyContent = '';
            }
        }
        
        const progFill = document.getElementById('milestone-progress-fill');
        if (progFill) {
            progFill.style.width = `${porcentaje}%`;
            if (porcentaje >= 100) {
                progFill.style.background = "linear-gradient(90deg, #ffd700, #ffcc00)";
                progFill.style.boxShadow = "0 0 15px rgba(255, 215, 0, 0.4)";
            }
        }

        // Si ya está completada, deshabilitar interacciones
        if (porcentaje >= 100) {
            if (btnAportar) {
                btnAportar.disabled = true;
                btnAportar.classList.add('disabled-gold');
                btnAportar.innerHTML = '<i class="fas fa-check-circle"></i> META COMPLETADA';
            }
            if (inputAporte) {
                inputAporte.disabled = true;
                inputAporte.placeholder = "Meta completada";
            }
            document.querySelectorAll('.quick-amount-btn').forEach(b => b.disabled = true);
        }
    }

    if (goalTitleEl && goalImageEl) {
        goalTitleEl.textContent = metaTitulo;
        const storedImageUrl = localStorage.getItem("metaSeleccionadaImagen");
        const baseActual = parseFloat(localStorage.getItem("metaSeleccionadaActual")) || 0;
        const baseTotal = parseFloat(localStorage.getItem("metaSeleccionadaTotal")) || 0;

        const progressKey = `progreso_meta_${metaTitulo}`;
        const savedProgress = localStorage.getItem(progressKey);
        
        metaActual = savedProgress !== null ? parseFloat(savedProgress) : baseActual;
        metaTotal = baseTotal;

        updateFinancialUI(metaActual, metaTotal);

        if (storedImageUrl && storedImageUrl !== "none") {
            const cleanUrl = storedImageUrl.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
            goalImageEl.src = cleanUrl.startsWith('img/') ? "../" + cleanUrl : cleanUrl;
        }

        // VALIDACIÓN: Meta ya completada
        if (metaActual >= metaTotal && metaTotal > 0) {
            if (btnAportar) {
                btnAportar.disabled = true;
                btnAportar.innerHTML = '<i class="fas fa-check-circle"></i> META COMPLETADA';
                btnAportar.style.background = "#444";
            }
            if (inputAporte) {
                inputAporte.disabled = true;
                inputAporte.placeholder = "Meta ya completada";
            }
        }
    }

    // 5. Botón APORTAR: Guardar Dinero y Día
    if (btnAportar) {
        btnAportar.addEventListener('click', () => {
            if (metaActual >= metaTotal) return; // Ya completada

            const amount = parseMonto(inputAporte ? inputAporte.value : 0);
            if (amount > 0) {
               const wasCompleted = metaActual >= metaTotal;
               
               // 5.1 Guardar Dinero
               metaActual += amount;
               localStorage.setItem(`progreso_meta_${metaTitulo}`, metaActual);
               updateFinancialUI(metaActual, metaTotal);

               // 5.2 Guardar Día en Historial
               const historyKey = `historial_meta_${metaTitulo}`;
               const savedHistory = JSON.parse(localStorage.getItem(historyKey)) || [];
               const dateID = `${selectedDayInfo.day}-${selectedDayInfo.month}-${selectedDayInfo.year}`;
               
               if(!savedHistory.includes(dateID)) {
                   savedHistory.push(dateID);
                   localStorage.setItem(historyKey, JSON.stringify(savedHistory));
               }
               
               // 5.2.1 Guardar Historial Detallado para Modal
               const historyDetailedKey = `historial_detallado_meta_${metaTitulo}`;
               const savedDetailed = JSON.parse(localStorage.getItem(historyDetailedKey)) || [];
               savedDetailed.push({
                   id: Date.now().toString(),
                   date: `${String(selectedDayInfo.day).padStart(2, '0')}/${String(selectedDayInfo.month + 1).padStart(2, '0')}/${selectedDayInfo.year}`,
                   amount: amount,
                   tipo: ultimoTipoAporte,
                   descripcion: ultimoTipoAporte === 'rápido' ? 'Desde botón rápido' : 'Aporte para mi meta'
               });
               localStorage.setItem(historyDetailedKey, JSON.stringify(savedDetailed));

               // 5.3 Refrescar Calendario para mostrar chulito
               renderCalendar(currentMonth, currentYear);
               
               // VERIFICAR COMPLETITUD PARA MOSTRAR MODAL CELEBRACIÓN
               if (!wasCompleted && metaActual >= metaTotal) {
                   const modalCompletada = document.getElementById('modalMetaCompletada');
                   if (modalCompletada) {
                       modalCompletada.classList.add('activo');
                       // Quitamos la marca inmediata de finalizada aquí
                   }
               } else {
                   mostrarAlerta(`¡Aporte de $${formatMonto(amount)} realizado exitosamente!`);
               }
            } else {
               mostrarAlerta(`Ingresa un monto válido mayor a 0.`);
            }
        });
    }

    // Lógica de botones del modal de meta completada
    const btnVerMeta = document.getElementById('btnVerMeta');
    const btnCerrarMetaCompletada = document.getElementById('btnCerrarMetaCompletada');
    const modalMetaCompletada = document.getElementById('modalMetaCompletada');

    if (btnVerMeta) {
        btnVerMeta.addEventListener('click', () => {
            if (modalMetaCompletada) modalMetaCompletada.classList.remove('activo');
        });
    }

    if (btnCerrarMetaCompletada) {
        btnCerrarMetaCompletada.addEventListener('click', () => {
            // Marcar como finalizada permanentemente al cerrar el modal
            if (metaActual >= metaTotal) {
                localStorage.setItem(`finalizada_meta_${metaTitulo}`, "true");
            }
            window.location.href = '../ahorros.html';
        });
    }

    // Si el usuario intenta cerrar el modal con clic fuera, igual redirigir al salir
    if (modalMetaCompletada) {
        modalMetaCompletada.addEventListener('click', (e) => {
            if (e.target === modalMetaCompletada) {
                // Si el usuario hace clic fuera, lo tomamos como "Cerrar"
                // Pero según el requerimiento, si solo "ve la meta" y luego sale, debe redirigir.
                // Ajustaremos el botón "Regresar" para que redirija si está completada.
            }
        });
    }

    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => { 
            // Si la meta está completada y el usuario sale, marcar como finalizada
            if (metaActual >= metaTotal) {
                localStorage.setItem(`finalizada_meta_${metaTitulo}`, "true");
            }
            window.location.href = '../ahorros.html'; 
        });
    }

    // 6. Historial de Aportes y Exportación
    const historyLink = document.querySelector('.history-link');
    const modalHistorial = document.getElementById('modalHistorial');
    const btnCerrarHistorial = document.getElementById('btnCerrarHistorial');
    const btnCerrarHistorialSup = document.getElementById('btnCerrarHistorialSup');
    const tablaHistorialBody = document.getElementById('tablaHistorialBody');
    const mensajeSinHistorial = document.getElementById('mensajeSinHistorial');
    const btnExportarExcelAporte = document.getElementById('btnExportarExcelAporte');
    const btnExportarPDFAporte = document.getElementById('btnExportarPDFAporte');

    let doughnutChart = null;
    let barChart = null;

    // Variables de paginación
    let currentPage = 1;
    const itemsPerPage = 8;
    let filteredData = [];

    function renderTablePage() {
        tablaHistorialBody.innerHTML = '';
        const paginationControls = document.getElementById('paginationControls');
        const txtMostrandoAportes = document.getElementById('txtMostrandoAportes');

        if (filteredData.length === 0) {
            mensajeSinHistorial.style.display = 'block';
            document.querySelector('.tabla-premium').style.display = 'none';
            if(paginationControls) paginationControls.style.display = 'none';
            // if(txtMostrandoAportes) txtMostrandoAportes.textContent = `Mostrando 0 aportes`;
            return;
        }

        mensajeSinHistorial.style.display = 'none';
        document.querySelector('.tabla-premium').style.display = 'table';
        
        const totalPages = Math.ceil(filteredData.length / itemsPerPage);
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        
        // Revertir para mostrar más recientes primero
        const reversed = [...filteredData].reverse();
        const pageData = reversed.slice(startIndex, endIndex);

        pageData.forEach(record => {
            const tr = document.createElement('tr');
            const parts = record.date.split('/');
            const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            const monthName = monthNames[parseInt(parts[1]) - 1];

            const iconTipo = record.tipo === 'rápido' ? 'fa-bolt' : 'fa-pencil-alt';
            const classTipo = record.tipo === 'rápido' ? 'rapido' : 'manual';
            
            const desc = record.descripcion || (record.tipo === 'rápido' ? 'Aporte rápido' : 'Aporte manual');

            tr.innerHTML = `
                <td>
                    <span class="td-fecha-full">${record.date}</span>
                </td>
                <td>
                    <span class="tipo-aporte-badge ${classTipo}">
                        <i class="fas ${iconTipo}"></i> Aporte ${record.tipo || 'manual'}
                    </span>
                </td>
                <td style="color: var(--text-muted);">${desc}</td>
                <td class="monto-green">$${parseFloat(record.amount).toLocaleString('es-CO', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</td>
            `;
            tablaHistorialBody.appendChild(tr);
        });

        // if(txtMostrandoAportes) txtMostrandoAportes.textContent = `Mostrando ${filteredData.length} aportes`;
        
        const btnPrev = document.getElementById('btnPrevPage');
        const btnNext = document.getElementById('btnNextPage');
        const pageNumbersContainer = document.getElementById('pageNumbers');

        if (paginationControls && totalPages > 1) {
            paginationControls.style.display = 'flex';
            if(btnPrev) btnPrev.disabled = currentPage === 1;
            if(btnNext) btnNext.disabled = currentPage === totalPages;

            if (pageNumbersContainer) {
                pageNumbersContainer.innerHTML = '';
                for (let i = 1; i <= totalPages; i++) {
                    const btn = document.createElement('button');
                    btn.className = `btn-page ${i === currentPage ? 'active' : ''}`;
                    btn.textContent = i;
                    btn.addEventListener('click', () => {
                        currentPage = i;
                        renderTablePage();
                    });
                    pageNumbersContainer.appendChild(btn);
                }
            }
        } else if (paginationControls) {
            paginationControls.style.display = 'none';
        }
    }

    function cargarHistorial() {
        const historyDetailedKey = `historial_detallado_meta_${metaTitulo}`;
        let savedDetailed = JSON.parse(localStorage.getItem(historyDetailedKey)) || [];
        
        // Cargar Meta Info
        document.getElementById('historialMetaTitulo').textContent = metaTitulo;
        document.getElementById('historialMetaObjetivo').textContent = `$${metaTotal.toLocaleString("es-CO", {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
        document.getElementById('historialMetaAhorrado').textContent = `$${metaActual.toLocaleString("es-CO", {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
        
        const porcentaje = metaTotal > 0 ? Math.min(Math.round((metaActual / metaTotal) * 100), 100) : 0;
        const porcentajeTextEl = document.getElementById('historialMetaPorcentajeText');
        if (porcentajeTextEl) porcentajeTextEl.textContent = `${porcentaje}%`;
        
        const textCentral = document.getElementById('historialProgresoTexto');
        if (textCentral) textCentral.textContent = `${porcentaje}%`;

        // Gráfico Circular de Progreso
        const ctxCircle = document.getElementById('historialProgresoChart');
        if (ctxCircle) {
            if (doughnutChart) doughnutChart.destroy();
            doughnutChart = new Chart(ctxCircle, {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [porcentaje, 100 - porcentaje],
                        backgroundColor: ['#cfb53c', 'rgba(255,255,255,0.05)'],
                        borderWidth: 0,
                        cutout: '80%'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { tooltip: { enabled: false }, legend: { display: false } },
                    animation: { animateScale: true }
                }
            });
        }

        // Filtros
        const fFecha = document.getElementById('filtroFecha').value;
        const fTipo = document.getElementById('filtroTipo').value;

        // Filtrar Datos
        filteredData = savedDetailed.filter(r => {
            if (fTipo !== 'all' && r.tipo !== fTipo) return false;
            if (fFecha === 'month') {
                const parts = r.date.split('/');
                const rMonth = parts[1];
                const rYear = parts[2];
                const today = new Date();
                if (rMonth != (today.getMonth() + 1).toString().padStart(2, '0') || rYear != today.getFullYear()) return false;
            } else if (fFecha === 'year') {
                const parts = r.date.split('/');
                const rYear = parts[2];
                if (rYear != new Date().getFullYear()) return false;
            }
            return true;
        });

        // Calcular Resumen
        const count = filteredData.length;
        const total = filteredData.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
        const prom = count > 0 ? total / count : 0;
        const first = count > 0 ? filteredData[0].date : '-';
        const last = count > 0 ? filteredData[count - 1].date : '-';

        document.getElementById('resTotalAportes').textContent = count;
        document.getElementById('resMontoTotal').textContent = `$${total.toLocaleString("es-CO", {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
        document.getElementById('resPromedio').textContent = `$${prom.toLocaleString("es-CO", {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
        document.getElementById('resPrimerAporte').textContent = first;
        document.getElementById('resUltimoAporte').textContent = last;
        // document.getElementById('txtResumenEvolucion').textContent = `Has ahorrado un total de $${total.toLocaleString("es-CO", {minimumFractionDigits: 0, maximumFractionDigits: 0})} en los aportes seleccionados`;

        // Render Tabla
        currentPage = 1;
        renderTablePage();

        // Gráfico Evolución (Barras)
        const ctxBar = document.getElementById('historialEvolucionChart');
        if (ctxBar) {
            // Agrupar por fecha
            const grupos = {};
            filteredData.forEach(r => {
                grupos[r.date] = (grupos[r.date] || 0) + parseFloat(r.amount);
            });
            const labels = Object.keys(grupos);
            const dataVals = Object.values(grupos);

            if (barChart) barChart.destroy();
            
            const gradient = ctxBar.getContext('2d').createLinearGradient(0, 0, 0, 200);
            gradient.addColorStop(0, 'rgba(207, 181, 60, 0.4)');
            gradient.addColorStop(1, 'rgba(207, 181, 60, 0.0)');

            barChart = new Chart(ctxBar, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Monto ($)',
                        data: dataVals,
                        borderColor: '#cfb53c',
                        borderWidth: 4,
                        backgroundColor: gradient,
                        fill: true,
                        pointBackgroundColor: '#001524',
                        pointBorderColor: '#cfb53c',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { 
                            beginAtZero: false, 
                            grid: { color: 'rgba(255,255,255,0.05)' }, 
                            ticks: { 
                                color: '#999',
                                callback: function(value) {
                                    if (value >= 1000) return (value / 1000).toFixed(1) + 'k';
                                    return value;
                                }
                            } 
                        },
                        x: { 
                            grid: { display: true, color: 'rgba(255,255,255,0.05)' }, 
                            ticks: { color: '#999', maxTicksLimit: 10, font: { size: 10 } } 
                        }
                    }
                }
            });
        }
    }

    if (historyLink && modalHistorial) {
        historyLink.addEventListener('click', (e) => {
            e.preventDefault();
            const storedImageUrl = localStorage.getItem("metaSeleccionadaImagen");
            if (storedImageUrl && storedImageUrl !== "none") {
                const cleanUrl = storedImageUrl.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
                const imgEl = document.getElementById('historialMetaImg');
                if(imgEl) imgEl.src = cleanUrl.startsWith('img/') ? "../" + cleanUrl : cleanUrl;
            }
            cargarHistorial();
            modalHistorial.classList.add('activo');
            document.body.style.overflow = 'hidden';
        });
    }

    // Listeners de filtros
    const filtroFecha = document.getElementById('filtroFecha');
    const filtroTipo = document.getElementById('filtroTipo');
    const btnLimpiar = document.getElementById('btnLimpiarFiltros');

    if(filtroFecha) filtroFecha.addEventListener('change', cargarHistorial);
    if(filtroTipo) filtroTipo.addEventListener('change', cargarHistorial);
    if(btnLimpiar) btnLimpiar.addEventListener('click', () => {
        filtroFecha.value = 'all';
        filtroTipo.value = 'all';
        cargarHistorial();
    });

    const btnPrevPage = document.getElementById('btnPrevPage');
    const btnNextPage = document.getElementById('btnNextPage');
    if(btnPrevPage) {
        btnPrevPage.addEventListener('click', () => {
            if(currentPage > 1) {
                currentPage--;
                renderTablePage();
            }
        });
    }
    if(btnNextPage) {
        btnNextPage.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredData.length / itemsPerPage);
            if(currentPage < totalPages) {
                currentPage++;
                renderTablePage();
            }
        });
    }

    const cerrarHistorial = () => { 
        if(modalHistorial) {
            modalHistorial.classList.remove('activo'); 
            document.body.style.overflow = '';
        }
    };
    if (btnCerrarHistorial) btnCerrarHistorial.addEventListener('click', cerrarHistorial);
    if (btnCerrarHistorialSup) btnCerrarHistorialSup.addEventListener('click', cerrarHistorial);

    if (modalHistorial) {
        modalHistorial.addEventListener('click', (e) => {
            if (e.target === modalHistorial) cerrarHistorial();
        });
    }

    if (btnExportarExcelAporte) {
        btnExportarExcelAporte.addEventListener('click', () => {
            const historyDetailedKey = `historial_detallado_meta_${metaTitulo}`;
            const savedDetailed = JSON.parse(localStorage.getItem(historyDetailedKey)) || [];
            if (savedDetailed.length === 0) {
                mostrarAlerta('No hay historial para exportar.');
                return;
            }
            
            const titulo = `Historial_Aportes_${metaTitulo.replace(/\s+/g, '_')}`;
            let csv = "Fecha,Monto Aportado\n";
            savedDetailed.forEach(r => {
                csv += `${r.date},${r.amount}\n`;
            });

            const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `${titulo}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    if (btnExportarPDFAporte) {
        btnExportarPDFAporte.addEventListener('click', () => {
            // Redirección al sistema de reportes premium de Django
            window.location.href = '/reportes/ahorros/pdf/';
        });
    }
});
