/* ═══════════════════════════════════════════════════════════════
   CHAINGPT LABS — app.js
   Vanilla JS · Three.js · GSAP + ScrollTrigger · Lenis
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────────────────────────
   1. PRELOADER
────────────────────────────────────────────────────────────── */
(function initPreloader() {
  const bar  = document.getElementById('preloader-bar');
  const pct  = document.getElementById('preloader-pct');
  const el   = document.getElementById('preloader');
  let prog   = 0;

  const iv = setInterval(() => {
    prog += Math.random() * 18 + 4;
    if (prog > 100) prog = 100;
    bar.style.width = prog + '%';
    pct.textContent = Math.floor(prog) + '%';
    if (prog >= 100) {
      clearInterval(iv);
      setTimeout(() => {
        el.classList.add('done');
        setTimeout(() => { el.style.display = 'none'; startSite(); }, 650);
      }, 300);
    }
  }, 80);
})();

/* ──────────────────────────────────────────────────────────────
   2. CUSTOM CURSOR
────────────────────────────────────────────────────────────── */
function initCursor() {
  const ring = document.getElementById('cursor-ring');
  const dot  = document.getElementById('cursor-dot');
  if (!ring) return;

  let rx = 0, ry = 0, mx = 0, my = 0;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  // Lerp ring to cursor
  (function loop() {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();

  // States
  document.querySelectorAll('a, button, .mag, .tab, .faq-q, .team-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-link'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-link'));
  });
  document.querySelectorAll('.faq-q').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-faq'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-faq'));
  });
  document.querySelectorAll('#robot-canvas').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-3d'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-3d'));
  });
}

