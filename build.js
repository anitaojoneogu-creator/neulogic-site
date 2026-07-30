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
    <a href="${root}index.html" class="logo" aria-label="Neulogic home"><img src="${root}assets/img/neulogic-logo.png" alt="Neulogic"></a>
    <nav class="main-nav" id="mainNav" aria-label="Main navigation">
      <div class="nav-item">
        <button type="button" aria-haspopup="true">Solutions <span class="caret"></span></button>
        <div class="dropdown">
          <a href="${root}solutions/investment-wealth-management/index.html">Investment &amp; Wealth Management</a>
          <a href="${root}solutions/securities-trading/index.html">Securities Trading</a>
          <a href="${root}solutions/trust-management/index.html">Trust Management</a>
          <a href="${root}solutions/loan-management/index.html">Loan Management</a>
          <a href="${root}solutions/accounting-finance/index.html">Accounting &amp; Finance</a>
          <a href="${root}solutions/customer-portal/index.html">Customer Portal</a>
          <a href="${root}solutions/api-integration/index.html">API &amp; Systems Integration</a>
        </div>
      </div>
      <div class="nav-item">
        <button type="button" aria-haspopup="true">Why Neulogic <span class="caret"></span></button>
        <div class="dropdown">
          <a href="${root}about/index.html">About Us</a>
          <a href="${root}case-studies/index.html">Case Studies</a>
          <a href="${root}partners/index.html">Partners &amp; Integrations</a>
          <a href="${root}security-compliance/index.html">Security &amp; Compliance</a>
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
      <span class="footer-logo"><img src="${root}assets/img/neulogic-logo.png" alt="Neulogic"></span>
    </div>
    <div class="footer-main">
      <div class="footer-col">
        <h4>Solutions</h4>
        <ul>
          <li><a href="${root}solutions/investment-wealth-management/index.html">Investment &amp; Wealth Management</a></li>
          <li><a href="${root}solutions/securities-trading/index.html">Securities Trading</a></li>
          <li><a href="${root}solutions/trust-management/index.html">Trust Management</a></li>
          <li><a href="${root}solutions/loan-management/index.html">Loan Management</a></li>
          <li><a href="${root}solutions/accounting-finance/index.html">Accounting &amp; Finance</a></li>
          <li><a href="${root}solutions/customer-portal/index.html">Customer Portal</a></li>
          <li><a href="${root}solutions/api-integration/index.html">API &amp; Systems Integration</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <ul>
          <li><a href="${root}about/index.html">About Us</a></li>
          <li><a href="${root}security-compliance/index.html">Security &amp; Compliance</a></li>
          <li><a href="${root}case-studies/index.html">Case Studies</a></li>
          <li><a href="${root}partners/index.html">Partners &amp; Integrations</a></li>
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

