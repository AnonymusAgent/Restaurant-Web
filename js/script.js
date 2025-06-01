// script.js - Enhanced Professional Script
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation
    const hamburger = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links li');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
            
            // Animate nav items
            navItems.forEach((item, index) => {
                if (item.style.animation) {
                    item.style.animation = '';
                } else {
                    item.style.animation = `navItemFade 0.5s ease forwards ${index / 7 + 0.3}s`;
                }
            });
        });
    }

    // Smooth scrolling for all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Close mobile menu if open
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            }
            
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Header scroll effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(26, 26, 26, 0.95)';
            header.style.padding = '0.3rem 0';
        } else {
            header.style.background = 'rgba(26, 26, 26, 0.9)';
            header.style.padding = '0.5rem 0';
        }
    });

    // Form validation for contact page
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simple validation
            const name = this.querySelector('input[type="text"]');
            const email = this.querySelector('input[type="email"]');
            const message = this.querySelector('textarea');
            let isValid = true;
            
            // Clear previous errors
            document.querySelectorAll('.error').forEach(el => el.remove());
            
            if (!name.value.trim()) {
                showError(name, 'Please enter your name');
                isValid = false;
            }
            
            if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
                showError(email, 'Please enter a valid email');
                isValid = false;
            }
            
            if (!message.value.trim()) {
                showError(message, 'Please enter your message');
                isValid = false;
            }
            
            if (isValid) {
                // Simulate form submission
                const submitBtn = this.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';
                
                setTimeout(() => {
                    showSuccessMessage();
                    this.reset();
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Send';
                }, 1500);
            }
        });
    }
    
    function showError(input, message) {
        const error = document.createElement('div');
        error.className = 'error';
        error.textContent = message;
        error.style.color = 'var(--primary)';
        error.style.fontSize = '0.8rem';
        error.style.marginTop = '0.3rem';
        input.parentNode.appendChild(error);
    }
    
    function showSuccessMessage() {
        const success = document.createElement('div');
        success.className = 'success-message';
        success.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>Your message has been sent successfully!</span>
        `;
        success.style.display = 'flex';
        success.style.alignItems = 'center';
        success.style.gap = '0.5rem';
        success.style.padding = '1rem';
        success.style.background = 'rgba(0, 200, 0, 0.1)';
        success.style.border = '1px solid rgba(0, 200, 0, 0.3)';
        success.style.borderRadius = '4px';
        success.style.marginBottom = '1rem';
        success.style.color = 'green';
        
        const form = document.querySelector('.contact-form form');
        form.prepend(success);
        
        setTimeout(() => {
            success.style.opacity = '0';
            setTimeout(() => success.remove(), 300);
        }, 3000);
    }

    // Add animation to sections when scrolling
    const sections = document.querySelectorAll('.section');
    const observerOptions = {
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.6s ease-out';
        observer.observe(section);
    });
});

// Initialize lightGallery
document.addEventListener('DOMContentLoaded', function() {
            lightGallery(document.getElementById('lightgallery'), {
                selector: '.gallery-item',
                download: false,
                zoom: true,
                thumbnail: true
            });

            // Filter functionality
            const filterButtons = document.querySelectorAll('.filter-btn');
            const galleryItems = document.querySelectorAll('.gallery-item');

            filterButtons.forEach(button => {
                button.addEventListener('click', () => {
                    // Update active button
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');

                    const filterValue = button.getAttribute('data-filter');

                    // Filter items
                    galleryItems.forEach(item => {
                        if (filterValue === 'all' || item.classList.contains(filterValue)) {
                            item.style.display = 'block';
                        } else {
                            item.style.display = 'none';
                        }
                    });
                });
            });
        });

        // Tab functionality
        document.addEventListener('DOMContentLoaded', function() {
            const tabs = document.querySelectorAll('.menu-tab');
            const categories = document.querySelectorAll('.menu-category');

            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    // Remove active class from all tabs and categories
                    tabs.forEach(t => t.classList.remove('active'));
                    categories.forEach(c => c.classList.remove('active'));

                    // Add active class to clicked tab
                    tab.classList.add('active');

                    // Show corresponding category
                    const tabId = tab.getAttribute('data-tab');
                    document.getElementById(tabId).classList.add('active');
                });
            });
        });

        // Text Size Adjustment
document.getElementById('textIncrease').addEventListener('click', function() {
  const body = document.body;
  if (body.classList.contains('text-xlarge')) {
    body.classList.remove('text-xlarge');
    body.classList.add('text-xxlarge');
  } else if (body.classList.contains('text-large')) {
    body.classList.remove('text-large');
    body.classList.add('text-xlarge');
  } else {
    body.classList.add('text-large');
  }
});

document.getElementById('textDecrease').addEventListener('click', function() {
  const body = document.body;
  if (body.classList.contains('text-xxlarge')) {
    body.classList.remove('text-xxlarge');
    body.classList.add('text-xlarge');
  } else if (body.classList.contains('text-xlarge')) {
    body.classList.remove('text-xlarge');
    body.classList.add('text-large');
  } else if (body.classList.contains('text-large')) {
    body.classList.remove('text-large');
  }
});

document.getElementById('textReset').addEventListener('click', function() {
  document.body.classList.remove('text-large', 'text-xlarge', 'text-xxlarge');
});

// Color Inversion
document.getElementById('invertColors').addEventListener('click', function() {
  document.body.classList.toggle('high-contrast');
  
  // Save preference to localStorage
  if (document.body.classList.contains('high-contrast')) {
    localStorage.setItem('highContrast', 'enabled');
  } else {
    localStorage.setItem('highContrast', 'disabled');
  }
});

// Big Cursor
document.getElementById('bigCursor').addEventListener('click', function() {
  document.body.classList.toggle('big-cursor');
  
  // Save preference to localStorage
  if (document.body.classList.contains('big-cursor')) {
    localStorage.setItem('bigCursor', 'enabled');
  } else {
    localStorage.setItem('bigCursor', 'disabled');
  }
});

// Load saved preferences on page load
window.addEventListener('DOMContentLoaded', function() {
  if (localStorage.getItem('highContrast') === 'enabled') {
    document.body.classList.add('high-contrast');
  }
  
  if (localStorage.getItem('bigCursor') === 'enabled') {
    document.body.classList.add('big-cursor');
  }
});