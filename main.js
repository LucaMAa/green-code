/* ── CANVAS BG ── */
(function () {
  const canvas = document.getElementById('bg-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, dots = [];
  const S = 100, R = 1.2, COL = '99, 102, 241'; // Indigo
  let mx = -999, my = -999;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    dots = [];
    const rows = Math.ceil(H / S) + 1;
    const cols = Math.ceil(W / S) + 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({ 
          baseX: c * S, 
          baseY: r * S,
          x: c * S, 
          y: r * S, 
          g: 0,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5
        });
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const t = performance.now() * 0.0005;
    
    dots.forEach(d => {
      // Subtle organic movement
      d.x = d.baseX + Math.sin(t + d.baseY * 0.005) * 15;
      d.y = d.baseY + Math.cos(t + d.baseX * 0.005) * 15;

      const dx = d.x - mx, dy = d.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const prox = Math.max(0, 1 - dist / 250);
      const wave = Math.sin(t + d.x * 0.008 + d.y * 0.008) * 0.5 + 0.5;
      
      d.g = d.g * 0.92 + prox * 0.08;
      
      const a = 0.04 + d.g * 0.45 + wave * 0.02;
      const r = R + d.g * 4;
      
      ctx.beginPath();
      ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${COL},${a})`;
      ctx.fill();

      // Subtle connections for nearby high-gravity dots
      if (d.g > 0.15) {
        dots.forEach(d2 => {
          if (d === d2) return;
          const d2x = d2.x - d.x, d2y = d2.y - d.y;
          const d2dist = d2x * d2x + d2y * d2y;
          if (d2dist < S * S * 1.5) {
            const opacity = (d.g + d2.g) * 0.05;
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(d2.x, d2.y);
            ctx.strokeStyle = `rgba(${COL},${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      }
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  resize(); draw();
})();

/* ── TYPEWRITER CORE ── */
async function typewriter(el, text, speed = 50) {
  el.textContent = '';
  el.classList.add('typewriter');
  for (let i = 0; i < text.length; i++) {
    el.textContent += text[i];
    await new Promise(r => setTimeout(r, speed));
  }
}

/* ── NAV & SCROLL ── */
(function () {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('nav-toggle');
  const btt = document.getElementById('back-to-top');
  const navLinks = document.querySelectorAll('.nav-links a');
  
  function handleScroll() {
    const s = window.scrollY;
    
    // Smooth transition for nav
    if (s > 100) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    if (btt) {
      if (s > 800) btt.classList.add('show');
      else btt.classList.remove('show');
    }

    // Active link based on section
    let current = "";
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = s + 150; // Offset for better detection

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach((a) => {
      a.classList.remove("active");
      if (a.getAttribute("href") === `#${current}`) {
        a.classList.add("active");
      }
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('load', handleScroll); // Check on reload

  if (btt) {
    btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  if (toggle) {
    toggle.addEventListener('click', () => nav.classList.toggle('nav-open'));
  }
  
  // Close menu on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('nav-open');
    });
  });
})();

/* ── INITIAL ANIMATIONS ── */
document.addEventListener('DOMContentLoaded', () => {
  const heroLines = document.querySelectorAll('.hero-title .line');
  const heroBody = document.querySelector('.hero-body');
  
  // Hero animations stagger
  setTimeout(() => {
    if (heroBody) heroBody.classList.add('in');
  }, 1000);

  // Reveal observer
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        
        // If it has a typewriter title inside
        const t = e.target.querySelector('.tw-title');
        if (t && !t.dataset.done) {
          t.dataset.done = 'true';
          typewriter(t, t.dataset.text || t.textContent, 60);
        }
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => obs.observe(el));
});

/* ── COMPLEXITY VISUALIZER ── */
(function () {
  const slider = document.getElementById('n-slider');
  if(!slider) return;
  const nEl = document.getElementById('n-val');
  const list = document.getElementById('bar-list');
  const svg = d3.select('#complexity-chart');
  const container = document.getElementById('complexity-chart-container');

  const comps = [
    { id: 'c1', label: 'O(1)', fn: n => 1, col: '#10b981' },
    { id: 'clog', label: 'O(log n)', fn: n => Math.log2(n), col: '#f59e0b' },
    { id: 'cn', label: 'O(n)', fn: n => n, col: '#6366f1' },
    { id: 'cn2', label: 'O(n²)', fn: n => n * n, col: '#f43f5e' },
  ];

  // Initialize bars
  list.innerHTML = '';
  const fills = [];
  const notes = [];

  comps.forEach(c => {
    const row = document.createElement('div');
    row.className = 'bar-row';
    const nm = document.createElement('div');
    nm.className = 'bar-name';
    nm.textContent = c.label;
    const track = document.createElement('div');
    track.className = 'bar-track';
    const fill = document.createElement('div');
    fill.className = 'bar-fill';
    fill.style.background = c.col;
    fill.style.width = '0%';
    track.appendChild(fill);
    const note = document.createElement('div');
    note.className = 'note';
    row.appendChild(nm); row.appendChild(track); row.appendChild(note);
    list.appendChild(row);
    fills.push(fill); notes.push(note);
  });

  const margin = { top: 40, right: 60, bottom: 60, left: 80 };
  let width, height, chartG;

  function initChart() {
    if (!container) return;
    width = container.clientWidth - margin.left - margin.right;
    height = container.clientHeight - margin.top - margin.bottom;
    svg.attr('width', container.clientWidth).attr('height', container.clientHeight);
    svg.selectAll('*').remove();
    
    chartG = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    
    const x = d3.scaleLinear().domain([2, 500]).range([0, width]);
    const y = d3.scaleLog().domain([0.1, 500 * 500]).range([height, 0]);

    // Grid lines
    chartG.append('g').attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickSize(-height).tickFormat(''))
      .attr('color', 'rgba(255,255,255,0.05)');

    chartG.append('g').attr('class', 'grid')
      .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(''))
      .attr('color', 'rgba(255,255,255,0.05)');

    // Axis
    chartG.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5))
      .attr('color', 'rgba(255,255,255,0.3)')
      .style('font-family', 'JetBrains Mono').style('font-size', '10px');

    chartG.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d >= 1000 ? (d/1000)+'k' : d))
      .attr('color', 'rgba(255,255,255,0.3)')
      .style('font-family', 'JetBrains Mono').style('font-size', '10px');

    comps.forEach(c => {
      const lineData = d3.range(2, 501, 10).map(n => ({ n, val: Math.max(0.1, c.fn(n)) }));
      const line = d3.line().x(d => x(d.n)).y(d => y(d.val)).curve(d3.curveMonotoneX);
      
      chartG.append('path').datum(lineData)
        .attr('fill', 'none').attr('stroke', c.col).attr('stroke-width', 3)
        .attr('d', line)
        .attr('stroke-dasharray', function() { return this.getTotalLength() })
        .attr('stroke-dashoffset', function() { return this.getTotalLength() })
        .transition().duration(2000).delay(500)
        .attr('stroke-dashoffset', 0);

      // Label at end
      const last = lineData[lineData.length - 1];
      chartG.append('text')
        .attr('x', x(last.n) + 10).attr('y', y(last.val))
        .attr('fill', c.col).text(c.label)
        .style('font-size', '12px').style('font-weight', '700').style('font-family', 'JetBrains Mono')
        .style('opacity', 0).transition().duration(500).delay(2500).style('opacity', 1);
    });

    return { x, y };
  }

  let chart = initChart();
  window.addEventListener('resize', () => chart = initChart());

  function update(n) {
    const vals = comps.map(c => c.fn(n));
    const total = vals.reduce((a, b) => a + b, 0);
    const maxVal = Math.max(...vals);

    fills.forEach((f, i) => {
      const w = (vals[i] / maxVal * 100);
      f.style.width = w + '%';
      notes[i].textContent = vals[i].toLocaleString() + ' ops';
    });
    if(nEl) nEl.textContent = n;
  }

  slider.addEventListener('input', () => update(parseInt(slider.value)));
  update(100);
})();

