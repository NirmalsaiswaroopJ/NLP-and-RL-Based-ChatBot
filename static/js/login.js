// MediBot Login JavaScript

// GSAP Animations on Load
gsap.from(".logo", {
    y: -50,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out"
});

gsap.from(".badge", {
    scale: 0,
    opacity: 0,
    duration: 0.6,
    delay: 0.2,
    ease: "back.out(1.7)"
});

gsap.from(".quote-title", {
    y: 30,
    opacity: 0,
    duration: 0.8,
    delay: 0.4,
    ease: "power3.out"
});

gsap.from(".quote-description", {
    y: 20,
    opacity: 0,
    duration: 0.8,
    delay: 0.6,
    ease: "power3.out"
});

gsap.from(".feature-item", {
    x: -30,
    opacity: 0,
    duration: 0.6,
    delay: 0.8,
    stagger: 0.1,
    ease: "power3.out"
});

gsap.from(".form-box", {
    x: 30,
    opacity: 0,
    duration: 0.8,
    delay: 0.3,
    ease: "power3.out"
});

gsap.from(".trust-indicators", {
    y: 20,
    opacity: 0,
    duration: 0.8,
    delay: 1,
    ease: "power3.out"
});

// Icon pulse animation
gsap.to(".icon-container", {
    scale: 1.05,
    duration: 1,
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut"
});

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    const passwordToggle = document.querySelector('.password-toggle');
    const inputs = {
        username: document.getElementById('login_username'),
        password: document.getElementById('login_password')
    };
    const errorMessage = document.getElementById('error-message');

    // Password visibility toggle
    if (passwordToggle) {
        passwordToggle.addEventListener('click', function() {
            const input = document.getElementById('login_password');
            const icon = this.querySelector('.material-symbols-outlined');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.textContent = 'visibility_off';
            } else {
                input.type = 'password';
                icon.textContent = 'visibility';
            }

            // Animate icon
            gsap.from(icon, {
                scale: 0,
                duration: 0.3,
                ease: "back.out(1.7)"
            });
        });
    }

    // Validation functions
    const validators = {
        username: (value) => {
            if (!value.trim()) return 'Username is required';
            return '';
        },
        password: (value) => {
            if (!value) return 'Password is required';
            return '';
        }
    };

    // Real-time validation with animations
    Object.keys(inputs).forEach(field => {
        inputs[field].addEventListener('input', function() {
            validateField(field, this.value);
            // Hide error message on input
            if (errorMessage.classList.contains('show')) {
                gsap.to(errorMessage, {
                    opacity: 0,
                    height: 0,
                    duration: 0.3,
                    ease: "power2.out",
                    onComplete: () => {
                        errorMessage.classList.remove('show');
                    }
                });
            }
        });

        // Add focus animations
        inputs[field].addEventListener('focus', function() {
            const wrapper = this.closest('.input-wrapper');
            gsap.to(wrapper, {
                scale: 1.02,
                duration: 0.2,
                ease: "power2.out"
            });
        });

        inputs[field].addEventListener('blur', function() {
            const wrapper = this.closest('.input-wrapper');
            gsap.to(wrapper, {
                scale: 1,
                duration: 0.2,
                ease: "power2.out"
            });
        });
    });

    function validateField(field, value) {
        const inputGroup = inputs[field].parentElement.parentElement;
        const fieldError = inputGroup.querySelector('.field-error');
        const error = validators[field](value);
        
        if (error) {
            inputGroup.classList.add('error');
            fieldError.textContent = error;
            
            // Shake animation for error
            gsap.fromTo(inputGroup, 
                { x: -10 },
                { 
                    x: 0, 
                    duration: 0.1, 
                    repeat: 3, 
                    yoyo: true,
                    ease: "power2.inOut"
                }
            );
        } else {
            inputGroup.classList.remove('error');
            
            // Success animation
            const input = inputs[field];
            gsap.fromTo(input,
                { borderColor: '#10b981' },
                { 
                    borderColor: '#e5e7eb',
                    duration: 1,
                    ease: "power2.out"
                }
            );
        }
        
        return !error;
    }

    // Form submission with animation
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate all fields
        let isValid = true;
        Object.keys(inputs).forEach(field => {
            if (!validateField(field, inputs[field].value)) {
                isValid = false;
            }
        });

        if (!isValid) {
            // Scroll to first error
            const firstError = form.querySelector('.input-group.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Show loading state
        const submitBtn = document.getElementById('login-button');
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');

        // Animate button
        gsap.to(submitBtn, {
            scale: 0.95,
            duration: 0.1,
            yoyo: true,
            repeat: 1
        });

        // Submit the form
        form.submit();
    });

    // Input animation on type
    Object.keys(inputs).forEach(field => {
        inputs[field].addEventListener('input', function() {
            const icon = this.closest('.input-wrapper').querySelector('.input-icon');
            if (icon) {
                gsap.fromTo(icon,
                    { scale: 1.2, color: '#3b82f6' },
                    { 
                        scale: 1, 
                        color: '#9ca3af',
                        duration: 0.3,
                        ease: "back.out(1.7)"
                    }
                );
            }
        });
    });

    // Remember me checkbox animation
    const rememberCheckbox = document.getElementById('remember');
    if (rememberCheckbox) {
        rememberCheckbox.addEventListener('change', function() {
            const checkmark = this.nextElementSibling;
            if (this.checked) {
                gsap.from(checkmark, {
                    scale: 0,
                    duration: 0.3,
                    ease: "back.out(1.7)"
                });
            }
        });
    }

    // Logo hover effect
    const logo = document.querySelector('.logo');
    logo.addEventListener('mouseenter', function() {
        gsap.to(this, {
            scale: 1.1,
            duration: 0.3,
            ease: "back.out(1.7)"
        });
    });

    logo.addEventListener('mouseleave', function() {
        gsap.to(this, {
            scale: 1,
            duration: 0.3,
            ease: "power2.out"
        });
    });

    // Feature items hover animation
    document.querySelectorAll('.feature-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            gsap.to(this, {
                x: 10,
                duration: 0.3,
                ease: "power2.out"
            });
            
            const icon = this.querySelector('.material-symbols-outlined');
            gsap.to(icon, {
                scale: 1.2,
                rotation: 360,
                duration: 0.5,
                ease: "back.out(1.7)"
            });
        });

        item.addEventListener('mouseleave', function() {
            gsap.to(this, {
                x: 0,
                duration: 0.3,
                ease: "power2.out"
            });
            
            const icon = this.querySelector('.material-symbols-outlined');
            gsap.to(icon, {
                scale: 1,
                rotation: 0,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    });

    // Trust indicators animation
    const trustObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const items = entry.target.querySelectorAll('.trust-item');
                gsap.from(items, {
                    scale: 0,
                    opacity: 0,
                    duration: 0.5,
                    stagger: 0.2,
                    ease: "back.out(1.7)"
                });
                trustObserver.unobserve(entry.target);
            }
        });
    });

    const trustIndicators = document.querySelector('.trust-indicators');
    if (trustIndicators) {
        trustObserver.observe(trustIndicators);
    }

    // Parallax effect for background shapes
    document.addEventListener('mousemove', (e) => {
        const shapes = document.querySelectorAll('.shape');
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;

        shapes.forEach((shape, index) => {
            const speed = (index + 1) * 20;
            const x = (mouseX - 0.5) * speed;
            const y = (mouseY - 0.5) * speed;

            gsap.to(shape, {
                x: x,
                y: y,
                duration: 1,
                ease: "power2.out"
            });
        });
    });

    // Check for URL parameters to show error message
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('error') === 'invalid_credentials') {
        errorMessage.classList.add('show');
        gsap.from(errorMessage, {
            opacity: 0,
            y: -20,
            duration: 0.5,
            ease: "power2.out"
        });
    }

    // Forgot password link animation
    const forgotLink = document.querySelector('.forgot-link');
    if (forgotLink) {
        forgotLink.addEventListener('mouseenter', function() {
            gsap.to(this, {
                x: 3,
                duration: 0.2,
                ease: "power2.out"
            });
        });

        forgotLink.addEventListener('mouseleave', function() {
            gsap.to(this, {
                x: 0,
                duration: 0.2,
                ease: "power2.out"
            });
        });
    }

    // Register link animation
    const registerLink = document.querySelector('.register-link');
    if (registerLink) {
        registerLink.addEventListener('mouseenter', function() {
            gsap.to(this, {
                scale: 1.05,
                duration: 0.2,
                ease: "power2.out"
            });
        });

        registerLink.addEventListener('mouseleave', function() {
            gsap.to(this, {
                scale: 1,
                duration: 0.2,
                ease: "power2.out"
            });
        });
    }

    // Auto-focus first input with animation
    setTimeout(() => {
        inputs.username.focus();
        gsap.from(inputs.username, {
            scale: 1.05,
            duration: 0.3,
            ease: "back.out(1.7)"
        });
    }, 500);

    // Enter key submission
    Object.keys(inputs).forEach(field => {
        inputs[field].addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                form.dispatchEvent(new Event('submit'));
            }
        });
    });

    console.log('MediBot Login initialized successfully!');
});