/* ──────────────────────────────────────────────────────────────
   3. THREE.JS ROBOT
────────────────────────────────────────────────────────────── */
function initRobot() {
  const canvas = document.getElementById('robot-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, canvas.offsetWidth / canvas.offsetHeight, 0.1, 100);
  camera.position.set(0, 0.5, 6);

  /* Lights */
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(3, 5, 4);
  key.castShadow = true;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x4488ff, 0.3);
  fill.position.set(-3, 2, 2);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xFF4500, 0.5);
  rim.position.set(0, -2, -3);
  scene.add(rim);

  /* CPU point light (golden glow) */
  const cpuLight = new THREE.PointLight(0xFFB800, 0, 2);
  cpuLight.position.set(0, 0, 0.5);
  scene.add(cpuLight);

  /* Materials */
  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0xf0f0f0,
    metalness: 0.1,
    roughness: 0.3,
    clearcoat: 0.4,
  });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.6, roughness: 0.4 });
  const orangeMat = new THREE.MeshStandardMaterial({ color: 0xFF4500, metalness: 0.3, roughness: 0.5 });
  const glowMat = new THREE.MeshStandardMaterial({
    color: 0xFFB800,
    emissive: 0xFFB800,
    emissiveIntensity: 0,
    roughness: 0.2,
    metalness: 0.8,
  });

  /* Glass cylinder */
  const cylGeo = new THREE.CylinderGeometry(1.3, 1.3, 4.2, 48, 1, true);
  const cylMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0,
    transmission: 0.85,
    thickness: 2,
    ior: 1.45,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
  });
  const cylinder = new THREE.Mesh(cylGeo, cylMat);
  scene.add(cylinder);

  /* Robot group */
  const robot = new THREE.Group();
  scene.add(robot);

  /* Torso */
  const torsoGeo = new THREE.BoxGeometry(0.9, 1.1, 0.5, 1, 1, 1);
  const torso = new THREE.Mesh(torsoGeo, bodyMat);
  torso.position.y = 0;
  torso.castShadow = true;
  robot.add(torso);

  /* Chest CPU panel */
  const cpuGeo = new THREE.BoxGeometry(0.35, 0.35, 0.08);
  const cpu = new THREE.Mesh(cpuGeo, glowMat);
  cpu.position.set(0, 0.05, 0.3);
  robot.add(cpu);
  cpuLight.position.copy(cpu.position);

  /* Chest grid lines */
  const chestDetail = new THREE.Mesh(
    new THREE.PlaneGeometry(0.6, 0.5),
    new THREE.MeshBasicMaterial({ color: 0x333333, wireframe: true, opacity: 0.3, transparent: true })
  );
  chestDetail.position.set(0, 0, 0.27);
  robot.add(chestDetail);

  /* Head */
  const headGeo = new THREE.BoxGeometry(0.7, 0.65, 0.55);
  const head = new THREE.Mesh(headGeo, bodyMat);
  head.position.y = 1.0;
  head.castShadow = true;
  robot.add(head);

  /* Face plate (orange frame) */
  const faceGeo = new THREE.BoxGeometry(0.52, 0.42, 0.08);
  const face = new THREE.Mesh(faceGeo, orangeMat);
  face.position.set(0, 1.0, 0.3);
  robot.add(face);

  /* Eyes */
  const eyeGeo = new THREE.BoxGeometry(0.1, 0.08, 0.05);
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xFFB800, emissive: 0xFFB800, emissiveIntensity: 1.5 });
  [-0.13, 0.13].forEach(x => {
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(x, 1.02, 0.36);
    robot.add(eye);
  });

  /* Neck */
  const neckGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.2, 8);
  const neck = new THREE.Mesh(neckGeo, darkMat);
  neck.position.y = 0.68;
  robot.add(neck);

  /* Shoulder joints */
  [-0.62, 0.62].forEach(x => {
    const shoulderGeo = new THREE.SphereGeometry(0.14, 12, 12);
    const shoulder = new THREE.Mesh(shoulderGeo, orangeMat);
    shoulder.position.set(x, 0.35, 0);
    robot.add(shoulder);
  });

  /* Arms */
  [-0.7, 0.7].forEach((x, i) => {
    const upperGeo = new THREE.BoxGeometry(0.2, 0.6, 0.22);
    const upper = new THREE.Mesh(upperGeo, bodyMat);
    upper.position.set(x, 0.0, 0);
    upper.rotation.z = (i === 0 ? 0.15 : -0.15);
    upper.castShadow = true;
    robot.add(upper);

    const lowerGeo = new THREE.BoxGeometry(0.18, 0.5, 0.2);
    const lower = new THREE.Mesh(lowerGeo, darkMat);
    lower.position.set(x * 1.05, -0.55, 0);
    lower.castShadow = true;
    robot.add(lower);

    const handGeo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
    const hand = new THREE.Mesh(handGeo, orangeMat);
    hand.position.set(x * 1.08, -0.86, 0);
    robot.add(hand);
  });

  /* Legs */
  /* Hip connector */
  const hipGeo = new THREE.BoxGeometry(0.7, 0.18, 0.45);
  const hip = new THREE.Mesh(hipGeo, darkMat);
  hip.position.y = -0.64;
  robot.add(hip);

  [-0.25, 0.25].forEach(x => {
    const upperLegGeo = new THREE.BoxGeometry(0.24, 0.65, 0.26);
    const upperLeg = new THREE.Mesh(upperLegGeo, bodyMat);
    upperLeg.position.set(x, -1.1, 0);
    robot.add(upperLeg);

    const kneePad = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.12, 0.28), orangeMat);
    kneePad.position.set(x, -1.48, 0);
    robot.add(kneePad);

    const lowerLegGeo = new THREE.BoxGeometry(0.22, 0.55, 0.24);
    const lowerLeg = new THREE.Mesh(lowerLegGeo, darkMat);
    lowerLeg.position.set(x, -1.82, 0);
    robot.add(lowerLeg);

    const footGeo = new THREE.BoxGeometry(0.28, 0.12, 0.38);
    const foot = new THREE.Mesh(footGeo, bodyMat);
    foot.position.set(x, -2.14, 0.06);
    robot.add(foot);
  });

  /* Robotic arm for CPU assembly */
  const armGroup = new THREE.Group();
  const armPiece = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 0.08), darkMat);
  armPiece.position.y = -0.4;
  armGroup.add(armPiece);
  const cpuChip = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.3), glowMat);
  cpuChip.position.y = -0.8;
  armGroup.add(cpuChip);
  armGroup.position.set(0.6, 3.5, 0.3);
  robot.add(armGroup);

  /* Center robot */
  robot.position.y = 0.2;
  robot.scale.set(0.95, 0.95, 0.95);

  /* Mouse spring physics */
  let targetRotX = 0, targetRotY = 0;
  let currentRotX = 0, currentRotY = 0;
  let velX = 0, velY = 0;
  const spring  = 0.08;
  const damping = 0.75;

  document.addEventListener('mousemove', (e) => {
    targetRotY = ((e.clientX / window.innerWidth)  - 0.5) *  0.6;
    targetRotX = ((e.clientY / window.innerHeight) - 0.5) * -0.3;
  });

  /* Scroll scale binding */
  let scrollFraction = 0;
  window.addEventListener('scroll', () => {
    const hero = document.getElementById('hero');
    if (!hero) return;
    const h = hero.offsetHeight;
    scrollFraction = Math.min(1, window.scrollY / h);
  });

  /* CPU assembly animation */
  let cpuAnimDone = false;
  let cpuT = 0;

  /* FPS monitor */
  let fps = 60, lastTime = performance.now(), frames = 0;
  let lowPerf = false;

  /* Animate */
  let time = 0;
  function animate(now) {
    requestAnimationFrame(animate);

    // FPS check
    frames++;
    if (now - lastTime >= 1000) {
      fps = frames;
      frames = 0;
      lastTime = now;
      if (fps < 30 && !lowPerf) {
        lowPerf = true;
        renderer.setPixelRatio(0.5);
      }
    }

    time += 0.008;

    // CPU assembly: arm lowers from above
    if (!cpuAnimDone) {
      cpuT += 0.015;
      const t = Math.min(1, cpuT);
      const eased = 1 - Math.pow(1 - t, 3);
      armGroup.position.y = 3.5 - eased * 3.2;
      armGroup.rotation.z = Math.sin(eased * Math.PI * 2) * 0.1;
      if (t >= 1) {
        cpuAnimDone = true;
        // CPU glow ramp up
        glowMat.emissiveIntensity = 2;
        cpuLight.intensity = 1.5;
        armGroup.visible = false;
      }
    }

    // Idle float
    robot.position.y = 0.2 + Math.sin(time * 0.7) * 0.12;

    // Spring head tracking
    const dX = targetRotX - currentRotX;
    const dY = targetRotY - currentRotY;
    velX = velX * damping + dX * spring;
    velY = velY * damping + dY * spring;
    currentRotX += velX;
    currentRotY += velY;

    head.rotation.x = currentRotX * 0.8;
    head.rotation.y = currentRotY * 1.2;
    face.rotation.x = currentRotX * 0.8;
    face.rotation.y = currentRotY * 1.2;
    face.position.x = currentRotY * -0.04;

    robot.rotation.y = currentRotY * 0.4 + Math.sin(time * 0.3) * 0.05;

    // CPU golden pulse
    if (cpuAnimDone) {
      glowMat.emissiveIntensity = 1.5 + Math.sin(time * 3) * 0.5;
      cpuLight.intensity = 1.2 + Math.sin(time * 3) * 0.4;
    }

    // Eye blink
    const blink = Math.abs(Math.sin(time * 0.6));
    eyeMat.emissiveIntensity = 1.0 + blink * 0.8;

    // Scroll scale
    const scale = 1.0 - scrollFraction * 0.35;
    robot.scale.setScalar(0.95 * Math.max(0.3, scale));
    camera.position.z = 6 + scrollFraction * 3;

    renderer.render(scene, camera);
  }
  animate(performance.now());

  // Resize
  function onResize() {
    const w = canvas.offsetWidth, h = canvas.offsetHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);
}

