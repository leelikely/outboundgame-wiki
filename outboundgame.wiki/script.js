/* file: /script.js */

/**
 * Outbound Game Wiki - Main JavaScript
 * Handles: Navigation, Footer, Article listing, Article rendering, Contact form
 * Uses: Marked.js for Markdown parsing (included in article-template.html)
 */

document.addEventListener('DOMContentLoaded', () => {
    loadNavbar();
    loadFooter();
    setupMobileMenu();

    // Home page
    if (document.getElementById('home-articles')) {
        loadHomeArticles();
    }

    // Article template page
    if (document.getElementById('article-content')) {
        loadArticle();
    }

    // Contact page
    if (document.getElementById('contact-form')) {
        setupContactForm();
    }
});

/* ===== Navigation ===== */
function loadNavbar() {
    const navbarContainer = document.getElementById('navbar');
    if (!navbarContainer) return;

    const currentPath = window.location.pathname.split('/').pop();
    const isHome = currentPath === '' || currentPath === 'index.html';

    const guidesHref = isHome ? '#guides' : 'index.html#guides';
    const homeHref = isHome ? 'index.html' : 'index.html'; // always index.html

    const links = [
        { name: 'Home', href: homeHref, active: isHome },
        { name: 'Guides', href: guidesHref, active: false },
        { name: 'Map', href: 'map.html', active: currentPath === 'map.html' }, // NEW
        { name: 'About', href: 'about.html', active: currentPath === 'about.html' },
        { name: 'Contact', href: 'contact.html', active: currentPath === 'contact.html' }
    ];

    const navbarHTML = `
        <nav class="navbar">
            <div class="navbar-container">
                <a href="index.html" class="logo">Outbound<span>Guide</span></a>
                <ul class="nav-links" id="nav-links">
                    ${links.map(link => 
                        `<li><a href="${link.href}" class="${link.active ? 'active' : ''}">${link.name}</a></li>`
                    ).join('')}
                </ul>
                <div class="hamburger" id="hamburger">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </nav>
    `;
    navbarContainer.innerHTML = navbarHTML;
}

function setupMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
}

/* ===== Footer ===== */
function loadFooter() {
    const footerContainer = document.getElementById('footer');
    if (!footerContainer) return;

    const footerHTML = `
        <footer class="site-footer">
            <div class="ad-footer">[ADSENSE / MONETAG AD PLACEHOLDER]</div>
            <ul class="footer-links">
                <li><a href="index.html">Home</a></li>
                <li><a href="about.html">About</a></li>
                <li><a href="contact.html">Contact</a></li>
                <li><a href="privacy-policy.html">Privacy Policy</a></li>
                <li><a href="terms-of-service.html">Terms of Service</a></li>
            </ul>
            <p class="footer-copy">
                &copy; ${new Date().getFullYear()} Outbound Game Wiki. Fan-made and not affiliated with the official game.
            </p>
        </footer>
    `;
    footerContainer.innerHTML = footerHTML;
}

/* ===== Home Page: Load Articles from JSON ===== */
async function loadHomeArticles() {
    const container = document.getElementById('home-articles');
    if (!container) return;

    try {
        const response = await fetch('/articles/articles.json');
        if (!response.ok) throw new Error('Failed to load articles list');
        const articles = await response.json();

        articles.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (articles.length === 0) {
            container.innerHTML = '<p>No guides published yet. Check back soon!</p>';
            return;
        }

        const articlesHTML = articles.map(article => {
            const dateFormatted = new Date(article.date).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
            return `
                <div class="article-card">
                    <div class="article-card-content">
                        <h3><a href="article-template.html?article=${encodeURIComponent(article.filename)}">${escapeHTML(article.title)}</a></h3>
                        <div class="meta">
                            <span>${dateFormatted}</span>
                            ${article.category ? `<span class="category">${escapeHTML(article.category)}</span>` : ''}
                        </div>
                        <p class="excerpt">${escapeHTML(article.excerpt || '')}</p>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = articlesHTML;
    } catch (error) {
        console.error('Error loading articles:', error);
        container.innerHTML = '<p>Unable to load articles. Please try again later.</p>';
    }
}

/* ===== Article Template: Load and Render Markdown ===== */
async function loadArticle() {
    const params = new URLSearchParams(window.location.search);
    const articleSlug = params.get('article');
    if (!articleSlug) {
        showArticleError('No article specified.');
        return;
    }

    try {
        const response = await fetch(`/articles/${articleSlug}.md`);
        if (!response.ok) throw new Error('Article not found');
        const mdContent = await response.text();

        const { meta, content } = parseFrontmatter(mdContent);

        document.title = meta.title ? `${meta.title} - Outbound Guide` : 'Outbound Guide';
        document.getElementById('article-title').textContent = meta.title || 'Untitled';
        
        const metaContainer = document.getElementById('article-meta');
        const dateStr = meta.date ? new Date(meta.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
        const categoryStr = meta.category ? `<span class="category-badge">${escapeHTML(meta.category)}</span>` : '';
        metaContainer.innerHTML = `${dateStr ? `<span>${dateStr}</span>` : ''} ${categoryStr}`;

        if (typeof marked !== 'undefined') {
            document.getElementById('article-content').innerHTML = marked.parse(content);
        } else {
            document.getElementById('article-content').innerHTML = `<pre>${escapeHTML(content)}</pre>`;
        }

        let descriptionMeta = document.querySelector('meta[name="description"]');
        if (!descriptionMeta) {
            descriptionMeta = document.createElement('meta');
            descriptionMeta.setAttribute('name', 'description');
            document.head.appendChild(descriptionMeta);
        }
        if (meta.excerpt) {
            descriptionMeta.setAttribute('content', meta.excerpt);
        } else if (meta.title) {
            descriptionMeta.setAttribute('content', `Guide for ${meta.title} in Outbound game.`);
        }

        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.setAttribute('rel', 'canonical');
            document.head.appendChild(canonicalLink);
        }
        canonicalLink.setAttribute('href', `https://outboundgame.wiki/article-template.html?article=${encodeURIComponent(articleSlug)}`);
    } catch (error) {
        console.error('Error loading article:', error);
        showArticleError('Sorry, this guide could not be loaded. It may have been moved or deleted.');
    }
}

function showArticleError(message) {
    document.getElementById('article-title').textContent = 'Oops!';
    document.getElementById('article-meta').innerHTML = '';
    document.getElementById('article-content').innerHTML = `<p>${message}</p>`;
}

function parseFrontmatter(mdText) {
    const match = mdText.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
    if (!match) return { meta: {}, content: mdText };
    
    const yamlBlock = match[1];
    const content = mdText.slice(match[0].length);
    const meta = {};
    
    yamlBlock.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
            const key = line.slice(0, colonIndex).trim();
            const value = line.slice(colonIndex + 1).trim();
            meta[key] = value;
        }
    });
    return { meta, content };
}

/* ===== Contact Form ===== */
function setupContactForm() {
    const form = document.getElementById('contact-form');
    const messageDiv = document.getElementById('form-message');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        messageDiv.innerHTML = `
            <strong>Thanks for reaching out, ${escapeHTML(name) || 'friend'}!</strong><br>
            This is a static site, so your message hasn't been sent automatically. 
            Please email us directly at 
            <a href="mailto:hello@outboundgame.wiki">hello@outboundgame.wiki</a> 
            with your inquiry. We look forward to hearing from you!
        `;
        messageDiv.classList.add('show');
        form.reset();
    });
}

/* ===== Utility ===== */
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
