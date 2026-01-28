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
    featureFrames.forEach(frame => {
        observer.observe(frame);
    });
});