const solutions = [
  {
    slug: 'investment-wealth-management',
    name: 'Investment & Wealth Management',
    shortName: 'Investment & Wealth Management',
    headline: 'Portfolio management, fund accounting, and client reporting in one system.',
    sub: 'Symplus produces daily NAV, unit pricing, client statements, and regulatory returns from one set of accounting records.',
    imgId: 'iwmHero',
    imgAlt: 'Financial advisor reviewing a portfolio with a client',
    tags: ['Portfolio Management', 'Client Reporting', 'Compliance'],
    callouts: [
      { big: 'Daily NAV', lbl: 'Valuation and unit pricing on a daily cadence', cls: 'ph-a' },
      { big: 'Multi-asset', lbl: 'Equities, fixed income, funds and alternatives in one book', cls: 'ph-c' },
      { big: 'Multi-currency', lbl: 'Portfolios valued and reported across currencies', cls: 'accent' },
      { big: 'One ledger', lbl: 'Front office to fund accounting, no re-keying', cls: 'ph-d' },
    ],
    features: [
      ['Portfolio Management', 'Positions, valuations, and performance for every mandate in one live book.'],
      ['Fund Management', 'Individual/SMA, unitised/mutual, non-unitised, and capital funds administered on one ledger.'],
      ['Portfolio Rebalancing', 'Model-driven rebalancing with drift monitoring and proposed trade lists.'],
      ['Risk Management', 'Exposure, concentration, and limit monitoring across every portfolio.'],
      ['Client Reporting', 'Statements and valuation reports generated straight from the ledger.'],
      ['Investment Compliance', 'Rules-based pre- and post-trade checks against mandates and regulation.'],
      ['Multi-Asset Class Management', 'Equities, fixed income, money market, and alternatives handled natively.'],
      ['Multi-Currency Portfolio Management', 'Book, value, and report portfolios in any combination of currencies.'],
      ['Corporate Actions Processing', 'Dividends, splits, and rights applied automatically to affected holdings.'],
      ['Performance Analytics', 'Returns, attribution, and benchmark comparison for every portfolio.'],
      ['Client Onboarding & CRM', 'KYC records, account opening, and client relationships managed in-platform.'],
    ],
    who: 'Built for asset managers, wealth managers, and investment firms.',
    whoChips: ['Asset Managers', 'Wealth Managers', 'Investment Firms', 'Portfolio Managers', 'Fund Accountants', 'Compliance Teams'],
    connect: 'Trades booked by your trading desk update portfolio valuations as they execute. Fund accounting, client reporting, and compliance read the same records, so there is nothing to reconcile between them.',
    connectsTo: ['accounting-finance', 'customer-portal', 'api-integration'],
  },
  {
    slug: 'securities-trading',
    name: 'Securities Trading',
    shortName: 'Securities Trading',
    headline: 'Order management, execution, and settlement for stockbrokers and dealers.',
    sub: 'Symplus covers order capture, execution, CSD settlement, and back-office processing, with NGX-certified trading capabilities.',
    imgId: 'tradingHero',
    imgAlt: 'Trader working at a desk with market screens',
    tags: ['Order Management', 'Trade Execution', 'Settlement'],
    callouts: [
      { big: 'NGX-certified', lbl: 'Certified trading capabilities on the Nigerian Exchange', cls: 'accent' },
      { big: 'Straight-through', lbl: 'Order to settlement without re-keying', cls: 'ph-a' },
      { big: 'Front + back', lbl: 'One system across front and back office', cls: 'ph-c' },
      { big: 'Client portals', lbl: 'Web and mobile trading for your customers', cls: 'ph-d' },
    ],
    features: [
      ['Brokerage Management', 'The full brokerage operation: clients, orders, positions, and fees in one system.'],
      ['Equities Trading', 'Order capture, execution, and position keeping for listed equities.'],
      ['Fixed Income Trading', 'Bonds and money-market instruments traded and settled alongside equities.'],
      ['Derivatives Trading', 'Exchange-traded derivatives with margin tracked at daily cadence.'],
      ['Order Management', 'Capture, route, amend, and audit every order through its full lifecycle.'],
      ['Trade Execution', 'Execution workflows certified against NGX trading infrastructure.'],
      ['Position Management', 'Real-time positions by client, instrument, and desk.'],
      ['Settlement Processing', 'CSD reconciliation and settlement processing, with exceptions flagged automatically.'],
      ['Front Office & Back Office Operations', 'One ledger from client order to back-office postings.'],
      ['Customer Trading Portal', 'A branded web portal where clients place orders and track their accounts.'],
      ['Mobile Trading', 'Trading and account access from your clients’ phones.'],
      ['Trading Reports & Analytics', 'Desk, client, and regulatory reporting straight from trade data.'],
    ],
    who: 'Built for stockbrokers, securities dealers, and capital market operators.',
    whoChips: ['Stockbrokers', 'Securities Dealers', 'Capital Market Operators', 'Dealing Desks', 'Back-Office Teams'],
    connect: 'Executed trades post straight to portfolio management and the general ledger, with no export step and no re-keying. Settlement data reconciles against the same records your accountants close on.',
    connectsTo: ['accounting-finance', 'loan-management', 'customer-portal', 'api-integration'],
  },
  {
    slug: 'trust-management',
    name: 'Trust Management',
    shortName: 'Trust Management',
    headline: 'Software for trust administration, from registers to beneficiary payments.',
    sub: 'Symplus administers corporate, public, and private trusts, with fiduciary records, covenant registers, and beneficiary accounts.',
    imgId: 'trustHero',
    imgAlt: 'Professionals in discussion around a boardroom table',
    tags: ['Fiduciary Registers', 'Beneficiary Accounts', 'Bond Trusts'],
    callouts: [
      { big: 'One ledger', lbl: 'Every trust and beneficiary tied to a single record', cls: 'ph-b' },
      { big: 'Bond trusteeship', lbl: 'Corporate and government bond trusts with covenant registers', cls: 'ph-c' },
      { big: 'Audit-ready', lbl: 'Registers your regulator and auditors can walk through', cls: 'accent' },
      { big: 'No re-keying', lbl: 'Trust accounting posts straight to the ledger', cls: 'ph-d' },
    ],
    features: [
      ['Corporate Trust', 'Trusteeship for corporate structures, administered end to end.'],
      ['Public Trust', 'Public trust mandates with complete fiduciary records.'],
      ['Private Trust', 'Private and family trusts managed on the same ledger.'],
      ['Syndication', 'Syndicated facilities with every participant’s position on record.'],
      ['Corporate & Government Bonds', 'Bond trusteeship with covenant registers and due-date tracking.'],
      ['Unit Trusts', 'Unitised schemes with holdings and pricing in one place.'],
      ['Reserve Funds', 'Reserve and sinking funds tracked against their obligations.'],
      ['Living Trusts', 'Living trusts administered across their full life.'],
      ['Will Administration', 'Estates and wills processed with a complete audit trail.'],
      ['Custodian Services', 'Custody records reconciled against the ledger.'],
      ['Executorship', 'Executorship mandates with every action on record.'],
      ['Education Trusts', 'Education trusts with beneficiary schedules and disbursements.'],
      ['Beneficiary Account Management', 'Every beneficiary’s entitlements and payments in one account view.'],
    ],
    who: 'Built for trustees and pension fund administrators.',
    whoChips: ['Trustees', 'Pension Fund Administrators', 'Fiduciary Services Teams', 'Estate Administrators'],
    connect: 'Trust accounting posts to the same general ledger as the rest of your operation, and portfolio holdings held in trust feed valuation, compliance, and reporting directly.',
    connectsTo: ['accounting-finance', 'customer-portal', 'api-integration'],
  },
  {
    slug: 'loan-management',
    name: 'Loan Management',
    shortName: 'Loan Management',
    headline: 'Loan management from origination to payoff.',
    sub: 'Symplus tracks each loan with its collateral, repayment schedule, and arrears status, across every lending product.',
    imgId: 'loanHero',
    imgAlt: 'Bankers reviewing loan documents together',
    tags: ['Loan Portfolio', 'Collateral', 'Reporting'],
    callouts: [
      { big: 'End to end', lbl: 'Origination to payoff on one book', cls: 'ph-d' },
      { big: 'Every product', lbl: 'Personal, commercial, mortgage and syndicated', cls: 'ph-a' },
      { big: 'Collateral tracked', lbl: 'Registered, valued, and tied to its facilities', cls: 'accent' },
      { big: 'What-if ready', lbl: 'Stress the portfolio before you commit', cls: 'ph-c' },
    ],
    features: [
      ['Personal, Commercial, Mortgage & Syndicated Loans', 'Every lending product on one book, from retail to syndicated facilities.'],
      ['Line of Credit', 'Revolving facilities with drawdowns and limits tracked live.'],
      ['Instalment Loans', 'Schedule-driven products with every instalment posted automatically.'],
      ['Loan Portfolio Management', 'The whole book by product, sector, and performance status.'],
      ['Collateral Management', 'Collateral registered, valued, and tied to its facilities.'],
      ['Standing Orders', 'Repayments collected on schedule without manual intervention.'],
      ['Payment Waivers', 'Waivers applied under controlled, auditable approval.'],
      ['Loan Reporting', 'Portfolio, arrears, and regulatory reports straight from the book.'],
      ['Credit Portfolio Analysis', 'Concentration and performance analysis across the portfolio.'],
      ['What-if Scenario Analysis', 'Model interest-rate and repayment scenarios across the portfolio.'],
    ],
    who: 'Built for lenders, banks, and discount houses.',
    whoChips: ['Lenders', 'Banks', 'Discount Houses', 'Credit Teams', 'Loan Operations'],
    connect: 'Loan postings hit the general ledger as they happen, collateral positions inform risk reporting, and Business Intelligence reads the book in real time.',
    connectsTo: ['accounting-finance', 'customer-portal', 'api-integration'],
  },
  {
    slug: 'accounting-finance',
    name: 'Accounting & Finance',
    shortName: 'Accounting & Finance',
    headline: 'Accounting built into every module.',
    sub: 'The general ledger posts as transactions happen. Reconciliation, financial statements, and IFRS reporting run on live data.',
    imgId: 'acctHero',
    imgAlt: 'Accountant working through figures with a calculator',
    tags: ['General Ledger', 'IFRS Reporting', 'Reconciliation'],
    callouts: [
      { big: 'Live GL', lbl: 'Posts the moment transactions happen', cls: 'ph-a' },
      { big: 'IFRS-ready', lbl: 'Reporting aligned to IFRS out of the box', cls: 'accent' },
      { big: 'Multi-company', lbl: 'Consolidated across entities and currencies', cls: 'ph-b' },
      { big: 'Any-day close', lbl: 'A trial balance you can produce any day of the month', cls: 'ph-c' },
    ],
    features: [
      ['General Ledger', 'Every transaction posted to a live ledger the moment it happens.'],
      ['Cash Management', 'Cash positions and movements across every account.'],
      ['Customer Accounts', 'Client money and customer balances fully segregated and reconciled.'],
      ['Accounts Receivable', 'Billing and collections tracked through to settlement.'],
      ['Bank Reconciliation', 'Statements matched against the ledger, exceptions surfaced automatically.'],
      ['Budget Management', 'Budgets set and tracked against actuals in real time.'],
      ['Fixed Asset Management', 'Asset registers with depreciation posted automatically.'],
      ['Financial Statements', 'P&amp;L, balance sheet, and cash flow straight from the ledger.'],
      ['Trial Balance', 'A trial balance you can produce any day of the month.'],
      ['IFRS Reporting', 'Reporting aligned to IFRS out of the box.'],
      ['Multi-Company & Multi-Currency Accounting', 'Consolidate across entities and currencies without spreadsheets.'],
      ['Financial Report Generator', 'Build the reports your board and regulator ask for.'],
    ],
    who: 'Built for CFOs and finance teams across every institution type.',
    whoChips: ['CFOs', 'Financial Controllers', 'Finance Teams', 'Fund Accountants', 'Internal Audit'],
    connect: 'Every other module posts here. Portfolios, trades, trusts, and loans all land in the same books.',
    connectsTo: '*',
  },
  {
    slug: 'customer-portal',
    name: 'Customer Portal',
    shortName: 'Customer Portal',
    headline: 'A client portal built around your institution, not a generic template.',
    sub: 'Neulogic builds and connects a self-service portal for your clients, reflecting whichever Symplus solution you run.',
    imgId: 'portalHero',
    imgAlt: 'A client checking their account on a laptop and phone',
    tags: ['Client Login', 'Account View', 'Statements'],
    callouts: [
      { big: 'Built for you', lbl: 'Configured around your institution, not a fixed shipped app', cls: 'accent' },
      { big: 'Live data', lbl: 'Reflects the same records your core solution runs on', cls: 'ph-a' },
      { big: 'Self-service', lbl: 'Clients check their accounts without calling your desk', cls: 'ph-c' },
      { big: 'Secure access', lbl: 'Individual client login and permissions', cls: 'ph-d' },
    ],
    features: [
      ['Secure Client Login', 'Individual, permission-controlled access for each of your clients.'],
      ['Real-Time Account View', 'Clients see their portfolio or account position as it stands now.'],
      ['Statement Access', 'Clients download their own statements without contacting your team.'],
      ['Transaction History', 'A full record of a client’s activity, available on demand.'],
      ['Fund Subscription & Redemption', 'Where relevant, clients subscribe or redeem directly through the portal.'],
      ['Mobile Access', 'The portal works on the devices your clients already use.'],
    ],
    who: 'Built for any institution that wants to give its clients self-service access to their accounts.',
    whoChips: ['Asset Managers', 'Stockbrokers', 'Trustees', 'Lenders', 'Client Services Teams'],
    connect: 'The portal reflects data from whichever core solution you run — Investment & Wealth Management, Securities Trading, Trust Management, or Loan Management. A portal for a stockbroker’s clients looks different from one for an asset manager’s clients: the same capability, connected to different data.',
    connectsTo: ['investment-wealth-management', 'securities-trading', 'trust-management', 'loan-management'],
  },
  {
    slug: 'api-integration',
    name: 'API & Systems Integration',
    shortName: 'API & Systems Integration',
    headline: 'Symplus connects to what you already run.',
    sub: 'An extensive API stack for integrating Symplus with your core banking, CRM, and third-party data systems.',
    imgId: 'apiHero',
    imgAlt: 'An engineer working at a computer',
    tags: ['APIs', 'Core Banking', 'Data Providers'],
    callouts: [
      { big: 'API stack', lbl: 'Extensive APIs for reading from and writing to Symplus', cls: 'accent' },
      { big: 'Core banking', lbl: 'Integrate with the core systems you already run', cls: 'ph-a' },
      { big: 'Oracle · Azure', lbl: 'Built on enterprise-grade technology', cls: 'ph-c' },
      { big: 'Power BI', lbl: 'The reporting layer behind Business Intelligence', cls: 'ph-d' },
    ],
    features: [
      ['Core Banking Integration', 'API-based integration with the core banking systems you run.'],
      ['CRM Integration', 'Connect Symplus to your existing CRM.'],
      ['Third-Party Data Providers', 'Feed market data and reference data in from external providers.'],
      ['Oracle', 'Symplus deployments run on Oracle database technology.'],
      ['Microsoft Azure', 'Cloud deployments of Symplus are built on Microsoft Azure.'],
      ['Power BI', 'The reporting and analytics layer behind the Business Intelligence module.'],
    ],
    who: 'Built for IT and integration teams evaluating how Symplus fits an existing technology stack.',
    whoChips: ['IT Teams', 'Integration Engineers', 'Solution Architects', 'CTOs'],
    connect: 'This is the connective layer behind every other solution, and it is what feeds the Customer Portal its data. Symplus reads from and writes to the systems your institution already runs.',
    connectsTo: '*',
  },
];

