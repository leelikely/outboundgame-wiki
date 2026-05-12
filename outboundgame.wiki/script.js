/* file: /script.js */

document.addEventListener('DOMContentLoaded', () => {
    loadNavbar();
    loadFooter();
    setupMobileMenu();

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    if (currentPath === 'index.html' || currentPath === '') {
        loadHomeArticles();
        loadHomeVideos();
    } else if (currentPath === 'articles.html') {
        loadAllArticles();
    } else if (currentPath === 'videos.html') {
        loadAllVideos();
    } else if (currentPath === 'video.html') {
        loadVideoPlayer();
    } else if (currentPath === 'all-guides.html') {
        // all-guides.html 本身是静态的，无需加载动态内容
    } else if (document.getElementById('article-content')) {
        loadArticle();
    } else if (document.getElementById('contact-form')) {
        setupContactForm();
    }
});

/* ===== Navigation ===== */
function loadNavbar() {
    const navbarContainer = document.getElementById('navbar');
    if (!navbarContainer) return;

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    const links = [
        { name: 'Home', href: 'index.html', active: currentPath === 'index.html' || currentPath === '' },
        { name: 'Guides', href: 'articles.html', active: currentPath === 'articles.html' },
        { name: 'Videos', href: 'videos.html', active: currentPath === 'videos.html' },
        { name: 'Map', href: 'map.html', active: currentPath === 'map.html' },
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
                    <span></span><span></span><span></span>
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
            <div class="ad-footer" id="ad-footer-container"></div>
            <ul class="footer-links">
                <li><a href="index.html">Home</a></li>
                <li><a href="articles.html">Guides</a></li>
                <li><a href="all-guides.html">All Guides</a></li>
                <li><a href="videos.html">Videos</a></li>
                <li><a href="about.html">About</a></li>
                <li><a href="contact.html">Contact</a></li>
                <li><a href="privacy-policy.html">Privacy Policy</a></li>
                <li><a href="terms-of-service.html">Terms of Service</a></li>
            </ul>
            <p class="footer-copy">&copy; ${new Date().getFullYear()} Outbound Game Wiki. Fan-made and not affiliated with the official game.</p>
        </footer>
    `;
    footerContainer.innerHTML = footerHTML;
    activateFooterAd();
}

function activateFooterAd() {
    const container = document.getElementById('ad-footer-container');
    if (container) {
        const s = document.createElement('script');
        s.dataset.zone = '10992811';
        s.src = 'https://nap5k.com/tag.min.js';
        container.appendChild(s);
    }
}

/* ===== Home Articles (latest 9) ===== */
async function loadHomeArticles() {
    const container = document.getElementById('home-articles');
    if (!container) return;
    try {
        const response = await fetch('/articles/articles.json');
        if (!response.ok) throw new Error('Failed to load articles');
        const articles = await response.json();
        articles.sort((a, b) => new Date(b.date) - new Date(a.date));
        const latest = articles.slice(0, 9);
        if (latest.length === 0) {
            container.innerHTML = '<p>No guides published yet.</p>';
            return;
        }
        container.innerHTML = latest.map(article => `
            <div class="article-card">
                <div class="article-card-content">
                    <h3><a href="article-template.html?article=${encodeURIComponent(article.filename)}">${escapeHTML(article.title)}</a></h3>
                    <div class="meta">
                        <span>${new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        ${article.category ? `<span class="category">${escapeHTML(article.category)}</span>` : ''}
                    </div>
                    <p class="excerpt">${escapeHTML(article.excerpt || '')}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p>Unable to load articles.</p>';
    }
}

/* ===== Home Videos (latest 3) ===== */
async function loadHomeVideos() {
    const container = document.getElementById('home-videos');
    if (!container) return;
    try {
        const response = await fetch('/videos.json');
        if (!response.ok) throw new Error('Failed to load videos');
        const videos = await response.json();
        videos.sort((a, b) => new Date(b.date) - new Date(a.date));
        const latest = videos.slice(0, 3);
        container.innerHTML = latest.map(v => createVideoCard(v)).join('');
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p>Unable to load videos.</p>';
    }
}

/* ===== All Articles Page ===== */
async function loadAllArticles() {
    const container = document.getElementById('all-articles');
    if (!container) return;
    try {
        const response = await fetch('/articles/articles.json');
        if (!response.ok) throw new Error('Failed to load articles');
        const articles = await response.json();
        articles.sort((a, b) => new Date(b.date) - new Date(a.date));
        container.innerHTML = articles.map(article => `
            <div class="article-card">
                <div class="article-card-content">
                    <h3><a href="article-template.html?article=${encodeURIComponent(article.filename)}">${escapeHTML(article.title)}</a></h3>
                    <div class="meta">
                        <span>${new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        ${article.category ? `<span class="category">${escapeHTML(article.category)}</span>` : ''}
                    </div>
                    <p class="excerpt">${escapeHTML(article.excerpt || '')}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p>Unable to load articles.</p>';
    }
}

/* ===== All Videos Page ===== */
async function loadAllVideos() {
    const container = document.getElementById('all-videos');
    if (!container) return;
    try {
        const response = await fetch('/videos.json');
        if (!response.ok) throw new Error('Failed to load videos');
        const videos = await response.json();
        videos.sort((a, b) => new Date(b.date) - new Date(a.date));
        container.innerHTML = videos.map(v => createVideoCard(v)).join('');
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p>Unable to load videos.</p>';
    }
}

/* ===== Single Video Player ===== */
async function loadVideoPlayer() {
    const params = new URLSearchParams(window.location.search);
    const videoId = params.get('video');
    const container = document.getElementById('video-player');
    if (!container) return;
    if (!videoId) {
        container.innerHTML = '<p>No video specified.</p>';
        return;
    }
    try {
        const response = await fetch('/videos.json');
        if (!response.ok) throw new Error('Failed to load videos');
        const videos = await response.json();
        const video = videos.find(v => v.id === videoId);
        if (!video) {
            container.innerHTML = '<p>Video not found.</p>';
            return;
        }
        document.title = `${video.title} - Outbound Game Wiki`;
        container.innerHTML = `
            <h1>${escapeHTML(video.title)}</h1>
            <p class="video-meta">Published: ${new Date(video.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <div class="video-wrapper">
                <iframe src="${video.embedUrl}" allowfullscreen loading="lazy"></iframe>
            </div>
            <div class="video-description">${video.description}</div>
            <a href="${video.sourceUrl}" target="_blank" rel="noopener noreferrer" class="btn">Watch on YouTube</a>
        `;
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p>Unable to load video.</p>';
    }
}

/* ===== Article Detail (with support message) ===== */
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

        const markdownHTML = (typeof marked !== 'undefined') ? marked.parse(content) : `<pre>${escapeHTML(content)}</pre>`;
        const supportHTML = `<div class="support-message" style="margin-top:3em;"><br><br><p>If you enjoy our content, you can also support our creators by visiting <a href="https://omg10.com/4/10992539" target="_blank">https://omg10.com/4/10992539</a>. Your support and encouragement keep us moving forward. Thank you so much!</p></div>`;
        document.getElementById('article-content').innerHTML = markdownHTML + supportHTML;

        let descriptionMeta = document.querySelector('meta[name="description"]');
        if (!descriptionMeta) {
            descriptionMeta = document.createElement('meta');
            descriptionMeta.name = 'description';
            document.head.appendChild(descriptionMeta);
        }
        descriptionMeta.content = meta.excerpt || (meta.title ? `Guide for ${meta.title} in Outbound game.` : '');
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.rel = 'canonical';
            document.head.appendChild(canonicalLink);
        }
        canonicalLink.href = `https://outboundgame.wiki/article-template.html?article=${encodeURIComponent(articleSlug)}`;
    } catch (error) {
        console.error(error);
        showArticleError('Sorry, this guide could not be loaded.');
    }
}

function showArticleError(message) {
    document.getElementById('article-title').textContent = 'Oops!';
    document.getElementById('article-meta').innerHTML = '';
    document.getElementById('article-content').innerHTML = `<p>${message}</p>`;
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
            Please email us directly at <a href="mailto:hello@outboundgame.wiki">hello@outboundgame.wiki</a>.
        `;
        messageDiv.classList.add('show');
        form.reset();
    });
}

/* ===== Utility Functions ===== */
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
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
            meta[line.slice(0, colonIndex).trim()] = line.slice(colonIndex + 1).trim();
        }
    });
    return { meta, content };
}

function createVideoCard(video) {
    return `
        <div class="video-card">
            <a href="video.html?video=${encodeURIComponent(video.id)}">
                <img src="${video.thumbnail}" alt="${escapeHTML(video.title)}" loading="lazy">
                <div class="video-card-info">
                    <h3>${escapeHTML(video.title)}</h3>
                    <span class="video-date">${new Date(video.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
            </a>
        </div>
    `;
}
