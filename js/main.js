/**
 * Aupets Banho & Tosa - Main Script
 * Lucas do Rio Verde - MT
 */

document.addEventListener('DOMContentLoaded', function () {
  // ==========================================================================
  // 1. Mobile Drawer Navigation
  // ==========================================================================
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileDrawerClose = document.getElementById('mobileDrawerClose');
  const mobileDrawerBackdrop = document.getElementById('mobileDrawerBackdrop');

  function openDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('is-open');
    mobileMenuBtn?.classList.add('is-active');
    mobileMenuBtn?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('is-open');
    mobileMenuBtn?.classList.remove('is-active');
    mobileMenuBtn?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mobileDrawer.classList.contains('is-open');
      if (isOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    mobileDrawerClose?.addEventListener('click', closeDrawer);
    mobileDrawerBackdrop?.addEventListener('click', closeDrawer);

    // Fecha ao clicar em qualquer link do drawer
    mobileDrawer.querySelectorAll('.mobile-drawer__link').forEach(link => {
      link.addEventListener('click', () => {
        closeDrawer();
      });
    });

    // Fecha ao clicar nos botões de agendamento dentro do drawer
    mobileDrawer.querySelectorAll('[data-open-booking]').forEach(btn => {
      btn.addEventListener('click', () => {
        closeDrawer();
      });
    });

    // Fecha com a tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('is-open')) {
        closeDrawer();
      }
    });
  }

  // ==========================================================================
  // 2. FAQ Accordion
  // ==========================================================================
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');
        // Fecha outros itens para efeito sanfona limpo
        faqItems.forEach(other => other.classList.remove('is-open'));
        if (!isOpen) {
          item.classList.add('is-open');
        }
      });
    }
  });

  // Abre a primeira pergunta do FAQ por padrão para o usuário ver o funcionamento
  if (faqItems.length > 0) {
    faqItems[0].classList.add('is-open');
  }

  // ==========================================================================
  // 3. Smooth Scroll para links internos com compensação do Header
  // ==========================================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerHeight = document.querySelector('.header')?.offsetHeight || 76;
        const targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ==========================================================================
  // 4. Header Shadow & Active Section Spy
  // ==========================================================================
  const header = document.querySelector('.header');
  const desktopLinks = document.querySelectorAll('.header__link');
  const sections = Array.from(desktopLinks)
    .map(link => {
      const id = link.getAttribute('href');
      return id && id.startsWith('#') && id.length > 1 ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  window.addEventListener('scroll', () => {
    // Sombra do Header
    if (window.scrollY > 20) {
      header?.classList.add('header--scrolled');
    } else {
      header?.classList.remove('header--scrolled');
    }

    // Scrollspy simples e performático
    const headerHeight = header?.offsetHeight || 76;
    const scrollPos = window.scrollY + headerHeight + 50;

    let currentSectionId = '';
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollPos) {
        currentSectionId = '#' + sec.id;
      }
    });

    if (currentSectionId) {
      desktopLinks.forEach(link => {
        if (link.getAttribute('href') === currentSectionId) {
          link.classList.add('is-active');
        } else {
          link.classList.remove('is-active');
        }
      });
    }
  }, { passive: true });
});
