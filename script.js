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
    const titleEl = document.getElementById('hero-title');

    if (labelEl && titleEl) {
        const fxLabel = new TextScramble(labelEl);
        const fxTitle = new TextScramble(titleEl);

        const labelText = labelEl.innerText;
        const titleText = titleEl.innerText;

        // Clear initial text to prevent flash (Stable due to CSS min-height)
        labelEl.innerText = '';
        titleEl.innerText = '';

        setTimeout(() => {
            fxLabel.setText(labelText).then(() => {
                setTimeout(() => fxTitle.setText(titleText), 200);
            });
        }, 600);
    }
});


/* ─── 9. Project Modal Logic ────────────────────────────── */
const projectData = {
    carbon: {
        number: '01',
        title: 'Carbon Sequestration Research',
        tags: ['Research', 'Environmental Science', 'Data Analysis'],
        illustration: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=1000',
        description: 'Researched 8+ carbon sequestration techniques, integrating data on improvements such as increased biodiversity, enhanced water quality, and healthier soil.',
        challenges: 'Analyzing vast datasets across 8+ techniques and cross-referencing environmental impact metrics with long-term ecosystem stability.',
        results: 'Integrated multi-domain environmental data into a comprehensive report presented at a major conference, contributing to local sustainability initiatives.'
    },
    nanoparticles: {
        number: '02',
        title: 'Magnetic Nanoparticles Synthesis',
        tags: ['Nanotechnology', 'Protocol Design', 'Lab Research'],
        illustration: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=1000',
        description: 'Drove a 15% reduction in experiment repetitions through detailed, standardized synthesis protocols, ensuring consistent results.',
        challenges: 'Addressing significant inconsistencies in manual synthesis protocols which were leading to wasted resources and time across the research team.',
        results: 'Established new standardized protocols that reduced experiment repetitions by 15% and improved inter-team data reliability.'
    },
    tame: {
        number: '03',
        title: 'Manufacture of TAME Process',
        tags: ['Published · IJARESM', 'Process Design', 'Sustainability'],
        illustration: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1000',
        description: 'Authored and published a research paper in IJARESM (Vol. 12) detailing a novel process design for sustainable TAME manufacturing.',
        challenges: 'Balancing rigorous industrial yield requirements with aggressive sustainability and environmental impact targets in a theoretical process design.',
        results: 'Successfully published findings in IJARESM; proposed a novel, optimized design that improves resource efficiency for TAME manufacturing.'
    },
    flare: {
        number: '04',
        title: 'Design of Flare System',
        tags: ['Simulation', 'Process Engineering', 'Journal Submission'],
        illustration: 'flare_tower.png',
        description: 'Authored a comprehensive research paper on flare tower design and simulation results, achieving first-author status.',
        challenges: 'Ensuring strict safety compliance while maximizing simulation accuracy for complex flare tower fluid dynamics and thermal behavior.',
        results: 'Achieved first-author status for a research paper submitted to a high-impact engineering journal, scheduled for publication by 2025.'
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

function openModal(projectId) {
    const data = projectData[projectId];
    if (!data || !modal) return;

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
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

document.querySelectorAll('.view-details').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.project));
});

if (modalClose) modalClose.addEventListener('click', closeModal);
if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
        closeModal();
    }
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


