// ============================
// TEMA CLARO / OSCURO
// ============================

const themeToggle = document.querySelector(".theme-toggle-btn");
const body = document.body;

if (themeToggle) {
  const themeImg = themeToggle.querySelector("img");

  function updateThemeIcon(isDark) {
    if (!themeImg) return;
    themeImg.src = isDark ? "icons/light_theme.png" : "icons/dark_theme.png";
    themeImg.alt = isDark ? "Modo claro" : "Modo oscuro";
  }

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    body.classList.add("dark-mode");
    updateThemeIcon(true);
  } else {
    updateThemeIcon(false);
  }

  themeToggle.addEventListener("click", () => {
    const isDark = body.classList.toggle("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    updateThemeIcon(isDark);

    if (
      typeof createCharts === "function" &&
      document.getElementById("categoryFilter")
    ) {
      createCharts(document.getElementById("categoryFilter").value);
    }
  });
}

// ============================
// CAMBIAR VISTA DE WIDGETS
// ============================

const viewBtn = document.querySelector(".view-btn");
if (viewBtn) {
  const dropdown = document.querySelector(".view-dropdown");
  const wrapper = document.querySelector(".view-wrapper");
  const viewOptions = dropdown.querySelectorAll("ul li");

  const viewNames = {
    expanded: "Vista Expandida",
    grid: "Vista en Rejilla",
    list: "Vista en Lista",
    compact: "Vista Compacta",
  };

  function limpiarWidgetsExpandido() {
    // Quita clase 'show' de descripciones extendidas
    document
      .querySelectorAll(".widget-description-extended.show")
      .forEach((el) => el.classList.remove("show"));

    document
      .querySelectorAll(".widget-card.expanded")
      .forEach((el) => el.classList.remove("expanded"));

    document.querySelectorAll(".widget-action-btn").forEach((btn) => {
      btn.textContent = "Ver más";
    });
  }

  function setActiveView(view) {
    body.classList.remove(
      "view-grid",
      "view-list",
      "view-expanded",
      "view-compact"
    );
    body.classList.add(`view-${view}`);
    viewBtn.textContent = viewNames[view] || "Vista";
    localStorage.setItem("activeView", view);

    viewOptions.forEach((opt) => {
      opt.classList.toggle("selected", opt.getAttribute("data-view") === view);
    });

    // Limpiamos widgets desplegados para evitar conflictos visuales
    limpiarWidgetsExpandido();
  }

  const savedView = localStorage.getItem("activeView") || "grid";
  setActiveView(savedView);

  viewBtn.addEventListener("click", () => {
    dropdown.classList.toggle("show");
  });

  window.addEventListener("click", (e) => {
    if (!wrapper.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });

  viewOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const selectedView = option.getAttribute("data-view");
      if (selectedView) {
        setActiveView(selectedView);
        dropdown.classList.remove("show");
      }
    });
  });
}

// ============================
// MODAL NUEVO WIDGET
// ============================

const modalOverlay = document.getElementById("widgetModal");
const openModalBtn = document.getElementById("openModal");
const closeModalBtn = document.getElementById("closeModal");

document.querySelectorAll(".add-new-widget").forEach((el) => {
  el.addEventListener("click", () => {
    if (modalOverlay) modalOverlay.style.display = "flex";
  });
});

if (openModalBtn) {
  openModalBtn.addEventListener("click", () => {
    if (modalOverlay) modalOverlay.style.display = "flex";
  });
}

if (closeModalBtn) {
  closeModalBtn.addEventListener("click", () => {
    if (modalOverlay) modalOverlay.style.display = "none";
  });
}

// ============================
// DATOS DINÁMICOS Y MÉTRICAS
// ============================

const dynamicData = {
  ventas: [120, 190, 300, 500, 200, 300],
  recaudado: [100, 200, 150, 300, 280, 350],
  usuarios: [14, 37, 28, 53, 49, 74],
  conversiones: [31, 58, 50, 86, 81, 126],
  labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
};

