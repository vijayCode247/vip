/* ==========================================================
   VIP Project Marketplace – front-end app (no build step)
   Hash-routed single page: #/  #/projects  #/project/ID
   #/categories  #/upload  #/login  #/register  #/profile  #/about

   NOTE: accounts, uploads, favourites and downloads are kept in
   localStorage so the site works standalone as a demo. Replace the
   `store` calls with real API requests before going live – never
   keep passwords in the browser in production.
   ========================================================== */
'use strict';

/* ---------- helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rupee = n => Number(n) === 0 ? 'Free' : '₹' + Number(n).toLocaleString('en-IN');

const store = {
  get(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ } }
};

let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

/* ---------- icons (24×24 stroke set) ---------- */
const ICONS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  bell: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  heart: '<path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
  home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  upload: '<path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 20h16"/>',
  download: '<path d="M12 4v12"/><path d="m7 11 5 5 5-5"/><path d="M4 20h16"/>',
  settings: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  logout: '<path d="M9 4H5v16h4"/><path d="m16 8 4 4-4 4"/><path d="M20 12H9"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  code: '<path d="m8 8-5 4 5 4"/><path d="m16 8 5 4-5 4"/><path d="m14 5-4 14"/>',
  window: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M7 6.5h.01M10 6.5h.01"/>',
  phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  java: '<path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 10h2a2 2 0 0 1 0 4h-2"/><path d="M8 3c0 2 2 2 0 4M12 3c0 2 2 2 0 4"/>',
  python: '<path d="M12 3c-4 0-4 1.5-4 3v2h4v1H6c-2 0-3 2-3 4s1 4 3 4h1v-2c0-2 1-3 3-3h4c2 0 3-1 3-3V6c0-2-2-3-5-3z"/><path d="M12 21c4 0 4-1.5 4-3v-2h-4v-1h6c2 0 3-2 3-4s-1-4-3-4h-1v2c0 2-1 3-3 3h-4c-2 0-3 1-3 3v3c0 2 2 3 5 3z"/>',
  palette: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/>',
  more: '<circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/>',
  folder: '<path d="M3 6h6l2 2h10v11H3z"/>',
  plane: '<path d="M21 3 3 10l7 3 3 7z"/><path d="m10 13 11-10"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff: '<path d="M3 3l18 18"/><path d="M10.6 6.1A9.8 9.8 0 0 1 12 6c6 0 10 6 10 6a17 17 0 0 1-3.2 3.8M6.3 7.7C3.7 9.5 2 12 2 12s4 7 10 7c1.6 0 3-.4 4.3-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M16.5 14.6c2.7-.3 4.5 1.2 5 4.4"/>',
  shield: '<path d="M12 3 4 6v6c0 4.5 3.4 7.8 8 9 4.6-1.2 8-4.5 8-9V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
  userplus: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M18 8v6M15 11h6"/>',
  cloudup: '<path d="M7 18a4.5 4.5 0 0 1-.6-8.960A6 6 0 0 1 18 9a4 4 0 0 1 0 9"/><path d="m12 20-.01-8M9 14l3-3 3 3"/>'
};
const ic = name => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;

/* ---------- logo ---------- */
let logoN = 0;
function logo() {
  const id = 'vipg' + (++logoN); // unique gradient id per instance, so hidden copies never break visible ones
  return `<svg viewBox="0 0 104 44" role="img" aria-label="VIP – Virtual Intelligent Precision">
  <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0066FF"/><stop offset=".55" stop-color="#1fb8c8"/><stop offset="1" stop-color="#39FF14"/></linearGradient></defs>
  <text x="2" y="36" font-family="Poppins, sans-serif" font-weight="800" font-style="italic" font-size="42" letter-spacing="-3" fill="url(#${id})">VIP</text>
</svg>`;
}

/* ---------- categories & projects ---------- */
const CATS = [
  { name: 'Web Development', short: 'Web Dev', icon: 'window', count: 120 },
  { name: 'Mobile Apps', short: 'Mobile Apps', icon: 'phone', count: 80 },
  { name: 'Java', short: 'Java', icon: 'java', count: 95 },
  { name: 'Python', short: 'Python', icon: 'python', count: 70 },
  { name: 'UI/UX Design', short: 'UI/UX', icon: 'palette', count: 45 },
  { name: 'Others', short: 'Others', icon: 'more', count: 60 }
];
const TOTAL_COUNT = CATS.reduce((a, c) => a + c.count, 0);

const PROJECTS = [
  {
    id: '1', title: 'E-Commerce Website', cat: 'Web Development', tech: ['HTML', 'CSS', 'JavaScript', 'PHP', 'MySQL'],
    rating: 4.8, reviews: 120, price: 499, thumb: 'ecom', demo: '',
    desc: 'This is a fully functional e-commerce website with modern UI. It includes user registration, product listing, cart, payment integration and admin panel.',
    features: ['Responsive Design', 'User Login & Registration', 'Product Management', 'Cart & Checkout', 'Admin Panel']
  },
  {
    id: '2', title: 'Student Management System', cat: 'Web Development', tech: ['PHP', 'MySQL', 'Bootstrap'],
    rating: 4.6, reviews: 98, price: 399, thumb: 'student', demo: '',
    desc: 'Manage students, courses, attendance and results from one dashboard. Ships with role-based access for admins and teachers.',
    features: ['Student & Course Records', 'Attendance Tracking', 'Result Reports', 'Role-based Access', 'Export to CSV']
  },
  {
    id: '3', title: 'Weather App', cat: 'Web Development', tech: ['HTML', 'CSS', 'JavaScript'],
    rating: 4.7, reviews: 75, price: 299, thumb: 'weather', demo: '',
    desc: 'A clean weather app that shows current conditions and a 5-day forecast for any city, with automatic location detection.',
    features: ['Search by City', '5-day Forecast', 'Location Detection', 'Unit Switch (°C / °F)', 'Responsive Layout']
  },
  {
    id: '4', title: 'Portfolio Website', cat: 'Web Development', tech: ['HTML', 'CSS', 'JavaScript'],
    rating: 4.9, reviews: 110, price: 199, thumb: 'portfolio', demo: '',
    desc: 'A modern personal portfolio template with project showcase, skills section, and a working contact form.',
    features: ['Animated Hero', 'Project Gallery', 'Skills Section', 'Contact Form', 'Dark & Light Mode']
  },
  {
    id: '5', title: 'Realtime Chat App', cat: 'Mobile Apps', tech: ['Flutter', 'Firebase'],
    rating: 4.5, reviews: 64, price: 599, thumb: 'chat', demo: '',
    desc: 'One-to-one and group chat with image sharing and push notifications, built with Flutter and Firebase.',
    features: ['Group & Private Chats', 'Image Sharing', 'Push Notifications', 'Online Status', 'Dark Mode']
  },
  {
    id: '6', title: 'Bank Management System', cat: 'Java', tech: ['Java', 'MySQL'],
    rating: 4.4, reviews: 52, price: 349, thumb: 'bank', demo: '',
    desc: 'A desktop banking application covering accounts, deposits, withdrawals, transfers and printable statements.',
    features: ['Account Management', 'Deposits & Withdrawals', 'Fund Transfers', 'Statements', 'Admin Login']
  },
  {
    id: '7', title: 'Sales Data Dashboard', cat: 'Python', tech: ['Python', 'Flask', 'SQLite'],
    rating: 4.7, reviews: 81, price: 449, thumb: 'dashboard', demo: '',
    desc: 'Upload a CSV of sales and get interactive charts, monthly trends and top-product reports in seconds.',
    features: ['CSV Import', 'Interactive Charts', 'Monthly Trends', 'Top Products Report', 'PDF Export']
  },
  {
    id: '8', title: 'Fitness App UI Kit', cat: 'UI/UX Design', tech: ['Figma'],
    rating: 4.9, reviews: 143, price: 0, thumb: 'ui', demo: '',
    desc: 'Forty-plus mobile screens for workout tracking, plans and progress, with reusable components and a style guide.',
    features: ['40+ Screens', 'Reusable Components', 'Style Guide', 'Light & Dark Themes', 'Auto Layout']
  },
  {
    id: '9', title: 'Task Manager', cat: 'Others', tech: ['HTML', 'CSS', 'JavaScript'],
    rating: 4.3, reviews: 39, price: 149, thumb: 'todo', demo: '',
    desc: 'A drag-and-drop task board with due dates, labels and local saving. No backend needed.',
    features: ['Drag & Drop Board', 'Due Dates', 'Labels', 'Saved in Browser', 'Keyboard Shortcuts']
  }
];
const THUMB_BY_CAT = { 'Web Development': 'portfolio', 'Mobile Apps': 'chat', 'Java': 'bank', 'Python': 'dashboard', 'UI/UX Design': 'ui', 'Others': 'todo' };
const TECH_COLORS = {
  HTML: ['#e44d26', 'H5'], CSS: ['#2965f1', 'C3'], JavaScript: ['#f7df1e', 'JS'], PHP: ['#777bb4', 'PHP'], MySQL: ['#00758f', 'SQL'],
  Bootstrap: ['#7952b3', 'B'], Java: ['#f89820', 'J'], Python: ['#3776ab', 'Py'], Flutter: ['#02569b', 'Fl'], Firebase: ['#f5a300', 'Fb'],
  Flask: ['#4b5563', 'Fk'], SQLite: ['#0f80cc', 'SQ'], Figma: ['#a259ff', 'Fg']
};

