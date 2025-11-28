// MediBot Registration JavaScript

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

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    const passwordToggles = document.querySelectorAll('.password-toggle');
    const inputs = {
        username: document.getElementById('username'),
        email: document.getElementById('email'),
        password: document.getElementById('password'),
        confirmPassword: document.getElementById('confirmPassword')
    };

    // Password visibility toggle
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.closest('.input-wrapper').querySelector('input');
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
    });

    // Password strength checker
    function checkPasswordStrength(password) {
        let strength = 0;
        
        if (password.length >= 6) strength++;
        if (password.length >= 10) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        
        return strength;
    }

    function updatePasswordStrength(password) {
        const strengthBar = document.querySelector('.strength-bar');
        const strength = checkPasswordStrength(password);
        
        strengthBar.classList.remove('weak', 'medium', 'strong');
        
        if (strength <= 2) {
            strengthBar.classList.add('weak');
        } else if (strength <= 4) {
            strengthBar.classList.add('medium');
        } else {
            strengthBar.classList.add('strong');
        }
    }

    // Validation functions
    const validators = {
        username: (value) => {
            if (!value.trim()) return 'Username is required';
            if (value.length < 3) return 'Username must be at least 3 characters';
            if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
            return '';
        },
        email: (value) => {
            if (!value) return 'Email is required';
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
            return '';
        },
        password: (value) => {
            if (!value) return 'Password is required';
            if (value.length < 6) return 'Password must be at least 6 characters';
            return '';
        },
        confirmPassword: (value) => {
            if (!value) return 'Please confirm your password';
            if (value !== inputs.password.value) return 'Passwords do not match';
            return '';
        }
    };

    // Real-time validation with animations
    Object.keys(inputs).forEach(field => {
        inputs[field].addEventListener('input', function() {
            validateField(field, this.value);
            
            // Update password strength for password field
            if (field === 'password') {
                updatePasswordStrength(this.value);
            }
            
            // Re-validate confirm password if password changes
            if (field === 'password' && inputs.confirmPassword.value) {
                validateField('confirmPassword', inputs.confirmPassword.value);
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
        const errorMessage = inputGroup.querySelector('.error-message');
        const error = validators[field](value);
        
        if (error) {
            inputGroup.classList.add('error');
            errorMessage.textContent = error;
            
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
    form.addEventListener('submit', async function(e) {
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
        const submitBtn = form.querySelector('.btn-register');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnIcon = submitBtn.querySelector('.btn-icon');
        
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');

        // Animate button
        gsap.to(submitBtn, {
            scale: 0.95,
            duration: 0.1,
            yoyo: true,
            repeat: 1
        });

        try {
            // Submit the form (this will be handled by Flask)
            form.submit();
            
            // Note: The code below won't execute after form.submit()
            // but keeping it for reference if you want to use AJAX instead
            
        } catch (error) {
            console.error('Registration error:', error);
            
            // Show error message
            alert('Registration failed. Please try again.');
            
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
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

    // Auto-focus first input with animation
    setTimeout(() => {
        inputs.username.focus();
        gsap.from(inputs.username, {
            scale: 1.05,
            duration: 0.3,
            ease: "back.out(1.7)"
        });
    }, 500);

    console.log('MediBot Registration initialized successfully!');
});