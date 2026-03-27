interface CarouselConfig {
  trackId: string;
  dotsSelector: string;
  gallerySelector: string;
  prevBtnId: string;
  nextBtnId: string;
  carouselId: string;
  autoplayInterval?: number;
}

export function initCarousel(config: CarouselConfig) {
  const {
    trackId,
    dotsSelector,
    gallerySelector,
    prevBtnId,
    nextBtnId,
    carouselId,
    autoplayInterval = 5000,
  } = config;

  const track = document.getElementById(trackId) as HTMLElement;
  const dots = document.querySelectorAll(dotsSelector);
  const galleryItems = document.querySelectorAll(gallerySelector);
  const prevBtn = document.getElementById(prevBtnId) as HTMLButtonElement;
  const nextBtn = document.getElementById(nextBtnId) as HTMLButtonElement;
  const total = galleryItems.length;
  let current = 0;
  let startX = 0;
  let isDragging = false;

  function goTo(index: number) {
    current = Math.max(0, Math.min(index, total - 1));
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
    galleryItems.forEach((item, i) => item.classList.toggle('active', i === current));
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;
  }

  // Gallery clicks
  galleryItems.forEach((item) => {
    item.addEventListener('click', () => goTo(Number((item as HTMLElement).dataset.index)));
  });

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));
  dots.forEach((dot) => {
    dot.addEventListener('click', () => goTo(Number((dot as HTMLElement).dataset.index)));
  });

  // Keyboard
  document.getElementById(carouselId)!.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  // Touch / pointer swipe
  track.addEventListener('pointerdown', (e) => {
    if ((e.target as HTMLElement).closest('a')) return;
    startX = e.clientX;
    isDragging = true;
    track.style.transition = 'none';
    track.setPointerCapture(e.pointerId);
  });

  track.addEventListener('pointerup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    track.style.transition = '';
    const diff = e.clientX - startX;
    if (Math.abs(diff) > 60) {
      goTo(current + (diff < 0 ? 1 : -1));
    } else {
      goTo(current);
    }
  });

  track.addEventListener('pointercancel', () => {
    isDragging = false;
    track.style.transition = '';
    goTo(current);
  });

  // Auto-advance (disabled for prefers-reduced-motion)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let autoplay: ReturnType<typeof setInterval> | null = null;
  let userPaused = false;

  function startAutoplay() {
    if (prefersReducedMotion || userPaused) return;
    stopAutoplay();
    autoplay = setInterval(() => {
      if (current < total - 1) goTo(current + 1);
      else stopAutoplay();
    }, autoplayInterval);
  }

  function stopAutoplay() {
    if (autoplay) { clearInterval(autoplay); autoplay = null; }
  }

  const carousel = document.getElementById(carouselId)!;
  const layout = carousel.closest('.carousel-layout')!;
  layout.addEventListener('pointerenter', stopAutoplay);
  layout.addEventListener('pointerleave', () => { if (!userPaused) startAutoplay(); });
  layout.addEventListener('focusin', stopAutoplay);
  layout.addEventListener('focusout', () => { if (!userPaused) startAutoplay(); });

  // Pause autoplay when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoplay();
    else if (!userPaused) startAutoplay();
  });

  if (prefersReducedMotion) userPaused = true;
  startAutoplay();
  goTo(0);
}
