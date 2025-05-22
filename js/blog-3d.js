/**
 * blog-3d.js - Efeitos 3D e animações para o blog
 * IAutomatize - Blog 3D
 */

class Blog3DManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = [];
        this.init();
    }

    init() {
        // Aguardar carregamento do DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.setupHero3D();
        this.setupAnimations();
        this.setupFloatingElements();
        this.setupParticles();
        this.setupEnhancedHovers();
        this.setupScrollEffects();
        
        console.log('🎨 Blog 3D Manager inicializado!');
    }

    // Configurar Hero 3D com Three.js
    setupHero3D() {
        const heroSection = document.querySelector('.blog-hero');
        if (!heroSection) return;

        // Criar canvas
        const canvas = document.createElement('canvas');
        canvas.id = 'hero-3d-canvas';
        heroSection.appendChild(canvas);

        // Configurar Three.js
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
        
        this.renderer.setSize(window.innerWidth, heroSection.offsetHeight);
        this.renderer.setClearColor(0x000000, 0);

        // Criar partículas 3D
        this.createParticles3D();
        
        // Posicionar câmera
        this.camera.position.z = 5;

        // Iniciar loop de animação
        this.animate3D();

        // Responsividade
        window.addEventListener('resize', () => this.onWindowResize());
    }

    createParticles3D() {
        const particleCount = 100;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            // Posições aleatórias
            positions[i * 3] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

            // Cores (roxo da marca)
            colors[i * 3] = 0.35;     // R
            colors[i * 3 + 1] = 0.17; // G
            colors[i * 3 + 2] = 0.63; // B
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    animate3D() {
        requestAnimationFrame(() => this.animate3D());

        if (this.particles) {
            this.particles.rotation.x += 0.001;
            this.particles.rotation.y += 0.002;
        }

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        const heroSection = document.querySelector('.blog-hero');
        if (!heroSection) return;

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, heroSection.offsetHeight);
    }

    // Configurar animações AOS
    setupAnimations() {
        // Inicializar AOS
        AOS.init({
            duration: 800,
            once: true,
            offset: 100
        });

        // Adicionar atributos AOS aos elementos
        document.querySelectorAll('.blog-card').forEach((card, index) => {
            card.setAttribute('data-aos', 'fade-up');
            card.setAttribute('data-aos-delay', index * 100);
        });

        document.querySelectorAll('.carousel-card').forEach((card, index) => {
            card.setAttribute('data-aos', 'slide-right');
            card.setAttribute('data-aos-delay', index * 150);
        });

        // Efeito typing no título
        const heroTitle = document.querySelector('.blog-hero-content h1');
        if (heroTitle) {
            heroTitle.classList.add('typing-effect');
        }
    }

    // Elementos flutuantes
    setupFloatingElements() {
        const body = document.body;
        const floatingContainer = document.createElement('div');
        floatingContainer.className = 'floating-elements';
        
        for (let i = 0; i < 3; i++) {
            const shape = document.createElement('div');
            shape.className = 'floating-shape';
            floatingContainer.appendChild(shape);
        }
        
        body.appendChild(floatingContainer);
    }

    // Sistema de partículas CSS
    setupParticles() {
        const heroSection = document.querySelector('.blog-hero');
        if (!heroSection) return;

        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles-container';
        heroSection.appendChild(particlesContainer);

        // Criar partículas
        setInterval(() => {
            if (particlesContainer.children.length < 20) {
                this.createParticle(particlesContainer);
            }
        }, 500);
    }

    createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 3 + 5) + 's';
        
        container.appendChild(particle);
        
        // Remover após animação
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 8000);
    }

    // Hovers melhorados
    setupEnhancedHovers() {
        // Adicionar classe aos botões
        document.querySelectorAll('.newsletter-button, .read-more').forEach(btn => {
            btn.classList.add('btn-3d');
        });

        // Adicionar efeito às imagens
        document.querySelectorAll('.blog-image, .carousel-card-content').forEach(element => {
            element.classList.add('enhanced-hover');
        });

        // Efeitos de mouse para cards
        document.querySelectorAll('.blog-card, .carousel-card').forEach(card => {
            card.addEventListener('mouseenter', (e) => {
                this.addCardTilt(e.target);
            });
            
            card.addEventListener('mouseleave', (e) => {
                this.removeCardTilt(e.target);
            });
        });
    }

    addCardTilt(card) {
        if (window.innerWidth <= 768) return; // Não aplicar no mobile
        
        card.style.transition = 'transform 0.3s ease';
        card.addEventListener('mousemove', this.handleCardMouseMove);
    }

    removeCardTilt(card) {
        card.style.transform = '';
        card.removeEventListener('mousemove', this.handleCardMouseMove);
    }

    handleCardMouseMove(e) {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const rotateX = (e.clientY - centerY) / 10;
        const rotateY = (e.clientX - centerX) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
    }

    // Efeitos de scroll
    setupScrollEffects() {
        let ticking = false;
        
        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax-element');
            
            parallaxElements.forEach((element, index) => {
                const speed = (index + 1) * 0.5;
                element.style.transform = `translateY(${scrolled * speed}px)`;
            });
            
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        });

        // Adicionar classe parallax a alguns elementos
        document.querySelectorAll('.floating-shape').forEach(shape => {
            shape.classList.add('parallax-element');
        });
    }

    // Animações de entrada baseadas no scroll
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, observerOptions);

        // Observar elementos para animação
        document.querySelectorAll('.fade-up, .slide-left, .scale-in').forEach(el => {
            observer.observe(el);
        });
    }

    // Método público para adicionar animações a novos elementos
    animateElement(element, animationType = 'fade-up', delay = 0) {
        element.classList.add(animationType);
        if (delay > 0) {
            setTimeout(() => {
                element.classList.add('animated');
            }, delay);
        } else {
            element.classList.add('animated');
        }
    }
}

// Função para integrar com o blog.js existente
function integrateBlog3D() {
    // Aguardar o BlogManager carregar os artigos
    if (typeof blogManager !== 'undefined') {
        const originalLoadBlogArticles = blogManager.loadBlogArticles;
        
        blogManager.loadBlogArticles = function() {
            return originalLoadBlogArticles.call(this).then(() => {
                // Após carregar artigos, aplicar animações
                setTimeout(() => {
                    if (window.blog3DManager) {
                        window.blog3DManager.setupAnimations();
                    }
                }, 500);
            });
        };
    }
}

// Inicialização global
window.blog3DManager = new Blog3DManager();

// Integrar com o sistema existente
document.addEventListener('DOMContentLoaded', () => {
    integrateBlog3D();
});

// Exportar para uso global
window.Blog3DManager = Blog3DManager;
