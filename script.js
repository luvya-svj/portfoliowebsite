/* ============================================================
   script.js – Portfolio Interactions
   ============================================================ */

/* ─── 1. Mobile Menu ─────────────────────────────────────── */
const menuBtn = document.getElementById('mobile-menu');
const navLinks = document.getElementById('nav-links');

if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        menuBtn.setAttribute('aria-expanded', isOpen);

        const [b0, b1, b2] = menuBtn.querySelectorAll('.bar');
        if (isOpen) {
            b0.style.transform = 'rotate(45deg) translate(5px, 6px)';
            b1.style.opacity = '0';
            b2.style.transform = 'rotate(-45deg) translate(5px, -6px)';
        } else {
            b0.style.transform = b2.style.transform = '';
            b1.style.opacity = '';
        }
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            menuBtn.setAttribute('aria-expanded', 'false');
            menuBtn.querySelectorAll('.bar').forEach(b => {
                b.style.transform = b.style.opacity = '';
            });
        });
    });
}


/* ─── 2. Header shadow on scroll ────────────────────────── */
const header = document.getElementById('site-header');
const spySections = document.querySelectorAll('section[id]');
const navLinkEls = document.querySelectorAll('.nav-links a');

if (header) {
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
}

// Robust ScrollSpy Logic
if (spySections.length) {
    const onScroll = () => {
        let current = '';
        const scrollY = window.scrollY;
        const headerOffset = header ? header.offsetHeight : 68;

        spySections.forEach(section => {
            const sectionTop = section.offsetTop - headerOffset - 50;
            if (scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        // Ensure bottom section highlights when scrolled to very bottom
        if (window.innerHeight + Math.round(window.scrollY) >= document.body.offsetHeight - 50) {
            current = spySections[spySections.length - 1].getAttribute('id');
        }

        // Drop highlighting at the very top
        if (scrollY < 100) {
            current = '';
        }

        navLinkEls.forEach(link => {
            link.classList.remove('active');
            if (current && link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // Trigger outline on run
    setTimeout(onScroll, 100);
}


/* ─── 3. Scroll-reveal for .reveal elements ─────────────── */
const revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && revealEls.length) {
    const revealIO = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealIO.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -48px 0px'
    });

    revealEls.forEach(el => revealIO.observe(el));
} else {
    revealEls.forEach(el => el.classList.add('visible'));
}


/* ─── 4. Stagger children — .anim-stagger containers ───── */
/*
   When a container with .anim-stagger enters the viewport,
   JS assigns increasing transitionDelay to each child, then
   adds .stagger-visible to trigger their CSS transitions.
*/
const staggerContainers = document.querySelectorAll('.anim-stagger');

if ('IntersectionObserver' in window && staggerContainers.length) {
    const STAGGER_MS = 80; // ms between each child

    const staggerIO = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const children = Array.from(entry.target.children);
            children.forEach((child, i) => {
                child.style.transitionDelay = `${i * STAGGER_MS}ms`;
            });
            entry.target.classList.add('stagger-visible');
            staggerIO.unobserve(entry.target);
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -32px 0px'
    });

    staggerContainers.forEach(container => staggerIO.observe(container));
} else {
    // Graceful fallback — make everything visible immediately
    staggerContainers.forEach(container => container.classList.add('stagger-visible'));
}


/* ─── 5. Smooth scroll with header offset ────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();

        const offset = header ? header.offsetHeight : 68;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    });
});


/* ─── 7. Mouse-Following Glow Logic ─────────────────────── */
const glowEl = document.getElementById('cursor-glow');

if (glowEl) {
    window.addEventListener('mousemove', (e) => {
        glowEl.style.setProperty('--mouse-x', `${e.clientX}px`);
        glowEl.style.setProperty('--mouse-y', `${e.clientY}px`);
    }, { passive: true });
}


/* ─── 8. Text Scramble Effect ───────────────────────────── */
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
    }

    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }

    update() {
        let output = '';
        let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += `<span class="scramble-char">${char}</span>`;
            } else {
                output += from;
            }
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }

    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    const labelEl = document.getElementById('hero-label');
    const firstEl = document.getElementById('hero-first');
    const lastEl = document.getElementById('hero-last');

    if (labelEl && firstEl && lastEl) {
        const fxLabel = new TextScramble(labelEl);
        const fxFirst = new TextScramble(firstEl);
        const fxLast = new TextScramble(lastEl);

        const labelText = labelEl.innerText;
        const firstText = firstEl.innerText;
        const lastText = lastEl.innerText;

        // Clear initial text to prevent flash (Stable due to CSS min-height)
        labelEl.innerText = '';
        firstEl.innerText = '';
        lastEl.innerText = '';

        setTimeout(() => {
            fxLabel.setText(labelText).then(() => {
                setTimeout(() => {
                    fxFirst.setText(firstText).then(() => {
                        setTimeout(() => fxLast.setText(lastText), 80);
                    });
                }, 200);
            });
        }, 600);
    }
});


