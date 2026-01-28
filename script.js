document.addEventListener('DOMContentLoaded', () => {
    console.log('IAutomatize site loaded');

    // Scroll Animation Logic
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    }, observerOptions);

    const featureFrames = document.querySelectorAll('.feature-frame');
    const ctaBtn = document.getElementById('cta-button');
    
    featureFrames.forEach(frame => {
        observer.observe(frame);
    });

    if (ctaBtn) observer.observe(ctaBtn);

    // Redirection CTA Logic
    const ctaButton = document.getElementById('cta-button');
    const overlay = document.getElementById('redirection-overlay');
    const textContainer = document.getElementById('redirection-text');
    const whatsappUrl = 'https://wa.me/5515991716525';

    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            const words = ["Estou", "te", "redirecionando", "para", "o", "meu", "contato"];
            
            // Clear container
            textContainer.innerHTML = '';
            
            // Show overlay
            overlay.classList.remove('hidden');
            setTimeout(() => overlay.classList.add('active'), 10);

            // Sequential word reveal
            words.forEach((word, index) => {
                const span = document.createElement('span');
                span.textContent = word;
                span.style.animationDelay = `${index * 0.1}s`;
                textContainer.appendChild(span);
            });

            // Redirect after all words + 3s (to give time to read)
            const finishAnimation = (words.length * 100) + 500;
            setTimeout(() => {
                window.location.href = whatsappUrl;
            }, finishAnimation + 3000); 
        });
    }
});
