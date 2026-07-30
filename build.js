// Static site generator for the Neulogic marketing site.
// Run: node build.js   — regenerates every HTML page from the templates below.
// Shared assets live in assets/css/styles.css and assets/js/main.js.
//
// PHOTOGRAPHY: all photos are hotlinked from Unsplash (free license, no attribution
// required). Each was hand-picked from searches for African professionals in modern
// office settings; a consistent warm/desaturated grade is applied in CSS (.ph-img).
//
// PLACEHOLDER CONTENT: testimonials, case studies, and leadership placeholder cards
// contain generated placeholder copy. Every such block is marked with
// data-placeholder="true" and an HTML comment — search for "PLACEHOLDER CONTENT"
// or data-placeholder to find everything that must be replaced before launch.
const fs = require('fs');
const path = require('path');

// Cache-busting stamp regenerated each build, appended to CSS/JS URLs so browsers
// always fetch the current assets after a rebuild instead of serving stale cache.
const ASSET_V = Date.now();

// Canonical site origin (GitHub Pages). Used to build absolute og:url / og:image URLs,
// which social scrapers require (relative URLs don't work for link previews).
const SITE_URL = 'https://anitaojoneogu-creator.github.io/neulogic-site';
// Social share image. Save the Neulogic OG banner here (recommended 1200×630).
const OG_IMAGE = SITE_URL + '/assets/img/og-image.png';
// Neulogic Solutions Limited company page on LinkedIn.
const LINKEDIN_URL = 'https://www.linkedin.com/company/neulogic-solutions-ltd';

const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg>';

/* ---------------- photography (Unsplash, free license) ---------------- */

const IMG = {
  hero:        'photo-1604783125462-37d81c7385e6', // man in dark suit at laptop, moody
  proofTeam:   'photo-1573164574572-cb89e39749b4', // team at table with laptops
  proofOffice: 'photo-1573164574511-73c773193279', // professionals in modern office
  solFund:     'photo-1676119633019-be66d5c4bc4c', // man in suit writing on laptop
  solTrading:  'photo-1758876202980-0a28b744fb24', // two colleagues discussing data on screen
  solLending:  'photo-1653566031535-bcf33e1c2893', // group around table with laptops
  whoWeHelp:   'photo-1642522029693-20b2ab875b19', // motion-blur pair walking in office
  iwmHero:     'photo-1531482615713-2afd69097998', // advisor and client at monitor
  tradingHero: 'photo-1590283603385-17ffb3a7f29f', // trading terminal with charts and buy/sell
  trustHero:   'photo-1633158829585-23ba8f7c8caf', // hands stacking coins
  loanHero:    'photo-1637856794303-d864ce316444', // two people at table with laptop
  acctHero:    'photo-1713461983836-de0a45009424', // hands with calculator and documents
  whoDesk:     'photo-1573164574397-dd250bc8a598', // African professionals at a desk
  case1:       'photo-1573164574397-dd250bc8a598', // three colleagues at table
  case2:       'photo-1573164574048-f968d7ee9f20', // two women working on laptops
  case3:       'photo-1633114072836-15d933c6d3a7', // coworkers collaborating over laptop
  case4:       'photo-1573165706511-3ffde6ef1fe3', // three women beside wooden table
  caseDetail:  'photo-1653566031587-114b636e182b', // two women reviewing a laptop screen
  avatarF1:    'photo-1573497019418-b400bb3ab074', // smiling professional woman
  avatarM1:    'photo-1614023342667-6f060e9d1e04', // man in black shirt with glasses
  avatarF2:    'photo-1573497491207-618cc224f243', // woman in white dress shirt
  avatarM2:    'photo-1522529599102-193c0d76b5b6', // man smiling
  avatarF3:    'photo-1573497161161-c3e73707e25c', // woman smiling on chair
  aboutStory:  'photo-1739302750695-31a8c978c770', // group seated around a table
  leader1:     'photo-1645736594095-b9a4cabc1a7c', // man with glasses, portrait
  leader2:     'photo-1602009786436-96b827675d32', // woman in pink blazer, smiling
  leader3:     'photo-1561406636-b80293969660',    // woman, portrait
  careers:     'photo-1573167659694-342d570ce45a', // two women listening to a colleague
  art1:        'photo-1637684666451-423047d6bf5e', // man at table with laptop
  art2:        'photo-1581368163672-d717bcb4c6af', // man in blue shirt at computer
  art3:        'photo-1610473068514-276d33c606dd', // woman at desk with laptop
  art4:        'photo-1559136555-9303baea8ebd',    // colleagues at a computer
  portalHero:  'photo-1758876202167-f81c995c3fdc', // person on phone + laptop (self-service)
  apiHero:     'photo-1648146511841-30f5b8957629', // person at a computer monitor (technical)
  tradexHero:  'photo-1549086802-bb458f399f05',    // trader facing a monitor (OMS)
  derivHero:   'photo-1758691736498-422201cc57da', // charts presentation (derivatives/risk)
  srvOutsourcing: 'photo-1633114072836-15d933c6d3a7', // coworkers collaborating
  srvSupport:     'photo-1581368163672-d717bcb4c6af', // person at a computer
  srvCustom:      'photo-1637684666451-423047d6bf5e', // developer at a laptop
  srvMobile:      'photo-1758876202167-f81c995c3fdc', // person using a phone
  srvTraining:    'photo-1573167659694-342d570ce45a', // people in a training discussion
  srvConsultancy: 'photo-1739302750695-31a8c978c770', // consultants at a table
};

const U = (id, w) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
// img() emits the photo plus a .grade overlay for the site-wide unified color grade
const img = (id, alt, opts = {}) =>
  `<img class="ph-img" src="${U(id, opts.w || 1400)}" alt="${alt}"${opts.eager ? '' : ' loading="lazy"'}><span class="grade" aria-hidden="true"></span>`;
const avatar = (id, alt) =>
  `<img class="avatar-img" src="${U(id, 200)}" alt="${alt}" loading="lazy">`;

/* ---------------- shared partials ---------------- */

