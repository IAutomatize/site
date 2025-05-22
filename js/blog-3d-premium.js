/**
 * Premium 3D Effects Manager - IAutomatize
 * Cinematic visual effects for modern web experience
 */

class PremiumBlog3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.time = 0;
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.createMatrixLoading();
        setTimeout(() => {
            this.setupPremiumHero3D();
            this.setupFloatingOrbs();
            this.setupCyberGrid();
            this.setupDataStreams();
            this.setupGlitchEffects();
            this.setupInteractiveElements();
            this.removeLoading();
            console.log('🚀 Premium 3D Effects Activated!');
        }, 2000);
    }

    createMatrixLoading() {
        const loading = document.createElement('div');
        loading.className = 'matrix-loading';
        loading.innerHTML = `
            <div class="matrix-rain"></div>
            <div style="position: relative; z-index: 10; text-align: center; color: var(--neon-primary);">
                <h2 style="font-size: 2rem; margin-bottom: 20px; text-shadow: 0 0 20px var(--neon-primary);">INICIALIZANDO SISTEMA</h2>
                <div style="font-family: 'Courier New', monospace;">
                    <div>LOADING NEURAL NETWORKS...</div>
                    <div>ACTIVATING AI PROTOCOLS...</div>
                    <div>ESTABLISHING QUANTUM LINK...</div>
                </div>
            </div>
        `;
        document.body.appendChild(loading);

        // Matrix rain effect
        this.createMatrixRain(loading.querySelector('.matrix-rain'));
    }

    createMatrixRain(container) {
        const characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        const columns = Math.floor(window.innerWidth / 20);

        for (let i = 0; i < columns; i++) {
            const column = document.createElement('div');
            column.className = 'matrix-column';
            column.style.left = (i * 20) + 'px';
            column.style.animationDelay = Math.random() * 3 + 's';
            column.style.animationDuration = (Math.random() * 2 + 2) + 's';
            
            let text = '';
            for (let j = 0; j < 20; j++) {
                text += characters.charAt(Math.floor(Math.random() * characters.length)) + '<br>';
            }
            column.innerHTML = text;
            
            container.appendChild(column);
        }
    }

    removeLoading() {
        const loading = document.querySelector('.matrix-loading');
        if (loading) {
            loading.style.opacity = '0';
            setTimeout(() => loading.remove(), 500);
        }
    }

    setupPremiumHero3D() {
        const heroSection = document.querySelector('.blog-hero');
        if (!heroSection) return;

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.id = 'hero-3d-canvas';
        heroSection.appendChild(canvas);

        // Three.js setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas, 
            alpha: true, 
            antialias: true 
        });
        
        this.renderer.setSize(window.innerWidth, heroSection.offsetHeight);
        this.renderer.setClearColor(0x000000, 0);

        // Create premium particle system
        this.createPremiumParticles();
        
        // Create floating geometry
        this.createFloatingGeometry();
        
        // Add lighting
        this.setupLighting();
        
        // Position camera
        this.camera.position.z = 5;

        // Mouse interaction
        this.setupMouseInteraction();

        // Start animation loop
        this.animate3D();

        // Responsive
        window.addEventListener('resize', () => this.onWindowResize());
    }

    createPremiumParticles() {
        const particleCount = 2000;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            // Spread particles in 3D space
            positions[i * 3] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

            // Color variation (purple to cyan)
            const colorIntensity = Math.random();
            colors[i * 3] = 0.5 + colorIntensity * 0.5;     // R
            colors[i * 3 + 1] = 0.3 + colorIntensity * 0.4; // G
            colors[i * 3 + 2] = 0.9 + colorIntensity * 0.1; // B

            // Size variation
            sizes[i] = Math.random() * 3 + 1;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                uniform float time;
                
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    
                    // Animated size based on time and distance
                    float animatedSize = size * (1.0 + sin(time + position.x * 0.1) * 0.3);
                    
                    gl_PointSize = animatedSize * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
                    
                    if (distanceToCenter > 0.5) discard;
                    
                    float alpha = 1.0 - (distanceToCenter * 2.0);
                    alpha = pow(alpha, 2.0);
                    
                    // Neon glow effect
                    vec3 glowColor = vColor + vec3(0.2, 0.2, 0.4) * alpha;
                    
                    gl_FragColor = vec4(glowColor, alpha * 0.8);
                }
            `,
            transparent: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    createFloatingGeometry() {
        // Create floating wireframe geometries
        const geometries = [
            new THREE.OctahedronGeometry(0.5, 0),
            new THREE.TetrahedronGeometry(0.4, 0),
            new THREE.IcosahedronGeometry(0.3, 0)
        ];

        geometries.forEach((geometry, index) => {
            const material = new THREE.MeshBasicMaterial({
                color: index === 0 ? 0x8B5FBF : index === 1 ? 0x00D9FF : 0x9D4EDD,
                wireframe: true,
                transparent: true,
                opacity: 0.6
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8
            );
            mesh.userData = {
                originalPosition: mesh.position.clone(),
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.02,
                    y: (Math.random() - 0.5) * 0.02,
                    z: (Math.random() - 0.5) * 0.02
                }
            };

            this.scene.add(mesh);
        });
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);

        // Point lights
        const light1 = new THREE.PointLight(0x8B5FBF, 1, 100);
        light1.position.set(5, 5, 5);
        this.scene.add(light1);

        const light2 = new THREE.PointLight(0x00D9FF, 1, 100);
        light2.position.set(-5, -5, 5);
        this.scene.add(light2);
    }

    setupMouseInteraction() {
        document.addEventListener('mousemove', (event) => {
            this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        });
    }

    animate3D() {
        requestAnimationFrame(() => this.animate3D());
        
        this.time += 0.01;

        if (this.particles) {
            // Rotate particle system
            this.particles.rotation.x += 0.0005;
            this.particles.rotation.y += 0.001;
            
            // Update shader time
            this.particles.material.uniforms.time.value = this.time;
            
            // Mouse interaction
            this.particles.rotation.x += this.mouseY * 0.0001;
            this.particles.rotation.y += this.mouseX * 0.0001;
        }

        // Animate floating geometries
        this.scene.traverse((object) => {
            if (object.isMesh && object.userData.rotationSpeed) {
                object.rotation.x += object.userData.rotationSpeed.x;
                object.rotation.y += object.userData.rotationSpeed.y;
                object.rotation.z += object.userData.rotationSpeed.z;
                
                // Floating motion
                object.position.y = object.userData.originalPosition.y + Math.sin(this.time + object.position.x) * 0.1;
            }
        });

        this.renderer.render(this.scene, this.camera);
    }

    setupFloatingOrbs() {
        const hero = document.querySelector('.blog-hero');
        if (!hero) return;

        for (let i = 0; i < 4; i++) {
            const orb = document.createElement('div');
            orb.className = 'floating-orb';
            hero.appendChild(orb);
        }
    }

    setupCyberGrid() {
        const grid = document.createElement('div');
        grid.className = 'cyber-grid';
        document.body.appendChild(grid);
    }

    setupDataStreams() {
        const hero = document.querySelector('.blog-hero');
        if (!hero) return;

        const streamContainer = document.createElement('div');
        streamContainer.style.position = 'absolute';
        streamContainer.style.top = '0';
        streamContainer.style.left = '0';
        streamContainer.style.width = '100%';
        streamContainer.style.height = '100%';
        streamContainer.style.zIndex = '2';
        streamContainer.style.pointerEvents = 'none';

        for (let i = 0; i < 5; i++) {
            const stream = document.createElement('div');
            stream.className = 'data-stream';
            streamContainer.appendChild(stream);
        }

        hero.appendChild(streamContainer);
    }

    setupGlitchEffects() {
        const title = document.querySelector('.blog-hero-content h1');
        if (title) {
            title.classList.add('glitch');
            title.setAttribute('data-text', title.textContent);
            
            // Random glitch trigger
            setInterval(() => {
                if (Math.random() > 0.95) {
                    title.style.animation = 'none';
                    setTimeout(() => {
                        title.style.animation = '';
                    }, 100);
                }
            }, 100);
        }
    }

    setupInteractiveElements() {
        // Convert buttons to neon style
        document.querySelectorAll('.newsletter-button, .read-more').forEach(btn => {
            btn.classList.add('btn-neon');
        });

        // Add holographic effect to cards
        document.querySelectorAll('.blog-card, .carousel-card').forEach(card => {
            card.classList.add('holographic');
            
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-20px) rotateX(10deg) rotateY(5deg) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    onWindowResize() {
        const heroSection = document.querySelector('.blog-hero');
        if (!heroSection || !this.camera || !this.renderer) return;

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, heroSection.offsetHeight);
    }
}

// Initialize
window.premiumBlog3D = new PremiumBlog3D();

// Export for global access
window.PremiumBlog3D = PremiumBlog3D;
