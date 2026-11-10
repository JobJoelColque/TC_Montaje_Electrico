lucide.createIcons();
    const slides = [...document.querySelectorAll('.hero-slide')];
    const dots = [...document.querySelectorAll('[data-slide]')];
    const hero = document.querySelector('.hero');
    let current = 0;
    let timer;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const active = i === current;
        slide.classList.toggle('active', active);
        slide.setAttribute('aria-hidden', String(!active));
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
        if (i === current) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
    }
    function stopCarousel() { clearInterval(timer); }
    function startCarousel() {
      stopCarousel();
      if (!reduceMotion.matches && slides.length > 1) {
        timer = setInterval(() => showSlide((current + 1) % slides.length), 6000);
      }
    }
    document.getElementById('prev-slide').addEventListener('click', () => { showSlide(current - 1); startCarousel(); });
    document.getElementById('next-slide').addEventListener('click', () => { showSlide(current + 1); startCarousel(); });
    dots.forEach(dot => dot.addEventListener('click', () => { showSlide(Number(dot.dataset.slide)); startCarousel(); }));
    hero.addEventListener('mouseenter', stopCarousel);
    hero.addEventListener('mouseleave', startCarousel);
    hero.addEventListener('focusin', stopCarousel);
    hero.addEventListener('focusout', event => { if (!hero.contains(event.relatedTarget)) startCarousel(); });
    hero.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        showSlide(current + (event.key === 'ArrowRight' ? 1 : -1));
        startCarousel();
      }
    });
    reduceMotion.addEventListener('change', startCarousel);
    startCarousel();

    const menuButton = document.getElementById('menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    function closeMenu() { mobileNav.classList.remove('open'); menuButton.setAttribute('aria-expanded','false'); menuButton.setAttribute('aria-label','Abrir menú'); }
    menuButton.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });
    mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
    const submit = document.getElementById('send-button');
    let sdkReady = false;
    function setStatus(message, error = false) {
      status.textContent = message;
      status.style.color = error ? '#ffb1a8' : '#9bd8ff';
    }
    function validate(input) {
      const value = input.value.trim();
      const valid = value.length > 0 && (input.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
      input.classList.toggle('invalid', !valid);
      input.setAttribute('aria-invalid', String(!valid));
      document.getElementById(input.id + '-error').classList.toggle('hidden', valid);
      return valid;
    }
    const fields = [...form.querySelectorAll('input, textarea')];
    fields.forEach(field => field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') validate(field);
    }));
    async function initialize() {
      try {
        const result = await window.dataSdk.init({ onDataChanged() {} });
        sdkReady = result.isOk;
        if (!result.isOk) setStatus('No se pudo conectar el formulario. Intentá enviarlo nuevamente en unos momentos.', true);
        return sdkReady;
      } catch (_) {
        sdkReady = false;
        setStatus('No se pudo conectar el formulario. Intentá enviarlo nuevamente en unos momentos.', true);
        return false;
      }
    }
    initialize();
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const valid = fields.map(validate).every(Boolean);
      if (!valid) { setStatus('Revisá los campos señalados.', true); fields.find(field => field.getAttribute('aria-invalid') === 'true')?.focus(); return; }
      submit.disabled = true;
      submit.setAttribute('aria-busy', 'true');
      setStatus('Enviando consulta…');
      try {
        if (!sdkReady && !(await initialize())) return;
        const record = {
          nombre: form.nombre.value.trim(),
          email: form.email.value.trim(),
          telefono: form.telefono.value.trim(),
          mensaje: form.mensaje.value.trim(),
          fecha_envio: new Date().toISOString()
        };
        const result = await window.dataSdk.create(record);
        if (!result.isOk) {
          setStatus('No pudimos confirmar el envío. Comprobá si llegó antes de intentarlo nuevamente.', true);
          return;
        }
        form.reset();
        fields.forEach(field => { field.classList.remove('invalid'); field.removeAttribute('aria-invalid'); document.getElementById(field.id + '-error').classList.add('hidden'); });
        setStatus('Consulta enviada. Gracias por escribirnos.');
      } catch (_) {
        setStatus('No pudimos confirmar el envío. Comprobá si llegó antes de intentarlo nuevamente.', true);
      } finally {
        submit.disabled = false;
        submit.removeAttribute('aria-busy');
      }
    });