/* ──────────────────────────────────────────────────────────────
   4. LENIS SMOOTH SCROLL
────────────────────────────────────────────────────────────── */
function initLenis() {
  if (typeof Lenis === 'undefined') return;
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  window._lenis = lenis;
  return lenis;
}

/* ──────────────────────────────────────────────────────────────
   5. GSAP SCROLL ANIMATIONS
────────────────────────────────────────────────────────────── */
function initScrollAnimations() {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger, Flip);

  /* Staggered reveal: all .reveal elements */
  document.querySelectorAll('.reveal, .reveal-left, .reveal-scale').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      onEnter: () => el.classList.add('visible'),
    });
  });

  /* Hero heading lines animate in */
  const heroLines = document.querySelectorAll('.h1-line');
  heroLines.forEach((line, i) => {
    gsap.from(line, {
      y: 80,
      opacity: 0,
      duration: 1.0,
      delay: 0.2 + i * 0.15,
      ease: 'power4.out',
    });
  });
  gsap.from('.hero-badge', { opacity: 0, y: 20, duration: 0.8, delay: 0.1, ease: 'power3.out' });
  gsap.from('.hero-tagline', { opacity: 0, y: 20, duration: 0.8, delay: 0.5, ease: 'power3.out' });
  gsap.from('.hero-btns', { opacity: 0, y: 20, duration: 0.8, delay: 0.65, ease: 'power3.out' });
  gsap.from('.hero-stats-bar', { opacity: 0, y: 20, duration: 0.8, delay: 0.8, ease: 'power3.out' });

  /* Programs cards stagger */
  ScrollTrigger.create({
    trigger: '.programs-grid',
    start: 'top 80%',
    onEnter: () => {
      gsap.from('.prog-card', {
        y: 50, opacity: 0,
        stagger: 0.12,
        duration: 0.9,
        ease: 'power3.out',
      });
    },
  });

  /* Bento grid stagger */
  ScrollTrigger.create({
    trigger: '.bento-grid',
    start: 'top 80%',
    onEnter: () => {
      gsap.from('.bc', {
        y: 40, opacity: 0,
        stagger: 0.08,
        duration: 0.8,
        ease: 'power3.out',
      });
    },
  });

  /* Team cards */
  ScrollTrigger.create({
    trigger: '.team-grid',
    start: 'top 80%',
    onEnter: () => {
      gsap.from('.team-card', {
        y: 50, opacity: 0,
        stagger: 0.1,
        duration: 0.9,
        ease: 'power3.out',
      });
    },
  });

  /* Testimonials */
  ScrollTrigger.create({
    trigger: '.testi-track',
    start: 'top 80%',
    onEnter: () => {
      gsap.from('.testi-card', {
        x: 60, opacity: 0,
        stagger: 0.15,
        duration: 0.9,
        ease: 'power3.out',
      });
    },
  });

  /* FAQ items */
  ScrollTrigger.create({
    trigger: '.faq-list',
    start: 'top 80%',
    onEnter: () => {
      gsap.from('.faq-item', {
        y: 30, opacity: 0,
        stagger: 0.08,
        duration: 0.7,
        ease: 'power3.out',
      });
    },
  });

  /* News cards */
  ScrollTrigger.create({
    trigger: '.news-grid',
    start: 'top 80%',
    onEnter: () => {
      gsap.from('.news-card', {
        y: 40, opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out',
      });
    },
  });

  /* Apply section */
  ScrollTrigger.create({
    trigger: '.sec-apply',
    start: 'top 75%',
    onEnter: () => {
      gsap.from('.apply-h2', { y: 50, opacity: 0, duration: 1.0, ease: 'power4.out' });
      gsap.from('.apply-sub', { y: 30, opacity: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' });
      gsap.from('.apply-btns', { y: 20, opacity: 0, duration: 0.8, delay: 0.35, ease: 'power3.out' });
      gsap.from('.apply-meta > div', { y: 20, opacity: 0, stagger: 0.1, duration: 0.7, delay: 0.5 });
    },
  });

  /* Parallax hero bg text */
  gsap.to('#hero-bg-text', {
    y: '-20%',
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  });

  /* Marquee inertia via scroll velocity */
}

/* ──────────────────────────────────────────────────────────────
   6. HERO COUNTER ANIMATION
────────────────────────────────────────────────────────────── */
function initHeroCounters() {
  document.querySelectorAll('.hs-n[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    let started = false;

    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !started) {
        started = true;
        let current = 0;
        const step = Math.ceil(target / 60);
        const iv = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = current;
          if (current >= target) clearInterval(iv);
        }, 16);
      }
    }, { threshold: 0.5 });
    io.observe(el);
  });
}

