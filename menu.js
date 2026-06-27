/**
 * menu.js — Navegación dinámica del Portal IO · UTN
 *
 * Inyecta el <nav class="site-nav"> en el #nav-container de la página actual
 * y marca automáticamente el enlace activo según window.location.pathname.
 */
(function () {
  'use strict';

  // ── CONFIGURACIÓN DE BLOQUEO POR EXAMEN ───────────────────────────────────
  // Cambiar a true para desactivar la página completa durante la prueba.
  // Al finalizar, volver a poner en false y subir los cambios a GitHub.
  const IS_LOCKED = true; 

  if (IS_LOCKED) {
    const blockPage = () => {
      document.title = "Acceso Restringido — Examen en Curso";
      document.body.style.overflow = "hidden";
      document.body.innerHTML = `
        <div style="
          position: fixed;
          top: 0; left: 0; width: 100vw; height: 100vh;
          background: radial-gradient(circle at center, #111827 0%, #030712 100%);
          color: #f3f4f6;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', -apple-system, sans-serif;
          z-index: 999999;
          padding: 2rem;
          text-align: center;
          box-sizing: border-box;
        ">
          <div style="
            background: rgba(17, 24, 39, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            padding: 3rem;
            max-width: 500px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            backdrop-filter: blur(20px);
            display: flex;
            flex-direction: column;
            align-items: center;
          ">
            <div style="
              width: 80px;
              height: 80px;
              border-radius: 50%;
              background: rgba(239, 68, 68, 0.1);
              border: 1px solid rgba(239, 68, 68, 0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 2rem;
              box-shadow: 0 0 30px rgba(239, 68, 68, 0.2);
            ">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            
            <h1 style="
              font-size: 1.8rem;
              font-weight: 800;
              margin-bottom: 1rem;
              background: linear-gradient(135deg, #f3f4f6 0%, #9ca3af 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              letter-spacing: -0.5px;
            ">Acceso Restringido</h1>
            
            <p style="
              font-size: 1rem;
              line-height: 1.6;
              color: #9ca3af;
              margin-bottom: 0;
            ">
              El simulador y las herramientas de resolución de Investigación Operativa se encuentran <strong>desactivados temporalmente</strong> por examen en curso. 
              <br><br>
              El portal volverá a estar disponible automáticamente una vez finalizado el examen.
            </p>
          </div>
          
          <div style="
            position: absolute;
            bottom: 2rem;
            font-size: 0.8rem;
            color: #4b5563;
          ">
            Investigación Operativa · UTN · Comisión Sábados
          </div>
        </div>
      `;
    };
    if (document.readyState === 'loading') {
      document.addEventListener("DOMContentLoaded", blockPage);
    } else {
      blockPage();
    }
    return;
  }


  // ── Detectar la página actual ──────────────────────────────────────────────
  // Funciona tanto en file:// como en http://
  const pathname = window.location.pathname;
  const currentPage = pathname.split('/').pop() || 'index.html';

  // ── Definición de todos los enlaces del portal ─────────────────────────────
  // unit: 'u1' | 'u2' | 'u4'
  const NAV_LINKS = [
    // Unidad 1 · Procesos Estocásticos / Markov
    { href: 'simulador_markov.html',           label: 'Simulador',         unit: 'u1' },
    { href: 'ejercicio_call_center.html',      label: 'Call Center',       unit: 'u1' },
    { href: 'resolvedor_markov.html',          label: 'Resolvedor',        unit: 'u1' },
    { href: 'resolvedor_nacimiento_muerte.html', label: 'Nac. y Muerte',    unit: 'u1' },
    // Unidad 2 · Teoría de Colas
    { href: 'simulador_mmk.html',              label: 'Simulador M/M/k',  unit: 'u2' },
    // Unidad 3 · Proyectos
    { href: 'simulador_pert_cpm.html',         label: 'PERT / CPM',       unit: 'u3' },
    // Unidad 4 · Simulación
    { href: 'simulador_montecarlo.html',       label: 'Filas de Espera', unit: 'u4' },
    { href: 'tutorial_excel_montecarlo.html',  label: 'Guía Excel',      unit: 'u4' },
  ];

  // ── Helpers ────────────────────────────────────────────────────────────────
  function buildLink(link) {
    const isActive = currentPage === link.href;
    // Clase base + clase de unidad (u2 / u4) si aplica + active si corresponde
    const unitClass = (link.unit !== 'u1') ? ` ${link.unit}` : '';
    const activeClass = isActive ? ' active' : '';
    return `<a href="${link.href}" class="nav-link${unitClass}${activeClass}">${link.label}</a>`;
  }

  // ── Construir el HTML completo del nav ─────────────────────────────────────
  const currentLink = NAV_LINKS.find(l => l.href === currentPage);
  const currentUnit = currentLink ? currentLink.unit : 'u1';

  const u1Links = NAV_LINKS.filter(l => l.unit === 'u1').map(buildLink).join('\n  ');
  const u2Links = NAV_LINKS.filter(l => l.unit === 'u2').map(buildLink).join('\n  ');
  const u3Links = NAV_LINKS.filter(l => l.unit === 'u3').map(buildLink).join('\n  ');
  const u4Links = NAV_LINKS.filter(l => l.unit === 'u4').map(buildLink).join('\n  ');

  const navHTML = `<nav class="site-nav">
  <a href="index.html" class="nav-logo">
    <div class="dot ${currentUnit}"></div>
    IO · UTN
  </a>
  <span class="nav-unit">U1 · Markov</span>
  ${u1Links}
  <div class="nav-sep"></div>
  <span class="nav-unit u2">U2 · Colas</span>
  ${u2Links}
  <div class="nav-sep"></div>
  <span class="nav-unit u3" style="color: var(--purple-accent, #a855f7);">U3 · Proyectos</span>
  ${u3Links}
  <div class="nav-sep"></div>
  <span class="nav-unit u4">U4 · Simulación</span>
  ${u4Links}
</nav>`;

  // ── Inyectar en #nav-container ─────────────────────────────────────────────
  // outerHTML reemplaza el <div> placeholder por el <nav> real
  const container = document.getElementById('nav-container');
  if (container) {
    container.outerHTML = navHTML;
  } else {
    console.warn('[menu.js] No se encontró #nav-container en el DOM.');
  }
})();