/* ─── 9. Project Modal Logic ────────────────────────────── */
const projectData = {
    carbon: {
        number: '01',
        title: 'Carbon Sequestration Research',
        tags: ['Research', 'Environmental Science', 'Data Analysis', 'Conference'],
        illustration: 'carbonseq.jpeg',
        description: 'Evaluated modern carbon sequestration techniques and their environmental and ecological impact. The goal was to analyze various approaches used to capture and store atmospheric carbon while assessing their broader benefits for ecosystems and climate resilience.',
        challenges: 'A comparative research analysis was conducted across eight carbon sequestration strategies — spanning both nature-based solutions and technological approaches. The study synthesized scientific literature and environmental datasets to evaluate improvements in biodiversity, soil health, and water quality. Findings were compiled into a structured research report and presented at an academic conference.',
        results: 'The analysis identified multiple co-benefits of carbon sequestration beyond carbon reduction, including improved biodiversity, enhanced soil fertility, and better water retention in ecosystems. The research contributed to a conference presentation and a formal report summarizing the comparative effectiveness and sustainability implications of all eight approaches.'
    },
    nanoparticles: {
        number: '02',
        title: 'Magnetic Nanoparticles Synthesis Optimization',
        tags: ['Nanotechnology', 'Protocol Design', 'Lab Research'],
        illustration: 'magnetic.jpeg',
        description: 'Focused on improving the efficiency and reproducibility of magnetic nanoparticle synthesis experiments conducted in a laboratory research environment.',
        challenges: 'A standardized experimental protocol was developed to address inconsistencies in nanoparticle synthesis procedures. The approach involved documenting process parameters, refining step-by-step experimental methods, and implementing controlled synthesis conditions to reduce experimental variability.',
        results: 'Implementation of the standardized synthesis protocols resulted in a 15% reduction in repeated experiments, improving experimental reliability while reducing resource waste and laboratory time. The improved workflow also enhanced consistency across the research team\'s experimental outputs.'
    },
    tame: {
        number: '03',
        title: 'Manufacture of TAME Process Design',
        tags: ['Published · IJARESM', 'Process Design', 'Sustainability', 'Fuel Additives'],
        illustration: 'tame-process.jpeg',
        description: 'Explored the design and optimization of a sustainable manufacturing process for TAME (Tertiary Amyl Methyl Ether), a fuel additive used to improve gasoline combustion efficiency.',
        challenges: 'Designed a conceptual process flow for TAME production while analyzing chemical reaction pathways and process conditions. Engineering design principles and process engineering methodologies were applied to evaluate efficiency, sustainability considerations, and industrial feasibility.',
        results: 'Published in the International Journal of All Research Education and Scientific Methods (IJARESM), Volume 12, Issue 10, October 2024. The paper proposed improvements to the TAME manufacturing process aimed at increasing sustainability and process efficiency.'
    },
    flare: {
        number: '04',
        title: 'Flare System Design & Simulation',
        tags: ['Simulation', 'Process Engineering', 'Journal Submission', 'Safety Systems'],
        illustration: 'flaretower.jpeg',
        description: 'Designed and analyzed an industrial flare system used in chemical processing plants for the safe disposal of excess gases.',
        challenges: 'Engineering design calculations and simulation techniques were used to develop a flare tower configuration capable of safely handling process gases under different operational scenarios. The design process incorporated chemical engineering safety standards, thermodynamic considerations, and simulation-based validation.',
        results: 'Produced a comprehensive engineering paper detailing the flare system design and simulation outcomes. Achieved first-author status for submission to a high-impact academic journal, demonstrating the design\'s technical viability and safety performance.'
    },
    ecobox: {
        number: '05',
        title: 'EcoBox – AI-Driven Food Waste Reduction',
        tags: ['AI', 'Sustainability', 'Mobile App', 'UMass Amherst'],
        illustration: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000',
        description: 'Developed EcoBox, a sustainability-focused platform that connects restaurants, dining halls, and grocery stores with consumers to redistribute surplus food through discounted meals. The project addresses food waste and food affordability by combining a consumer mobile app with AI-enabled surplus prediction for businesses.',
        challenges: 'Integrating real-time surplus inventory data with predictive AI models while maintaining a low-friction interface for busy restaurant staff.',
        results: 'Designed a dual-end solution that effectively reduces industrial food waste and provides affordable meal options for students and the community.'
    },
    poker: {
        number: '06',
        title: 'Poker Hand Outcome Prediction',
        tags: ['Analytics', 'Statistics', 'Python', 'UMass Amherst'],
        illustration: 'https://images.unsplash.com/photo-1541278107931-e006523892df?auto=format&fit=crop&q=80&w=1000',
        description: 'Conducted a descriptive analytics and statistical modeling project analyzing over 1 million simulated poker hands from the UCI Poker Hand dataset to evaluate whether early card combinations can predict high-value outcomes.',
        challenges: 'Managing and performing complex statistical operations on a dataset exceeding 1 million entries to identify non-obvious predictive markers.',
        results: 'Quantified the predictive power of early-game states, demonstrating how big-data analysis can reveal underlying probabilities in complex datasets.'
    }
};

