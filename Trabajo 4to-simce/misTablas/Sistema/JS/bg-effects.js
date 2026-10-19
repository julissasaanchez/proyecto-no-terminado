/* MOTOR DE FONDOS Y CRISTALES DE ENERGÍA MÍSTICOS - MIS TABLAS 4° BÁSICO */

class BackgroundEffectsEngine {
    constructor() {
        this.container = null;
        this.crystals = ['💎', '🔮', '✨', '⚡', '🌟', '💠'];
        this.activeCrystals = 0;
        this.maxCrystals = 6;
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.buildLayer();
            this.spawnMysticStars();
            this.startCrystalLoop();
        });
    }

    buildLayer() {
        if (document.getElementById('bgAnimatedLayer')) return;
        const layer = document.createElement('div');
        layer.id = 'bgAnimatedLayer';
        layer.className = 'bg-animated-layer';
        document.body.appendChild(layer);
        this.container = layer;
    }

    spawnMysticStars() {
        if (!this.container) return;
        for (let i = 0; i < 20; i++) {
            const star = document.createElement('div');
            star.className = 'mystic-star';
            const size = 3 + Math.random() * 5;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.left = `${Math.random() * 100}vw`;
            star.style.top = `${Math.random() * 100}vh`;
            star.style.animationDelay = `${Math.random() * 3}s`;
            this.container.appendChild(star);
        }
    }

    startCrystalLoop() {
        setInterval(() => {
            if (this.activeCrystals < this.maxCrystals) {
                this.spawnSingleCrystal();
            }
        }, 3500);
    }

    spawnSingleCrystal() {
        if (!this.container) return;

        const c = document.createElement('div');
        c.className = 'floating-crystal-item';
        
        const crystalIcon = this.crystals[Math.floor(Math.random() * this.crystals.length)];
        c.textContent = crystalIcon;
        c.style.left = `${8 + Math.random() * 84}%`;
        c.style.animationDuration = `${9 + Math.random() * 5}s`;

        c.addEventListener('click', (e) => {
            e.stopPropagation();
            this.collectCrystal(c);
        });

        this.container.appendChild(c);
        this.activeCrystals++;

        setTimeout(() => {
            if (c.parentNode) {
                c.remove();
                this.activeCrystals--;
            }
        }, 15000);
    }

    collectCrystal(cElem) {
        if (cElem.classList.contains('collected')) return;
        cElem.classList.add('collected');

        if (window.audio) audio.playStar();
        if (window.stateMgr) stateMgr.addPoints(10);

        const rect = cElem.getBoundingClientRect();
        this.createParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);

        if (window.modalSys) {
            modalSys.showToast('✨ ¡Cristal Mágico Recolectado! +10 Puntos de Energía', 'success', '💎');
        }

        cElem.style.transform = 'scale(1.8) rotate(360deg)';
        cElem.style.opacity = '0';
        cElem.style.transition = 'all 0.4s ease-out';

        setTimeout(() => {
            cElem.remove();
            this.activeCrystals--;
        }, 400);
    }

    createParticleBurst(x, y) {
        const particles = ['✨', '💎', '🌟', '⚡'];
        for (let i = 0; i < 8; i++) {
            const p = document.createElement('div');
            p.style.position = 'fixed';
            p.style.left = `${x}px`;
            p.style.top = `${y}px`;
            p.style.fontSize = '1.4rem';
            p.style.pointerEvents = 'none';
            p.style.zIndex = '2500';
            p.textContent = particles[Math.floor(Math.random() * particles.length)];

            const angle = (i / 8) * Math.PI * 2;
            const distance = 45 + Math.random() * 25;
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;

            p.style.transition = 'all 0.5s ease-out';
            document.body.appendChild(p);

            requestAnimationFrame(() => {
                p.style.transform = `translate(${dx}px, ${dy}px) scale(0)`;
                p.style.opacity = '0';
            });

            setTimeout(() => p.remove(), 550);
        }
    }
}

const bgEffects = new BackgroundEffectsEngine();

/* ================================================================
   EFECTO DE BRILLO MÁGICO QUE SIGUE AL MOUSE - SOLO EN EL LOGIN
   Limita el canvas y las partículas exclusivamente al .login-card.
   Respeta prefers-reduced-motion.
   ================================================================ */

class LoginMagicGlow {
    constructor() {
        this.card        = null;
        this.canvas      = null;
        this.ctx2d       = null;
        this.particles   = [];
        this.mouseX      = 0;
        this.mouseY      = 0;
        this.raf         = null;
        this.maxParticles = 55;
        this.active      = false;

        // Paleta de colores acorde al tema del login (indigo, pink, cyan)
        this.colors = [
            'rgba(99, 102, 241,',    // --primary
            'rgba(236, 72, 153,',    // --secondary
            'rgba(6, 182, 212,',     // --crystal-cyan
            'rgba(245, 158, 11,',    // --crystal-gold
            'rgba(168, 85, 247,',    // --crystal-purple
            'rgba(255, 255, 255,',   // white sparkle
        ];

        this._onPointerMove = this._onPointerMove.bind(this);
        this._onPointerLeave= this._onPointerLeave.bind(this);

        document.addEventListener('DOMContentLoaded', () => this._init());
    }