// Resolve a solution's "how it connects" targets from its connectsTo field.
// '*' means every other solution; otherwise an explicit slug list. Links always
// render in the canonical solutions[] order regardless of how connectsTo is listed.
const solutionLinksHTML = (s, root) => {
  const targets = s.connectsTo === '*'
    ? solutions.filter(x => x.slug !== s.slug).map(x => x.slug)
    : s.connectsTo;
  return solutions
    .filter(x => targets.includes(x.slug))
    .map(x => `<a href="${root}solutions/${x.slug}/index.html">${ARROW} ${x.name}</a>`)
    .join('\n      ');
};

const solutionPageBody = (s, root) => `
<section class="page-hero">
  <div class="container page-hero-grid">
    <div>
      <div class="eyebrow-row">
        <span class="eyebrow-badge">Solutions</span>
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

${ctaBand(root, `Talk to us about ${s.shortName}.`, 'Tell us what you run today and what you want to change.', 'Contact Us')}
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

/* ---------------- case studies ----------------
   Real Neulogic client names with full case-study content. The headline result across
   these engagements is the ~90% reduction in reporting/operations turnaround that
   Neulogic reports. NOTE FOR REVIEW: this is Neulogic-provided marketing content —
   confirm the 90% figure and that each named client consents to being featured before
   relying on these pages publicly. Challenge sections are written as the general
   industry situation ("like many …"), not as specific claims about a firm's internal
   failings, and the closing statement is attributed to Neulogic, not to an invented
   spokesperson at the client. */
const caseStudies = [
  {
    slug: 'united-capital-asset-management',
    client: 'United Capital Asset Management', short: 'United Capital',
    cat: 'asset-managers', imgId: 'case1',
    typeLabel: 'Investment &amp; Wealth Management',
    moduleLine: 'Runs Symplus for asset management, fund management, and client reporting.',
    result: 'Reporting turnaround cut by 90%.',
    challenge: 'Like many asset managers, United Capital produced NAV, unit pricing, client statements, and regulatory returns from data held across more than one system. Each cycle, that data had to be pulled together and reconciled before the numbers could be trusted, and the work stretched over days.',
    solution: 'United Capital moved portfolio management, fund accounting, and client reporting onto Symplus, so NAV, statements, and regulatory returns are produced from a single transaction ledger.',
    chips: ['Investment &amp; Wealth Management', 'Accounting &amp; Finance', 'Business Intelligence'],
    results: [
      { big: '90%', lbl: 'Faster reporting turnaround' },
      { big: '1', lbl: 'Ledger for valuation, accounting, and reporting' },
      { big: '0', lbl: 'Manual re-keying between systems' },
    ],
    outcome: 'The reporting pack that used to take days now comes off one ledger in hours, with turnaround down by roughly 90%.',
  },
  {
    slug: 'csl-stockbrokers',
    client: 'CSL Stockbrokers', short: 'CSL Stockbrokers',
    cat: 'brokers', imgId: 'case2',
    typeLabel: 'Securities Trading',
    moduleLine: 'Runs Symplus for order management, execution, and settlement.',
    result: 'Settlement turnaround cut by 90%.',
    challenge: 'Like most brokers running at scale, CSL captured orders in one system and settled them in another, with the back office reconciling between the two. Turnaround on settlement and post-trade reporting was slow, and breaks could take days to surface.',
    solution: 'CSL moved order capture, execution, and settlement onto Symplus, with NGX-certified trading workflows and post-trade reconciliation against the CSD in the same system.',
    chips: ['Securities Trading', 'Accounting &amp; Finance'],
    results: [
      { big: '90%', lbl: 'Faster settlement turnaround' },
      { big: '1', lbl: 'System from front office to back office' },
      { big: '0', lbl: 'Re-keying between order and settlement' },
    ],
    outcome: 'Settlement and post-trade reporting that used to run for days now clears in hours, with turnaround down by roughly 90%.',
  },
  {
    slug: 'norrenberger-financial-group',
    client: 'Norrenberger Financial Group', short: 'Norrenberger',
    cat: 'trustees', imgId: 'case3',
    typeLabel: 'Trust Management',
    moduleLine: 'Runs Symplus for trust administration and beneficiary accounting.',
    result: 'Trust reporting turnaround cut by 90%.',
    challenge: 'Like many trustees, Norrenberger kept covenant registers and beneficiary records separately from its trust accounting. Producing trust and beneficiary reports meant assembling data by hand each cycle before anything could go out.',
    solution: 'Norrenberger put its trust accounts, beneficiary records, and covenant registers on Symplus, tied to the same general ledger its finance team closes on.',
    chips: ['Trust Management', 'Accounting &amp; Finance'],
    results: [
      { big: '90%', lbl: 'Faster trust reporting turnaround' },
      { big: '1', lbl: 'Register tied to the general ledger' },
      { big: '0', lbl: 'Spreadsheets to reconcile' },
    ],
    outcome: 'Trust and beneficiary reporting that used to be assembled by hand now comes off one ledger, with turnaround down by roughly 90%.',
  },
  {
    slug: 'zedcrest-capital',
    client: 'Zedcrest Capital', short: 'Zedcrest Capital',
    cat: 'asset-managers', imgId: 'case4',
    typeLabel: 'Investment &amp; Wealth Management',
    moduleLine: 'Runs Symplus for portfolio management and IFRS reporting.',
    result: 'Board reporting turnaround cut by 90%.',
    challenge: 'Like many investment firms, Zedcrest consolidated portfolios across multiple entities and currencies into board and IFRS reporting through a manual process, which left reporting lagging a step behind the actual book.',
    solution: 'Zedcrest consolidated its multi-entity, multi-currency portfolios on Symplus, producing IFRS-ready and board reporting directly from the ledger the desk trades against.',
    chips: ['Investment &amp; Wealth Management', 'Accounting &amp; Finance', 'Business Intelligence'],
    results: [
      { big: '90%', lbl: 'Faster board reporting turnaround' },
      { big: '1', lbl: 'Ledger across entities and currencies' },
      { big: '0', lbl: 'Overnight batches; reporting is live' },
    ],
    outcome: 'Board and IFRS reporting now tracks the live book instead of lagging it, with turnaround down by roughly 90%.',
  },
];

// One results-grid card: real client name, the module it runs, and the headline result.
const caseCard = (cs, root) => `<a href="${root}case-studies/${cs.slug}/index.html" class="case-card img-ph" data-cat="${cs.cat}">
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
          const clients = ['Cordros', 'UniCap', 'FBNQuest', 'CSL Stockbrokers', 'FSDH', 'RenCap', 'Royal Exchange', 'Norrenberger Financial Group'];
          const group = (hidden) => `<div class="logo-group"${hidden ? ' aria-hidden="true"' : ''}>${clients.map(c => `<span>${c}</span>`).join('')}</div>`;
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
        <p style="color:#454b42;max-width:440px;">Seven modules covering portfolio management, trading, trust administration, lending, accounting, client access, and integration.</p>
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
            'trust-management': 'Trust administration and beneficiary records for corporate, private, and public trusts.',
            'loan-management': 'Loan book, collateral, and credit management for personal, commercial, mortgage, and syndicated loans.',
            'accounting-finance': 'General ledger, IFRS reporting, and multi-currency accounting, shared across every module.',
            'business-intelligence': 'Executive dashboards and reporting built from live data across every module.',
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
        <span class="eyebrow-badge">Case Studies</span>
        <span class="eyebrow-label">Our proven impact</span>
      </div>
      <h2>Results our clients<br>can point to.</h2>
    </div>
    <!-- Real, confirmed Neulogic clients. Result lines are bracketed placeholders; module
         lines are facts only where moduleConfirmed. See caseStudies[] and the review gate.
         Not for publication until each client signs off on the framing (data-review). -->
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
      <span class="eyebrow-badge">Case Studies</span>
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
      <button class="filter-btn" data-cat="brokers">Brokers</button>
      <button class="filter-btn" data-cat="trustees">Trustees</button>
    </div>
    <!-- Real, confirmed Neulogic clients (see caseStudies[]). Result lines are bracketed
         placeholders; module lines are facts only where moduleConfirmed. Not for
         publication until each client signs off on the framing (data-review). -->
    <div class="cases-grid" id="caseGrid">
      ${caseStudies.map(cs => caseCard(cs, root)).join('\n      ')}
    </div>
    <div class="filter-empty" id="caseGrid-empty">No case studies in this category yet.</div>
  </div>