/* ---------- state ---------- */
let user = store.get('vip_user', null);
let users = store.get('vip_users', []);
let favs = store.get('vip_favs', []);
let uploads = store.get('vip_uploads', []);
let downloads = store.get('vip_dl', []);
const filter = { q: '', cat: 'All' };
let profileTab = 'overview';
let focusSearch = false;

const allProjects = () => [...uploads, ...PROJECTS];
const findProject = id => allProjects().find(p => String(p.id) === String(id));

/* ---------- generated thumbnails (inline SVG, no image files needed) ---------- */
let gid = 0;
function thumb(kind) {
  const id = 'tg' + (++gid);
  const F = 'font-family="Poppins, Inter, sans-serif"';
  const bar = `<rect width="320" height="18" fill="#0d1a40"/><circle cx="10" cy="9" r="2.5" fill="#ff5f56"/><circle cx="19" cy="9" r="2.5" fill="#ffbd2e"/><circle cx="28" cy="9" r="2.5" fill="#27c93f"/><rect x="60" y="5" width="200" height="8" rx="4" fill="#16265a"/>`;
  let body = '';
  switch (kind) {
    case 'ecom':
      body = `<rect y="18" width="320" height="172" fill="#0b1636"/>
        <text x="20" y="62" fill="#fff" font-size="17" font-weight="700" ${F}>Shop Beat</text>
        <text x="20" y="82" fill="#39ff14" font-size="17" font-weight="700" ${F}>Products</text>
        <rect x="20" y="94" width="58" height="16" rx="4" fill="#0066ff"/>
        <path d="M172 88a30 30 0 0 1 60 0" fill="none" stroke="#3d8bff" stroke-width="6" stroke-linecap="round"/>
        <rect x="166" y="84" width="14" height="26" rx="6" fill="#0066ff"/><rect x="224" y="84" width="14" height="26" rx="6" fill="#0066ff"/>
        <circle cx="262" cy="70" r="18" fill="#39ff14" opacity=".2"/>
        ${[0, 1, 2, 3].map(i => `<rect x="${20 + i * 73}" y="130" width="64" height="46" rx="6" fill="#12224f"/><circle cx="${52 + i * 73}" cy="148" r="10" fill="${['#0066ff', '#39ff14', '#3d8bff', '#1fb8c8'][i]}" opacity=".85"/><rect x="${36 + i * 73}" y="164" width="32" height="4" rx="2" fill="#2b3f7c"/>`).join('')}`;
      break;
    case 'student':
      body = `<rect y="18" width="320" height="172" fill="#f4f7fc"/><rect y="18" width="62" height="172" fill="#0f1d45"/>
        ${[0, 1, 2, 3, 4].map(i => `<rect x="10" y="${32 + i * 18}" width="42" height="7" rx="3.5" fill="${i === 0 ? '#0066ff' : '#2b3f7c'}"/>`).join('')}
        ${[0, 1, 2].map(i => `<rect x="${74 + i * 82}" y="30" width="72" height="34" rx="6" fill="#fff" stroke="#dbe3f5"/><rect x="${82 + i * 82}" y="38" width="28" height="6" rx="3" fill="${['#0066ff', '#14a514', '#ffb400'][i]}"/><rect x="${82 + i * 82}" y="50" width="44" height="7" rx="3" fill="#c5d0ec"/>`).join('')}
        <rect x="74" y="76" width="236" height="104" rx="6" fill="#fff" stroke="#dbe3f5"/>
        ${[0, 1, 2, 3, 4].map(i => `<rect x="84" y="${86 + i * 18}" width="90" height="6" rx="3" fill="#c5d0ec"/><rect x="200" y="${86 + i * 18}" width="30" height="6" rx="3" fill="${i % 2 ? '#0066ff' : '#39c41a'}"/><rect x="250" y="${86 + i * 18}" width="40" height="6" rx="3" fill="#dbe3f5"/>`).join('')}`;
      break;
    case 'weather':
      body = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a6cff"/><stop offset="1" stop-color="#5cc4ff"/></linearGradient></defs>
        <rect y="18" width="320" height="172" fill="url(#${id})"/>
        <circle cx="240" cy="76" r="26" fill="#ffd54a"/><circle cx="240" cy="76" r="38" fill="#ffd54a" opacity=".22"/>
        <ellipse cx="205" cy="98" rx="34" ry="14" fill="#fff" opacity=".95"/><ellipse cx="232" cy="92" rx="26" ry="14" fill="#fff"/>
        <text x="24" y="86" fill="#fff" font-size="40" font-weight="700" ${F}>24°</text>
        <text x="26" y="106" fill="#e5f3ff" font-size="11" ${F}>Chennai · Sunny</text>
        ${[0, 1, 2, 3, 4].map(i => `<rect x="${20 + i * 58}" y="130" width="50" height="46" rx="8" fill="#fff" opacity=".2"/><circle cx="${45 + i * 58}" cy="146" r="7" fill="#fff" opacity=".9"/><rect x="${33 + i * 58}" y="160" width="24" height="5" rx="2.5" fill="#fff" opacity=".8"/>`).join('')}`;
      break;
    case 'portfolio':
      body = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0066ff"/><stop offset="1" stop-color="#39ff14"/></linearGradient></defs>
        <rect y="18" width="320" height="172" fill="#08122e"/>
        <text x="22" y="64" fill="#fff" font-size="16" font-weight="700" ${F}>Hi, I'm Alex</text>
        <text x="22" y="82" fill="#39ff14" font-size="11" ${F}>Full-stack developer</text>
        <rect x="22" y="94" width="120" height="5" rx="2.5" fill="#2b3f7c"/><rect x="22" y="106" width="96" height="5" rx="2.5" fill="#2b3f7c"/>
        <rect x="22" y="122" width="54" height="16" rx="4" fill="#39ff14"/>
        <circle cx="240" cy="90" r="42" fill="url(#${id})" opacity=".9"/><circle cx="240" cy="80" r="14" fill="#08122e" opacity=".55"/><path d="M212 122c6-22 50-22 56 0" fill="#08122e" opacity=".55"/>
        ${[0, 1, 2].map(i => `<rect x="${22 + i * 96}" y="152" width="86" height="26" rx="6" fill="#12224f"/><rect x="${32 + i * 96}" y="162" width="${[50, 36, 62][i]}" height="6" rx="3" fill="${['#0066ff', '#39ff14', '#3d8bff'][i]}"/>`).join('')}`;
      break;
    case 'chat':
      body = `<rect y="18" width="320" height="172" fill="#0b1636"/>
        <rect x="20" y="32" width="150" height="26" rx="12" fill="#16265a"/><rect x="30" y="42" width="100" height="6" rx="3" fill="#5b70b3"/>
        <rect x="140" y="66" width="160" height="26" rx="12" fill="#0066ff"/><rect x="150" y="76" width="110" height="6" rx="3" fill="#bcd6ff"/>
        <rect x="20" y="100" width="120" height="26" rx="12" fill="#16265a"/><rect x="30" y="110" width="70" height="6" rx="3" fill="#5b70b3"/>
        <rect x="170" y="134" width="130" height="26" rx="12" fill="#0066ff"/><rect x="180" y="144" width="80" height="6" rx="3" fill="#bcd6ff"/>
        <circle cx="286" cy="34" r="6" fill="#39ff14"/>`;
      break;
    case 'bank':
      body = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0066ff"/><stop offset="1" stop-color="#0a2d80"/></linearGradient></defs>
        <rect y="18" width="320" height="172" fill="#0b1636"/>
        <rect x="22" y="36" width="150" height="90" rx="10" fill="url(#${id})"/><rect x="34" y="50" width="26" height="18" rx="4" fill="#ffd54a"/>
        <rect x="34" y="88" width="100" height="6" rx="3" fill="#bcd6ff"/><rect x="34" y="102" width="60" height="6" rx="3" fill="#7fb2ff"/>
        ${[0, 1, 2, 3, 4].map(i => `<rect x="${196 + i * 22}" y="${118 - [30, 52, 40, 70, 58][i]}" width="14" height="${[30, 52, 40, 70, 58][i]}" rx="3" fill="${i === 3 ? '#39ff14' : '#2f68d8'}"/>`).join('')}
        <rect x="22" y="142" width="276" height="8" rx="4" fill="#16265a"/><rect x="22" y="158" width="200" height="8" rx="4" fill="#16265a"/>`;
      break;
    case 'dashboard':
      body = `<rect y="18" width="320" height="172" fill="#08122e"/>
        ${[0, 1, 2].map(i => `<rect x="${20 + i * 96}" y="30" width="86" height="32" rx="6" fill="#12224f"/><rect x="${28 + i * 96}" y="38" width="30" height="6" rx="3" fill="#5b70b3"/><rect x="${28 + i * 96}" y="49" width="46" height="8" rx="4" fill="${['#0066ff', '#39ff14', '#3d8bff'][i]}"/>`).join('')}
        <rect x="20" y="74" width="190" height="102" rx="8" fill="#12224f"/>
        <path d="M32 156 L66 130 L98 142 L134 104 L170 116 L198 90" fill="none" stroke="#39ff14" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
        ${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${32 + i * 30}" y="${168 - [18, 30, 22, 40, 28, 46][i]}" width="12" height="${[18, 30, 22, 40, 28, 46][i]}" rx="2" fill="#0066ff" opacity=".55"/>`).join('')}
        <circle cx="262" cy="118" r="34" fill="none" stroke="#16265a" stroke-width="14"/><circle cx="262" cy="118" r="34" fill="none" stroke="#0066ff" stroke-width="14" stroke-dasharray="120 214" transform="rotate(-90 262 118)"/><circle cx="262" cy="118" r="34" fill="none" stroke="#39ff14" stroke-width="14" stroke-dasharray="50 214" stroke-dashoffset="-120" transform="rotate(-90 262 118)"/>`;
      break;
    case 'ui':
      body = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0066ff"/><stop offset="1" stop-color="#39ff14"/></linearGradient></defs>
        <rect y="18" width="320" height="172" fill="#0b1636"/>
        ${[0, 1, 2].map(i => `<g transform="translate(${34 + i * 90} ${30 + (i === 1 ? -4 : 6)})"><rect width="72" height="140" rx="12" fill="#0f1d45" stroke="#2b3f7c" stroke-width="2"/><rect x="8" y="14" width="56" height="42" rx="8" fill="${i === 1 ? 'url(#' + id + ')' : '#16265a'}"/><rect x="8" y="66" width="38" height="6" rx="3" fill="#5b70b3"/><rect x="8" y="80" width="56" height="16" rx="6" fill="#0066ff" opacity=".8"/><rect x="8" y="104" width="56" height="16" rx="6" fill="#16265a"/></g>`).join('')}`;
      break;
    default: // todo
      body = `<rect y="18" width="320" height="172" fill="#0b1636"/>
        ${[0, 1, 2, 3].map(i => `<rect x="22" y="${32 + i * 36}" width="276" height="28" rx="8" fill="#12224f"/><circle cx="40" cy="${46 + i * 36}" r="7" fill="${i < 2 ? '#39ff14' : 'none'}" stroke="${i < 2 ? '#39ff14' : '#3d8bff'}" stroke-width="2"/>${i < 2 ? `<path d="m36.5 ${46 + i * 36} 3 3 5-6" fill="none" stroke="#03210a" stroke-width="2" stroke-linecap="round"/>` : ''}<rect x="58" y="${43 + i * 36}" width="${[150, 120, 170, 100][i]}" height="6" rx="3" fill="${i < 2 ? '#3a4d88' : '#7d90c9'}"/>`).join('')}`;
  }
  return `<svg viewBox="0 0 320 190" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="320" height="190" fill="#0a1430"/>${bar}${body}</svg>`;
}

/* ---------- shared components ---------- */
function stars(p) {
  if (!Number(p.reviews)) return `<span class="rate"><b>★</b>New</span>`;
  return `<span class="rate"><b>★</b>${Number(p.rating).toFixed(1)} <small>(${p.reviews})</small></span>`;
}
function projectCard(p) {
  const on = favs.includes(String(p.id));
  return `<article class="pcard">
    <a class="pthumb" href="#/project/${esc(p.id)}" aria-label="${esc(p.title)}">${thumb(p.thumb)}</a>
    <button class="fav ${on ? 'on' : ''}" data-fav="${esc(p.id)}" aria-pressed="${on}" aria-label="${on ? 'Remove from' : 'Add to'} favorites">${ic('heart')}</button>
    <div class="pbody">
      <h3>${esc(p.title)}</h3>
      <div class="tags">${p.tech.slice(0, 5).map(t => `<span>${esc(t)}</span>`).join('')}</div>
      <div class="prow">${stars(p)}<strong class="price ${Number(p.price) === 0 ? 'free' : ''}">${rupee(p.price)}</strong></div>
      <a class="btn btn-blue btn-sm" href="#/project/${esc(p.id)}">View Details</a>
    </div>
  </article>`;
}
function catCards(onDark) {
  return `<div class="cat-grid ${onDark ? 'on-dark' : ''}">${CATS.map(c => `
    <a class="cat-card" href="#/projects" data-cat="${esc(c.name)}">
      <span class="tile">${ic(c.icon)}</span><strong>${esc(c.name)}</strong><span>${c.count}+ Projects</span>
    </a>`).join('')}</div>`;
}
function emptyState(title, text, btn) {
  return `<div class="empty"><h3>${esc(title)}</h3><p>${esc(text)}</p>${btn || ''}</div>`;
}

/* ---------- chrome ---------- */
function renderChrome() {
  const links = [['/', 'Home'], ['/projects', 'Projects'], ['/categories', 'Categories'], ['/upload', 'Upload'], ['/about', 'About']];
  $('#header').innerHTML = `<header class="site-header"><div class="wrap">
    <a class="logo" href="#/" aria-label="VIP home">${logo()}</a>
    <nav class="main-nav" id="mainNav" aria-label="Primary">
      ${links.map(([h, l]) => `<a href="#${h}" data-nav="${h}">${l}</a>`).join('')}
    </nav>
    <div class="head-actions">
      <button class="icon-btn" id="hSearch" aria-label="Search projects">${ic('search')}</button>
      <button class="icon-btn" id="hBell" aria-label="Notifications">${ic('bell')}</button>
      ${user
        ? `<a class="avatar" href="#/profile" aria-label="Your profile">${esc((user.name || 'U').trim().charAt(0).toUpperCase())}</a>`
        : `<a class="btn btn-blue btn-sm" href="#/login">Login / Register</a>`}
      <button class="icon-btn menu-btn" id="menuBtn" aria-label="Menu" aria-expanded="false" aria-controls="mainNav">${ic('menu')}</button>
    </div>
  </div></header>`;

  $('#footer').innerHTML = `<footer class="site-footer image-footer">
    <section class="footer-newsletter">
      <div class="footer-news-wrap">
        <div class="footer-brand-block">
          <a class="footer-vip-logo" href="#/" aria-label="VIP home">${logo()}</a>
          <span class="footer-divider"></span>
          <div>
            <h2>Stay Updated with Our Latest Offers</h2>
            <p>Get exclusive deals, new arrivals and more — straight to your inbox.</p>
          </div>
        </div>
        <form class="footer-subscribe" id="footerSubscribe">
          <span class="footer-mail">${ic('mail')}</span>
          <input id="footerEmail" type="email" placeholder="Enter your email address" aria-label="Email address" required>
          <button type="submit">${ic('plane')}<span>Subscribe</span></button>
        </form>
        <div class="footer-follow">
          <strong>Follow Us</strong>
          <div class="social-links" aria-label="Social media">
            <a href="#" aria-label="Facebook">f</a>
            <a href="#" aria-label="X">X</a>
            <a href="#" aria-label="Instagram">◎</a>
            <a href="#" aria-label="YouTube">▶</a>
            <a href="#" aria-label="LinkedIn">in</a>
          </div>
        </div>
      </div>
    </section>

    <section class="footer-main">
      <div class="footer-grid">
        <div class="footer-column">
          <div class="footer-heading"><span class="footer-icon">${ic('users')}</span><h3>Get to Know Us</h3></div>
          <a href="#/about">About VIP <b>›</b></a>
          <a href="#/about">Careers <b>›</b></a>
          <a href="#/about">Press Releases <b>›</b></a>
          <a href="#/about">VIP Science <b>›</b></a>
        </div>
        <div class="footer-column">
          <div class="footer-heading"><span class="footer-icon">${ic('mail')}</span><h3>Connect with Us</h3></div>
          <a href="#">Facebook <b>›</b></a>
          <a href="#">X / Twitter <b>›</b></a>
          <a href="#">Instagram <b>›</b></a>
          <a href="#">YouTube <b>›</b></a>
        </div>
        <div class="footer-column">
          <div class="footer-heading"><span class="footer-icon">${ic('grid')}</span><h3>Make Money with Us</h3></div>
          <a href="#/upload">Sell on VIP <b>›</b></a>
          <a href="#/upload">Publish Your Project <b>›</b></a>
          <a href="#/upload">Protect and Build Your Brand <b>›</b></a>
          <a href="#/projects">VIP Global Selling <b>›</b></a>
          <a href="#/upload">Supply to VIP <b>›</b></a>
          <a href="#/about">Become an Affiliate <b>›</b></a>
          <a href="#/about">Advertise Your Projects <b>›</b></a>
        </div>
        <div class="footer-column">
          <div class="footer-heading"><span class="footer-icon">${ic('bell')}</span><h3>Let Us Help You</h3></div>
          <a href="#/profile">Your Account <b>›</b></a>
          <a href="#/about">Returns Centre <b>›</b></a>
          <a href="#/about">Project Safety Alerts <b>›</b></a>
          <a href="#/about">100% Purchase Protection <b>›</b></a>
          <a href="#/about">VIP App Download <b>›</b></a>
          <a href="#/about">Help <b>›</b></a>
        </div>
        <div class="footer-confidence">
          <div class="confidence-item">
            <span class="confidence-icon">${ic('shield')}</span>
            <div><h3>Shop with Confidence</h3><p>Your safety and satisfaction<br>are our top priority.</p></div>
          </div>
          <div class="confidence-item">
            <span class="confidence-icon">${ic('download')}</span>
            <div><h3>Fast &amp; Reliable Delivery</h3><p>On thousands of digital projects</p></div>
          </div>
          <div class="confidence-item">
            <span class="confidence-icon">${ic('shield')}</span>
            <div><h3>Secure Payments</h3><p>100% safe and encrypted</p></div>
          </div>
          <div class="confidence-item">
            <span class="confidence-icon">${ic('check')}</span>
            <div><h3>Easy Returns</h3><p>Hassle-free support</p></div>
          </div>
        </div>
      </div>
    </section>

    <section class="footer-bottom">
      <div class="footer-bottom-wrap">
        <div class="footer-bottom-brand">${logo()}<span></span><small>© ${new Date().getFullYear()} VIP. All rights reserved.</small></div>
        <nav class="footer-legal" aria-label="Legal">
          <a href="#/about">Privacy Policy</a><i></i><a href="#/about">Terms of Service</a><i></i><a href="#/about">Cookies</a><i></i><a href="#/about">Sitemap</a>
        </nav>
      </div>
    </section>
  </footer>`;

  $('#bottomNav').innerHTML = `
    <a href="#/" data-nav="/">${ic('home')}Home</a>
    <a href="#/projects" data-nav="/projects">${ic('folder')}Projects</a>
    <a href="#/upload" class="plus" data-nav="/upload"><span class="circle">${ic('upload')}</span>Upload</a>
    <a href="#/categories" data-nav="/categories">${ic('grid')}Categories</a>
    <a href="#/profile" data-nav="/profile">${ic('user')}Profile</a>`;
}
function markActive(path) {
  $$('[data-nav]').forEach(a => {
    const h = a.dataset.nav;
    const on = h === '/' ? path === '/' : (path.startsWith(h) || (h === '/projects' && path === '/project'));
    a.classList.toggle('active', on);
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
}

/* ---------- pages ---------- */
function pageHome() {
  const featured = PROJECTS.slice(0, 4);
  return `
  <section class="dark-page hero"><div class="wrap">
    <div>
      <span class="pill">Welcome to VIP</span>
      <h1>Explore &amp; Download <span class="grad">Amazing Projects</span></h1>
      <p class="lead">Browse thousands of real-time projects, source code and web applications. Build your skills and grow together.</p>
      <form class="searchbar" id="heroSearch" role="search">
        ${ic('search')}
        <input type="search" id="heroQ" placeholder="Search for projects…" aria-label="Search for projects" autocomplete="off">
        <button type="submit" aria-label="Search">${ic('search')}</button>
      </form>
      <div class="chips">${['Web Development', 'Java', 'Python', 'Mobile Apps', 'UI/UX Design', 'Others'].map(c => `<a class="chip" href="#/projects" data-cat="${esc(c)}">${esc(c === 'UI/UX Design' ? 'UI/UX' : c)}</a>`).join('')}</div>
    </div>
    <div class="hero-art" aria-hidden="true">
      <div class="win w1"><div class="dots"><i></i><i></i><i></i></div><span class="ln" style="width:70%"></span><span class="ln g" style="width:45%"></span><span class="ln" style="width:85%"></span><span class="ln" style="width:55%"></span><span class="ln g" style="width:65%"></span><span class="ln" style="width:40%"></span></div>
      <div class="win w2"><div class="dots"><i></i><i></i><i></i></div><span class="ln g" style="width:60%"></span><span class="ln" style="width:80%"></span><span class="ln" style="width:50%"></span></div>
      <span class="float f1">HTML</span><span class="float js f2">&lt;/&gt;</span><span class="float js f3">JS</span><span class="float f4">JS</span>
    </div>
  </div></section>

  <section class="light"><div class="wrap">
    <div class="section-head"><div><h2>Popular Categories</h2><p>Choose from a wide range of project categories</p></div><a class="view-all" href="#/categories">View All ${ic('arrow')}</a></div>
    ${catCards(false)}
    <div class="section-head"><div><h2>Featured Projects</h2><p>Handpicked projects for you</p></div><a class="view-all" href="#/projects">View All ${ic('arrow')}</a></div>
    <div class="p-grid">${featured.map(projectCard).join('')}</div>
    <div class="cta">
      <span class="plane">${ic('plane')}</span>
      <div><h3>Start Sharing Your Projects</h3><p>Upload your projects and help others learn. Earn from your skills!</p></div>
      <a class="btn btn-green" href="#/upload">Upload Project ${ic('arrow')}</a>
    </div>
  </div></section>`;
}

function filteredProjects() {
  const q = filter.q.trim().toLowerCase();
  return allProjects().filter(p =>
    (filter.cat === 'All' || p.cat === filter.cat) &&
    (!q || p.title.toLowerCase().includes(q) || p.tech.some(t => t.toLowerCase().includes(q)) || p.cat.toLowerCase().includes(q)));
}
function gridHtml() {
  const list = filteredProjects();
  return list.length
    ? `<div class="p-grid two-up three">${list.map(projectCard).join('')}</div>`
    : emptyState('No projects found', 'Try a different keyword or pick another category.', `<button class="btn btn-blue btn-sm" data-reset>Clear filters</button>`);
}
function pageProjects() {
  return `<section class="dark-page"><div class="wrap page">
    <h1>All Projects</h1><p class="sub">Discover amazing projects uploaded by our community</p>
    <div class="toolbar">
      <div class="field-icon">${ic('search')}<input class="input" id="pq" type="search" placeholder="Search projects…" aria-label="Search projects" value="${esc(filter.q)}" autocomplete="off"></div>
      <select class="select" id="pcat" aria-label="Category">
        <option value="All">All Categories</option>
        ${CATS.map(c => `<option ${filter.cat === c.name ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
      </select>
    </div>
    <div class="layout">
      <aside class="side" aria-label="Categories"><h4>Categories</h4><div class="cats" id="sideCats">${sideCats()}</div></aside>
      <div id="grid">${gridHtml()}</div>
    </div>
  </div></section>`;
}
function sideCats() {
  const item = (name, icon, n) => `<button data-side="${esc(name)}" class="${filter.cat === name ? 'active' : ''}"><span class="lbl">${ic(icon)}${esc(name === 'All' ? 'All Categories' : name)}</span><span class="n">(${n})</span></button>`;
  return item('All', 'grid', TOTAL_COUNT) + CATS.map(c => item(c.name, c.icon, c.count)).join('');
}
function refreshProjects() {
  $('#grid').innerHTML = gridHtml();
  $('#sideCats').innerHTML = sideCats();
  const sel = $('#pcat'); if (sel) sel.value = filter.cat;
}

function pageCategories() {
  return `<section class="dark-page"><div class="wrap page">
    <h1>Categories</h1><p class="sub">Choose from a wide range of project categories</p>
    <div style="margin-top:22px">${catCards(true)}</div>
  </div></section>`;
}

function pageDetail(id) {
  const p = findProject(id);
  if (!p) return `<section class="dark-page"><div class="wrap page">${emptyState('Project not found', 'It may have been removed.', `<a class="btn btn-blue btn-sm" href="#/projects">Browse projects</a>`)}</div></section>`;
  const feats = (p.features && p.features.length ? p.features : ['Clean source code', 'Easy setup', 'Fully responsive']);
  return `<section class="dark-page"><div class="wrap page">
    <a class="back" href="#/projects">${ic('arrow')} Back to Projects</a>
    <div class="detail">
      <div>
        <h1 style="font-size:30px">${esc(p.title)}</h1>
        <div class="dtags">${p.tech.map(t => `<span>${esc(t)}</span>`).join('')}</div>
        <div class="meta">${stars(p).replace('<small>(' + p.reviews + ')</small>', `<small>(${p.reviews} reviews)</small>`)}</div>
        <div class="big-price">${rupee(p.price)}</div>
        <div class="actions">
          <button class="btn btn-green" data-buy="${esc(p.id)}">${ic('download')} ${Number(p.price) === 0 ? 'Download' : 'Buy &amp; Download'}</button>
          <button class="btn btn-blue" data-demo="${esc(p.id)}">Live Demo</button>
        </div>
      </div>
      <div class="preview"><div class="main">${thumb(p.thumb)}</div>
        <div class="strip">${['ecom', 'student', 'weather', 'portfolio'].map((k, i) => `<div>${thumb(i === 0 ? p.thumb : k)}</div>`).join('')}</div>
      </div>
    </div>
    <div class="detail-info">
      <div class="panel wide"><h3>Project Description</h3><p>${esc(p.desc || 'No description provided.')}</p></div>
      <div class="panel"><h3>Features</h3><ul class="checks">${feats.map(f => `<li>${ic('check')}${esc(f)}</li>`).join('')}</ul></div>
      <div class="panel"><h3>Technologies Used</h3><ul class="tech-list">${p.tech.map(t => {
        const [bg, code] = TECH_COLORS[t] || ['#4b5b8a', t.slice(0, 2)];
        return `<li><i style="background:${bg};${t === 'JavaScript' ? 'color:#111' : ''}">${esc(code)}</i>${esc(t)}</li>`;
      }).join('')}</ul></div>
    </div>
  </div></section>`;
}

function pageUpload() {
  if (!user) {
    return `<section class="dark-page"><div class="wrap page"><div class="form-card">${emptyState('Log in to upload', 'You need an account to share projects with the community.', `<a class="btn btn-blue" href="#/login">Login / Register</a>`)}</div></div></section>`;
  }
  return `<section class="dark-page"><div class="wrap page"><div class="form-card">
    <h1>Upload New Project</h1><p class="sub">Share your project with the community</p>
    <form id="uploadForm" novalidate style="margin-top:22px">
      <div id="upErr"></div>
      <div class="fgroup"><label for="upName">Project Name <span class="req">*</span></label><input class="input" id="upName" placeholder="Enter project name" required></div>
      <div class="fgroup"><label for="upCat">Category <span class="req">*</span></label>
        <select class="select" id="upCat" required><option value="">Select category</option>${CATS.map(c => `<option>${esc(c.name)}</option>`).join('')}</select></div>
      <div class="fgroup"><label for="upTech">Technologies</label><input class="input" id="upTech" placeholder="HTML, CSS, JavaScript"><div class="hint">Separate with commas.</div></div>
      <div class="fgroup"><label for="upDesc">Description <span class="req">*</span></label><textarea class="textarea" id="upDesc" placeholder="Enter project description" required></textarea></div>
      <div class="fgroup"><label for="upImgs">Project Images</label>
        <label class="drop" id="drop">${ic('upload')}<span id="dropText">Click to upload images or drag and drop<br><small>PNG, JPG, JPEG</small></span><input type="file" id="upImgs" accept="image/png,image/jpeg" multiple></label></div>
      <div class="fgroup"><label for="upDemo">Demo URL</label><input class="input" id="upDemo" type="url" placeholder="https://example.com (optional)"></div>
      <div class="fgroup"><label for="upFile">Project File (ZIP)</label><input class="input" id="upFile" type="file" accept=".zip"></div>
      <div class="fgroup"><label for="upPrice">Price (₹) <span class="req">*</span></label><input class="input" id="upPrice" type="number" min="0" step="1" placeholder="Enter price (0 for free)" required></div>
      <button class="btn btn-green btn-block" type="submit">Publish Project</button>
    </form>
  </div></div></section>`;
}

const GOOGLE_SVG = `<svg class="brand-ic" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.5 28.7A14.500 14.500 0 0 1 9.500 24c0-1.600.3-3.200.9-4.700l-7.900-6.100A24 24 0 0 0 0 24c0 3.900.9 7.500 2.600 10.800l7.900-6.100z"/><path fill="#34A853" d="M24 48c6.500 0 11.900-2.100 15.900-5.800l-7.500-5.800c-2.100 1.400-4.800 2.300-8.400 2.300-6.300 0-11.600-4.100-13.500-9.800l-7.900 6.100C6.500 42.600 14.600 48 24 48z"/></svg>`;
const GITHUB_SVG = `<svg class="brand-ic" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>`;

const AUTH_ART = `<div class="auth-art" aria-hidden="true">
  <svg viewBox="0 0 420 440">
    <defs>
      <linearGradient id="apl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#39ff14"/><stop offset=".5" stop-color="#0066ff"/><stop offset="1" stop-color="#39ff14"/></linearGradient>
      <linearGradient id="ascr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0a2a7a"/><stop offset="1" stop-color="#061340"/></linearGradient>
      <linearGradient id="abse" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b8bff"/><stop offset="1" stop-color="#0a3fbe"/></linearGradient>
      <filter id="aglow"><feGaussianBlur stdDeviation="8"/></filter>
    </defs>
    <ellipse cx="210" cy="350" rx="150" ry="36" fill="#39ff14" opacity=".22" filter="url(#aglow)"/>
    <polygon points="40,330 210,262 380,330 210,410" fill="#0a1a4a" stroke="url(#apl)" stroke-width="3"/>
    <polygon points="40,330 210,410 210,428 40,348" fill="url(#apl)" opacity=".85"/>
    <polygon points="380,330 210,410 210,428 380,348" fill="#0a3fbe" opacity=".9"/>
    <polygon points="105,318 215,278 335,318 225,362" fill="url(#abse)"/>
    <polygon points="105,318 225,362 225,370 105,326" fill="#0a3fbe"/>
    <polygon points="225,362 335,318 335,326 225,370" fill="#062a8a"/>
    <polygon points="215,278 335,318 335,198 215,158" fill="url(#ascr)" stroke="#3d8bff" stroke-width="3" stroke-linejoin="round"/>
    <g stroke-linecap="round" stroke-width="4">
      <path d="M232 196 l34 11" stroke="#3d8bff"/><path d="M232 212 l52 17" stroke="#39ff14"/><path d="M232 228 l28 9" stroke="#3d8bff"/><path d="M232 244 l44 14" stroke="#3d8bff"/><path d="M232 260 l22 7" stroke="#39ff14"/>
    </g>
    <g transform="translate(262 184) skewY(18)"><rect width="56" height="36" rx="8" fill="#0a1a4a" stroke="#3d8bff" stroke-width="2"/><text x="28" y="24" text-anchor="middle" font-family="Poppins, sans-serif" font-weight="700" font-size="16" fill="#9cc4ff">&lt;/&gt;</text></g>
    <path d="M210 112 V150" stroke="#39ff14" stroke-width="2" stroke-dasharray="3 6" stroke-linecap="round"/>
    <g transform="translate(210 70)"><path d="M-46 18a26 26 0 0 1 10-50 34 34 0 0 1 64 8 22 22 0 0 1 4 42z" fill="#0a4fd8" stroke="#3d8bff" stroke-width="3" stroke-linejoin="round"/><path d="M0 14V-14M-14 0 0 -14 14 0" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
    <rect x="120" y="345" width="84" height="64" rx="8" fill="#0a4fd8" stroke="#3d8bff" stroke-width="3"/>
    <circle cx="140" cy="365" r="6" fill="#39ff14"/><path d="M128 400l22-24 16 16 10-10 20 18z" fill="#9cc4ff"/>
    <circle cx="204" cy="404" r="16" fill="#39ff14"/><path d="M204 396v12m-6-6 6 6 6-6" stroke="#03210a" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <span class="tag t-html">HTML</span><span class="tag t-js">JS</span><span class="tag t-css">CSS</span>
</div>`;

function passwordField(id, label, ph) {
  return `<div class="fgroup"><label for="${id}">${label}</label><div class="field-icon pw">${ic('lock')}<input class="input" id="${id}" type="password" placeholder="${ph}" autocomplete="${id === 'lPass' ? 'current-password' : 'new-password'}" required><button type="button" data-eye="${id}" aria-label="Show password">${ic('eyeoff')}</button></div></div>`;
}
function socialButtons() {
  return `<div class="or">OR</div>
    <button type="button" class="btn-social" data-social="Google">${GOOGLE_SVG}Continue with Google</button>
    <button type="button" class="btn-social" data-social="GitHub">${GITHUB_SVG}Continue with GitHub</button>`;
}
function authShell(mode, card) {
  const login = mode === 'login';
  const feats = [['cloudup', 'Upload Projects', 'Share your creative work easily'], ['users', 'Reach More People', 'Get noticed by a global audience'], ['download', 'Earn & Grow', 'Let others download and support you'], ['shield', 'Safe & Secure', 'Your data is always protected']];
  return `<section class="dark-page auth-page">
    <span class="band tr" aria-hidden="true"></span><span class="band bl" aria-hidden="true"></span>
    <header class="auth-top">
      <a class="auth-id" href="#/" aria-label="VIP home">${logo()}<span><strong>Virtual Intelligent Precision</strong><em>Build<i></i>Share<i></i>Download</em></span></a>
      <div class="auth-alt"><span>${login ? "Don't have an account?" : 'Already have an account?'}</span><a class="btn-outline-green" href="#/${login ? 'register' : 'login'}">${ic(login ? 'userplus' : 'user')}${login ? 'Sign Up' : 'Login'}</a></div>
    </header>
    <div class="auth-stage">
      <div class="auth-left">
        <div class="auth-brand">${logo()}<h2>Virtual Intelligent Precision</h2><p class="verbs">Build<i></i>Share<i></i>Download</p></div>
        <h3 class="auth-h">Your Projects.<span>Our Platform.</span></h3>
        <p class="auth-p">Upload your projects, share with the world and let others download. Build your future with VIP.</p>
        <ul class="auth-feats">${feats.map(([i, t, d]) => `<li><span class="ft">${ic(i)}</span><div><strong>${t}</strong><small>${d}</small></div></li>`).join('')}</ul>
        <p class="auth-join">Join the VIP community<i></i><b>Create</b><i></i><b>Share</b><i></i><b>Inspire</b></p>
        ${AUTH_ART}
      </div>
      <div class="auth-right">${card}</div>
    </div>
  </section>`;
}

function pageLogin() {
  return authShell('login', `<div class="gcard">
    <h1>Welcome <span>Back!</span></h1><p class="sub2">Login to your VIP account</p>
    <form id="loginForm" novalidate><div id="authErr"></div>
      <div class="fgroup"><label for="lEmail">Email or Username</label><div class="field-icon">${ic('mail')}<input class="input" id="lEmail" placeholder="Enter your email or username" autocomplete="username" required></div></div>
      ${passwordField('lPass', 'Password', 'Enter your password')}
      <div class="row-between"><label><input type="checkbox" id="lRemember" checked> Remember me</label><a class="link-green" href="#/login" data-forgot>Forgot password?</a></div>
      <button class="btn-grad" type="submit">${ic('arrow')}Login</button>
    </form>
    ${socialButtons()}
    <p class="foot-note">Don't have an account? <a class="link-green" href="#/register">Sign Up ›</a></p>
  </div>`);
}
function pageRegister() {
  return authShell('register', `<div class="gcard">
    <h1>Create <span>Account</span></h1><p class="sub2">Join the VIP community</p>
    <form id="regForm" novalidate><div id="authErr"></div>
      <div class="fgroup"><label for="rName">Full Name</label><div class="field-icon">${ic('user')}<input class="input" id="rName" placeholder="Enter your name" autocomplete="name" required></div></div>
      <div class="fgroup"><label for="rEmail">Email</label><div class="field-icon">${ic('mail')}<input class="input" id="rEmail" type="email" placeholder="Enter your email" autocomplete="email" required></div></div>
      ${passwordField('rPass', 'Password', 'At least 6 characters')}
      <button class="btn-grad" type="submit">${ic('arrow')}Sign Up</button>
    </form>
    ${socialButtons()}
    <p class="foot-note">Already have an account? <a class="link-green" href="#/login">Login ›</a></p>
  </div>`);
}

function pageProfile() {
  if (!user) return `<section class="dark-page"><div class="wrap page">${emptyState('You are not logged in', 'Log in to see your profile, downloads and favorites.', `<a class="btn btn-blue" href="#/login">Login / Register</a>`)}</div></section>`;
  const tabs = [['overview', 'Profile', 'user'], ['mine', 'My Projects', 'folder'], ['downloads', 'Downloads', 'download'], ['favorites', 'Favorites', 'heart'], ['settings', 'Settings', 'settings']];
  let content = '';
  const row = (p, end) => `<a class="list-item" href="#/project/${esc(p.id)}"><span class="th">${thumb(p.thumb)}</span><div><h4>${esc(p.title)}</h4><small>${esc(p.cat)}</small></div><div class="end">${end}</div></a>`;
  const rowEnd = p => `<b>${rupee(p.price)}</b><span style="color:var(--gold)">★</span> ${Number(p.rating).toFixed(1)}`;
  const mine = uploads, dl = downloads.map(findProject).filter(Boolean), fv = favs.map(findProject).filter(Boolean);

  if (profileTab === 'overview') {
    const recent = [...mine, ...dl].slice(0, 3);
    content = `<div class="stats"><div class="stat"><b>${mine.length}</b><span>Projects</span></div><div class="stat"><b>${dl.length}</b><span>Downloads</span></div><div class="stat"><b>${fv.length}</b><span>Favorites</span></div></div>
      <div class="section-head"><h2 style="font-size:16px">Recent Projects</h2></div>
      ${recent.length ? `<div class="list">${recent.map(p => row(p, rowEnd(p))).join('')}</div>` : emptyState('Nothing here yet', 'Upload a project or download one to see it here.', `<a class="btn btn-blue btn-sm" href="#/projects">Browse projects</a>`)}`;
  } else if (profileTab === 'mine') {
    content = mine.length ? `<div class="list">${mine.map(p => row(p, rowEnd(p))).join('')}</div>` : emptyState('No uploads yet', 'Share your first project with the community.', `<a class="btn btn-green btn-sm" href="#/upload">Upload Project</a>`);
  } else if (profileTab === 'downloads') {
    content = dl.length ? `<div class="list">${dl.map(p => row(p, rowEnd(p))).join('')}</div>` : emptyState('No downloads yet', 'Projects you download will appear here.', `<a class="btn btn-blue btn-sm" href="#/projects">Browse projects</a>`);
  } else if (profileTab === 'favorites') {
    content = fv.length ? `<div class="list">${fv.map(p => row(p, rowEnd(p))).join('')}</div>` : emptyState('No favorites yet', 'Tap the heart on any project to save it.', `<a class="btn btn-blue btn-sm" href="#/projects">Browse projects</a>`);
  } else {
    content = `<form id="settingsForm" class="panel" style="max-width:420px"><div class="fgroup"><label for="sName">Full Name</label><input class="input" id="sName" value="${esc(user.name)}" required></div>
      <div class="fgroup"><label for="sEmail">Email</label><input class="input" id="sEmail" value="${esc(user.email)}" disabled></div>
      <button class="btn btn-blue" type="submit">Save changes</button></form>`;
  }
  return `<section class="dark-page"><div class="wrap page"><div class="layout">
    <aside class="side" aria-label="Account">
      ${tabs.map(([k, l, i]) => `<button data-tab="${k}" class="${profileTab === k ? 'active' : ''}"><span class="lbl">${ic(i)}${l}</span></button>`).join('')}
      <button data-logout><span class="lbl">${ic('logout')}Logout</span></button>
    </aside>
    <div>
      <div class="profile-head"><span class="avatar">${esc(user.name.trim().charAt(0).toUpperCase())}</span><div><h2 style="font-size:17px">${esc(user.name)}</h2><small>${esc(user.email)}</small></div></div>
      ${content}
    </div>
  </div></div></section>`;
}

function pageAbout() {
  return `<section class="dark-page"><div class="wrap page">
    <h1>Your ideas. Our platform. Global reach.</h1>
    <p class="sub" style="max-width:60ch">VIP – Virtual Intelligent Precision – is a marketplace where developers and designers build, share and download real projects.</p>
    <div class="about">
      <div class="panel"><h3>Build</h3><p>Turn what you have learned into working projects, and learn from source code written by others.</p></div>
      <div class="panel"><h3>Share</h3><p>Upload your project with screenshots, a demo link and a price, or offer it for free.</p></div>
      <div class="panel"><h3>Download</h3><p>Find complete, ready-to-run projects across web, mobile, Java, Python and design.</p></div>
    </div>
  </div></section>`;
}

function pageBrand() {
  const swatch = (name, hex, cls) => `<div class="swatch"><span class="dot ${cls}" aria-hidden="true"></span><div><strong>${name}</strong><small>${hex}</small></div><button class="btn btn-ghost btn-sm" data-copy="${hex}">Copy</button></div>`;
  return `<section class="dark-page"><div class="wrap page brand">
    <div class="brand-hero">
      <div class="brand-logo">${logo()}</div>
      <h1>Virtual Intelligent Precision</h1>
      <p class="brand-name">Project Marketplace</p>
      <p class="brand-verbs"><span>Build</span><span>Share</span><span>Download</span></p>
    </div>
    <div class="brand-grid">
      <div class="panel"><h3>Logo on dark</h3><div class="logo-box dark">${logo()}</div></div>
      <div class="panel"><h3>Logo on light</h3><div class="logo-box light">${logo()}</div></div>
      <div class="panel"><h3>Brand colors</h3>
        ${swatch('Electric Blue', '#0066FF', 'blue')}
        ${swatch('Neon Green', '#39FF14', 'green')}
      </div>
      <div class="panel"><h3>Tagline</h3><p class="tagline">Your Ideas<br>Our Platform<br>Global Reach</p></div>
    </div>
  </div></section>`;
}

/* ---------- router ---------- */
function route() {
  const path = location.hash.replace(/^#/, '') || '/';
  const [, page = '', arg] = path.split('/');
  const app = $('#app');
  let html;
  switch (page) {
    case '': html = pageHome(); break;
    case 'projects': html = pageProjects(); break;
    case 'categories': html = pageCategories(); break;
    case 'project': html = pageDetail(arg); break;
    case 'upload': html = pageUpload(); break;
    case 'login': html = user ? (location.hash = '#/profile', '') : pageLogin(); break;
    case 'register': html = user ? (location.hash = '#/profile', '') : pageRegister(); break;
    case 'profile': html = pageProfile(); break;
    case 'about': html = pageAbout(); break;
    case 'brand': html = pageBrand(); break;
    default: html = `<section class="dark-page"><div class="wrap page">${emptyState('Page not found', 'That page does not exist.', `<a class="btn btn-blue btn-sm" href="#/">Go home</a>`)}</div></section>`;
  }
  document.body.classList.toggle('auth', page === 'login' || page === 'register');
  if (!html) return;
  app.innerHTML = html;
  markActive('/' + page);
  $('#mainNav')?.classList.remove('open');
  $('#menuBtn')?.setAttribute('aria-expanded', 'false');
  window.scrollTo(0, 0);
  if (page === 'projects' && focusSearch) { $('#pq')?.focus(); focusSearch = false; }
}

/* ---------- actions ---------- */
function setUser(u, remember = true) {
  user = u;
  if (remember) store.set('vip_user', u);
  else { try { localStorage.removeItem('vip_user'); } catch { /* ignore */ } }
  renderChrome(); markActive('/' + (location.hash.split('/')[1] || ''));
}
function showErr(msg) { const el = $('#authErr') || $('#upErr'); if (el) el.innerHTML = `<div class="error" role="alert">${esc(msg)}</div>`; }

function buy(id) {
  const p = findProject(id);
  if (!p) return;
  if (!user) { toast('Please log in to download projects.'); location.hash = '#/login'; return; }
  if (!downloads.includes(String(p.id))) { downloads.unshift(String(p.id)); store.set('vip_dl', downloads); }
  toast(Number(p.price) === 0 ? `“${p.title}” added to your downloads.` : `Order placed for “${p.title}”. Find it in Downloads.`);
}

/* ---------- events (delegated, so re-renders never lose handlers) ---------- */
document.addEventListener('click', e => {
  const t = e.target;
  const fav = t.closest('[data-fav]');
  if (fav) {
    e.preventDefault();
    const id = fav.dataset.fav;
    favs = favs.includes(id) ? favs.filter(x => x !== id) : [...favs, id];
    store.set('vip_favs', favs);
    const on = favs.includes(id);
    fav.classList.toggle('on', on);
    fav.setAttribute('aria-pressed', on);
    toast(on ? 'Saved to favorites' : 'Removed from favorites');
    return;
  }
  const cat = t.closest('[data-cat]');
  if (cat) { filter.cat = cat.dataset.cat; filter.q = ''; return; } // link navigates to #/projects
  const side = t.closest('[data-side]');
  if (side) { filter.cat = side.dataset.side; refreshProjects(); return; }
  if (t.closest('[data-reset]')) { filter.cat = 'All'; filter.q = ''; const q = $('#pq'); if (q) q.value = ''; refreshProjects(); return; }
  const buyBtn = t.closest('[data-buy]'); if (buyBtn) return buy(buyBtn.dataset.buy);
  const demo = t.closest('[data-demo]');
  if (demo) {
    const p = findProject(demo.dataset.demo);
    if (p && p.demo) window.open(p.demo, '_blank', 'noopener');
    else toast('A live demo is not available for this project yet.');
    return;
  }
  const eye = t.closest('[data-eye]');
  if (eye) { const inp = $('#' + eye.dataset.eye); const show = inp.type === 'password'; inp.type = show ? 'text' : 'password'; eye.innerHTML = ic(show ? 'eye' : 'eyeoff'); eye.setAttribute('aria-label', show ? 'Hide password' : 'Show password'); return; }
  const soc = t.closest('[data-social]');
  if (soc) { toast(`${soc.dataset.social} sign-in needs OAuth set up on your backend.`); return; }
  if (t.closest('[data-forgot]')) { e.preventDefault(); toast('Password reset needs a backend – connect one to enable it.'); return; }
  const copy = t.closest('[data-copy]');
  if (copy) {
    const hex = copy.dataset.copy;
    (navigator.clipboard ? navigator.clipboard.writeText(hex) : Promise.reject())
      .then(() => toast(`Copied ${hex}`), () => toast(`Color: ${hex}`));
    return;
  }
  const tab = t.closest('[data-tab]'); if (tab) { profileTab = tab.dataset.tab; route(); return; }
  if (t.closest('[data-logout]')) { setUser(null, false); toast('You have been logged out.'); location.hash = '#/'; return; }
  if (t.closest('#hSearch')) { focusSearch = true; if (location.hash === '#/projects') { $('#pq')?.focus(); focusSearch = false; } else location.hash = '#/projects'; return; }
  if (t.closest('#hBell')) { toast('No new notifications.'); return; }
  if (t.closest('#menuBtn')) { const nav = $('#mainNav'); const open = nav.classList.toggle('open'); $('#menuBtn').setAttribute('aria-expanded', open); return; }
});

document.addEventListener('input', e => {
  if (e.target.id === 'pq') { filter.q = e.target.value; refreshProjects(); }
});
document.addEventListener('change', e => {
  if (e.target.id === 'pcat') { filter.cat = e.target.value; refreshProjects(); }
  if (e.target.id === 'upImgs') {
    const n = e.target.files.length;
    $('#dropText').textContent = n ? `${n} image${n > 1 ? 's' : ''} selected` : 'Click to upload images or drag and drop';
  }
});
['dragover', 'dragleave', 'drop'].forEach(ev => document.addEventListener(ev, e => {
  const d = e.target.closest?.('#drop'); if (!d) return;
  if (ev === 'dragover') { e.preventDefault(); d.classList.add('over'); }
  else if (ev === 'dragleave') d.classList.remove('over');
  else {
    e.preventDefault(); d.classList.remove('over');
    const input = $('#upImgs');
    const imgs = [...(e.dataTransfer?.files || [])].filter(f => /^image\/(png|jpe?g)$/.test(f.type));
    if (input && imgs.length) {
      const dt = new DataTransfer(); imgs.forEach(f => dt.items.add(f));
      input.files = dt.files; input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
}));

document.addEventListener('submit', e => {
  const f = e.target;
  e.preventDefault();

  if (f.id === 'heroSearch') {
    filter.q = $('#heroQ').value; filter.cat = 'All'; location.hash = '#/projects';
  }

  if (f.id === 'loginForm') {
    const email = $('#lEmail').value.trim().toLowerCase(), pass = $('#lPass').value;
    if (!email || !pass) return showErr('Enter your email and password.');
    const match = u => u.email === email || u.name.trim().toLowerCase() === email;
    const found = users.find(u => match(u) && u.pass === pass);
    if (!found) return showErr(users.some(match) ? 'That password is incorrect.' : 'No account found for that email or username. Sign up to continue.');
    setUser({ name: found.name, email: found.email }, $('#lRemember').checked);
    toast(`Welcome back, ${found.name.split(' ')[0]}!`);
    location.hash = '#/';
  }

  if (f.id === 'regForm') {
    const name = $('#rName').value.trim(), email = $('#rEmail').value.trim().toLowerCase(), pass = $('#rPass').value;
    if (!name || !email) return showErr('Enter your name and email.');
    if (!/^\S+@\S+\.\S+$/.test(email)) return showErr('Enter a valid email address.');
    if (pass.length < 6) return showErr('Use at least 6 characters for your password.');
    if (users.some(u => u.email === email)) return showErr('An account with that email already exists. Log in instead.');
    users.push({ name, email, pass }); // DEMO ONLY – never store passwords client-side in production
    store.set('vip_users', users);
    setUser({ name, email });
    toast('Account created. Welcome to VIP!');
    location.hash = '#/';
  }

  if (f.id === 'footerSubscribe') {
    const email = $('#footerEmail').value.trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast('Enter a valid email address.');
    store.set('vip_subscriber', email);
    f.reset();
    toast('Thanks! You are subscribed to VIP updates.');
  }

  if (f.id === 'uploadForm') {
    const title = $('#upName').value.trim(), cat = $('#upCat').value, desc = $('#upDesc').value.trim(), price = $('#upPrice').value;
    const demo = $('#upDemo').value.trim();
    if (!title || !cat || !desc || price === '') return showErr('Fill in the project name, category, description and price.');
    if (Number(price) < 0) return showErr('Price cannot be negative.');
    if (demo && !/^https?:\/\//i.test(demo)) return showErr('The demo URL must start with http:// or https://');
    const tech = $('#upTech').value.split(',').map(s => s.trim()).filter(Boolean);
    const p = {
      id: 'u' + Date.now(), title, cat, tech: tech.length ? tech : [cat], rating: 0, reviews: 0, price: Number(price),
      thumb: THUMB_BY_CAT[cat] || 'todo', demo, desc, features: []
    };
    uploads.unshift(p); store.set('vip_uploads', uploads);
    toast('Published. Your project is live.');
    location.hash = '#/project/' + p.id;
  }

  if (f.id === 'settingsForm') {
    const name = $('#sName').value.trim();
    if (!name) return toast('Name cannot be empty.');
    users = users.map(u => u.email === user.email ? { ...u, name } : u); store.set('vip_users', users);
    setUser({ ...user, name }); toast('Changes saved.'); route();
  }
});

window.addEventListener('hashchange', route);
renderChrome();
route();
