'use strict';

const examples = {
  progetti: '“Riassumi gli obiettivi, le scelte progettuali e i dati dimensionali del Nuovo Polo Ospedaliero.”',
  tecnica: '“Estrai i requisiti dimensionali delle aree di degenza e riportali in tabella con fonte e pagina.”',
  confronti: '“Confronta i materiali di facciata adottati nei progetti e indica vantaggi, criticità e ricorrenze.”',
  operativo: '“Prepara una checklist delle verifiche da completare prima della prossima riunione di progetto.”'
};

const revealObserver = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    }), { threshold: 0.12 })
  : null;

document.querySelectorAll('.reveal').forEach((element) => {
  if (revealObserver) revealObserver.observe(element);
  else element.classList.add('visible');
});

document.querySelectorAll('[data-prompt-group]').forEach((button, index) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-prompt-group]').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    const quote = document.querySelector('.prompt-carousel blockquote');
    const counter = document.querySelector('.prompt-index');
    if (!quote || !counter) return;
    quote.style.opacity = '0';
    quote.style.transform = 'translateY(8px)';
    window.setTimeout(() => {
      quote.textContent = examples[button.dataset.promptGroup];
      counter.textContent = `0${index + 1} / 04`;
      quote.style.opacity = '1';
      quote.style.transform = 'none';
    }, 180);
  });
});

const guideStage = document.querySelector('.guide-stage');
document.querySelectorAll('[data-guide-step]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!guideStage) return;
    const selectedTime = Number(button.dataset.guideStep) * -4;
    guideStage.classList.add('is-guide-resetting');
    guideStage.style.setProperty('--guide-cycle-delay', `${selectedTime}s`);
    void guideStage.offsetWidth;
    guideStage.classList.remove('is-guide-resetting');
  });
});

const copyButton = document.querySelector('.copy-example');
if (copyButton) {
  copyButton.addEventListener('click', async () => {
    const value = document.querySelector('.formula p')?.textContent.trim();
    if (!value) return;
    await navigator.clipboard.writeText(value);
    copyButton.textContent = 'Copiato';
    window.setTimeout(() => { copyButton.textContent = 'Copia'; }, 1600);
  });
}

const card = document.querySelector('.tilt-card');
if (card && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  card.closest('.hero-visual').addEventListener('pointermove', (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `rotateY(${x * 8 - 5}deg) rotateX(${2 - y * 6}deg)`;
  });
  card.closest('.hero-visual').addEventListener('pointerleave', () => {
    card.style.transform = 'rotateY(-5deg) rotateX(2deg)';
  });
}

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('[data-archive-card]').forEach((archiveCard) => {
    archiveCard.addEventListener('pointermove', (event) => {
      const rect = archiveCard.getBoundingClientRect();
      archiveCard.style.setProperty('--pointer-x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
      archiveCard.style.setProperty('--pointer-y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
    });
  });
}

const passwordToggle = document.querySelector('.toggle-password');
if (passwordToggle) {
  const input = document.querySelector('#password');
  passwordToggle.addEventListener('click', () => {
    const reveal = input.type === 'password';
    input.type = reveal ? 'text' : 'password';
    passwordToggle.textContent = reveal ? 'Nascondi' : 'Mostra';
  });
  if (new URLSearchParams(window.location.search).get('error') === '1') {
    document.querySelector('.login-error').hidden = false;
  }
}