/* ──────────────────────────────────────────────────────────────
   7. MAGNETIC LINKS
────────────────────────────────────────────────────────────── */
function initMagnetic() {
  const RADIUS = 60;
  document.querySelectorAll('[data-mag]').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < RADIUS) {
        const strength = (RADIUS - dist) / RADIUS;
        el.style.transform = `translate(${dx * strength * 0.35}px, ${dy * strength * 0.35}px)`;
        el.style.color = '#FF4500';
        el.style.transition = 'transform 0.1s, color 0.2s';
      }
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
      el.style.color = '';
      el.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1), color 0.3s';
    });
  });
}

/* ──────────────────────────────────────────────────────────────
   8. HEADER SCROLL BEHAVIOR + MEGA MENU
────────────────────────────────────────────────────────────── */
function initHeader() {
  const header    = document.getElementById('site-header');
  const megaMenu  = document.getElementById('mega-menu');
  const progLink  = document.querySelector('.nav-link[href="#programs"]');
  const burger    = document.getElementById('burger');
  const drawer    = document.getElementById('mobile-drawer');

  // Scroll shrink
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  });

  // Mega menu trigger
  if (progLink && megaMenu) {
    progLink.addEventListener('mouseenter', () => {
      megaMenu.classList.add('open');
      megaMenu.setAttribute('aria-hidden', 'false');
    });
    header.addEventListener('mouseleave', () => {
      megaMenu.classList.remove('open');
      megaMenu.setAttribute('aria-hidden', 'true');
    });
  }

  // Burger
  if (burger && drawer) {
    burger.addEventListener('click', () => {
      const open = burger.classList.toggle('open');
      drawer.classList.toggle('open', open);
      drawer.setAttribute('aria-hidden', String(!open));
    });
  }

  // Close drawer on link click
  document.querySelectorAll('.mob-link, .mob-apply').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('open');
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
    });
  });

  // Active nav highlight on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active-link'));
        const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active-link');
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => io.observe(s));
}

