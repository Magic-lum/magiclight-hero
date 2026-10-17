// interactive-hero.js - parallax + timeline copy
(function () {
  const TIMINGS = [5000, 8000, 9000, 8000];
  const COPY_SETS = {
    A: [
      "Tu letrero actual da pena de noche.",
      "Corta la basura. Pásate a la luz.",
      "Cero residuos. Consumo mínimo. Flexibilidad total.",
      "Una forma más brillante de comunicar. Agenda tu demo."
    ],
    B: [
      "Sigues pagando millones por colgar plástico.",
      "Menos fierros viejos, más alta definición.",
      "Sin permisos eternos. Sin cables colgando. Puro branding.",
      "El futuro del branding no es de acrílico. Súbete al LED."
    ],
    C: [
      "La publicidad exterior se quedó pegada en los noventa.",
      "Llegó la tecnología europea que apaga los carteles de PVC.",
      "Cambia de campaña en un minuto y desde el suelo.",
      "Deja de financiar basura. Gobo LED Chile."
    ]
  };
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }

  function initHero(section){
    if(!section) return;

    const bgImg = section.querySelector('.hero__bg svg, .interactive-hero__bg img');
    const logo = section.querySelector('[data-logo]');
    const symbol = section.querySelector('[data-symbol]');
    const textBlock = section.querySelector('.hero__copy, .interactive-hero__text');
    const copyLine = section.querySelector('[data-copy-line]');

    if(!bgImg || !logo || !copyLine) return;

    let ticking = false;
    function applyScroll(){
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const visible = clamp((vh - rect.top) / (vh + rect.height), 0, 1);
      const progress = clamp(1 - visible, 0, 1);

      if(bgImg.tagName === 'IMG'){
        bgImg.style.transform = `translate3d(0, ${progress * 40}px, 0) scale(1.06)`;
      } else {
        bgImg.style.transform = `translate3d(0, ${progress * 40}px, 0) scale(1.06)`;
      }

      const logoScale = 1 - progress * 0.12;
      const logoY = -progress * 32;
      const logoRot = progress * 1.2;
      logo.style.transform = `translate3d(0, ${logoY}px, 0) rotate(${logoRot}deg) scale(${logoScale})`;
      logo.style.opacity = String(clamp(1 - progress * 0.45, 0.35, 1));

      if(symbol){
        const s = progress * 18;
        symbol.style.transform = `translate3d(${s}px, ${-s}px, 0) scale(${1 - progress * 0.08})`;
        symbol.style.opacity = String(clamp(1 - progress * 0.7, 0.2, 1));
      }

      if(textBlock){
        textBlock.style.transform = `translate3d(0, ${progress * 28}px, 0)`;
        textBlock.style.opacity = String(clamp(1 - progress * 0.8, 0, 1));
      }
    }
    function onScroll(){
      if(prefersReduced || section.dataset.forceReduce === 'true') return;
      if(!ticking){
        requestAnimationFrame(()=>{ applyScroll(); ticking=false; });
        ticking = true;
      }
    }
    applyScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    if('IntersectionObserver' in window){
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => entry.isIntersecting && applyScroll());
      }, { threshold: [0, 0.25, 0.5, 0.75, 1] });
      io.observe(section);
    }

    const copySetAttr = section.dataset.copySet || 'A';
    const forceReduce = section.dataset.forceReduce === 'true';
    const reduced = forceReduce || prefersReduced;

    if(reduced){
      const first = COPY_SETS[copySetAttr === 'cycle' ? 'A' : copySetAttr][0];
      copyLine.textContent = first;
      copyLine.classList.add('is-enter');
      copyLine.style.opacity = 1;
      return;
    }

    let running = true, timeouts = [], loopIndex = 0;
    function clearAll(){ timeouts.forEach(t => clearTimeout(t)); timeouts = []; }
    function fadeIn(text){
      copyLine.textContent = text;
      copyLine.classList.remove('is-exit');
      copyLine.classList.add('is-enter');
      copyLine.style.opacity = 1;
      copyLine.style.transform = 'translate3d(0,0,0)';
    }
    function fadeOut(){
      copyLine.classList.remove('is-enter');
      copyLine.classList.add('is-exit');
      copyLine.style.opacity = 0;
      copyLine.style.transform = 'translate3d(0,14px,0)';
    }

    function showSequence(setKey){
      clearAll();
      let cumulative = 0;
      const lines = COPY_SETS[setKey] || COPY_SETS.A;

      for(let i=0;i<lines.length;i++){
        ((idx)=>{
          const showAt = cumulative;
          const hideAt = cumulative + TIMINGS[idx];
          timeouts.push(setTimeout(() => fadeIn(lines[idx]), showAt));
          timeouts.push(setTimeout(() => fadeOut(), hideAt - 300));
          cumulative += TIMINGS[idx];
        })(i);
      }

      timeouts.push(setTimeout(() => {
        if(!running) return;
        if(setKey === 'cycle'){
          loopIndex = (loopIndex + 1) % 3;
          const next = ['A','B','C'][loopIndex];
          showSequence(next);
        } else {
          showSequence(setKey);
        }
      }, cumulative));
    }

    section.addEventListener('mouseenter', () => {
      running = false; clearAll();
    });
    section.addEventListener('mouseleave', () => {
      if(!running){
        running = true;
        const startKey = (copySetAttr === 'cycle') ? ['A','B','C'][loopIndex] : copySetAttr;
        showSequence(startKey);
      }
    });

    const startKey = (copySetAttr === 'cycle') ? 'A' : copySetAttr;
    showSequence(startKey);
  }

  document.addEventListener('DOMContentLoaded', function () {
    const hero = document.getElementById('magiclight-hero');
    if(hero) initHero(hero);
  });
})();