const modal = document.getElementById('project-modal');
const modalClose = modal ? modal.querySelector('.modal-close') : null;
const modalPrev = document.getElementById('modal-prev');
const modalNext = document.getElementById('modal-next');

let currentProjectId = null;
const projectIds = Object.keys(projectData);

function openModal(projectId) {
    const data = projectData[projectId];
    if (!data || !modal) return;

    currentProjectId = projectId;

    document.getElementById('modal-project-number').innerText = data.number;
    document.getElementById('modal-title').innerText = data.title;
    document.getElementById('modal-description').innerText = data.description;
    document.getElementById('modal-challenges').innerText = data.challenges;
    document.getElementById('modal-results').innerText = data.results;

    const tagsContainer = document.getElementById('modal-tags');
    tagsContainer.innerHTML = data.tags.map(tag => `<span>${tag}</span>`).join('');

    const illustrationEl = document.getElementById('modal-illustration');
    if (illustrationEl) {
        illustrationEl.src = data.illustration;
        illustrationEl.alt = `${data.title} Technical Illustration`;
        
        // Ensure image starts at top if scrollable
        illustrationEl.parentElement.scrollTop = 0;
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Reset modal scroll position
    modal.querySelector('.modal-content').scrollTop = 0;
}

function navigateModal(direction) {
    const currentIndex = projectIds.indexOf(currentProjectId);
    let nextIndex = currentIndex + direction;

    // Loop around
    if (nextIndex >= projectIds.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = projectIds.length - 1;

    openModal(projectIds[nextIndex]);
}

function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    currentProjectId = null;
}

document.querySelectorAll('.view-details').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.project));
});

if (modalPrev) modalPrev.addEventListener('click', () => navigateModal(-1));
if (modalNext) modalNext.addEventListener('click', () => navigateModal(1));

if (modalClose) modalClose.addEventListener('click', closeModal);
if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

window.addEventListener('keydown', (e) => {
    if (!modal || !modal.classList.contains('active')) return;

    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') navigateModal(-1);
    if (e.key === 'ArrowRight') navigateModal(1);
});

// Back to Top Button
const backToTopBtn = document.getElementById('back-to-top');

if (backToTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}


/* ─── 10. Contact Form (Formspree) ─────────────────────── */
(function () {
    const form     = document.getElementById('contact-form');
    const submitBtn= document.getElementById('cf-submit');
    const status   = document.getElementById('form-status');

    if (!form) return;

    // ── Replace this with YOUR Formspree endpoint after signing up at formspree.io ──
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

    function setStatus(msg, type) {
        status.textContent = msg;
        status.className = `form-status visible ${type}`;
    }

    function clearStatus() {
        status.textContent = '';
        status.className = 'form-status';
    }

    function validate() {
        let ok = true;
        ['cf-name', 'cf-email', 'cf-message'].forEach(id => {
            const el = document.getElementById(id);
            if (!el.value.trim()) {
                el.classList.add('error');
                ok = false;
            } else {
                el.classList.remove('error');
            }
        });

        const emailEl = document.getElementById('cf-email');
        if (emailEl.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
            emailEl.classList.add('error');
            ok = false;
        }

        return ok;
    }

    // Remove error styling on input
    form.querySelectorAll('input, textarea').forEach(el => {
        el.addEventListener('input', () => el.classList.remove('error'));
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearStatus();

        if (!validate()) {
            setStatus('Please fill in all fields correctly.', 'error');
            return;
        }

        // Loading state
        submitBtn.classList.add('loading');

        try {
            const response = await fetch(FORMSPREE_ENDPOINT, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: new FormData(form)
            });

            if (response.ok) {
                setStatus('✓ Message sent! I\'ll get back to you soon.', 'success');
                form.reset();
            } else {
                const data = await response.json().catch(() => ({}));
                const msg = (data.errors || []).map(e => e.message).join(', ') || 'Something went wrong. Please try again.';
                setStatus(msg, 'error');
            }
        } catch {
            setStatus('Network error. Please check your connection and try again.', 'error');
        } finally {
            submitBtn.classList.remove('loading');
        }
    });
})();
