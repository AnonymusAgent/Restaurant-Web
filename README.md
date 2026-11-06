# La Maison Paris — Restaurant Website

A responsive, multi-page restaurant website concept for **La Maison**, a fictional Parisian French dining room. Built with plain HTML, CSS and JavaScript; there is no build step or framework dependency.

## Pages

- `index.html` — restaurant overview, signature dishes, guest notes and experience links
- `menu.html` — food and wine menus with category tabs
- `about.html` — restaurant story and culinary philosophy
- `gallery.html` — food, dining room and event gallery with category filters
- `events.html` — chef's table, tasting and special-event information
- `private-dining.html` — private salon and group dining information
- `reservations.html` — date, party-size and time request form
- `contact.html` — contact details, opening hours, map and enquiry form

## Run locally

Open `index.html` in a browser, or serve the folder locally (recommended so all relative assets load consistently):

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Features

- Mobile navigation and layouts, accessible skip links, labels and keyboard focus states
- Responsive page layouts and reduced-motion support
- Menu category tabs, gallery category filters and text-size / contrast controls
- Reservation and contact forms use the visitor's email application (`mailto:`); a message is **not sent** and a reservation is **not confirmed** until the restaurant replies
- Local image assets and an original La Maison wordmark in SVG

## Project structure

```text
.
├── index.html, about.html, menu.html, gallery.html, contact.html
├── events.html, private-dining.html, reservations.html
├── css/
│   ├── style.css
│   └── chef.css
├── js/script.js
└── images/
```

## Before production

This repository is a visual/demo concept: the restaurant, address, menu, reviews, chef bio and contact details are illustrative and must be replaced with verified business information. The static forms do not have a backend; connect a reservation/contact service before accepting real bookings. Review and replace supplied photography with assets for which you have the appropriate rights. External Google Fonts, Font Awesome and the optional gallery lightbox require an internet connection; the core pages and local imagery work without those enhancements.