    _init() {
        // Solo activar si existe el contenedor del login en esta página
        this.card = document.querySelector('.login-card');
        if (!this.card) return;

        // Respetar preferencia de movimiento reducido
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        this._buildCanvas();
        this._startLoop();
        this.active = true;
    }

    _buildCanvas() {
        // Asegurar position relative en la tarjeta para que el canvas la siga
        const cs = getComputedStyle(this.card);
        if (cs.position === 'static') this.card.style.position = 'relative';

        this.canvas = document.createElement('canvas');
        this.canvas.className   = 'login-glow-canvas';
        this.canvas.style.cssText = [
            'position:absolute',
            'top:0', 'left:0',
            'width:100%', 'height:100%',
            'pointer-events:none',
            'border-radius:inherit',
            'z-index:0',
            'overflow:hidden',
        ].join(';');

        // Insertar como primer hijo para que quede DETRÁS del contenido
        this.card.insertBefore(this.canvas, this.card.firstChild);
        this.ctx2d = this.canvas.getContext('2d');

        this._resizeCanvas();

        // Listeners exclusivamente en .login-card
        this.card.addEventListener('pointermove',  this._onPointerMove,  { passive: true });
        this.card.addEventListener('pointerleave', this._onPointerLeave, { passive: true });

        // Resize observer para adaptar el canvas al tamaño del contenedor
        if (window.ResizeObserver) {
            new ResizeObserver(() => this._resizeCanvas()).observe(this.card);
        }
    }

    _resizeCanvas() {
        if (!this.canvas || !this.card) return;
        const r = this.card.getBoundingClientRect();
        this.canvas.width  = r.width  || this.card.offsetWidth;
        this.canvas.height = r.height || this.card.offsetHeight;
    }

    _onPointerMove(e) {
        const rect = this.card.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
        this._spawnParticles();
    }

    _onPointerLeave() {
        // No eliminamos las partículas existentes: se desvanecen solas
    }

    _spawnParticles() {
        // Limitar la cantidad total para no saturar
        const toSpawn = 3;
        for (let i = 0; i < toSpawn; i++) {
            if (this.particles.length >= this.maxParticles) break;

            const angle    = Math.random() * Math.PI * 2;
            const speed    = 0.3 + Math.random() * 1.0;
            const radius   = 2 + Math.random() * 4.5;
            const life     = 0.6 + Math.random() * 0.7; // segundos
            const colorBase= this.colors[Math.floor(Math.random() * this.colors.length)];

            this.particles.push({
                x:     this.mouseX + (Math.random() - 0.5) * 16,
                y:     this.mouseY + (Math.random() - 0.5) * 16,
                vx:    Math.cos(angle) * speed,
                vy:    Math.sin(angle) * speed - 0.6, // deriva suave hacia arriba
                r:     radius,
                alpha: 0.9,
                decay: 1 / (life * 60), // 60 fps normalizado
                color: colorBase,
                glow:  Math.random() < 0.35, // algunas partículas tienen halo extra
            });
        }
    }

    _startLoop() {
        const loop = () => {
            this.raf = requestAnimationFrame(loop);
            this._render();
        };
        this.raf = requestAnimationFrame(loop);
    }

    _render() {
        if (!this.ctx2d || !this.canvas) return;
        const ctx = this.ctx2d;
        const W   = this.canvas.width;
        const H   = this.canvas.height;

        ctx.clearRect(0, 0, W, H);

        // Brillo suave bajo el cursor (halo luminoso grande)
        const grad = ctx.createRadialGradient(
            this.mouseX, this.mouseY, 0,
            this.mouseX, this.mouseY, 120
        );
        grad.addColorStop(0,   'rgba(168, 85, 247, 0.08)');
        grad.addColorStop(0.4, 'rgba(99, 102, 241, 0.05)');
        grad.addColorStop(1,   'rgba(6, 182, 212, 0.0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Dibujar y actualizar partículas
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            p.x     += p.vx;
            p.y     += p.vy;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            ctx.save();

            if (p.glow) {
                ctx.shadowBlur  = 10;
                ctx.shadowColor = `${p.color}0.9)`;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `${p.color}${p.alpha.toFixed(2)})`;
            ctx.fill();

            ctx.restore();
        }
    }
}

// Auto-instanciar solo en la página de login (donde exista .login-card)
const loginGlow = new LoginMagicGlow();