/* ──────────────────────────────────────────────────────────────
   9. PORTFOLIO TABS (GSAP FLIP)
────────────────────────────────────────────────────────────── */
function initTabs() {
  const tabs   = document.querySelectorAll('.tab');
  const cards  = document.querySelectorAll('.bc[data-cat]');

  function switchTab(tab) {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const cat = tab.dataset.tab;

    const state = (typeof Flip !== 'undefined') ? Flip.getState(cards) : null;

    cards.forEach(card => {
      const show = (cat === 'incubation')
        ? card.dataset.cat === 'incubation'
        : card.dataset.cat === 'investment' || card.classList.contains('bc-metrics-card') || card.classList.contains('bc-apply-cta');
      card.classList.toggle('hidden', !show);
    });

    if (state && typeof Flip !== 'undefined') {
      Flip.from(state, {
        duration: 0.5,
        ease: 'power2.inOut',
        absolute: true,
        onEnter: els => gsap.fromTo(els, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.4 }),
        onLeave: els => gsap.to(els, { opacity: 0, scale: 0.9, duration: 0.3 }),
      });
    }
  }

  tabs.forEach(tab => tab.addEventListener('click', () => switchTab(tab)));
}

/* ──────────────────────────────────────────────────────────────
   10. PARTNER MARQUEE (inertia)
────────────────────────────────────────────────────────────── */
function initPartnerMarquee() {
  const track = document.getElementById('partner-track');
  if (!track) return;

  let x = 0;
  const speed = 0.6;
  let scrollBoost = 0;
  let lastScrollY = 0;

  window.addEventListener('scroll', () => {
    scrollBoost = (window.scrollY - lastScrollY) * 0.4;
    lastScrollY = window.scrollY;
  });

  (function loop() {
    scrollBoost *= 0.92;
    x -= (speed + scrollBoost);
    const halfWidth = track.scrollWidth / 2;
    if (Math.abs(x) >= halfWidth) x = 0;
    track.style.transform = `translateX(${x}px)`;
    requestAnimationFrame(loop);
  })();
}