/* ── LANG CHART ── */
(function () {
  const wrap = document.getElementById('lang-chart');
  if(!wrap) return;
  const langs = [
    { name: 'C / Rust', m: 1.00, c: '#10b981' },
    { name: 'C++', m: 1.34, c: '#34d399' },
    { name: 'Java', m: 1.98, c: '#f59e0b' },
    { name: 'Go', m: 3.23, c: '#fb923c' },
    { name: 'JavaScript', m: 4.45, c: '#6366f1' },
    { name: 'Python', m: 75.88, c: '#f43f5e' },
  ];
  const max = 75.88;

  langs.forEach(l => {
    const row = document.createElement('div');
    row.className = 'lang-row';
    const nm = document.createElement('div');
    nm.className = 'nm'; nm.textContent = l.name; 
    const track = document.createElement('div');
    track.className = 'lang-track';
    const fill = document.createElement('div');
    fill.className = 'lang-fill';
    fill.style.background = l.c;
    fill.style.width = '0%';
    fill.dataset.target = (l.m / max * 100);
    fill.textContent = l.m.toFixed(2) + 'x';
    track.appendChild(fill);
    row.appendChild(nm); row.appendChild(track);
    wrap.appendChild(row);
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        wrap.querySelectorAll('.lang-fill').forEach(f => {
          f.style.width = f.dataset.target + '%';
        });
      }
    });
  }, { threshold: 0.5 });
  observer.observe(wrap);
})();
