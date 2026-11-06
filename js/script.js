// La Maison — lightweight, dependency-free interactions.
document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const menuButton = document.querySelector('.hamburger-menu');
  const nav = document.querySelector('.nav-links');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('active');
      menuButton.classList.toggle('active', open);
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('active'); menuButton.classList.remove('active');
      menuButton.setAttribute('aria-expanded', 'false');
    }));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') { nav.classList.remove('active'); menuButton.classList.remove('active'); menuButton.setAttribute('aria-expanded', 'false'); }
    });
  }

  // Category navigation on the menu page.
  const tabs = [...document.querySelectorAll('.menu-tab')];
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(item => { item.classList.toggle('active', item === tab); item.setAttribute('aria-selected', String(item === tab)); });
    document.querySelectorAll('.menu-category').forEach(section => section.classList.toggle('active', section.id === tab.dataset.tab));
  }));

  // Gallery filters remain usable without the optional lightbox library.
  const filters = document.querySelectorAll('.filter-btn');
  filters.forEach(button => button.addEventListener('click', () => {
    filters.forEach(item => item.classList.toggle('active', item === button));
    document.querySelectorAll('.gallery-item').forEach(item => {
      item.hidden = button.dataset.filter !== 'all' && !item.classList.contains(button.dataset.filter);
    });
  }));

  const gallery = document.querySelector('#lightgallery');
  if (gallery && window.lightGallery) window.lightGallery(gallery, { selector: '.gallery-item', download: false });

  // Set the earliest bookable date to today.
  const dateField = document.querySelector('input[type="date"]');
  if (dateField) dateField.min = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  const reservationForm = document.querySelector('#reservationForm');
  if (reservationForm) reservationForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!reservationForm.reportValidity()) return;
    const data = new FormData(reservationForm);
    const status = reservationForm.querySelector('.form-status');
    const subject = encodeURIComponent(`Reservation request — ${data.get('date')}`);
    const message = encodeURIComponent(`Hello La Maison,\n\nI would like to request a table.\nName: ${data.get('name')}\nEmail: ${data.get('email')}\nPhone: ${data.get('phone') || 'Not provided'}\nGuests: ${data.get('guests')}\nDate: ${data.get('date')}\nTime: ${data.get('time')}\nNotes: ${data.get('notes') || 'None'}\n\nPlease let me know if this is available.`);
    status.textContent = 'Your email app is opening with the request. Your booking is not confirmed until our team replies.';
    window.location.href = `mailto:bonjour@lamaison.paris?subject=${subject}&body=${message}`;
  });

  // Contact form opens a prepared email, making the static site honest and useful without pretending to have a server.
  const contactForm = document.querySelector('#contactForm');
  if (contactForm) contactForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    const data = new FormData(contactForm);
    const bodyText = [...data.entries()].map(([key, value]) => `${key}: ${value}`).join('\n');
    const status = document.createElement('p');
    status.className = 'form-status'; status.setAttribute('role', 'status');
    status.textContent = 'Your email app is opening with your message. We look forward to hearing from you.';
    contactForm.querySelector('.form-status')?.remove(); contactForm.append(status);
    window.location.href = `mailto:bonjour@lamaison.paris?subject=${encodeURIComponent(data.get('subject') || 'Website enquiry')}&body=${encodeURIComponent(bodyText)}`;
  });

  document.querySelectorAll('.newsletter-form').forEach(form => form.addEventListener('submit', event => {
    event.preventDefault();
    const email = form.querySelector('input[type="email"]');
    if (!email || !email.reportValidity()) return;
    const status = document.createElement('p'); status.className = 'newsletter-status'; status.setAttribute('role', 'status');
    status.textContent = 'Thank you — please email us to join our occasional notes from the kitchen.';
    form.after(status); form.reset();
  }));

});