function pushNewData() {
  const newValues = {
    ventas: Math.floor(Math.random() * 200) + 100,
    recaudado: Math.floor(Math.random() * 400) + 100,
    usuarios: Math.floor(Math.random() * 100) + 10,
    conversiones: Math.floor(Math.random() * 150) + 30,
  };

  for (let key in newValues) {
    dynamicData[key].push(newValues[key]);
    if (dynamicData[key].length > 6) dynamicData[key].shift();
  }

  const now = new Date();
  const label = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  dynamicData.labels.push(label);
  if (dynamicData.labels.length > 6) dynamicData.labels.shift();

  updateMetricCounters(newValues);
  if (document.getElementById("categoryFilter")) {
    createCharts(document.getElementById("categoryFilter").value);
  }
}

function updateMetricCounters(values) {
  if (document.getElementById("recaudadoValue"))
    document.getElementById(
      "recaudadoValue"
    ).textContent = `$${values.recaudado.toLocaleString()}`;
  if (document.getElementById("usuariosValue"))
    document.getElementById("usuariosValue").textContent = `${values.usuarios}`;
  if (document.getElementById("ventasValue"))
    document.getElementById("ventasValue").textContent = `${values.ventas}`;
  if (document.getElementById("conversionesValue"))
    document.getElementById(
      "conversionesValue"
    ).textContent = `${values.conversiones}`;
}

// ============================
// CHARTS DINÁMICOS
// ============================

const barCtx = document.getElementById("barChart")?.getContext("2d");
const lineCtx = document.getElementById("lineChart")?.getContext("2d");

let barChart, lineChart;

const categoryColors = {
  ventas: "rgba(0, 168, 232, 0.6)",
  recaudado: "rgba(0, 232, 168, 0.6)",
  usuarios: "rgba(232, 168, 0, 0.6)",
  conversiones: "rgba(232, 0, 168, 0.6)",
};

const borderColors = {
  ventas: "rgba(0, 168, 232, 1)",
  recaudado: "rgba(0, 232, 168, 1)",
  usuarios: "rgba(232, 168, 0, 1)",
  conversiones: "rgba(232, 0, 168, 1)",
};

function getCustomPlugin(titles, textColor, colors) {
  return {
    id: "customLabels",
    afterDraw(chart) {
      const ctx = chart.ctx;
      ctx.save();
      ctx.font = "bold 18px sans-serif";
      ctx.textBaseline = "top";

      const padding = 15;
      const spacingX = 200;
      const spacingY = 25;

      titles.forEach((title, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const x = padding + col * spacingX;
        const y = padding + row * spacingY;

        ctx.fillStyle = textColor;
        ctx.fillText(title, x, y);

        ctx.beginPath();
        ctx.arc(x - 10, y + 8, 5, 0, Math.PI * 2);
        ctx.fillStyle = colors[index];
        ctx.fill();
        ctx.closePath();
      });

      ctx.restore();
    },
  };
}