</section>

${ctaBand(root, 'Talk to us about your operation.', 'Tell us what you run today and what you want to change.', 'Book a Call')}
`;

// Per-client detail page. Real client name + full content. The 90% turnaround figure and
// the narratives are Neulogic-provided marketing content (see caseStudies comment);
// the closing statement is attributed to Neulogic, not to an invented client spokesperson.
const caseDetailBody = (cs, root) => `
<!-- Neulogic-provided case study content. Confirm the 90% figure and client consent
     before relying on this page publicly. -->
<section class="page-hero" style="padding-bottom:30px;">
  <div class="container">
    <div class="eyebrow-row">
      <span class="eyebrow-badge">Case Study</span>
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
    <a href="${root}case-studies/index.html" class="btn btn-dark">Read more case studies</a>
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

const articles = [
  {
    slug: 'real-cost-of-five-systems',
    cat: 'Strategy', catSlug: 'strategy', imgId: 'art1',
    title: 'The Real Cost of Running Five Systems Instead of One',
    dek: 'Licence fees are the visible cost. The reconciliation headcount, rework, and audit overhead are where the real money goes.',
    outline: [
      'The visible costs: duplicated licences, infrastructure, and vendor management',
      'The hidden costs: reconciliation headcount and the month-end scramble',
      'Error and rework: what breaks when the same trade lives in five places',
      'Audit overhead: proving consistency across systems that were never designed to agree',
      'Integration fragility: what happens when one vendor upgrades',
      'A framework for calculating your institution’s true total cost of ownership',
    ],
  },
  {
    slug: 'what-ngx-certification-means',
    cat: 'Trading', catSlug: 'trading', imgId: 'art2',
    title: 'What NGX Certification Means for Your Trading Desk',
    dek: 'Certification against Nigerian Exchange infrastructure isn’t a marketing badge; it changes what your desk can rely on.',
    outline: [
      'What NGX certification actually covers, and what it doesn’t',
      'Why certified execution workflows matter on settlement day',
      'The difference between "integrates with NGX" and "certified against NGX"',
      'What certification means for your compliance and audit posture',
      'Questions to ask any trading-system vendor about exchange certification',
    ],
  },
  {
    slug: 'why-month-end-takes-two-weeks',
    cat: 'Operations', catSlug: 'operations', imgId: 'art3',
    title: 'Why Month-End Reporting Takes Two Weeks, and How to Fix It',
    dek: 'The close isn’t slow because your team is slow. It’s slow because the data lives in systems that were never designed to agree.',
    outline: [
      'Where the two weeks actually go: exports, reconciliation, and adjustment cycles',
      'Why spreadsheet reconciliation gets worse as you grow, not better',
      'The single-ledger alternative: what changes when valuation and accounting share records',
      'What a two-day close requires operationally',
      'How to audit your own close process for wasted days',
    ],
  },
  {
    slug: 'single-platform-vs-best-of-breed',
    cat: 'Strategy', catSlug: 'strategy', imgId: 'art4',
    title: 'Single Platform vs. Best-of-Breed: What It Costs You at Scale',
    dek: 'Best-of-breed sounds like the sophisticated choice. At scale, the integration tax says otherwise.',
    outline: [
      'The integration tax: who actually maintains the connections between your systems',
      'Data ownership: where the golden record lives when five systems disagree',
      'Upgrade cycles: what one vendor’s roadmap does to your whole stack',
      'When best-of-breed genuinely wins, and when it quietly stops winning',
      'The scale economics: why the calculus changes as desks and obligations multiply',
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
    </div>
    <div class="article-grid" id="articleGrid">
      ${articles.map(a => `<a class="article-card" data-cat="${a.catSlug}" href="${root}insights/${a.slug}/index.html">
        <div class="img-ph">${img(IMG[a.imgId], '')}</div>
        <div class="body">
          <span class="cat">${a.cat}</span>
          <h3>${a.title}</h3>
          <p style="font-size:13.5px;color:#5a6055;">${a.dek}</p>
          <p class="meta">Neulogic Team &nbsp;·&nbsp; [Publish date] &nbsp;·&nbsp; [X] min read</p>
        </div>
      </a>`).join('\n      ')}
    </div>
    <div class="filter-empty" id="articleGrid-empty">No articles in this category yet.</div>
  </div>
</section>

${ctaBand(root, 'Questions about your own systems?', 'Book a call to talk through your next system review.', 'Book a Call')}
`;

const articleBody = (a, root) => {
  const related = articles.filter(x => x.slug !== a.slug).slice(0, 2);
  return `
<section class="container article-header">
  <span class="cat" style="display:inline-block;background:var(--sage-bg);color:var(--sage-text);font-size:10px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;padding:5px 12px;border-radius:999px;">${a.cat}</span>
  <h1>${a.title}</h1>
  <p class="meta">By Neulogic Team &nbsp;·&nbsp; [Publish date] &nbsp;·&nbsp; [X] min read</p>
</section>

<section class="container" style="max-width:1000px;padding-bottom:50px;">
  <div class="img-ph" data-drift style="min-height:340px;">${img(IMG[a.imgId], '', { eager: true })}</div>
</section>

<article class="container article-body">
  <p><strong>${a.dek}</strong></p>

  <h2>What this article will cover</h2>
  <ol>
    ${a.outline.map(o => `<li>${o}</li>`).join('\n    ')}
  </ol>

  <div class="draft-note">
    <strong>[Full article content to be written]</strong><br>
    This page is a structured outline, not a finished article. The section list above defines the intended argument. A real draft is still needed before this page is published or indexed.
  </div>
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
          <p class="meta">Neulogic Team &nbsp;·&nbsp; [Publish date]</p>
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

/* ---------------- page registry & build ---------------- */

const pages = [
  { file: 'index.html', title: 'Neulogic Solutions | The Pan-African software platform for regulated financial operations', desc: 'Neulogic Solutions builds Symplus, an integrated platform for asset managers, brokers, trustees, and lenders across Africa.', light: false, body: homeBody },
  { file: 'security-compliance/index.html', title: 'Security & Compliance | Neulogic Solutions', desc: 'Built for institutions that answer to regulators: certifications, controls, audit trails, and the enterprise technology under Symplus.', light: false, body: securityBody },
  { file: 'case-studies/index.html', title: 'Case Studies | Neulogic Solutions', desc: 'Results our clients can point to. Case studies from institutions running their operations on Symplus.', light: true, body: caseHubBody },
  ...caseStudies.map(cs => ({
    file: `case-studies/${cs.slug}/index.html`,
    title: `${cs.client.replace(/&amp;/g, '&')} | Case Study | Neulogic Solutions`,
    desc: `Case study: ${cs.client.replace(/&amp;/g, '&')}. Draft with placeholder content, pending client sign-off before publication.`,
    light: true,
    body: (root) => caseDetailBody(cs, root),
  })),
  { file: 'partners/index.html', title: 'Partners & Integrations | Neulogic Solutions', desc: 'Symplus uses enterprise-grade technology from partners like Oracle and Microsoft Azure, and connects to the systems you already run.', light: false, body: partnersBody },
  { file: 'about/index.html', title: 'About Us | Neulogic Solutions', desc: 'Over 14 years building the infrastructure African financial institutions run on.', light: false, body: aboutBody },
  { file: 'contact/index.html', title: 'Contact | Neulogic Solutions', desc: 'Contact Neulogic Solutions: email support@m.neulogicsolutions.com, call +234 814 899 0091, or visit our Lagos office.', light: false, body: contactBody },
  { file: 'request-demo/index.html', title: 'Request a Demo | Neulogic Solutions', desc: 'See Symplus running on your data, not a slideware demo.', light: true, body: demoBody },
  { file: 'insights/index.html', title: 'Insights | Neulogic Solutions', desc: 'Insights in the industry: operational thinking for regulated financial institutions.', light: true, body: insightsHubBody },
  { file: 'careers/index.html', title: 'Careers | Neulogic Solutions', desc: 'Join us at Neulogic. We build the software African financial institutions run on.', light: false, body: careersBody },
  ...solutions.map(s => ({
    file: `solutions/${s.slug}/index.html`,
    title: `${s.name} | Neulogic Solutions`,
    desc: s.headline,
    light: true,
    body: (root) => solutionPageBody(s, root),
  })),
  ...articles.map(a => ({
    file: `insights/${a.slug}/index.html`,
    title: `${a.title} | Neulogic Insights`,
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