const headHTML = (title, desc, root, pagePath) => {
  const canonical = pagePath === 'index.html' ? '' : pagePath.replace(/index\.html$/, '');
  const pageUrl = SITE_URL + '/' + canonical;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="icon" type="image/png" href="${root}assets/img/favicon.png">
<link rel="apple-touch-icon" href="${root}assets/img/apple-touch-icon.png">
<link rel="canonical" href="${pageUrl}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Neulogic Solutions">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${pageUrl}">
<meta property="og:image" content="${OG_IMAGE}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${OG_IMAGE}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://images.unsplash.com">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${root}assets/css/styles.css?v=${ASSET_V}">
</head>
<body>
`;
};

// light=true: page has a light hero, so the header starts frosted (transparent
// over white would be invisible). light=false: transparent over a dark hero,
// switching to frosted glass after the scroll threshold.
const headerHTML = (root, light) => `
<header class="site-header${light ? ' light-start' : ''}" id="siteHeader">
  <div class="container header-inner">
    <a href="${root}index.html" class="logo" aria-label="Neulogic home">
      <img class="logo-light" src="${root}assets/img/neulogic-logo-white.png" alt="Neulogic">
      <img class="logo-dark" src="${root}assets/img/neulogic-logo.png" alt="Neulogic">
    </a>
    <nav class="main-nav" id="mainNav" aria-label="Main navigation">
      <div class="nav-item">
        <button type="button" aria-haspopup="true">Solutions <span class="caret"></span></button>
        <div class="dropdown">
          ${solutions.map(s => `<a href="${root}solutions/${s.slug}/index.html">${s.name.replace(/&/g, '&amp;')}</a>`).join('\n          ')}
        </div>
      </div>
      <div class="nav-item">
        <button type="button" aria-haspopup="true">Services <span class="caret"></span></button>
        <div class="dropdown dropdown-wide">
          ${services.map(s => `<a href="${root}services/${s.slug}/index.html"><strong>${s.name}</strong><span>${serviceBlurb[s.slug]}</span></a>`).join('\n          ')}
        </div>
      </div>
      <div class="nav-item">
        <button type="button" aria-haspopup="true">Why Neulogic <span class="caret"></span></button>
        <div class="dropdown">
          <a href="${root}about/index.html">About Us</a>
          <a href="${root}client-success/index.html">Client Success</a>
          <a href="${root}clients/index.html">Our Clients</a>
          <a href="${root}partners-integrations-security/index.html">Partners, Integrations &amp; Security</a>
        </div>
      </div>
      <div class="nav-item">
        <button type="button" aria-haspopup="true">Resources <span class="caret"></span></button>
        <div class="dropdown">
          <a href="${root}insights/index.html">Insights</a>
        </div>
      </div>
      <div class="nav-item"><a href="${root}careers/index.html">Careers</a></div>
      <div class="nav-item"><a href="${root}contact/index.html">Contact</a></div>
    </nav>
    <a href="${root}contact/index.html" class="btn btn-orange header-cta">Contact Us</a>
    <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>
`;

const footerHTML = (root, standalone) => `
<footer class="site-footer${standalone ? ' standalone' : ''}">
  <div class="container">
    <div class="footer-logo-row">
      <span class="footer-logo"><img src="${root}assets/img/neulogic-logo-white.png" alt="Neulogic"></span>
    </div>
    <div class="footer-main">
      <div class="footer-col">
        <h4>Solutions</h4>
        <ul>
          ${solutions.map(s => `<li><a href="${root}solutions/${s.slug}/index.html">${s.name.replace(/&/g, '&amp;')}</a></li>`).join('\n          ')}
        </ul>
      </div>
      <div class="footer-col">
        <h4>Services</h4>
        <ul>
          ${services.map(s => `<li><a href="${root}services/${s.slug}/index.html">${s.name}</a></li>`).join('\n          ')}
        </ul>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <ul>
          <li><a href="${root}about/index.html">About Us</a></li>
          <li><a href="${root}client-success/index.html">Client Success</a></li>
          <li><a href="${root}clients/index.html">Our Clients</a></li>
          <li><a href="${root}partners-integrations-security/index.html">Partners, Integrations &amp; Security</a></li>
          <li><a href="${root}careers/index.html">Careers</a></li>
          <li><a href="${root}contact/index.html">Contact</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Resources</h4>
        <ul>
          <li><a href="${root}insights/index.html">Insights</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Contact</h4>
        <address>
          Neulogic Solutions Limited<br>
          25 Olusoji Idowu Street,<br>
          Off Ikorodu Road, Ilupeju,<br>
          Lagos, Nigeria<br>
          <a href="tel:+2348148990091">+234 814 899 0091</a><br>
          <a href="mailto:support@m.neulogicsolutions.com">support@m.neulogicsolutions.com</a>
        </address>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="socials">
        <a href="${LINKEDIN_URL}" aria-label="Neulogic Solutions on LinkedIn" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V23h-4V8zm7.5 0h3.8v2.05h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V23h-4v-7.9c0-1.88-.03-4.3-2.62-4.3-2.62 0-3.02 2.05-3.02 4.17V23H8V8z"/></svg>
        </a>
      </div>
      <p class="copyright">&copy; 2026 Neulogic Solutions. All rights reserved.</p>
    </div>
  </div>
</footer>
<script src="${root}assets/js/main.js?v=${ASSET_V}"></script>
</body>
</html>
`;

const ctaBand = (root, title, sub, btnLabel, href) => `
<section class="cta-band" style="margin-top:110px;">
  <div class="container">
    <h2>${title}</h2>
    ${sub ? `<p class="sub">${sub}</p>` : ''}
    <a href="${href || (root + 'contact/index.html')}" class="btn btn-orange">${btnLabel || 'Contact Us'}</a>
  </div>
</section>
`;

/* ---------------- solution pages data ---------------- */

// Feature content is the real Symplus feature set (source: neulogicsolutions.com).
// Order drives the nav, footer, and homepage grid. Business Intelligence is excluded
// entirely. Each entry only carries the fields the solution-page template renders.
const solutions = [
  {
    slug: 'investment-wealth-management',
    name: 'Investment & Wealth Management',
    sub: 'Symplus produces daily NAV, unit pricing, client statements, and regulatory returns from one set of accounting records.',
    imgId: 'iwmHero',
    imgAlt: 'Financial advisor reviewing a portfolio with a client',
    tags: ['Portfolio Management', 'Client Reporting', 'Compliance'],
    features: [
      ['Client Onboarding & Relationship Management', 'Advanced onboarding and relationship tools for separately managed, unit-based, deposit, and retail products.'],
      ['Multi-Asset Class Support', 'Coverage across the widest range of asset classes, from mutual funds to real estate.'],
      ['Multi-Currency Fund Accounting', 'Integrated corporate action processing and full analytics for all security types.'],
      ['Flexible Asset Classification', 'Complete coverage of traditional global investment products with configurable classification.'],
      ['Compliance Engine', 'Rules-based compliance engine to keep every portfolio inside its investment mandate.'],
      ['360° Client View', 'Real-time client view backed by an extensive set of reports and data views.'],
      ['Management Reporting', 'Business analysis and top-management reporting with 24/7 access to all data.'],
      ['Portfolio Re-Balancing', 'Full re-balancing tools across managed portfolios.'],
    ],
    who: 'Built for asset managers, wealth managers, and investment firms.',
    whoChips: ['Asset Managers', 'Wealth Managers', 'Investment Firms', 'Portfolio Managers', 'Fund Accountants', 'Compliance Teams'],
  },
  {
    slug: 'securities-trading',
    name: 'Securities Trading',
    sub: 'Symplus covers order capture, execution, CSD settlement, and back-office processing, with NGX-certified trading capabilities.',
    imgId: 'tradingHero',
    imgAlt: 'Trader working at a desk with market screens',
    tags: ['Order Management', 'Trade Execution', 'Settlement'],
    features: [
      ['Brokerage Back-Office', 'Finance, accounts, and operations record-keeping for the full brokerage business.'],
      ['Order & Execution Management', 'Real-time order capture, execution, and validation across trading venues.'],
      ['Client Web Portals', 'Branded online portals for client account access, layered on the same back office.'],
      ['Mobile Trading Access', 'Interfaced mobile applications for clients and dealers.'],
      ['Reporting & Analysis', 'Wide-ranging, self-service reports and data views for operational management.'],
      ['Integrated Accounting', 'Direct, seamless integration with the Symplus accounting and general ledger modules.'],
    ],
    who: 'Built for stockbrokers, securities dealers, and capital market operators.',
    whoChips: ['Stockbrokers', 'Securities Dealers', 'Capital Market Operators', 'Dealing Desks', 'Back-Office Teams'],
  },
  {
    slug: 'trade-x',
    name: 'Trade-X (OMS)',
    sub: 'Real-time, FIX-protocol order management and market-data access across NGX and other trading venues.',
    imgId: 'tradexHero',
    imgAlt: 'Trading desk with market-data screens',
    tags: ['Order Management', 'FIX Connectivity', 'Market Data'],
    features: [
      ['Real-Time Order Management', 'Single-click order entry with immediate responses from connected venues.'],
      ['FIX Protocol Connectivity', 'Receives FIX messages from multiple markets and trading destinations.'],
      ['NGX Market Access', 'Trading and market-data access across all Nigerian Exchange Group (NGX) boards.'],
      ['API-Based Integration', 'Open interface for integration with any third-party application.'],
      ['Live Market Data', 'Real-time market data, news, quotes, and position updates.'],
      ['Order Lifecycle Tools', 'Fast posting, amendment, cancellation, and acknowledgement of quotes and orders.'],
      ['Book Management', 'Full activity logging and book management for every desk.'],
      ['Risk Controls', 'Built-in controls to prevent overtrading.'],
      ['Cross-Module Interface', 'Direct interface to accounting, securities trading, and derivatives for real-time account management.'],
    ],
    who: 'Built for stockbrokers, dealers, and traders on the capital markets.',
    whoChips: ['Stockbrokers', 'Dealers', 'Traders', 'Dealing Desks', 'Capital Market Operators'],
  },
  {
    slug: 'derivatives',
    name: 'Derivatives',
    sub: 'Exchange-traded futures and options management, with the analytics and risk controls a high-risk trading business needs.',
    imgId: 'derivHero',
    imgAlt: 'Analyst reviewing risk and derivatives charts',
    tags: ['Futures & Options', 'Risk Analytics', 'Compliance'],
    features: [
      ['Multi-Currency Accounting', 'Full accounting and analytics across all security types.'],
      ['Multi-Market Support', 'Trade across multiple markets from one platform.'],
      ['Broad Underlying Coverage', 'Commodities, stocks, bonds, interest rates, and currencies as underlying assets.'],
      ['Simple to Complex Structures', 'From straightforward to complex structured derivatives.'],
      ['Exchange-Traded Contract Management', 'End-to-end management of local and foreign exchange-traded contracts.'],
      ['Straight-Through Processing', 'Real-time trade flow between front and back office, removing dual-keying errors.'],
      ['Compliance Engine', 'Rules-based compliance engine for effective risk control.'],
      ['Real-Time Monitoring', 'Notifications across the full trade lifecycle.'],
      ['Termination Value Calculation', 'Quick calculation of termination values for transactions.'],
      ['Counterparty & Regulatory Risk', 'Monitors counterparty exposure and generates regulatory risk reports.'],
      ['Full Audit Trail', 'Complete audit trail of every change made in the system.'],
      ['Configurable', 'Adaptable to an organisation&rsquo;s specific derivatives-trading needs.'],
    ],
    who: 'Built for derivatives desks, securities firms, and investment banks.',
    whoChips: ['Derivatives Desks', 'Securities Firms', 'Investment Banks', 'Risk & Compliance Teams'],
  },
  {
    slug: 'trust-management',
    name: 'Trust Management',
    sub: 'Symplus administers corporate, public, and private trusts, with fiduciary records, covenant registers, and beneficiary accounts.',
    imgId: 'trustHero',
    imgAlt: 'Professionals in discussion around a boardroom table',
    tags: ['Fiduciary Registers', 'Beneficiary Accounts', 'Bond Trusts'],
    features: [
      ['Corporate Trust', 'Syndication and corporate bond trust administration.'],
      ['Public Trust', 'Unit trust, scheme/mutual fund, government bond, and reserve fund administration.'],
      ['Private Trust', 'Will services, custodian services, executorship/administration, living trusts, and education trusts.'],
      ['Investment Monitoring', 'Integrated with Symplus Asset Management to monitor and value trust fund investments.'],
      ['Beneficiary Accounting', 'Integrated with Symplus Accounting to maintain individual and beneficiary trust accounts.'],
      ['Trust Financial Reporting', 'Trial Balance, P&amp;L, and Balance Sheet generated at defined frequencies.'],
    ],
    who: 'Built for trustees and pension fund administrators.',
    whoChips: ['Trustees', 'Pension Fund Administrators', 'Fiduciary Services Teams', 'Estate Administrators'],
  },
  {
    slug: 'loan-management',
    name: 'Loan Management',
    sub: 'Symplus tracks each loan with its collateral, repayment schedule, and arrears status, across every lending product.',
    imgId: 'loanHero',
    imgAlt: 'Bankers reviewing loan documents together',
    tags: ['Loan Portfolio', 'Collateral', 'Reporting'],
    features: [
      ['Loan Types', 'Personal, commercial, mortgage, and syndicated loans in one system.'],
      ['Instalment & Line-of-Credit Lending', 'Full support for instalment, line-of-credit, and commercial lending functions.'],
      ['What-If Analysis', 'Scenario analysis tools to model loan outcomes before commitment.'],
      ['Collateral Records', 'Structured tracking of collateral against every loan.'],
      ['Standing Orders & Waivers', 'Standing order processing and payment waiver management.'],
      ['Portfolio Reporting', 'A global view of the loan book by customer or branch.'],
      ['Credit Performance Analysis', 'Sectored query and reporting features to track credit performance.'],
      ['Multi-Currency', 'Fully multi-currency loan portfolio monitoring.'],
    ],
    who: 'Built for lenders, banks, and discount houses.',
    whoChips: ['Lenders', 'Banks', 'Discount Houses', 'Credit Teams', 'Loan Operations'],
  },
  {
    slug: 'accounting-finance',
    name: 'Accounting & Finance',
    sub: 'The general ledger posts as transactions happen. Reconciliation, financial statements, and IFRS reporting run on live data.',
    imgId: 'acctHero',
    imgAlt: 'Accountant working through figures with a calculator',
    tags: ['General Ledger', 'IFRS Reporting', 'Reconciliation'],
    features: [
      ['General Ledger', 'Multi-company, multi-currency general ledger at the core of every module.'],
      ['Cash Account Management', 'Full cash account tracking and management.'],
      ['Customer Account Management', 'Centralised customer account records shared across modules.'],
      ['Fixed Asset Management', 'Full lifecycle tracking of fixed assets.'],
      ['Bank Reconciliation', 'Automated reconciliation against bank statements.'],
      ['Accounts Receivable', 'Receivables tracking and ageing.'],
      ['Budget Management', 'Budget definition and monitoring against actuals.'],
      ['IFRS Financial Reporting', 'Trial Balance, IFRS-compliant Statement of Financial Position and Income Statement, in customisable formats.'],
    ],
    who: 'Built for CFOs and finance teams across every institution type.',
    whoChips: ['CFOs', 'Financial Controllers', 'Finance Teams', 'Fund Accountants', 'Internal Audit'],
  },
  {
    slug: 'customer-portal',
    name: 'Customer Portal',
    sub: 'Neulogic builds and connects a self-service portal for your clients, reflecting whichever Symplus solution you run.',
    imgId: 'portalHero',
    imgAlt: 'A client checking their account on a laptop and phone',
    tags: ['Client Login', 'Account View', 'Statements'],
    features: [
      ['Self-Service Access', 'Clients view portfolios, statements, and transactions without contacting the back office.'],
      ['Branded Web Portal', 'A web portal interfaced directly to the Symplus back office.'],
      ['Mobile Access', 'Interfaced mobile applications for on-the-go account access.'],
      ['Real-Time Data', 'Portal data reflects the same ledger used internally, with no separate reconciliation.'],
    ],
    who: 'Built for any institution that wants to give its clients self-service access to their accounts.',
    whoChips: ['Asset Managers', 'Stockbrokers', 'Trustees', 'Lenders', 'Client Services Teams'],
  },
  {
    slug: 'api-integration',
    name: 'API & Systems Integration',
    sub: 'An open API interface and FIX connectivity for integrating Symplus with the systems you already run.',
    imgId: 'apiHero',
    imgAlt: 'An engineer working at a computer',
    tags: ['APIs', 'FIX Protocol', 'Integration'],
    features: [
      ['API-Based Integration', 'An API interface that allows integration with any third-party application.'],
      ['FIX Protocol Connectivity', 'Ability to receive FIX messages from multiple markets and trading destinations.'],
      ['Cross-Module Integration', 'Direct interfaces between accounting, securities trading, derivatives, asset management, and trust modules for real-time account management.'],
      ['Straight-Through Processing', 'Automated trade flow between front and back office, removing dual-keying and re-entry errors.'],
    ],
    who: 'Built for IT and integration teams evaluating how Symplus fits an existing technology stack.',
    whoChips: ['IT Teams', 'Integration Engineers', 'Solution Architects', 'CTOs'],
  },
];

// Shared template for Solutions and Services detail pages. eyebrow defaults to "Solutions".
const solutionPageBody = (s, root, eyebrow = 'Solutions') => `
<section class="page-hero">
  <div class="container page-hero-grid">
    <div>
      <div class="eyebrow-row">
        <span class="eyebrow-badge">${eyebrow}</span>
      </div>
      <h1>${s.name}</h1>
      <p class="sub">${s.sub}</p>
      <a href="${root}contact/index.html" class="btn btn-orange">Contact Us</a>
    </div>
    <div class="img-ph" data-drift>
      ${img(IMG[s.imgId], s.imgAlt, { eager: true })}
      <div class="img-tags">
        ${s.tags.map(t => `<span class="img-tag">${t}</span>`).join('\n        ')}
      </div>
    </div>
  </div>
</section>

<section style="padding:100px 0 0;">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow-row">
        <span class="eyebrow-badge">Features</span>
        <span class="eyebrow-label">What&rsquo;s in the module</span>
      </div>
      <h2>What&rsquo;s included.</h2>
    </div>
    <div class="feature-grid">
      ${s.features.map(([name, desc]) => `<div class="feature-card">
        <div class="icon">${CHECK}</div>
        <h3>${name}</h3>
        <p>${desc}</p>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>

<section id="who" style="padding:100px 0 0;">
  <div class="container">
    <div class="who-band">
      <div>
        <div class="eyebrow-row" style="margin-bottom:16px;">
          <span class="eyebrow-badge">Who It&rsquo;s For</span>
        </div>
        <h2>${s.who}</h2>
      </div>
      <div class="who-chips">
        ${s.whoChips.map(c => `<span class="who-chip">${c}</span>`).join('\n        ')}
      </div>
    </div>
  </div>
</section>

${ctaBand(root, `Talk to us about ${s.name}.`, 'Tell us what you run today and what you want to change.', 'Contact Us')}
`;

/* ---------------- services ---------------- */

const services = [
  {
    slug: 'outsourcing',
    name: 'Outsourcing',
    sub: 'Trained technical personnel on short notice, so operational gaps in your technical staffing never become operational risk.',
    imgId: 'srvOutsourcing',
    imgAlt: 'Colleagues working together in an office',
    tags: ['Technical Staffing', 'Knowledge Transfer', 'Uptime'],
    features: [
      ['Short-Notice Deployment', 'Trained technical personnel ready to fill operational gaps in technical staffing quickly.'],
      ['Continuity of Operations', 'Coverage for short-notice staff departures, so implemented business processes keep running.'],
      ['In-House Partnership', 'Works alongside your existing technology personnel rather than replacing them.'],
      ['Continuous Knowledge Transfer', 'Ongoing transfer of Symplus knowledge to your team, not just a temporary fix.'],
      ['Uptime-Focused', 'Keeps users working and lapses in operations to a minimum.'],
    ],
    who: 'Built for institutions facing gaps in technical staffing.',
    whoChips: ['Fund Managers', 'Securities Firms', 'Trustee Firms', 'IT Departments Facing Staffing Gaps'],
  },
  {
    slug: 'support',
    name: 'Support',
    sub: 'Seasoned technical support expertise, under a plan built around your operations.',
    imgId: 'srvSupport',
    imgAlt: 'A support specialist at a computer',
    tags: ['Support Plans', 'Product Updates', 'After-Implementation Care'],
    features: [
      ['Multiple Support Plans', 'Software support plans matched to your operational needs.'],
      ['After-Implementation Services', 'Support that continues well past go-live.'],
      ['Skilled Support Personnel', 'Dedicated staff available to support every Symplus application.'],
      ['Regular Updates & Fixes', 'Annual support plans include product updates, patches, and fixes.'],
      ['Local, Short-Notice Resources', 'Local resources available at short notice with the right skills for your issue.'],
      ['Continuous Knowledge Transfer', 'A partner who understands your business, not a ticket queue.'],
    ],
    who: 'Built for existing Symplus clients and the teams who run them.',
    whoChips: ['Existing Symplus Clients', 'Operations Teams', 'IT Departments'],
  },
  {
    slug: 'custom-solutions',
    name: 'Custom Solutions',
    sub: 'Custom software development for the business case no ready-made application can solve.',
    imgId: 'srvCustom',
    imgAlt: 'A developer working at a laptop',
    tags: ['Bespoke Development', 'Legacy Integration', 'Domain Expertise'],
    features: [
      ['Custom Application Development', 'Secure business applications built for mission-critical sectors.'],
      ['Deep Domain Expertise', 'Extensive domain expertise and existing code libraries applied to your specific challenge.'],
      ['From Manual to Automated', 'Transforms spreadsheet- and manual-process-driven operations into automated, secure workflows.'],
      ['Legacy Integration', 'Solutions built to integrate with any legacy business applications you already run.'],
      ['Built for the Future', 'Designed with future requirements in mind, not just what you need today.'],
    ],
    who: 'Built for organisations with non-standard requirements.',
    whoChips: ['Organisations With Non-Standard Requirements', 'Financial Institutions Needing Bespoke Workflows'],
  },
  {
    slug: 'mobile-development',
    name: 'Mobile Development',
    sub: 'Professional, fast, and secure mobile applications, built to your specific requirements.',
    imgId: 'srvMobile',
    imgAlt: 'A person using a mobile app',
    tags: ['Mobile Apps', 'Security-First', 'UX Design'],
    features: [
      ['Full-Featured Mobile Apps', 'Apps that carry out the same financial transactions as your desktop platform, on the go.'],
      ['Security by Design', 'Cybersecurity built in from ideation through architecture, execution, testing, and release.'],
      ['Insightful UX', 'Clean, efficient user experiences designed to improve brand perception.'],
      ['Privacy-First', 'Optional, highly visible privacy notifications that show customers you care about their data.'],
      ['System-Level Preferences', 'Apps that respect device-level language and light/dark mode settings, meeting users where they are.'],
    ],
    who: 'Built for client-facing teams who want mobile access.',
    whoChips: ['Client-Facing Teams', 'Brokerages & Asset Managers Wanting Mobile Access'],
  },
  {
    slug: 'training',
    name: 'Training',
    sub: 'Symplus training delivered by the team that designed and built the suite.',
    imgId: 'srvTraining',
    imgAlt: 'A training session in progress',
    tags: ['User Training', 'Custom Training', 'Ongoing Enablement'],
    features: [
      ['Symplus User Application Training', 'Covers the full range of application modules in the Symplus suite.'],
      ['Custom Training Programmes', 'Training tailored specifically to your organisation&rsquo;s needs.'],
      ['Trained by the Builders', 'Delivered by the same team that designed and built Symplus.'],
      ['Keeps Staff Current', 'Ongoing training as new products and features are released.'],
    ],
    who: 'Built for new users and teams onboarding new modules.',
    whoChips: ['New Symplus Users', 'Teams Onboarding New Modules', 'Organisations Managing Staff Turnover'],
  },
  {
    slug: 'software-consultancy',
    name: 'Software Consultancy',
    sub: 'Independent business analysis and consultancy from a team with 25+ years of domain expertise.',
    imgId: 'srvConsultancy',
    imgAlt: 'Consultants reviewing work at a table',
    tags: ['Business Analysis', 'Process Optimisation', 'Independent Advice'],
    features: [
      ['Business Analysis & Consultancy', 'Qualified, experienced personnel available to partner on business analysis.'],
      ['Technology Optimisation', 'Helps you get better use out of technology assets you have already acquired.'],
      ['Process Design & Implementation', 'Designs, develops, and implements business processes to meet operational requirements.'],
      ['Independent, Unbiased Advice', 'Engages as a neutral, independent consultant, not a vendor with an agenda.'],
      ['Best-Practice Guidance', 'Ensures the right technology is selected and best practices are followed.'],
    ],
    who: 'Built for organisations evaluating new technology or optimising processes.',
    whoChips: ['Organisations Evaluating New Technology', 'Teams Optimising Existing Processes'],
  },
];

// One-line descriptions used in the Services nav dropdown and hub cards.
const serviceBlurb = {
  'outsourcing': 'Skilled technical staff on demand for the Symplus ecosystem.',
  'support': 'Ongoing technical support to keep your operations running.',
  'custom-solutions': 'Bespoke software built around your specific business case.',
  'mobile-development': 'Secure, user-friendly mobile apps for your clients and staff.',
  'training': 'Symplus training built and delivered by the team that built the suite.',
  'software-consultancy': 'Business analysis and technology consultancy from our senior team.',
};

// Longer hub-card descriptions.
const serviceHubDesc = {
  'outsourcing': 'Trained technical personnel on short notice, to cover staffing gaps and keep your Symplus operations moving.',
  'support': 'Software support plans with seasoned technical expertise, regular updates, and after-implementation care.',
  'custom-solutions': 'Custom application development for the business cases no ready-made software can solve.',
  'mobile-development': 'Secure, fast, and user-friendly mobile apps, built to your specific requirements.',
  'training': 'Symplus training delivered by the team that designed and built the suite.',
  'software-consultancy': 'Business analysis and independent consultancy from a team with 25+ years of domain expertise.',
};

const servicesHubBody = (root) => `
<section class="page-hero-dark">
  <div class="container">
    <div class="eyebrow-row">
      <span class="eyebrow-badge">Services</span>
    </div>
    <h1>Services that keep Symplus running, and your team ahead of it.</h1>
    <p class="sub">From short-notice technical staffing to custom development and hands-on training, our services team supports every stage of your Symplus deployment.</p>
    <a href="${root}contact/index.html" class="btn btn-orange" style="margin-top:30px;">Contact Us</a>
  </div>
</section>

<section style="padding:100px 0 0;">
  <div class="container">
    <div class="sol-stream" style="display:grid;grid-template-columns:repeat(2,1fr);gap:24px;">
      ${services.map(s => `<a class="article-card" href="${root}services/${s.slug}/index.html">
        <div class="img-ph">${img(IMG[s.imgId], s.imgAlt)}</div>
        <div class="body">
          <span class="cat">${s.name}</span>
          <h3>${s.name}</h3>
          <p style="font-size:13.5px;color:#5a6055;">${serviceHubDesc[s.slug]}</p>
        </div>
      </a>`).join('\n      ')}
    </div>
  </div>
</section>

${ctaBand(root, 'Let&rsquo;s talk about your operations.', 'Book a free consultation and see how Symplus fits your regulatory obligations.', 'Contact Us')}
`;

/* ---------------- testimonials (shared, PLACEHOLDER CONTENT) ---------------- */

// PLACEHOLDER CONTENT: generated quotes with generic role titles. Not real clients,
// not real people. Replace with verified, approved client quotes before launch.
const testimonials = [
  {
    img: 'avatarF1', name: 'Adaora E.', role: 'Head of Operations, Asset Management Firm',
    quote: 'Month-end used to mean a week of reconciliation before we trusted our own numbers. Now the figures our clients see and the figures we close on come from the same ledger.',
    date: 'February 2026',
  },
  {
    img: 'avatarM1', name: 'Ifeanyi O.', role: 'Executive Director, Securities Trading Firm',
    quote: 'Settlement day stopped being a fire drill. The desk, the back office, and the CSD numbers agree before anyone has to chase anything.',
    date: 'November 2025',
  },
  {
    img: 'avatarF2', name: 'Kemi A.', role: 'Chief Financial Officer, Trustee Services Firm',
    quote: 'Our auditors asked to walk the ledger end to end. For the first time, that was a short meeting.',
    date: 'May 2026',
  },
  {
    img: 'avatarM2', name: 'Tunde B.', role: 'Head of Technology, Stockbroking Firm',
    quote: 'We connected Symplus to our core banking system through the API stack in weeks, not the year our last integration took.',
    date: 'August 2025',
  },
  {
    img: 'avatarF3', name: 'Ngozi U.', role: 'Managing Director, Wealth Management Firm',
    quote: 'Clients stopped calling to ask for their statements. They log in and pull them whenever they want.',
    date: 'March 2026',
  },
];

const testimonialCards = () =>
  testimonials.map(t => `<div class="testi-card" data-placeholder="true">
      <div class="testi-who">
        <div class="testi-avatar">${avatar(IMG[t.img], '')}</div>
        <div>
          <div class="n">${t.name}</div>
          <div class="r">${t.role}</div>
        </div>
      </div>
      <p class="testi-quote">&ldquo;${t.quote}&rdquo;</p>
      <div class="testi-foot">
        <span class="date">${t.date}</span>
        <span class="qm">&rdquo;</span>
      </div>
    </div>`).join('\n      ');

/* ---------------- client success ----------------
   Only the three clients with a real, sourced announcement on neulogicsolutions.com.
   Facts only: no invented percentages, no fabricated executive quotes. The closing
   statement in each is attributed to Neulogic, not to a named client spokesperson.
   CSL Stockbrokers and Zedcrest were removed (no sourced story); they appear on the
   Our Clients roster instead. */
const caseStudies = [
  {
    slug: 'norrenberger-financial-group',
    client: 'Norrenberger Financial Group', short: 'Norrenberger',
    cat: 'trustees', imgId: 'case3',
    typeLabel: 'Financial Group',
    moduleLine: 'Runs Symplus for trust administration, asset management, and securities trading across its subsidiaries.',
    result: 'One platform across its subsidiaries.',
    challenge: 'Norrenberger, &ldquo;Masters in Wealth Creation,&rdquo; needed a single platform that could support its investment banking, asset management, and securities trading subsidiaries as it worked to simplify wealth creation for its clients.',
    solution: 'Norrenberger signed on to Symplus in fiscal year 2021, with deployment completed across a wide range of modules spanning its subsidiary businesses.',
    results: [
      { big: 'One platform', lbl: 'Integrated across investment banking, asset management, and securities trading subsidiaries' },
      { big: 'Multi-asset', lbl: 'Multi-currency, multi-asset-class operations on one system' },
      { big: 'Since 2021', lbl: 'Signed on in fiscal year 2021' },
    ],
    outcome: 'Norrenberger&rsquo;s subsidiaries now run on one platform instead of one per business line, which is the integration we built Symplus for.',
  },
  {
    slug: 'united-capital-asset-management',
    client: 'United Capital Asset Management', short: 'United Capital',
    cat: 'asset-managers', imgId: 'case1',
    typeLabel: 'Asset Management',
    moduleLine: 'Runs Symplus for asset and fund management across individual, mutual, and other fund types.',
    result: 'Selected after an international vendor review.',
    challenge: 'United Capital determined its existing vendor was not meeting its requirements and ran an extensive review process, including international vendors, before selecting Symplus.',
    solution: 'United Capital implemented Symplus to cover a wide range of funds, booking and tracking investments across multiple asset classes in both local and foreign currencies.',
    results: [
      { big: 'Wider coverage', lbl: 'A single platform covering a wider range of funds and asset classes than the previous vendor' },
      { big: 'Multi-currency', lbl: 'Investments booked and tracked in local and foreign currencies' },
      { big: 'Chosen on merit', lbl: 'Selected after a review that included international vendors' },
    ],
    outcome: 'United Capital chose Symplus over international competition to cover a wider range of funds and asset classes on one platform.',
  },
  {
    slug: 'fsdh-asset-management',
    client: 'FSDH Asset Management', short: 'FSDH',
    cat: 'asset-managers', imgId: 'case2',
    typeLabel: 'Asset Management',
    moduleLine: 'Runs Symplus for asset management, alongside United Capital, after an international vendor review.',
    result: 'Selected on merit against international competition.',
    challenge: 'Like United Capital, FSDH Asset Management found its existing vendor was not meeting requirements and ran a competitive review that included international vendors.',
    solution: 'FSDH licensed Symplus to manage its asset management operations, covering the same wide range of fund types and asset classes.',
    results: [
      { big: 'Chosen on merit', lbl: 'Selected against international competition' },
      { big: 'Full coverage', lbl: 'A wide range of fund types and asset classes' },
      { big: 'Asset management', lbl: 'Fund and asset management operations on Symplus' },
    ],
    outcome: 'FSDH selected Symplus on merit against international competition to run its fund and asset management operations.',
  },
];

// One results-grid card: real client name, the module it runs, and a one-line result.
const caseCard = (cs, root) => `<a href="${root}client-success/${cs.slug}/index.html" class="case-card img-ph" data-cat="${cs.cat}">
        ${img(IMG[cs.imgId], '')}
        <div class="case-meta">
          <div>
            <div class="t">${cs.client}</div>
            <div class="mod">${cs.moduleLine}</div>
            <div class="d">${cs.result}</div>
          </div>
          <span class="arrow-btn" aria-hidden="true">${ARROW}</span>
        </div>
      </a>`;

/* ---------------- homepage body ---------------- */

const homeBody = (root) => `
<section class="hero">
  <div class="hero-media">
    <img src="${U(IMG.hero, 2000)}" alt="Businessman working at a laptop in a dimly lit office" data-parallax>
  </div>
  <div class="container hero-inner">
    <div class="hero-badge-row">
      <span class="hero-badge">Trusted</span>
      <span class="hero-badge-label">Licensed software</span>
    </div>
    <h1>The Pan-African software platform for regulated financial operations.</h1>
    <div class="hero-bottom">
      <div class="hero-trust">
        <div class="hero-trust-avatars" aria-hidden="true">
          <span></span><span></span><span></span>
        </div>
        <p class="hero-trust-text">Trusted by 65+ financial institutions</p>
      </div>
    </div>
  </div>
</section>

<section class="proof">
  <div class="container proof-grid">
    <div class="proof-card img-ph">
      ${img(IMG.proofTeam, 'Team working together at a table with laptops')}
      <div class="proof-stat" style="position:relative;z-index:2;">
        <div class="num">14+</div>
        <div class="lbl">Years building Symplus</div>
      </div>
    </div>
    <div class="proof-card img-ph">
      ${img(IMG.proofOffice, 'Professionals collaborating in a modern office')}
      <div class="proof-stat" style="position:relative;z-index:2;">
        <div class="num">65+</div>
        <div class="lbl">Enterprises on licence</div>
      </div>
    </div>
    <div class="proof-card proof-quote">
      <div>
        <div class="qmark">&ldquo;</div>
        <blockquote>Good software isn&rsquo;t about more features. It&rsquo;s about getting the regulated details right.</blockquote>
      </div>
      <div class="attr">Chiedu Okeleke, MD &amp; CEO</div>
    </div>
    <div class="proof-card proof-headshot">
      <!-- Real photo supplied by Neulogic. Save the provided headshot as assets/img/chiedu-okeleke.jpg;
           until the file exists, the card falls back to a labeled placeholder. -->
      <div class="img-ph ph-d headshot-img">
        <img class="ph-img" src="${root}assets/img/chiedu-okeleke.jpg" alt="Chiedu Okeleke, Co-founder and CEO of Neulogic Solutions" onerror="this.parentElement.dataset.label='Add photo: assets/img/chiedu-okeleke.jpg';this.nextElementSibling&&this.nextElementSibling.remove();this.remove()"><span class="grade" aria-hidden="true"></span>
      </div>
      <div class="headshot-meta">
        <div class="name">
          Chiedu Okeleke
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.4l-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z"/></svg>
        </div>
        <div class="cap">MD &amp; CEO, Neulogic Solutions</div>
      </div>
    </div>
  </div>
</section>

<section class="intro">
  <div class="container">
    <p class="statement">We are a licensed software provider building asset management, securities trading, loans, trustee, and derivatives infrastructure for financial institutions across Africa.</p>
    <p class="trust-label">Trusted by Africa&rsquo;s top regulated institutions</p>
    <div class="logo-marquee" aria-label="Client logos">
      <div class="logo-track">
        ${(() => {
          const logos = [
            ['cordros', 'Cordros'], ['unicap', 'UniCap'], ['fbnquest', 'FBNQuest'],
            ['csl', 'CSL Stockbrokers'], ['fsdh', 'FSDH'], ['rencap', 'RenCap'],
            ['royalexchange', 'Royal Exchange'], ['norrenberger', 'Norrenberger Financial Group'],
          ];
          const group = (hidden) => `<div class="logo-group"${hidden ? ' aria-hidden="true"' : ''}>${logos.map(([slug, name]) => `<img src="${root}assets/img/clients/${slug}.png" alt="${name}" loading="lazy">`).join('')}</div>`;
          // duplicated group makes the -50% keyframe loop seamlessly
          return group(false) + group(true);
        })()}
      </div>
    </div>
  </div>
</section>

<section class="solutions" id="solutions">
  <div class="container">
    <div class="sol-sticky">
      <div class="sol-sticky-left">
        <div class="eyebrow-row">
          <span class="eyebrow-badge">Solutions</span>
          <span class="eyebrow-label">What we do for clients</span>
        </div>
        <h2 class="sol-text-h" style="font-size:clamp(30px,3.6vw,46px);margin-bottom:22px;">Modern infrastructure for every financial institution.</h2>
        <p style="color:#454b42;max-width:440px;">Nine modules covering portfolio management, trading, derivatives, trust administration, lending, accounting, client access, and integration.</p>
        <a href="${root}solutions/investment-wealth-management/index.html" class="sol-link"><span>Explore the modules</span> ${ARROW}</a>
      </div>
      <div class="sol-stream">
        ${(() => {
          // Homepage card sub-text, keyed by solution slug. This section is a fast,
          // scannable index: each card shows one image tag = the module name, a plain
          // module-name heading, and one clear sentence. The crafted, benefit-led
          // headlines live on each module's own solution page. Order and images come
          // from the solutions[] array (already in the required 1–8 order).
          const cardSub = {
            'investment-wealth-management': 'Portfolio management, NAV and unit pricing, and client reporting for fund managers and asset owners.',
            'securities-trading': 'Order management, execution, and settlement across multiple exchanges, including NGX-certified trading.',
            'trade-x': 'Real-time FIX-protocol order management and market-data access across NGX and other trading venues.',
            'derivatives': 'Exchange-traded futures and options management, with analytics, risk controls, and full trade lifecycle support.',
            'trust-management': 'Trust administration and beneficiary records for corporate, private, and public trusts.',
            'loan-management': 'Loan book, collateral, and credit management for personal, commercial, mortgage, and syndicated loans.',
            'accounting-finance': 'General ledger, IFRS reporting, and multi-currency accounting, shared across every module.',
            'customer-portal': 'Self-service access for your clients to view portfolios, statements, and transactions.',
            'api-integration': 'API-based integration connecting Symplus to your core banking, CRM, and other systems.',
          };
          return solutions.map(s => `<div class="sol-unit">
          <div class="img-ph" data-drift>
            ${img(IMG[s.imgId], s.imgAlt)}
            <div class="img-tags">
              <span class="img-tag">${s.name}</span>
            </div>
          </div>
          <div class="sol-card">
            <div>
              <h3>${s.name}</h3>
              <p>${cardSub[s.slug]}</p>
            </div>
            <a href="${root}solutions/${s.slug}/index.html" class="arrow-btn" aria-label="Explore ${s.name}">${ARROW}</a>
          </div>
        </div>`).join('\n        ');
        })()}
      </div>
    </div>
  </div>
</section>

<section class="clients" id="clients">
  <div class="container">
    <div class="clients-grid">
      <div>
        <div class="eyebrow-row">
          <span class="eyebrow-badge">Clients</span>
          <span class="eyebrow-label">Who we help</span>
        </div>
        <h2>Supporting institutions across every stage of growth.</h2>
        <p class="lead">Symplus scales with your organisation&rsquo;s operations, whether you are a one-fund company or a multi-business company.</p>
        <a href="${root}contact/index.html" class="btn btn-orange">Contact Us</a>
        <div class="clients-cards">
          <div class="client-card">
            <div class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 21h18M4 21V9l8-5 8 5v12M9 21v-6h6v6"/></svg>
            </div>
            <h3>Investment Banks</h3>
          </div>
          <div class="client-card">
            <div class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
            </div>
            <h3>Fund Managers</h3>
          </div>
          <div class="client-card">
            <div class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3l9 4-9 4-9-4 9-4zM3 12l9 4 9-4M3 17l9 4 9-4"/></svg>
            </div>
            <h3>Trustee Firms</h3>
          </div>
          <div class="client-card">
            <div class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 19V9M9 19V5M15 19v-8M20 19v-6M3 21h18"/></svg>
            </div>
            <h3>Securities Firms</h3>
          </div>
        </div>
      </div>
      <div class="clients-media">
        <div class="img-ph" data-drift>
          ${img(IMG.whoDesk, 'Professionals in a meeting at a desk')}
        </div>
      </div>
    </div>
  </div>
</section>

<section style="padding:120px 0 40px;" id="cases">
  <div class="container">
    <div class="section-head center">
      <div class="eyebrow-row">
        <span class="eyebrow-badge">Client Success</span>
        <span class="eyebrow-label">Our proven impact</span>
      </div>
      <h2>Results our clients<br>can point to.</h2>
    </div>
    <div class="cases-grid">
      ${caseStudies.map(cs => caseCard(cs, root)).join('\n      ')}
    </div>
  </div>
</section>

<section class="testimonials">
  <div class="container">
    <div class="testi-head">
      <div>
        <div class="eyebrow-row" style="margin-bottom:20px;">
          <span class="eyebrow-badge">Trusted</span>
          <span class="eyebrow-label">By industry leaders</span>
        </div>
        <h2>Real feedback, real results.</h2>
      </div>
      <p class="sub">Hear from the institutions running their operations on Neulogic.</p>
    </div>
    <!-- PLACEHOLDER CONTENT: testimonial quotes, names, and photos are generated
         placeholders (generic roles, no real companies). Replace with verified client
         quotes before launch. Search data-placeholder to find all such blocks.
         The row scrolls sideways as the page scrolls through this section (scroll-linked,
         JS in main.js). Without JS or with reduced motion, it's a manual swipe strip. -->
    <div class="testi-viewport" id="testiViewport" aria-label="Client testimonials">
      <div class="testi-track" id="testiTrack">
        ${testimonialCards()}
      </div>
    </div>
  </div>
</section>

<section class="final-cta" id="contact">
  <div class="container">
    <h2>Let&rsquo;s talk about your operations.</h2>
    <p class="sub">Book a free consultation and see how Symplus fits your regulatory obligations.</p>
    <a href="${root}request-demo/index.html" class="btn btn-orange">Schedule Consultation</a>
  </div>
</section>
`;

/* ---------------- security & compliance ---------------- */

const securityBody = (root) => `
<section class="page-hero-dark">
  <div class="container">
    <div class="eyebrow-row">
      <span class="eyebrow-badge">Security &amp; Compliance</span>
      <span class="eyebrow-label">Built to be examined</span>
    </div>
    <h1>Built for institutions that answer to regulators.</h1>
    <p class="sub">Symplus is licensed software, run by the institutions it serves, with the access controls, audit trails, and certifications a regulated institution needs.</p>
  </div>
</section>

<section style="padding:100px 0 0;">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow-row">
        <span class="eyebrow-badge">Credentials</span>
        <span class="eyebrow-label">Regulatory certifications</span>
      </div>
      <h2>Certifications.</h2>
    </div>
    <div class="cert-grid">
      <div class="cert-card featured">
        <span class="tag">Certified</span>
        <h3>NGX Certification</h3>
        <p>Symplus trading capabilities are certified against Nigerian Exchange infrastructure, with execution and post-trade workflows validated by the market itself.</p>
      </div>
      <div class="cert-card is-placeholder">
        <span class="tag">Placeholder</span>
        <h3>[Add certification name]</h3>
        <p>[Add issuing body and scope, e.g. data protection registration. Do not publish until a real certification is confirmed.]</p>
      </div>
      <div class="cert-card is-placeholder">
        <span class="tag">Placeholder</span>
        <h3>[Add certification name]</h3>
        <p>[Add issuing body and scope, e.g. ISO certification. Do not publish until a real certification is confirmed.]</p>
      </div>
    </div>
  </div>
</section>

<section style="padding:100px 0 0;">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow-row">
        <span class="eyebrow-badge">Infrastructure</span>
        <span class="eyebrow-label">Data &amp; hosting</span>
      </div>
      <h2>Data residency, encryption, backup, and availability.</h2>
      <p class="ph-note">Every item below is pending confirmation. Replace the bracketed values with verified specifics before this page goes live.</p>
    </div>
    <div class="cert-grid" style="grid-template-columns:repeat(2,1fr);">
      <div class="cert-card is-placeholder">
        <h3>Data residency &amp; hosting</h3>
        <ul class="info-list">
          <li>Hosting location(s): [confirm with engineering team]</li>
          <li>Data residency options: [confirm with engineering team]</li>
          <li>Deployment models (on-premise / cloud): [confirm with engineering team]</li>
        </ul>
      </div>
      <div class="cert-card is-placeholder">
        <h3>Encryption</h3>
        <ul class="info-list">
          <li>Encryption in transit: [confirm with engineering team]</li>
          <li>Encryption at rest: [confirm with engineering team]</li>
          <li>Key management: [confirm with engineering team]</li>
        </ul>
      </div>
      <div class="cert-card is-placeholder">
        <h3>Backup &amp; disaster recovery</h3>
        <ul class="info-list">
          <li>Backup cadence: [confirm with engineering team]</li>
          <li>Recovery point / recovery time objectives: [confirm with engineering team]</li>
          <li>DR site arrangements: [confirm with engineering team]</li>
        </ul>
      </div>
      <div class="cert-card is-placeholder">
        <h3>Availability</h3>
        <ul class="info-list">
          <li>Uptime commitment / SLA: [confirm with engineering team]</li>
          <li>Maintenance windows: [confirm with engineering team]</li>
          <li>Incident communication process: [confirm with engineering team]</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section style="padding:100px 0 0;">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow-row">
        <span class="eyebrow-badge">Controls</span>
        <span class="eyebrow-label">Access control &amp; audit</span>
      </div>
      <h2>Access control and audit features.</h2>
    </div>
    <div class="cert-grid">
      <div class="feature-card">
        <div class="icon">${CHECK}</div>
        <h3>User Roles &amp; Permissions</h3>
        <p>Granular, role-based access so every user sees and does exactly what their function allows, nothing more.</p>
      </div>
      <div class="feature-card">
        <div class="icon">${CHECK}</div>
        <h3>Audit Trails</h3>
        <p>Every transaction and every change carries who, what, and when: a record your auditors can walk through end to end.</p>
      </div>
      <div class="feature-card">
        <div class="icon">${CHECK}</div>
        <h3>Rules-Based Compliance Engine</h3>
        <p>Mandates and regulatory rules enforced in the platform itself, checked before and after every transaction.</p>
      </div>
    </div>
  </div>
</section>

<section style="padding:100px 0 0;">
  <div class="container" style="text-align:center;">
    <div class="section-head center">
      <div class="eyebrow-row">
        <span class="eyebrow-badge">Technology</span>
        <span class="eyebrow-label">Technology partners</span>
      </div>
      <h2>Built on enterprise-grade technology.</h2>
    </div>
    <div class="partner-strip">
      <span>Oracle</span>
      <span>Microsoft Azure</span>
      <span>Power BI</span>
    </div>
  </div>
</section>

${ctaBand(root, 'Have specific compliance questions? Talk to our team.', 'We can walk through your due-diligence checklist item by item.', 'Book a Call')}
`;

/* ---------------- case studies ---------------- */

const caseHubBody = (root) => `
<section class="page-hero" style="padding-bottom:30px;">
  <div class="container">
    <div class="eyebrow-row">
      <span class="eyebrow-badge">Client Success</span>
      <span class="eyebrow-label">Our proven impact</span>
    </div>
    <h1>Results our clients can point to.</h1>
  </div>
</section>

<section style="padding:20px 0 0;">
  <div class="container">
    <div class="filter-bar" data-filter-bar data-filter-target="#caseGrid">
      <button class="filter-btn active" data-cat="all">All</button>
      <button class="filter-btn" data-cat="asset-managers">Asset Managers</button>
      <button class="filter-btn" data-cat="trustees">Trustees</button>
    </div>
    <div class="cases-grid" id="caseGrid">
      ${caseStudies.map(cs => caseCard(cs, root)).join('\n      ')}
    </div>
    <div class="filter-empty" id="caseGrid-empty">No client stories in this category yet.</div>
  </div>
</section>

${ctaBand(root, 'Talk to us about your operation.', 'Tell us what you run today and what you want to change.', 'Contact Us')}
`;

// Per-client detail page. Real client name + full content. The 90% turnaround figure and
// the narratives are Neulogic-provided marketing content (see caseStudies comment);
// the closing statement is attributed to Neulogic, not to an invented client spokesperson.
const caseDetailBody = (cs, root) => `
<!-- Client success story. Facts sourced from the client's announcement on
     neulogicsolutions.com. No invented metrics; closing line attributed to Neulogic. -->
<section class="page-hero" style="padding-bottom:30px;">
  <div class="container">
    <div class="eyebrow-row">
      <span class="eyebrow-badge">Client Success Story</span>
      <span class="eyebrow-label">${cs.typeLabel}</span>
    </div>
    <h1>${cs.client}</h1>
    <p class="sub">${cs.result} ${cs.moduleLine}</p>
  </div>
</section>

<section style="padding:10px 0 40px;">
  <div class="container">
    <div class="img-ph" data-drift style="min-height:340px;">
      ${img(IMG[cs.imgId], '', { eager: true })}
      <div class="img-tags">
        <span class="img-tag">${cs.typeLabel}</span>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="container article-body">
    <h2>The Challenge</h2>
    <p>${cs.challenge}</p>

    <h2>The Solution</h2>
    <p>${cs.solution}</p>
  </div>
</section>

<section style="padding:70px 0 0;">
  <div class="container">
    <div class="section-head">
      <h2>The Results</h2>
    </div>
    <div class="callout-grid" style="grid-template-columns:repeat(3,1fr);">
      ${cs.results.map((r, i) => i === 0
        ? `<div class="callout-card accent">
        <div><div class="big">${r.big}</div><div class="lbl">${r.lbl}</div></div>
      </div>`
        : `<div class="callout-card img-ph ${i === 1 ? 'ph-a' : 'ph-d'}">
        <div><div class="big">${r.big}</div><div class="lbl">${r.lbl}</div></div>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>

<section style="padding:80px 0 0;">
  <div class="container" style="max-width:600px;">
    <div class="testi-card">
      <div class="testi-who">
        <div class="testi-avatar"><img class="avatar-img" src="${root}assets/img/favicon.png" alt="Neulogic Solutions" loading="lazy"></div>
        <div>
          <div class="n">Neulogic Solutions</div>
          <div class="r">On the ${cs.short} rollout</div>
        </div>
      </div>
      <p class="testi-quote">&ldquo;${cs.outcome}&rdquo;</p>
      <div class="testi-foot">
        <span class="date">Symplus</span>
        <span class="qm">&rdquo;</span>
      </div>
    </div>
  </div>
</section>

<section style="padding:80px 0 0;">
  <div class="container" style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
    <a href="${root}client-success/index.html" class="btn btn-dark">Read more client stories</a>
    <a href="${root}contact/index.html" class="btn btn-orange">Contact Us</a>
  </div>
</section>
`;

/* ---------------- partners ---------------- */

const partnersBody = (root) => `
<section class="page-hero-dark">
  <div class="container">
    <div class="eyebrow-row">
      <span class="eyebrow-badge">Partners &amp; Integrations</span>
    </div>
    <h1>We partner and integrate with top platforms.</h1>
    <p class="sub">Symplus uses enterprise-grade technology from partners, customisable to meet your requirements.</p>
  </div>
</section>

<section style="padding:100px 0 0;">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow-row">
        <span class="eyebrow-badge">Operational Partners</span>
      </div>
      <h2>Some of our operational partners.</h2>
    </div>
    <div class="cert-grid" style="grid-template-columns:repeat(2,1fr);">
      <div class="cert-card">
        <span class="tag">Database</span>
        <h3>Oracle</h3>
        <p>Symplus deployments run on Oracle database technology, the same enterprise database infrastructure the world&rsquo;s largest financial institutions rely on.</p>
      </div>
      <div class="cert-card">
        <span class="tag">Cloud</span>
        <h3>Microsoft Azure</h3>
        <p>Cloud deployments of Symplus are built on Microsoft Azure&rsquo;s enterprise cloud infrastructure.</p>
      </div>
    </div>
  </div>
</section>

<section style="padding:100px 0 0;">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow-row">
        <span class="eyebrow-badge">Integrations</span>
        <span class="eyebrow-label">Connect what you already run</span>
      </div>
      <h2>Symplus connects to the systems you already run.</h2>
      <p>Symplus is built to talk to your systems through APIs, in both directions.</p>
    </div>
    <div class="cert-grid">
      <div class="feature-card">
        <div class="icon">${CHECK}</div>
        <h3>Our APIs</h3>
        <p>We provide our APIs so your systems can read from and write to Symplus.</p>
      </div>
      <div class="feature-card">
        <div class="icon">${CHECK}</div>
        <h3>Third-Party APIs</h3>
        <p>We integrate APIs from your partners to make your Symplus experience better.</p>
      </div>
      <div class="feature-card">
        <div class="icon">${CHECK}</div>
        <h3>In-house APIs</h3>
        <p>We also connect your own in-house APIs into Symplus.</p>
      </div>
    </div>
  </div>
</section>

${ctaBand(root, 'Ask us about integrating with your existing systems.', 'Tell us what you run today and we will tell you how Symplus fits alongside it.', 'Contact Us')}
`;

/* ---------------- about ---------------- */

const aboutBody = (root) => `
<section class="page-hero-dark">
  <div class="container">
    <div class="eyebrow-row">
      <span class="eyebrow-badge">About Us</span>
      <span class="eyebrow-label">Who we are</span>
    </div>
    <h1>Over 14 years building the infrastructure African financial institutions run on.</h1>
    <p class="sub">Neulogic Solutions is a licensed software provider focused on African capital markets. Its product is Symplus.</p>
  </div>
</section>

<section style="padding:100px 0 0;">
  <div class="container">
    <div class="sol-block-1">
      <div class="sol-text">
        <div class="eyebrow-row">
          <span class="eyebrow-badge">Our Story</span>
        </div>
        <h2>We build trusted software for financial institutions.</h2>
        <p>Over fourteen years, Neulogic has built software for one kind of customer: the African financial institution that needs trusted, regulated operational software. Asset managers, stockbrokers, trustees, and lenders run their daily operations on Symplus.</p>
        <p style="margin-top:16px;">We are a licensed software provider. Our clients run the system and own their data. Our vision is Pan-African: software that regulated institutions can run wherever they operate.</p>
      </div>
      <div class="img-ph" data-drift style="min-height:420px;">
        ${img(IMG.aboutStory, 'Team gathered around a table in discussion')}
      </div>
    </div>
  </div>
</section>

<section style="padding:100px 0 0;">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow-row">
        <span class="eyebrow-badge">Leadership</span>
      </div>
      <h2>The leadership team.</h2>
    </div>
    <!-- PLACEHOLDER CONTENT: the three unnamed leadership cards use stock portraits and
         bracketed titles. Replace with real team members (photo, name, title) before launch. -->
    <div class="leader-grid">
      <div class="leader-card">
        <!-- Real photo supplied by Neulogic. Save the provided headshot as assets/img/chiedu-okeleke.jpg. -->
        <div class="img-ph ph-d">
          <img class="ph-img" src="${root}assets/img/chiedu-okeleke.jpg" alt="Chiedu Okeleke, Co-founder and CEO of Neulogic Solutions" onerror="this.parentElement.dataset.label='Add photo: assets/img/chiedu-okeleke.jpg';this.nextElementSibling&&this.nextElementSibling.remove();this.remove()"><span class="grade" aria-hidden="true"></span>
        </div>
        <div class="meta">
          <div class="name">Chiedu Okeleke</div>
          <div class="cap">MD &amp; CEO</div>
        </div>
      </div>
      <div class="leader-card is-placeholder" data-placeholder="true">
        <div class="img-ph">${img(IMG.leader1, 'Portrait placeholder', { w: 600 })}</div>
        <div class="meta">
          <div class="name">[Leadership team member]</div>
          <div class="cap">[Title: add real name and bio]</div>
        </div>
      </div>
      <div class="leader-card is-placeholder" data-placeholder="true">
        <div class="img-ph">${img(IMG.leader2, 'Portrait placeholder', { w: 600 })}</div>
        <div class="meta">
          <div class="name">[Leadership team member]</div>
          <div class="cap">[Title: add real name and bio]</div>
        </div>
      </div>
      <div class="leader-card is-placeholder" data-placeholder="true">
        <div class="img-ph">${img(IMG.leader3, 'Portrait placeholder', { w: 600 })}</div>
        <div class="meta">
          <div class="name">[Leadership team member]</div>
          <div class="cap">[Title: add real name and bio]</div>
        </div>
      </div>
    </div>
    <div class="quote-card" style="margin-top:60px;">
      <div class="qmark">&ldquo;</div>
      <blockquote>Good software isn&rsquo;t about more features. It&rsquo;s about getting the regulated details right.</blockquote>
      <div class="attr">Chiedu Okeleke, MD &amp; CEO</div>
    </div>
  </div>
</section>

<section style="padding:100px 0 0;">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow-row">
        <span class="eyebrow-badge">Mission &amp; Vision</span>
      </div>
      <h2>Why we do this.</h2>
    </div>
    <div class="cert-grid" style="grid-template-columns:1fr 1fr;">
      <div class="cert-card">
        <span class="tag">Mission</span>
        <h3>Software institutions can trust.</h3>
        <p>To give African financial institutions software they can run their regulated operations on with confidence.</p>
      </div>
      <div class="cert-card">
        <span class="tag">Vision</span>
        <h3>Unified infrastructure across Africa.</h3>
        <p>A Pan-African financial sector where every regulated institution operates on trusted, unified infrastructure.</p>
      </div>
    </div>
  </div>
</section>

<section style="padding:100px 0 0;">
  <div class="dark-band">
    <div class="container">
      <div class="stats-row" style="grid-template-columns:repeat(3,1fr);">
        <div><div class="num">14+</div><div class="lbl">Years building Symplus</div></div>
        <div><div class="num">65+</div><div class="lbl">Enterprises on licence</div></div>
        <div><div class="num">25+</div><div class="lbl">Years combined team experience in financial services technology</div></div>
      </div>
    </div>
  </div>
</section>

${ctaBand(root, 'Want to meet the team? Book a call.', '', 'Book a Call')}
`;

/* ---------------- implementation ---------------- */

const implementationBody = (root) => `
<section class="page-hero-dark">
  <div class="container">
    <div class="eyebrow-row">
      <span class="eyebrow-badge">Implementation</span>
      <span class="eyebrow-label">What happens after you sign</span>
    </div>
    <h1>From signed agreement to live system, here&rsquo;s exactly what happens.</h1>
    <p class="sub">A staged process with agreed checkpoints from scoping to go-live.</p>
  </div>
</section>

<section style="padding:100px 0 0;">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow-row">
        <span class="eyebrow-badge">The Process</span>
        <span class="eyebrow-label">Five stages</span>
      </div>
      <h2>The five stages.</h2>
    </div>
    <div class="steps">
      <div class="step-card">
        <div class="n">1</div>
        <h3>Discovery &amp; Scoping</h3>
        <p>We map your products, workflows, and regulatory obligations, and agree exactly what the system must do on day one.</p>
      </div>
      <div class="step-card">
        <div class="n">2</div>
        <h3>Data Migration</h3>
        <p>Your existing records — portfolios, clients, loan books, registers — are migrated, validated, and reconciled before anything goes live.</p>
      </div>
      <div class="step-card">
        <div class="n">3</div>
        <h3>Configuration &amp; Training</h3>
        <p>Symplus is configured to your products and controls, and your team is trained on the workflows they&rsquo;ll actually run.</p>
      </div>
      <div class="step-card">
        <div class="n">4</div>
        <h3>Go-Live</h3>
        <p>A controlled cutover, with results checked against your existing records before you switch.</p>
      </div>
      <div class="step-card">
        <div class="n">5</div>
        <h3>Ongoing Support</h3>
        <p>Technical support, managed services, and product updates for as long as you run the system.</p>
      </div>
    </div>
  </div>
</section>

<section style="padding:100px 0 0;">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow-row">
        <span class="eyebrow-badge">Services</span>
        <span class="eyebrow-label">How we support you</span>
      </div>
      <h2>Services we provide.</h2>
    </div>
    <div class="chip-row">
      <span class="chip">Implementation</span>
      <span class="chip">Product Customisation</span>
      <span class="chip">Systems Integration</span>
      <span class="chip">Data Migration</span>
      <span class="chip">Technical Support</span>
      <span class="chip">Managed Services</span>
      <span class="chip">Staff Training</span>
    </div>
  </div>
</section>

<section style="padding:100px 0 0;">
  <div class="container">
    <div class="section-head center">
      <div class="eyebrow-row">
        <span class="eyebrow-badge">FAQ</span>
        <span class="eyebrow-label">Common implementation questions</span>
      </div>
      <h2>Frequently asked questions.</h2>
    </div>
    <div class="faq">
      <details>
        <summary>How long does a typical implementation take?</summary>
        <div class="a">It depends on the modules deployed, the state of your existing data, and how many products you run — a single-module deployment moves much faster than a full platform migration. What we can promise: the timeline is agreed in Discovery &amp; Scoping and tracked stage by stage, so you always know exactly where the project stands.</div>
      </details>
      <details>
        <summary>What data do we need to have ready?</summary>
        <div class="a">Client records, current positions or balances (portfolios, loan books, trust registers, ledgers depending on your modules), and your product definitions. During Discovery we give you a precise extract checklist for your systems — and the migration stage includes validation and reconciliation, so imperfect source data is expected, not a crisis.</div>
      </details>
      <details>
        <summary>Who needs to be involved from our side?</summary>
        <div class="a">Typically: an operations lead who knows your daily workflows, someone who can speak for your finance and compliance requirements, and an IT contact for data extracts and infrastructure. Executive sponsorship helps decisions land quickly, but we structure the project so your team&rsquo;s day jobs keep running.</div>
      </details>
      <details>
        <summary>Do we run our old system in parallel?</summary>
        <div class="a">Go-live is a controlled cutover with parallel checks — results from Symplus are reconciled against your existing records before you switch. The exact parallel-run arrangement is agreed during scoping, based on your products and risk appetite.</div>
      </details>
      <details>
        <summary>What support do we get after go-live?</summary>
        <div class="a">Ongoing technical support, managed services if you want us operating parts of the stack, staff training for new joiners, and product updates. Support arrangements are part of your licence agreement, not an afterthought.</div>
      </details>
    </div>
  </div>
</section>

${ctaBand(root, 'Ready to start? Book a call.', 'Tell us what you run today and we&rsquo;ll walk you through what your implementation would look like.', 'Book a Call')}
`;

/* ---------------- request a demo ---------------- */

const demoBody = (root) => `
<section class="page-hero" style="padding-bottom:0;">
  <div class="container demo-grid">
    <div class="demo-side">
      <div class="eyebrow-row">
        <span class="eyebrow-badge">Request a Demo</span>
        <span class="eyebrow-label">See it running</span>
      </div>
      <h1>See Symplus running on your data, not a slideware demo.</h1>
      <p class="sub">Tell us what your institution runs and we&rsquo;ll show you the modules that matter to you, with scenarios that look like your actual operation.</p>
      <div class="demo-stats">
        <div><div class="num">65+</div><div class="lbl">Financial institutions</div></div>
        <div><div class="num">14+</div><div class="lbl">Years building Symplus</div></div>
      </div>
      <p style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#6b7066;margin-bottom:16px;">Trusted by</p>
      <div class="demo-logos">
        <span>Cordros</span>
        <span>FBNQuest</span>
        <span>FSDH</span>
      </div>
    </div>
    <div>
      <div class="form-card">
        <form id="demoForm">
          <div class="form-field">
            <label for="df-name">Name</label>
            <input id="df-name" type="text" required autocomplete="name">
          </div>
          <div class="form-field">
            <label for="df-email">Work Email</label>
            <input id="df-email" type="email" required autocomplete="email">
          </div>
          <div class="form-field">
            <label for="df-inst">Institution Name</label>
            <input id="df-inst" type="text" required autocomplete="organization">
          </div>
          <div class="form-field">
            <label for="df-type">Institution Type</label>
            <select id="df-type" required>
              <option value="" selected disabled>Select one…</option>
              <option>Asset Manager</option>
              <option>Broker</option>
              <option>Trustee</option>
              <option>Lender</option>
              <option>Other</option>
            </select>
          </div>
          <div class="form-field">
            <label for="df-systems">Current systems in use <span class="opt">(optional)</span></label>
            <input id="df-systems" type="text" placeholder="e.g. spreadsheets, in-house tools, other vendors">
          </div>
          <div class="form-field">
            <label for="df-team">Team size <span class="opt">(optional)</span></label>
            <select id="df-team">
              <option value="" selected disabled>Select one…</option>
              <option>1–10</option>
              <option>11–50</option>
              <option>51–200</option>
              <option>200+</option>
            </select>
          </div>
          <button type="submit" class="btn btn-orange" style="width:100%;margin-top:8px;">Request a Demo</button>
        </form>
        <div class="form-success" id="demoSuccess">
          <div class="check">${CHECK}</div>
          <h3>Request received.</h3>
          <p>Thanks, we&rsquo;ve got your details and our team will be in touch to schedule your demo.</p>
        </div>
      </div>
    </div>
  </div>
</section>
`;

/* ---------------- insights ---------------- */

// Real articles paraphrased from neulogicsolutions.com news posts. Bodies written fresh
// (facts, not copied sentences). Category "Company News" covers releases and milestones.
const articles = [
  {
    slug: 'ft-top-african-companies', cat: 'Company News', catSlug: 'company-news', imgId: 'art4',
    title: 'Symplus Users Make the FT&rsquo;s Top African Companies List',
    date: 'June 24, 2022', read: '3 min read',
    dek: 'The Financial Times&rsquo; first ranking of Africa&rsquo;s fastest-growing companies included several firms that run their operations on Symplus.',
    body: [
      'The Financial Times published its first ranking of Africa&rsquo;s fastest-growing companies, and several of the firms on the list run their operations on Symplus.',
      'Growth at that pace puts pressure on the systems underneath a business. A firm that doubles its book or adds a new line of business quickly finds out whether its software can keep up.',
      'The firms on that list needed operational software that scales with them rather than against them. That is the job Symplus is built to do: add desks, funds, and asset classes on the same ledger instead of bolting on another vendor for each one.',
      'Seeing our clients recognised on a stage like the FT&rsquo;s is a reminder of who we build for: the African financial institution that intends to grow.',
    ],
  },
  {
    slug: 'show-your-back-office-some-love', cat: 'Operations', catSlug: 'operations', imgId: 'art3',
    title: 'Show Your Back-Office Some Love',
    date: 'June 7, 2022', read: '4 min read',
    dek: 'Customer-facing portals and mobile apps get all the attention, but the back-office systems feeding them the data are what actually determine the experience.',
    body: [
      'Every institution wants a polished client portal and a fast mobile app. Those are the parts of the business a customer actually sees.',
      'But a portal is only as good as the data behind it. If the back office is slow, or the numbers a client sees do not match the numbers the firm closes on, no amount of front-end design will fix it.',
      'The back office is where valuations are struck, trades are settled, and statements are produced. When that runs on one clean ledger, the portal has something reliable to show. When it runs on spreadsheets stitched together, the cracks eventually surface on the client&rsquo;s screen.',
      'Investing in the back office is not glamorous, but it is what makes the front office trustworthy. Show it some love.',
    ],
  },
  {
    slug: 'symplus-mobile-applications', cat: 'Company News', catSlug: 'company-news', imgId: 'portalHero',
    title: 'Neulogic Releases New Symplus Mobile Applications',
    date: 'May 19, 2022', read: '3 min read',
    dek: 'Symplus Mobile is now live on the Apple App Store and Google Play, bringing investment and securities trading access to iPhone and Android users.',
    body: [
      'Symplus Mobile is now available on both the Apple App Store and Google Play. Clients of firms running Symplus can access their investment and securities trading accounts directly from their phones.',
      'The apps are interfaced to the same Symplus back office the firm runs internally, so what a client sees on their phone reflects the same records the institution works from.',
      'Mobile access is no longer a nice-to-have for a financial institution. Clients expect to check a portfolio or place an order from wherever they are, and the firms that make that easy hold on to more of them.',
      'The release is part of our continued investment in the client-facing side of Symplus, built with the same security-first approach we apply to every part of the platform.',
    ],
  },
  {
    slug: 'the-symplus-advantage', cat: 'Strategy', catSlug: 'strategy', imgId: 'art1',
    title: 'The Symplus Advantage',
    date: 'April 27, 2022', read: '4 min read',
    dek: 'A platform&rsquo;s real value shows up in how much room it gives your business to expand without bolting on new vendors.',
    body: [
      'Software is easy to compare on a feature list. The harder question is what happens two years later, when the business has grown and the requirements have changed.',
      'The Symplus advantage is room to expand. A firm can start with asset management and later add securities trading, trust management, or lending, on the same ledger, without introducing a new vendor for each line of business.',
      'That matters because every extra system is an extra integration to maintain, an extra reconciliation to run, and an extra place for the numbers to disagree. One platform removes that tax.',
      'The value of a platform is not just what it does today. It is how much it lets you grow without rebuilding your operations each time.',
    ],
  },
  {
    slug: 'derivatives-trading-module', cat: 'Trading', catSlug: 'trading', imgId: 'derivHero',
    title: 'Neulogic Releases New Derivatives Trading Module',
    date: 'April 15, 2022', read: '4 min read',
    dek: 'With NGX launching derivatives as a tradeable asset class after years of preparation, Symplus now ships a dedicated derivatives trading module to support it.',
    body: [
      'After years of preparation, the Nigerian Exchange Group launched derivatives as a new tradeable asset class. Symplus now ships a dedicated derivatives trading module built to support it.',
      'The module covers exchange-traded futures and options across multiple markets, with a broad range of underlying assets: commodities, stocks, bonds, interest rates, and currencies.',
      'Derivatives are a high-risk business, so the module is built around control. A rules-based compliance engine, real-time monitoring across the trade lifecycle, counterparty and regulatory risk reporting, and a full audit trail are part of it, not add-ons.',
      'It also connects straight through to the rest of Symplus, so front and back office share one set of records and there is no dual-keying between them.',
    ],
  },
  {
    slug: 'managing-funds-with-spreadsheets', cat: 'Operations', catSlug: 'operations', imgId: 'acctHero',
    title: 'You Mean You Manage Your Funds With Spreadsheets&hellip;?',
    date: 'August 24, 2021', read: '4 min read',
    dek: 'Spreadsheets are a great tool for quick number-crunching, but a liability as the system of record for a fund&rsquo;s operations.',
    body: [
      'Spreadsheets are excellent for what they were designed for: quick calculations and one-off analysis. The trouble starts when they quietly become the system of record for a fund.',
      'A spreadsheet has no audit trail worth the name, no real access control, and no guarantee that the version you are looking at is the current one. For a business that answers to a regulator, those are not small gaps.',
      'As a fund grows, the spreadsheets multiply. Someone maintains the links between them by hand, and the monthly close turns into a hunt for which cell broke this time.',
      'Managing a fund&rsquo;s operations deserves a system built for it: one ledger, proper controls, and numbers you can stand behind. If you are still running on spreadsheets, it is worth asking how long that can last.',
    ],
  },
  {
    slug: 'keeping-your-infrastructure-secure', cat: 'Compliance', catSlug: 'compliance', imgId: 'art2',
    title: 'Keeping Your Infrastructure Secure',
    date: 'July 3, 2017', read: '4 min read',
    dek: 'The WannaCry and NotPetya ransomware attacks were a wake-up call: network and infrastructure security can no longer be an afterthought.',
    body: [
      'The WannaCry and NotPetya ransomware attacks spread across the world and disrupted large organisations that assumed they were prepared. For financial institutions, they were a wake-up call.',
      'Security cannot be an afterthought bolted on at the end. It has to be built into how systems are designed, deployed, and maintained, and reviewed as threats change.',
      'For an institution holding client money and client data, the cost of a breach is not only financial. It is the trust that took years to build and can be lost in a day.',
      'Keeping infrastructure secure is ongoing work, not a one-time project. The firms that treat it that way are the ones still standing after the next attack.',
    ],
  },
  {
    slug: 'the-nigerian-investor', cat: 'Strategy', catSlug: 'strategy', imgId: 'aboutStory',
    title: 'The Nigerian Investor',
    date: 'February 18, 2017', read: '3 min read',
    dek: 'Nigerians clearly want a return on idle cash, and the rush toward Ponzi schemes shows an appetite for investing that is not being met with the right products.',
    body: [
      'Every time a Ponzi scheme sweeps through Nigeria, it reveals something real underneath the losses: a genuine appetite to put idle cash to work.',
      'The problem is not that Nigerians do not want to invest. It is that the legitimate products and channels have not always reached them in a form that is easy to access and trust.',
      'That is an opportunity for asset managers and securities firms. The demand exists. The firms that meet it with accessible, well-run products, backed by operations clients can rely on, will win that market.',
      'Technology has a part to play here, making it easier for institutions to offer, service, and report on products at the scale this demand implies.',
    ],
  },
  {
    slug: 'robust-investment-solution', cat: 'Strategy', catSlug: 'strategy', imgId: 'iwmHero',
    title: 'Are You Looking for a Robust Investment Solution?',
    date: 'December 11, 2016', read: '3 min read',
    dek: 'Built over years of working directly with market operators, Symplus has grown into a tested, full-featured investment and asset management solution.',
    body: [
      'Choosing the software an investment business runs on is a decision you live with for years. It pays to choose something that has already been tested by real operators.',
      'Symplus was built over more than a decade of working directly with market operators in African capital markets. Every module reflects requirements that came from firms doing the work, not from a whiteboard.',
      'The result is a full-featured investment and asset management solution: portfolio and fund management, multi-asset and multi-currency support, a compliance engine, and reporting, on one ledger.',
      'If you are evaluating a robust investment solution, the questions worth asking are how long it has been in production, who runs it, and whether it can grow with you. On all three, Symplus has a track record.',
    ],
  },
];

const insightsHubBody = (root) => `
<section class="page-hero" style="padding-bottom:30px;">
  <div class="container">
    <div class="eyebrow-row">
      <span class="eyebrow-badge">Insights</span>
      <span class="eyebrow-label">Resources</span>
    </div>
    <h1>Insights in the industry.</h1>
    <p class="sub">Articles on operations, trading, compliance, and systems strategy for regulated financial institutions.</p>
  </div>
</section>

<section style="padding:20px 0 0;">
  <div class="container">
    <div class="filter-bar" data-filter-bar data-filter-target="#articleGrid">
      <button class="filter-btn active" data-cat="all">All</button>
      <button class="filter-btn" data-cat="operations">Operations</button>
      <button class="filter-btn" data-cat="compliance">Compliance</button>
      <button class="filter-btn" data-cat="trading">Trading</button>
      <button class="filter-btn" data-cat="strategy">Strategy</button>
      <button class="filter-btn" data-cat="company-news">Company News</button>
    </div>
    <div class="article-grid" id="articleGrid">
      ${articles.map(a => `<a class="article-card" data-cat="${a.catSlug}" href="${root}insights/${a.slug}/index.html">
        <div class="img-ph">${img(IMG[a.imgId], '')}</div>
        <div class="body">
          <span class="cat">${a.cat}</span>
          <h3>${a.title}</h3>
          <p style="font-size:13.5px;color:#5a6055;">${a.dek}</p>
          <p class="meta">Neulogic Team &nbsp;·&nbsp; ${a.date} &nbsp;·&nbsp; ${a.read}</p>
        </div>
      </a>`).join('\n      ')}
    </div>
    <div class="filter-empty" id="articleGrid-empty">No articles in this category yet.</div>
  </div>
</section>

${ctaBand(root, 'Questions about your own systems?', 'Talk to us about your next system review.', 'Contact Us')}
`;

const articleBody = (a, root) => {
  const related = articles.filter(x => x.slug !== a.slug).slice(0, 2);
  return `
<section class="container article-header">
  <span class="cat" style="display:inline-block;background:var(--sage-bg);color:var(--sage-text);font-size:10px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;padding:5px 12px;border-radius:999px;">${a.cat}</span>
  <h1>${a.title}</h1>
  <p class="meta">By Neulogic Team &nbsp;·&nbsp; ${a.date} &nbsp;·&nbsp; ${a.read}</p>
</section>

<section class="container" style="max-width:1000px;padding-bottom:50px;">
  <div class="img-ph" data-drift style="min-height:340px;">${img(IMG[a.imgId], '', { eager: true })}</div>
</section>

<article class="container article-body">
  <p class="article-lead"><strong>${a.dek}</strong></p>
  ${a.body.map(p => `<p>${p}</p>`).join('\n  ')}
</article>

<section style="padding:40px 0 0;">
  <div class="container">
    <div class="section-head">
      <h2>Related articles</h2>
    </div>
    <div class="article-grid">
      ${related.map(r => `<a class="article-card" href="${root}insights/${r.slug}/index.html">
        <div class="img-ph" style="min-height:160px;">${img(IMG[r.imgId], '')}</div>
        <div class="body">
          <span class="cat">${r.cat}</span>
          <h3>${r.title}</h3>
          <p class="meta">Neulogic Team &nbsp;·&nbsp; ${r.date}</p>
        </div>
      </a>`).join('\n      ')}
    </div>
  </div>
</section>

${ctaBand(root, 'See Symplus in a demo.', 'Talk to us about the workflows these articles describe.', 'Contact Us')}
`;
};

/* ---------------- careers ---------------- */

const careersBody = (root) => `
<section class="page-hero-dark">
  <div class="container">
    <div class="eyebrow-row">
      <span class="eyebrow-badge">Careers</span>
      <span class="eyebrow-label">Join Neulogic</span>
    </div>
    <h1>Join us at Neulogic.</h1>
    <p class="sub">We build the software that regulated institutions across Africa run their daily operations on, and we would like to have you.</p>
  </div>
</section>

<section style="padding:100px 0 0;">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow-row">
        <span class="eyebrow-badge">Open Roles</span>
      </div>
      <h2>Current openings.</h2>
    </div>
    <div class="roles-empty">
      <h3>No open roles at the moment.</h3>
      <p>Check back soon, or introduce yourself anyway. We keep strong candidates in mind.</p>
    </div>
  </div>
</section>

<section style="padding:100px 0 0;">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow-row">
        <span class="eyebrow-badge">Why Join Us</span>
      </div>
      <h2>Work that regulated institutions depend on.</h2>
    </div>
    <div class="cert-grid">
      <div class="feature-card">
        <div class="icon">${CHECK}</div>
        <h3>Deep domain expertise</h3>
        <p>25+ years of combined team experience in financial services technology. You will learn from people who have shipped systems regulators examine.</p>
      </div>
      <div class="feature-card">
        <div class="icon">${CHECK}</div>
        <h3>Pan-African vision</h3>
        <p>Symplus is used by institutions across African capital markets, and the work is visible in how they operate every day.</p>
      </div>
      <div class="feature-card">
        <div class="icon">${CHECK}</div>
        <h3>Licensed-software model</h3>
        <p>As a licensed software provider, we win on getting the regulated details right. That standard shapes how we build.</p>
      </div>
    </div>
    <div class="img-ph" data-drift style="min-height:380px;margin-top:60px;">
      ${img(IMG.careers, 'Colleagues in a relaxed team discussion')}
    </div>
  </div>
</section>

<section class="cta-band" style="margin-top:110px;">
  <div class="container">
    <h2>Don&rsquo;t see a role that fits?</h2>
    <p class="sub">Email us and tell us what you do.</p>
    <a href="mailto:support@m.neulogicsolutions.com" class="btn btn-orange">Email us at support@m.neulogicsolutions.com</a>
  </div>
</section>
`;

/* ---------------- contact ---------------- */

const contactBody = (root) => `
<section class="page-hero-dark">
  <div class="container">
    <div class="eyebrow-row">
      <span class="eyebrow-badge">Contact</span>
    </div>
    <h1>Contact us.</h1>
    <p class="sub">Talk to our team about running your operations on Symplus.</p>
  </div>
</section>

<section style="padding:100px 0 0;">
  <div class="container">
    <div class="cert-grid">
      <div class="cert-card">
        <span class="tag">Email</span>
        <h3>support@m.neulogicsolutions.com</h3>
        <p>Send us a message and our team will get back to you.</p>
      </div>
      <div class="cert-card">
        <span class="tag">Phone</span>
        <h3>+234 814 899 0091</h3>
        <p>Call us during business hours, Monday to Friday.</p>
      </div>
      <div class="cert-card">
        <span class="tag">Office</span>
        <h3>Lagos, Nigeria</h3>
        <p>Neulogic Solutions Limited<br>25 Olusoji Idowu Street, Off Ikorodu Road, Ilupeju, Lagos, Nigeria.</p>
      </div>
    </div>
    <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-top:56px;">
      <a href="mailto:support@m.neulogicsolutions.com" class="btn btn-orange">Send us a mail</a>
      <a href="tel:+2348148990091" class="btn btn-dark">Call us</a>
    </div>
  </div>
</section>
`;

/* ---------------- partners, integrations & security (merged) ---------------- */

const pisBody = (root) => `
<section class="page-hero-dark">
  <div class="container">
    <div class="eyebrow-row"><span class="eyebrow-badge">Why Neulogic</span></div>
    <h1>Partners, Integrations &amp; Security</h1>
    <p class="sub">The technology partners we run on, the exchange infrastructure we connect to, and how Symplus handles integration, compliance, and security.</p>
  </div>
</section>

<section style="padding:100px 0 0;">
  <div class="container" style="text-align:center;">
    <div class="section-head center">
      <div class="eyebrow-row"><span class="eyebrow-badge">Technology Partners</span></div>
      <h2>Built on infrastructure you already trust.</h2>
      <p>Symplus is built and deployed on infrastructure and tooling from these technology partners.</p>
    </div>
    <div class="partner-strip">
      <span>Oracle</span>
      <span>Microsoft Azure</span>
      <span>Power BI</span>
    </div>
  </div>
</section>

<section style="padding:100px 0 0;">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow-row"><span class="eyebrow-badge">Market Infrastructure</span></div>
      <h2>Connected to the exchange, certified not co-branded.</h2>
      <p>Symplus connects directly to NGX&rsquo;s trading infrastructure. This reflects certified connectivity, not a business partnership with NGX.</p>
    </div>
    <div class="cert-grid" style="grid-template-columns:1fr;">
      <div class="cert-card">
        <span class="tag">Exchange</span>
        <h3>Nigerian Exchange Group (NGX)</h3>
        <p>Trade-X provides real-time, FIX-protocol order management and market-data access across all NGX trading boards. When NGX launched derivatives as a new tradeable asset class, Symplus shipped a dedicated derivatives trading module built to support it.</p>
      </div>
    </div>
  </div>
</section>

<section style="padding:100px 0 0;">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow-row"><span class="eyebrow-badge">Integration Capabilities</span></div>
      <h2>Symplus connects to the systems you already run.</h2>
    </div>
    <div class="cert-grid">
      <div class="feature-card"><div class="icon">${CHECK}</div><h3>API-Based Integration</h3><p>An open API interface for integration with any third-party application.</p></div>
      <div class="feature-card"><div class="icon">${CHECK}</div><h3>FIX Protocol Connectivity</h3><p>Real-time order and market-data messaging with multiple markets and trading destinations.</p></div>
      <div class="feature-card"><div class="icon">${CHECK}</div><h3>Cross-Module Integration</h3><p>Securities trading, trust management, and accounting modules are directly integrated with each other, so front-office, back-office, and financial reporting run off the same data.</p></div>
    </div>
  </div>
</section>

<section style="padding:100px 0 0;">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow-row"><span class="eyebrow-badge">Compliance &amp; Security</span></div>
      <h2>What Symplus does, said plainly.</h2>
    </div>
    <div class="cert-grid">
      <div class="feature-card"><div class="icon">${CHECK}</div><h3>Rules-Based Compliance Engines</h3><p>The Asset Management and Derivatives modules include rules-based compliance engines that keep portfolios and trades within defined risk and regulatory parameters. This is a product feature for your own regulatory compliance.</p></div>
      <div class="feature-card"><div class="icon">${CHECK}</div><h3>IFRS-Compliant Reporting</h3><p>The Accounting module produces IFRS-compliant financial statements: Trial Balance, Statement of Financial Position, and Income Statement.</p></div>
      <div class="feature-card"><div class="icon">${CHECK}</div><h3>Security-Minded Development</h3><p>Our mobile development process uses a shift-left approach, building security testing into every stage of the app lifecycle from ideation through release, to protect data integrity in mobile financial transactions.</p></div>
    </div>
  </div>
</section>

${ctaBand(root, 'Have specific security or compliance requirements for your institution?', 'Talk to us and we will walk you through how Symplus is deployed for your environment.', 'Contact Us')}
`;

/* ---------------- our clients ---------------- */

const clientsRoster = [
  { name: 'Cordros', logo: 'cordros' },
  { name: 'United Capital', logo: 'unicap', story: 'united-capital-asset-management' },
  { name: 'FBNQuest', logo: 'fbnquest' },
  { name: 'CSL Stockbrokers', logo: 'csl' },
  { name: 'FSDH', logo: 'fsdh', story: 'fsdh-asset-management' },
  { name: 'RenCap', logo: 'rencap' },
  { name: 'Royal Exchange', logo: 'royalexchange' },
  { name: 'Norrenberger Financial Group', logo: 'norrenberger', story: 'norrenberger-financial-group' },
  { name: 'AVA Asset Management &amp; Securities Trading' },
  { name: 'TrustBanc' },
  { name: 'Cowry Asset Management' },
  { name: 'GTI Securities &amp; Asset Management' },
  { name: 'Griffin' },
  { name: 'Imperial Asset Managers' },
  { name: 'Zedcrest Capital' },
  { name: 'First Ally' },
  { name: 'StoneX' },
  { name: 'Iron' },
  { name: 'Radix Capital' },
];

const clientsBody = (root) => `
<section class="page-hero-dark">
  <div class="container">
    <div class="eyebrow-row"><span class="eyebrow-badge">Our Clients</span></div>
    <h1>Supporting institutions across every stage of growth.</h1>
    <p class="sub">Symplus scales with your organisation&rsquo;s operations, whether you are a one-fund company or a multi-business company.</p>
    <p class="hero-trust-text" style="margin-top:26px;color:var(--orange);">Trusted by 65+ financial institutions</p>
  </div>
</section>

<section style="padding:100px 0 40px;">
  <div class="container">
    <div class="clients-roster">
      ${clientsRoster.map(c => `<div class="roster-card">
        ${c.logo ? `<div class="roster-logo"><img src="${root}assets/img/clients/${c.logo}.png" alt="${c.name}" loading="lazy"></div>` : `<div class="roster-name">${c.name}</div>`}
        ${c.story ? `<a class="roster-story" href="${root}client-success/${c.story}/index.html">Read their story ${ARROW}</a>` : ''}
      </div>`).join('\n      ')}
    </div>
  </div>
</section>

${ctaBand(root, 'Let&rsquo;s talk about your operations.', 'Tell us what you run today and what you want to change.', 'Contact Us')}
`;

/* ---------------- case-studies redirect (old URL -> client-success) ---------------- */

const redirectBody = (target) => `
<section class="page-hero-dark"><div class="container">
<h1>This page has moved.</h1>
<p class="sub">Case Studies is now Client Success. <a href="${target}" style="color:var(--orange);">Continue &rarr;</a></p>
</div></section>
<script>location.replace(${JSON.stringify(target)});</script>
`;

/* ---------------- page registry & build ---------------- */

const pages = [
  { file: 'index.html', title: 'Neulogic Solutions | The Pan-African software platform for regulated financial operations', desc: 'Neulogic Solutions builds Symplus, an integrated platform for asset managers, brokers, trustees, and lenders across Africa.', light: false, body: homeBody },
  { file: 'client-success/index.html', title: 'Client Success | Neulogic Solutions', desc: 'Client success stories from institutions running their operations on Symplus.', light: true, body: caseHubBody },
  ...caseStudies.map(cs => ({
    file: `client-success/${cs.slug}/index.html`,
    title: `${cs.client.replace(/&amp;/g, '&')} | Client Success | Neulogic Solutions`,
    desc: `How ${cs.client.replace(/&amp;/g, '&')} runs its operations on Symplus.`,
    light: true,
    body: (root) => caseDetailBody(cs, root),
  })),
  // redirect the old Case Studies URL to Client Success
  { file: 'case-studies/index.html', title: 'Client Success | Neulogic Solutions', desc: 'This page has moved to Client Success.', light: false, body: (root) => redirectBody(`${root}client-success/index.html`) },
  { file: 'clients/index.html', title: 'Our Clients | Neulogic Solutions', desc: 'The financial institutions across Africa that run their operations on Symplus.', light: false, body: clientsBody },
  { file: 'partners-integrations-security/index.html', title: 'Partners, Integrations & Security | Neulogic Solutions', desc: 'The technology partners we run on, the exchange infrastructure we connect to, and how Symplus handles integration, compliance, and security.', light: false, body: pisBody },
  { file: 'about/index.html', title: 'About Us | Neulogic Solutions', desc: 'Over 14 years building the infrastructure African financial institutions run on.', light: false, body: aboutBody },
  { file: 'contact/index.html', title: 'Contact | Neulogic Solutions', desc: 'Contact Neulogic Solutions: email support@m.neulogicsolutions.com, call +234 814 899 0091, or visit our Lagos office.', light: false, body: contactBody },
  { file: 'services/index.html', title: 'Services | Neulogic Solutions', desc: 'From technical staffing to custom development and hands-on training, our services team supports every stage of your Symplus deployment.', light: false, body: servicesHubBody },
  { file: 'request-demo/index.html', title: 'Request a Demo | Neulogic Solutions', desc: 'See Symplus running on your data, not a slideware demo.', light: true, body: demoBody },
  { file: 'insights/index.html', title: 'Insights | Neulogic Solutions', desc: 'Insights in the industry: operational thinking for regulated financial institutions.', light: true, body: insightsHubBody },
  { file: 'careers/index.html', title: 'Careers | Neulogic Solutions', desc: 'Join us at Neulogic. We build the software African financial institutions run on.', light: false, body: careersBody },
  ...solutions.map(s => ({
    file: `solutions/${s.slug}/index.html`,
    title: `${s.name} | Neulogic Solutions`,
    desc: s.sub,
    light: true,
    body: (root) => solutionPageBody(s, root),
  })),
  ...services.map(s => ({
    file: `services/${s.slug}/index.html`,
    title: `${s.name} | Services | Neulogic Solutions`,
    desc: s.sub,
    light: true,
    body: (root) => solutionPageBody(s, root, 'Services'),
  })),
  ...articles.map(a => ({
    file: `insights/${a.slug}/index.html`,
    title: `${a.title.replace(/&[a-z]+;/g, '')} | Neulogic Insights`,
    desc: a.dek,
    light: true,
    body: (root) => articleBody(a, root),
  })),
];

for (const p of pages) {
  const depth = p.file.split('/').length - 1;
  const root = '../'.repeat(depth);
  const standalone = p.file !== 'index.html';
  const html = headHTML(p.title, p.desc, root, p.file)
    + headerHTML(root, p.light)
    + p.body(root)
    + footerHTML(root, standalone);
  const out = path.join(__dirname, p.file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  console.log('wrote', p.file);
}
console.log(`\n${pages.length} pages generated.`);