function createCharts(category = "ventas") {
  if (!barCtx || !lineCtx) return;

  if (barChart) barChart.destroy();
  if (lineChart) lineChart.destroy();

  const isDark = body.classList.contains("dark-mode");
  const textColor = isDark ? "#f4f6f8" : "#2e2e2e";
  const isAll = category === "todas";

  const categories = isAll
    ? ["ventas", "recaudado", "usuarios", "conversiones"]
    : [category];

  const barDatasets = categories.map((cat) => ({
    label: `Datos de ${cat}`,
    data: dynamicData[cat],
    backgroundColor: categoryColors[cat],
  }));

  const lineDatasets = categories.map((cat) => ({
    label: `Tendencia de ${cat}`,
    data: dynamicData[cat],
    borderColor: borderColors[cat],
    tension: 0.3,
  }));

  const barTitles = categories.map((cat) => `Datos de ${cat}`);
  const lineTitles = categories.map((cat) => `Tend. de ${cat}`);
  const barColors = categories.map((cat) => categoryColors[cat]);
  const lineColors = categories.map((cat) => borderColors[cat]);

  const customBarLabels = getCustomPlugin(barTitles, textColor, barColors);
  const customLineLabels = getCustomPlugin(lineTitles, textColor, lineColors);

  barChart = new Chart(barCtx, {
    type: "bar",
    data: {
      labels: dynamicData.labels,
      datasets: barDatasets,
    },
    options: {
      plugins: {
        legend: { display: false },
      },
      layout: {
        padding: {
          top: categories.length > 1 ? 75 : 55,
          left: 10,
        },
      },
    },
    plugins: [customBarLabels],
  });

  lineChart = new Chart(lineCtx, {
    type: "line",
    data: {
      labels: dynamicData.labels,
      datasets: lineDatasets,
    },
    options: {
      plugins: {
        legend: { display: false },
      },
      layout: {
        padding: {
          top: categories.length > 1 ? 75 : 55,
          left: 10,
        },
      },
    },
    plugins: [customLineLabels],
  });
}

if (barCtx && lineCtx) {
  const filterElement = document.getElementById("categoryFilter");
  if (filterElement) {
    filterElement.addEventListener("change", (e) => {
      createCharts(e.target.value);
    });
    createCharts(filterElement.value);
  }
}

// ============================
// NOTIFICACIONES PAGINADAS
// ============================

document.addEventListener("DOMContentLoaded", () => {
  const notifications = [
    {
      title: "Nueva actualización disponible",
      text: "Se ha lanzado una nueva versión del sistema.",
      time: "Hace 2 horas",
      unread: true,
    },
    {
      title: "Tarea completada",
      text: "El widget de estadísticas ha finalizado su carga correctamente.",
      time: "Ayer",
    },
    {
      title: "Advertencia del sistema",
      text: "Algunos widgets no se cargaron correctamente.",
      time: "Hace 3 días",
    },
    {
      title: "Recordatorio de evento",
      text: "Tenés una reunión mañana a las 10:00 AM.",
      time: "Hace 4 días",
    },
    {
      title: "Nueva suscripción",
      text: "Un usuario se suscribió al plan premium.",
      time: "Hace 5 días",
    },
    {
      title: "Comentario recibido",
      text: "Hay un nuevo comentario en tu publicación.",
      time: "Hace 6 días",
    },
    {
      title: "Backup completado",
      text: "La copia de seguridad finalizó sin errores.",
      time: "Hace 1 semana",
    },
    {
      title: "Sesión iniciada",
      text: "Un nuevo inicio de sesión desde otro dispositivo.",
      time: "Hace 1 semana",
    },
    {
      title: "Actualización de seguridad",
      text: "Se aplicaron parches críticos al sistema.",
      time: "Hace 8 días",
    },
    {
      title: "Tarea pendiente",
      text: "Tenés tareas asignadas sin completar.",
      time: "Hace 9 días",
    },
    {
      title: "Nuevo mensaje",
      text: "Recibiste un nuevo mensaje interno.",
      time: "Hace 10 días",
    },
    {
      title: "Actualización de perfil",
      text: "Tu perfil fue modificado correctamente.",
      time: "Hace 11 días",
    },
    {
      title: "Solicitud de soporte",
      text: "Un usuario solicitó asistencia técnica.",
      time: "Hace 12 días",
    },
    {
      title: "Desconexión inesperada",
      text: "Hubo una caída temporal del servicio.",
      time: "Hace 13 días",
    },
    {
      title: "Reporte generado",
      text: "El informe mensual ya está disponible.",
      time: "Hace 14 días",
    },
    {
      title: "Evento importante",
      text: "Tenés un evento destacado en tu agenda.",
      time: "Hace 15 días",
    },
  ];

  const itemsPerPage = 4;
  let currentPage = 1;

  function renderNotifications() {
    const container = document.getElementById("notificationsContainer");
    if (!container) return;
    container.innerHTML = "";

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const currentItems = notifications.slice(start, end);

    currentItems.forEach((n) => {
      const div = document.createElement("div");
      div.classList.add("notification");
      if (n.unread) div.classList.add("unread");
      div.innerHTML = `
        <div class="content">
          <h3>${n.title}</h3>
          <p>${n.text}</p>
          <span class="timestamp">${n.time}</span>
        </div>
      `;
      container.appendChild(div);
    });
  }

  function renderPagination() {
    const pagination = document.getElementById("paginationNumbers");
    if (!pagination) return;

    const totalPages = Math.ceil(notifications.length / itemsPerPage);
    pagination.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.classList.add("pagination-number");
      if (i === currentPage) btn.classList.add("active");
      btn.textContent = i;
      btn.addEventListener("click", () => {
        currentPage = i;
        renderNotifications();
        renderPagination();
      });
      pagination.appendChild(btn);
    }

    const prevBtn = document.getElementById("prevPage");
    const nextBtn = document.getElementById("nextPage");

    if (prevBtn && nextBtn) {
      prevBtn.disabled = currentPage === 1;
      nextBtn.disabled = currentPage === totalPages;
    }
  }

  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderNotifications();
        renderPagination();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const totalPages = Math.ceil(notifications.length / itemsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        renderNotifications();
        renderPagination();
      }
    });
  }

  renderNotifications();
  renderPagination();
});

