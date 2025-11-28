// MediBot Professional JavaScript with Backend Integration - FIXED

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    console.log('MediBot script loaded');
    
    // GSAP Animations
    gsap.from(".navbar", {
        y: -100,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    });

    gsap.from(".hero-badge", {
        opacity: 0,
        scale: 0.5,
        duration: 0.8,
        delay: 0.3,
        ease: "back.out(1.7)"
    });

    gsap.from(".hero-title", {
        opacity: 0,
        y: 50,
        duration: 1,
        delay: 0.5,
        ease: "power3.out"
    });

    gsap.from(".hero-description", {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 0.7,
        ease: "power3.out"
    });

    gsap.from(".hero-actions .btn", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 0.9,
        stagger: 0.2,
        ease: "power3.out"
    });

    gsap.from(".stat-item", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 1.2,
        stagger: 0.15,
        ease: "power3.out"
    });

    gsap.from(".hero-image img", {
        opacity: 0,
        scale: 0.8,
        duration: 1.2,
        delay: 0.5,
        ease: "power3.out"
    });

    gsap.from(".floating-card", {
        opacity: 0,
        scale: 0,
        duration: 0.8,
        delay: 1.5,
        stagger: 0.3,
        ease: "back.out(1.7)"
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Navigation link hover effects
    document.querySelectorAll(".nav-link:not(.cta-btn)").forEach(link => {
        link.addEventListener("mouseenter", () => {
            gsap.to(link, {
                y: -2,
                duration: 0.3,
                ease: "power2.out"
            });
        });
        
        link.addEventListener("mouseleave", () => {
            gsap.to(link, {
                y: 0,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    });

    // Navbar scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        const navbar = document.querySelector('.navbar');
        
        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });

    // ==========================================
    // CHATBOT FUNCTIONALITY WITH BACKEND - FIXED
    // ==========================================
    const chatbotToggler = document.querySelector(".chatbot-toggler");
    const closeBtn = document.querySelector(".close-btn");
    const chatbot = document.querySelector(".chatbot");
    const chatbox = document.querySelector(".chatbox");
    const chatInput = document.querySelector(".chat-input textarea");
    const sendChatBtn = document.querySelector("#send-btn");

    // Debug: Check if elements exist
    console.log('Chatbot elements:', {
        toggler: !!chatbotToggler,
        closeBtn: !!closeBtn,
        chatbot: !!chatbot,
        chatbox: !!chatbox,
        chatInput: !!chatInput,
        sendBtn: !!sendChatBtn
    });

    if (!chatbotToggler || !closeBtn || !chatbot || !chatbox || !chatInput || !sendChatBtn) {
        console.error('Chatbot elements not found!');
        console.error('Missing elements:', {
            toggler: !chatbotToggler,
            closeBtn: !closeBtn,
            chatbot: !chatbot,
            chatbox: !chatbox,
            chatInput: !chatInput,
            sendBtn: !sendChatBtn
        });
        return;
    }

    let userMessage = null;
    let chatStatus = {
        isLoggedIn: false
    };

    // Initialize chat status on page load
    const initializeChatStatus = async () => {
        try {
            const response = await fetch('/chat/status');
            const data = await response.json();
            
            chatStatus.isLoggedIn = data.is_logged_in;
            
            updateChatHeader();
            console.log('Chat status initialized:', chatStatus);
        } catch (error) {
            console.error('Error fetching chat status:', error);
        }
    };

    // Update chat header with status
    const updateChatHeader = () => {
        const chatHeader = document.querySelector('.chatbot-header h2');
        
        if (!chatHeader) return;
        
        if (chatStatus.isLoggedIn) {
            chatHeader.innerHTML = `MediBot Assistant <span style="font-size: 0.75rem; font-weight: 400; opacity: 0.9;">(Full Access)</span>`;
        } else {
            chatHeader.innerHTML = `MediBot Assistant <span style="font-size: 0.75rem; font-weight: 400; opacity: 0.9;">(Limited Mode)</span>`;
        }
    };

    // Create chat message element
    const createChatLi = (message, className) => {
        const chatLi = document.createElement("li");
        chatLi.classList.add("chat", className);
        let chatContent = className === "outgoing" 
            ? `<p></p>` 
            : `<span class="material-symbols-outlined">health_and_safety</span><p></p>`;
        chatLi.innerHTML = chatContent;
        chatLi.querySelector("p").textContent = message;
        return chatLi;
    }

    // Show login prompt modal with custom message
    const showLoginPrompt = (message = null) => {
        // Remove existing modal if any
        const existingModal = document.querySelector('.chat-modal-overlay');
        if (existingModal) {
            existingModal.remove();
        }

        const defaultMessage = "Sign up or login to access all features including detailed consultations, appointment booking, and hospital finder!";
        const displayMessage = message || defaultMessage;

        const modal = document.createElement('div');
        modal.className = 'chat-modal-overlay';
        modal.innerHTML = `
            <div class="chat-modal">
                <div class="chat-modal-content">
                    <span class="material-symbols-outlined" style="font-size: 3rem; color: var(--primary-color);">lock</span>
                    <h3>Login Required</h3>
                    <p>${displayMessage}</p>
                    <div class="chat-modal-buttons">
                        <a href="/register" class="modal-btn btn-primary">Sign Up Now</a>
                        <a href="/login" class="modal-btn btn-secondary">Login</a>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Animate modal appearance
        gsap.from('.chat-modal', {
            scale: 0,
            duration: 0.3,
            ease: "back.out(1.7)"
        });

        // Close modal on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    };

    // Send message to backend
    const generateResponse = async (chatElement) => {
        const messageElement = chatElement.querySelector("p");
        
        // If not logged in, provide limited response with login prompt
        if (!chatStatus.isLoggedIn) {
            const query = userMessage.toLowerCase();
            
            // Check if asking for appointments or hospital finding
            if (query.includes('appointment') || query.includes('book') || 
                query.includes('hospital') || query.includes('doctor') || 
                query.includes('clinic') || query.includes('find') || 
                query.includes('nearby') || query.includes('location')) {
                
                messageElement.textContent = "🏥 To book appointments or find nearby hospitals, please login or sign up for full access to our services.";
                chatbox.scrollTo(0, chatbox.scrollHeight);
                
                setTimeout(() => {
                    showLoginPrompt("Access appointment booking and hospital finder by creating a free account!");
                }, 1000);
                return;
            }
            
            // For symptom-based queries, provide high-level advice
            if (query.includes('symptom') || query.includes('pain') || 
                query.includes('fever') || query.includes('headache') || 
                query.includes('cough') || query.includes('cold') || 
                query.includes('feel') || query.includes('sick') ||
                query.includes('hurt') || query.includes('ache')) {
                
                messageElement.textContent = "💡 High-Level Health Tips:\n\n• Stay hydrated - drink plenty of water\n• Get adequate rest (7-8 hours)\n• Maintain a balanced diet\n• Practice good hygiene\n• Monitor your symptoms\n\n⚠️ For detailed medical consultation, diagnosis, and personalized treatment plans, please login or sign up!";
                chatbox.scrollTo(0, chatbox.scrollHeight);
                
                setTimeout(() => {
                    const promptLi = createChatLi(
                        "👉 Login now to get: detailed diagnosis, personalized treatment plans, medication guidance, and direct doctor consultations!",
                        "incoming"
                    );
                    chatbox.appendChild(promptLi);
                    chatbox.scrollTo(0, chatbox.scrollHeight);
                }, 1500);
                
                return;
            }
            
            // For general health queries
            messageElement.textContent = "I can provide basic health information in limited mode. For detailed consultations, personalized advice, appointment booking, and finding nearby hospitals, please login or sign up! 🔐";
            chatbox.scrollTo(0, chatbox.scrollHeight);
            
            setTimeout(() => {
                showLoginPrompt();
            }, 2000);
            
            return;
        }
        
        // If logged in, proceed with full backend integration
        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: userMessage })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                messageElement.textContent = data.response;
                chatbox.scrollTo(0, chatbox.scrollHeight);
            } else {
                messageElement.textContent = "Sorry, I encountered an error. Please try again.";
            }
            
        } catch (error) {
            console.error('Error sending message:', error);
            messageElement.textContent = "Connection error. Please check your internet and try again.";
        }
    };

    // Handle chat submission
    const handleChat = () => {
        userMessage = chatInput.value.trim();
        if (!userMessage) return;

        chatInput.value = "";
        chatInput.style.height = "auto";

        // Add user message to chat
        chatbox.appendChild(createChatLi(userMessage, "outgoing"));
        chatbox.scrollTo(0, chatbox.scrollHeight);

        // Show typing indicator and get response
        setTimeout(() => {
            const incomingChatLi = createChatLi("Thinking...", "incoming");
            chatbox.appendChild(incomingChatLi);
            chatbox.scrollTo(0, chatbox.scrollHeight);
            generateResponse(incomingChatLi);
        }, 600);
    }

    // Event listeners for chat input
    chatInput.addEventListener("input", () => {
        chatInput.style.height = "auto";
        chatInput.style.height = `${chatInput.scrollHeight}px`;
    });

    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
            e.preventDefault();
            handleChat();
        }
    });

    sendChatBtn.addEventListener("click", handleChat);

    // FIXED: Close button functionality
    closeBtn.addEventListener("click", () => {
        console.log('Close button clicked');
        chatbot.classList.remove("show");
        
        // Update toggler icon
        const togglerIcons = chatbotToggler.querySelectorAll('.material-symbols-outlined');
        togglerIcons[0].style.display = 'block';
        togglerIcons[1].style.display = 'none';
    });

    // FIXED: Chatbot toggler functionality
    chatbotToggler.addEventListener("click", () => {
        console.log('Chatbot toggler clicked');
        
        const isShowing = chatbot.classList.contains("show");
        const togglerIcons = chatbotToggler.querySelectorAll('.material-symbols-outlined');
        
        if (isShowing) {
            // Close chatbot
            chatbot.classList.remove("show");
            togglerIcons[0].style.display = 'block';
            togglerIcons[1].style.display = 'none';
            console.log('Chatbot closed');
        } else {
            // Open chatbot
            chatbot.classList.add("show");
            togglerIcons[0].style.display = 'none';
            togglerIcons[1].style.display = 'block';
            console.log('Chatbot opened');
            
            // Animate chatbot appearance
            gsap.from(chatbot, {
                scale: 0,
                duration: 0.3,
                ease: "back.out(1.7)"
            });
        }
    });

    // Initialize chat status when page loads
    initializeChatStatus();

    // Button hover effects
    document.querySelectorAll(".btn").forEach(button => {
        button.addEventListener("mouseenter", function() {
            gsap.to(this, {
                scale: 1.05,
                duration: 0.3,
                ease: "power2.out"
            });
        });
        
        button.addEventListener("mouseleave", function() {
            gsap.to(this, {
                scale: 1,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    });

    // Stats counter animation (when in viewport)
    const animateStats = () => {
        const stats = document.querySelectorAll('.stat-number');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const text = target.textContent;
                    const hasPlus = text.includes('+');
                    const hasPercent = text.includes('%');
                    const num = parseInt(text.replace(/\D/g, ''));
                    
                    let counter = { value: 0 };
                    gsap.to(counter, {
                        value: num,
                        duration: 2,
                        ease: "power2.out",
                        onUpdate: function() {
                            let suffix = hasPlus ? '+' : (hasPercent ? '%' : '');
                            if (text === '24/7') {
                                target.textContent = '24/7';
                            } else {
                                target.textContent = Math.floor(counter.value) + (num > 1000 ? 'K' : '') + suffix;
                            }
                        }
                    });
                    
                    observer.unobserve(target);
                }
            });
        }, { threshold: 0.5 });
        
        stats.forEach(stat => observer.observe(stat));
    };

    // Initialize stats animation
    animateStats();

    // Parallax effect for hero image
    window.addEventListener('mousemove', (e) => {
        const heroImage = document.querySelector('.hero-image img');
        if (heroImage && window.innerWidth > 1024) {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 50;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 50;
            
            gsap.to(heroImage, {
                x: xAxis,
                y: yAxis,
                duration: 0.5,
                ease: "power2.out"
            });
        }
    });

    console.log('MediBot initialized successfully with backend integration!');
});