/* LÓGICA DE SELECCIÓN DE HÉROE Y REGISTRO - MIS TABLAS 4° BÁSICO */

document.addEventListener('DOMContentLoaded', () => {
    const studentNameInput = document.getElementById('studentNameInput');
    const avatarGrid        = document.getElementById('avatarGrid');
    const btnEnter          = document.getElementById('btnEnter');

    // El avatar comienza como null: el estudiante DEBE elegir uno explícitamente
    let selectedAvatar = null;
    let avatarEverChosen = false; // evitar preselección silenciosa

    // ── HELPERS DE MENSAJES DE ERROR INLINE ─────────────────────────────────
    function getOrCreateErrorMsg(id, insertAfterEl) {
        let el = document.getElementById(id);
        if (!el) {
            el = document.createElement('div');
            el.id = id;
            el.className = 'login-error-msg';
            el.setAttribute('role', 'alert');
            el.setAttribute('aria-live', 'polite');
            insertAfterEl.parentNode.insertBefore(el, insertAfterEl.nextSibling);
        }
        return el;
    }

    function showFieldError(inputEl, msgEl, text) {
        msgEl.textContent = text;
        msgEl.classList.add('visible');
        inputEl.classList.add('input-error');
        inputEl.classList.remove('shake');
        // Fuerza reflow para reiniciar la animación cada vez
        void inputEl.offsetWidth;
        inputEl.classList.add('shake');
    }

    function clearFieldError(inputEl, msgEl) {
        if (msgEl) {
            msgEl.textContent = '';
            msgEl.classList.remove('visible');
        }
        if (inputEl) inputEl.classList.remove('input-error', 'shake');
    }

    function showAvatarError(msgEl, text) {
        msgEl.textContent = text;
        msgEl.classList.add('visible');
        const grid = document.getElementById('avatarGrid');
        if (grid) {
            grid.classList.remove('avatar-grid-shake');
            void grid.offsetWidth;
            grid.classList.add('avatar-grid-shake');
        }
    }

    function clearAvatarError(msgEl) {
        if (msgEl) {
            msgEl.textContent = '';
            msgEl.classList.remove('visible');
        }
        const grid = document.getElementById('avatarGrid');
        if (grid) grid.classList.remove('avatar-grid-shake');
    }

    // Crear mensajes de error al lado de cada campo
    const nameErrMsg   = getOrCreateErrorMsg('nameErrorMsg',   studentNameInput);
    const avatarErrMsg = getOrCreateErrorMsg('avatarErrorMsg', avatarGrid);

    // ── RENDERIZAR AVATARES ──────────────────────────────────────────────────
    function renderHeroAvatars() {
        if (!avatarGrid) return;
        avatarGrid.innerHTML = '';
        AVATARS_LIST.forEach(av => {
            const card = document.createElement('div');
            card.className = `avatar-card ${(av.id === selectedAvatar) ? 'selected' : ''}`;
            card.setAttribute('data-id', av.id);
            card.style.padding = '14px 10px';
            card.innerHTML = `
                <div class="avatar-icon-container" style="width:70px; height:70px; margin:0 auto; display:flex; align-items:center; justify-content:center;">
                    <img src="${av.svg}" alt="${av.name}"
                         style="width:100%; height:100%; object-fit:contain; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.15));"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <span style="display:none; font-size:3rem;">${av.icon}</span>
                </div>
                <div class="avatar-name" style="margin-top:8px; font-size:1.05rem; font-weight:800; color:${av.color};">${av.name}</div>
                <div style="font-size:0.8rem; color:var(--text-muted); margin-top:4px; line-height:1.2;">${av.desc}</div>
            `;

            card.addEventListener('click', () => {
                if (window.audio) audio.playClick();
                selectedAvatar    = av.id;
                avatarEverChosen  = true;
                document.querySelectorAll('.avatar-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                // Limpiar error de avatar al seleccionar uno
                clearAvatarError(avatarErrMsg);
            });

            avatarGrid.appendChild(card);
        });
    }

    renderHeroAvatars();

    // Si el estudiante ya había iniciado sesión antes, restaurar datos
    if (stateMgr.state.studentName) {
        studentNameInput.value = stateMgr.state.studentName;
        if (stateMgr.state.avatar) {
            selectedAvatar   = stateMgr.state.avatar;
            avatarEverChosen = true;
            renderHeroAvatars();
        }
    }

    // Limpiar error de nombre al escribir
    studentNameInput.addEventListener('input', () => {
        if (studentNameInput.value.trim().length > 0) {
            clearFieldError(studentNameInput, nameErrMsg);
        }
    });

    // ── VALIDACIÓN Y ENVÍO ───────────────────────────────────────────────────
    btnEnter.addEventListener('click', () => {
        const name         = studentNameInput.value.trim();
        const noName       = !name || name.length < 2;
        const noAvatar     = !selectedAvatar || !avatarEverChosen;
        let   hasError     = false;

        // Limpiar errores previos
        clearFieldError(studentNameInput, nameErrMsg);
        clearAvatarError(avatarErrMsg);

        // Determinar mensaje(s) de error
        if (noName && noAvatar) {
            showFieldError(studentNameInput, nameErrMsg,
                '¡Ups! Debes ingresar tu nombre y seleccionar un avatar para continuar 🌟');
            showAvatarError(avatarErrMsg,
                '👆 ¡También elige a tu compañero héroe de aventura!');
            hasError = true;
        } else if (noName) {
            const msg = name === '' || name.length === 0
                ? '¡Ups! Debes ingresar tu nombre para continuar ✏️'
                : '😊 El nombre debe tener al menos 2 letras.';
            showFieldError(studentNameInput, nameErrMsg, msg);
            hasError = true;
        } else if (noAvatar) {
            showAvatarError(avatarErrMsg,
                '¡Ups! Debes escoger un avatar para continuar 🦸‍♂️');
            hasError = true;
        }

        if (hasError) {
            // Sonido de error (reutiliza motor existente)
            if (window.audio) {
                try { audio.playWrong(); } catch(e) {}
            }
            if (noName) studentNameInput.focus();
            return;
        }

        // ── Todo correcto: sonido de éxito y redirigir ──────────────────────
        if (window.audio) {
            try { audio.playCorrect ? audio.playCorrect() : audio.playVictory(); } catch(e) {}
        }

        stateMgr.setStudent(name, selectedAvatar);

        document.body.style.opacity    = '0';
        document.body.style.transition = 'opacity 0.4s ease';

        setTimeout(() => {
            window.location.href = 'Sistema/index.html';
        }, 420);
    });

    studentNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') btnEnter.click();
    });
});