// ============================
// ALERTAS (dropdown simple)
// ============================

const alertBtn = document.querySelector(".alert-btn");
if (alertBtn) {
  alertBtn.addEventListener("click", () => {
    document.querySelector(".alert-dropdown")?.classList.toggle("show");
  });

  window.addEventListener("click", (e) => {
    const alertWrapper = document.querySelector(".alert-wrapper");
    if (!alertWrapper.contains(e.target)) {
      document.querySelector(".alert-dropdown")?.classList.remove("show");
    }
  });
}

const verMasBtn = document.getElementById("verMasBtn");
const extraContent = document.getElementById("extraContent");

if (verMasBtn && extraContent) {
  // Inicialmente ocultamos el contenido extra
  extraContent.style.display = "none";

  verMasBtn.addEventListener("click", () => {
    const isHidden = extraContent.style.display === "none";

    if (isHidden) {
      extraContent.style.display = "block"; // Mostrar contenido extra
      verMasBtn.textContent = "Ver menos";
    } else {
      extraContent.style.display = "none"; // Ocultar contenido extra
      verMasBtn.textContent = "Ver más";
    }
  });
}

// Mostrar contenido en lista o abrir modal en otras vistas
document.querySelectorAll(".widget-action-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".widget-card");
    const extendedContent = card.querySelector(".widget-description-extended");

    if (!extendedContent) return;

    if (body.classList.contains("view-list")) {
      const isShown = extendedContent.classList.toggle("show");
      button.textContent = isShown ? "Ver menos" : "Ver más";
    } else {
      // Modal para vista expandida o rejilla
      const title = card.querySelector("h3")?.textContent || "";
      const description = extendedContent?.textContent || "";

      const modal = document.getElementById("widgetModalExpand");
      if (!modal) return;

      modal.querySelector("#modalWidgetTitle").textContent = title;
      modal.querySelector("#modalWidgetDescription").textContent = description;
      modal.classList.add("active");
    }
  });
});

// Cerrar modal
document.getElementById("closeWidgetModal").addEventListener("click", () => {
  document.getElementById("widgetModalExpand").classList.remove("active");
});

// Cerrar haciendo clic fuera del contenido del modal
document.getElementById("widgetModalExpand").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) {
    e.currentTarget.classList.remove("active");
  }
});