/* ──────────────────────────────────────────────────────────────
   11. TESTIMONIALS DRAGGABLE SLIDER
────────────────────────────────────────────────────────────── */
function initTestimonials() {
  const track   = document.getElementById('testi-track');
  const prevBtn = document.getElementById('testi-prev');
  const nextBtn = document.getElementById('testi-next');
  const dotsWrap = document.getElementById('testi-dots');
  if (!track) return;

  const cards  = track.querySelectorAll('.testi-card');
  const total  = cards.length;
  let current  = 0;
  let startX   = 0, isDragging = false, dragDelta = 0;

  // Build dots
  const dots = [];
  cards.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'testi-dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(d);
    dots.push(d);
  });

  function goTo(idx) {
    current = (idx + total) % total;
    const offset = current * -(100 / total);
    if (typeof gsap !== 'undefined') {
      gsap.to(track, { x: `${offset}%`, duration: 0.6, ease: 'power3.out' });
    } else {
      track.style.transform = `translateX(${offset}%)`;
    }
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  prevBtn && prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn && nextBtn.addEventListener('click', () => goTo(current + 1));

  // Touch/drag
  track.addEventListener('pointerdown', (e) => {
    isDragging = true;
    startX = e.clientX;
    track.style.userSelect = 'none';
  });
  window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    dragDelta = e.clientX - startX;
  });
  window.addEventListener('pointerup', () => {
    if (!isDragging) return;
    isDragging = false;
    if (dragDelta < -60) goTo(current + 1);
    else if (dragDelta > 60) goTo(current - 1);
    dragDelta = 0;
  });

  // Auto-advance
  setInterval(() => goTo(current + 1), 5000);
}

/* ──────────────────────────────────────────────────────────────
   12. FAQ ACCORDION
────────────────────────────────────────────────────────────── */
function initFAQ() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-q');
    const ans = item.querySelector('.faq-a');
    if (!btn || !ans) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item.open').forEach(other => {
        other.classList.remove('open');
        other.querySelector('.faq-a').style.maxHeight = '0';
      });

      if (!isOpen) {
        item.classList.add('open');
        ans.style.maxHeight = ans.querySelector('.faq-a-inner').scrollHeight + 'px';
      }
    });
  });
}

/* ──────────────────────────────────────────────────────────────
   13. STEP INDICATOR (IntersectionObserver)
────────────────────────────────────────────────────────────── */
function initStepIndicator() {
  const steps  = document.querySelectorAll('.step-dot');
  const cards  = document.querySelectorAll('.prog-card');
  if (!steps.length || !cards.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = Array.from(cards).indexOf(entry.target);
        steps.forEach((s, i) => s.classList.toggle('active', i === idx));
      }
    });
  }, { threshold: 0.6 });

  cards.forEach(c => io.observe(c));
}

/* ──────────────────────────────────────────────────────────────
   14. NEWS SECTION — vertical logo parallax
────────────────────────────────────────────────────────────── */
function initNewsParallax() {
  const vert = document.getElementById('news-vert');
  if (!vert || typeof gsap === 'undefined') return;

  gsap.to(vert, {
    y: -60,
    ease: 'none',
    scrollTrigger: {
      trigger: '.sec-news',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  });
}

/* ──────────────────────────────────────────────────────────────
   15. SCRAMBLE TEXT EFFECT (hero heading)
────────────────────────────────────────────────────────────── */
function scrambleText(el, finalText, duration) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890!@#$%';
  let frame = 0;
  const totalFrames = Math.round(duration / 16);

  const iv = setInterval(() => {
    frame++;
    const progress = frame / totalFrames;
    const revealed = Math.floor(progress * finalText.length);
    let result = '';
    for (let i = 0; i < finalText.length; i++) {
      if (i < revealed) {
        result += finalText[i];
      } else {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
    }
    el.textContent = result;
    if (frame >= totalFrames) {
      clearInterval(iv);
      el.textContent = finalText;
    }
  }, 16);
}

/* ──────────────────────────────────────────────────────────────
   16. MAIN INIT — runs after preloader
────────────────────────────────────────────────────────────── */
function startSite() {
  initCursor();
  initRobot();
  initLenis();
  initScrollAnimations();
  initHeroCounters();
  initMagnetic();
  initHeader();
  initTabs();
  initPartnerMarquee();
  initTestimonials();
  initFAQ();
  initStepIndicator();
  initNewsParallax();

  // Scramble hero heading
  setTimeout(() => {
    const lines = document.querySelectorAll('.h1-line');
    lines.forEach((line, i) => {
      const final = line.dataset.text || line.textContent;
      setTimeout(() => scrambleText(line, final, 600), i * 200);
    });
  }, 400);
}
