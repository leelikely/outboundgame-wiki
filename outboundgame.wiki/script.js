/* file: /script.js */

document.addEventListener('DOMContentLoaded', () => {
    loadNavbar();
    loadFooter();
    setupMobileMenu();

    // 优先按页面存在的容器判断功能
    if (document.getElementById('video-player')) {
        loadVideoPlayer();
        return;
    }
    if (document.getElementById('article-content')) {
        loadArticle();
        return;
    }
    if (document.getElementById('contact-form')) {
        setupContactForm();
        return;
    }

    // 后备：根据 URL 路径加载
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPath === 'index.html' || currentPath === '') {
        loadHomeArticles();
        loadHomeVideos();
    } else if (/^articles(\.html)?$/.test(currentPath)) {
        loadAllArticles();
    } else if (/^videos(\.html)?$/.test(currentPath)) {
        loadAllVideos();
    } else if (currentPath === 'all-guides.html') {
        // 静态页面无需动态加载
    }
});

/* ===== 导航栏 ===== */
function loadNavbar() {
    const navbarContainer = document.getElementById('navbar');
    if (!navbarContainer) return;

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const links = [
        { name: 'Home', href: 'index.html', active: currentPath === 'index.html' || currentPath === '' },
        { name: 'Guides', href: 'articles.html', active: /^articles/.test(currentPath) },
        { name: 'Videos', href: 'videos.html', active: /^videos/.test(currentPath) },
        { name: 'Map', href: 'map.html', active: currentPath === 'map.html' },
        { name: 'About', href: 'about.html', active: currentPath === 'about.html' },
        { name: 'Contact', href: 'contact.html', active: currentPath === 'contact.html' }
    ];

    const navbarHTML = `
        <nav class="navbar">
            <div class="navbar-container">
                <a href="index.html" class="logo">
                    <img src="/images/logo-icon.png" alt="logo" style="height:30px;margin:0;">
                    Outbound<span>Guide</span>
                </a>
                <ul class="nav-links" id="nav-links">
                    ${links.map(link => `<li><a href="${link.href}" class="${link.active?'active':''}">${link.name}</a></li>`).join('')}
                </ul>
                <div class="hamburger" id="hamburger"><span></span><span></span><span></span></div>
            </div>
        </nav>`;
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

/* ===== 页脚 ===== */
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
        </footer>`;
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

/* ===== 首页：最新 9 篇文章 ===== */
async function loadHomeArticles() {
    const container = document.getElementById('home-articles');
    if (!container) return;
    try {
        const res = await fetch('/articles/articles.json');
        if (!res.ok) throw new Error('Failed to load articles');
        const articles = await res.json();
        articles.sort((a, b) => new Date(b.date) - new Date(a.date));
        const latest = articles.slice(0, 9);
        if (latest.length === 0) {
            container.innerHTML = '<p>No guides published yet.</p>';
            return;
        }
        container.innerHTML = latest.map(a => `
            <div class="article-card">
                <div class="article-card-content">
                    <h3><a href="article-template.html?article=${encodeURIComponent(a.filename)}">${escapeHTML(a.title)}</a></h3>
                    <div class="meta">
                        <span>${new Date(a.date).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</span>
                        ${a.category ? `<span class="category">${escapeHTML(a.category)}</span>` : ''}
                    </div>
                    <p class="excerpt">${escapeHTML(a.excerpt || '')}</p>
                </div>
            </div>`).join('');
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p>Unable to load articles.</p>';
    }
}

/* ===== 首页：最新 3 个视频 ===== */
async function loadHomeVideos() {
    const container = document.getElementById('home-videos');
    if (!container) return;
    try {
        const res = await fetch('/videos.json');
        if (!res.ok) throw new Error('Failed to load videos');
        const videos = await res.json();
        videos.sort((a, b) => new Date(b.date) - new Date(a.date));
        const latest = videos.slice(0, 3);
        container.innerHTML = latest.map(v => createVideoCard(v)).join('');
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p>Unable to load videos.</p>';
    }
}

/* ===== 全部文章页 ===== */
async function loadAllArticles() {
    const container = document.getElementById('all-articles');
    if (!container) return;
    try {
        const res = await fetch('/articles/articles.json');
        if (!res.ok) throw new Error('Failed to load articles');
        const articles = await res.json();
        articles.sort((a, b) => new Date(b.date) - new Date(a.date));
        container.innerHTML = articles.map(a => `
            <div class="article-card">
                <div class="article-card-content">
                    <h3><a href="article-template.html?article=${encodeURIComponent(a.filename)}">${escapeHTML(a.title)}</a></h3>
                    <div class="meta">
                        <span>${new Date(a.date).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</span>
                        ${a.category ? `<span class="category">${escapeHTML(a.category)}</span>` : ''}
                    </div>
                    <p class="excerpt">${escapeHTML(a.excerpt || '')}</p>
                </div>
            </div>`).join('');
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p>Unable to load articles.</p>';
    }
}

/* ===== 全部视频页 ===== */
async function loadAllVideos() {
    const container = document.getElementById('all-videos');
    if (!container) return;
    try {
        const res = await fetch('/videos.json');
        if (!res.ok) throw new Error('Failed to load videos');
        const videos = await res.json();
        videos.sort((a, b) => new Date(b.date) - new Date(a.date));
        container.innerHTML = videos.map(v => createVideoCard(v)).join('');
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p>Unable to load videos.</p>';
    }
}

/* ===== 单个视频播放页 ===== */
async function loadVideoPlayer() {
    const container = document.getElementById('video-player');
    if (!container) return;
    container.innerHTML = '<p style="color:#888;">Loading video…</p>';

    const params = new URLSearchParams(window.location.search);
    const videoId = params.get('video');
    if (!videoId) {
        container.innerHTML = '<p>No video specified.</p>';
        return;
    }
    try {
        const res = await fetch('/videos.json');
        if (!res.ok) throw new Error('Failed to load videos');
        const videos = await res.json();
        const video = videos.find(v => v.id === videoId);
        if (!video) {
            container.innerHTML = '<p>Video not found.</p>';
            return;
        }
        document.title = `${video.title} - Outbound Game Wiki`;
        container.innerHTML = `
            <h1>${escapeHTML(video.title)}</h1>
            <p class="video-meta">Published: ${new Date(video.date).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</p>
            <div class="video-wrapper">
                <iframe src="${video.embedUrl}" allowfullscreen loading="lazy"></iframe>
            </div>
            <div class="video-description">${video.description}</div>
            <a href="${video.sourceUrl}" target="_blank" rel="noopener noreferrer" class="btn">Watch on YouTube</a>
        `;
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p>Unable to load video. Please try again later.</p>';
    }
}

/* ===== 文章详情页 ===== */
async function loadArticle() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('article');
    if (!slug) {
        showArticleError('No article specified.');
        return;
    }
    try {
        const res = await fetch(`/articles/${slug}.md`);
        if (!res.ok) throw new Error('Article not found');
        const md = await res.text();
        const { meta, content } = parseFrontmatter(md);
        document.title = meta.title ? `${meta.title} - Outbound Guide` : 'Outbound Guide';
        document.getElementById('article-title').textContent = meta.title || 'Untitled';
        const metaCont = document.getElementById('article-meta');
        const dateStr = meta.date ? new Date(meta.date).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}) : '';
        const catStr = meta.category ? `<span class="category-badge">${escapeHTML(meta.category)}</span>` : '';
        metaCont.innerHTML = `${dateStr?`<span>${dateStr}</span>`:''} ${catStr}`;

        let markdownHTML = (typeof marked !== 'undefined') ? marked.parse(content) : `<pre>${escapeHTML(content)}</pre>`;
        markdownHTML = markdownHTML.replace(/<h1[^>]*>.*?<\/h1>/, '');
        const supportHTML = `<div class="support-message" style="margin-top:3em;"><br><br><p>If you enjoy our content, you can also support our creators by visiting <a href="https://omg10.com/4/11001497" target="_blank">https://omg10.com/4/11001497</a>. Your support and encouragement keep us moving forward. Thank you so much!</p></div>`;
        document.getElementById('article-content').innerHTML = markdownHTML + supportHTML;

        let descMeta = document.querySelector('meta[name="description"]');
        if (!descMeta) { descMeta = document.createElement('meta'); descMeta.name = 'description'; document.head.appendChild(descMeta); }
        descMeta.content = meta.excerpt || (meta.title ? `Guide for ${meta.title} in Outbound game.` : '');
        let canon = document.querySelector('link[rel="canonical"]');
        if (!canon) { canon = document.createElement('link'); canon.rel = 'canonical'; document.head.appendChild(canon); }
        canon.href = `https://outboundgame.wiki/article-template.html?article=${encodeURIComponent(slug)}`;
    } catch (e) {
        console.error(e);
        showArticleError('Sorry, this guide could not be loaded.');
    }
}

function showArticleError(msg) {
    document.getElementById('article-title').textContent = 'Oops!';
    document.getElementById('article-meta').innerHTML = '';
    document.getElementById('article-content').innerHTML = `<p>${msg}</p>`;
}

/* ===== 联系表单 ===== */
function setupContactForm() {
    const form = document.getElementById('contact-form');
    const msgDiv = document.getElementById('form-message');
    if (!form) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        msgDiv.innerHTML = `<strong>Thanks for reaching out, ${escapeHTML(name)||'friend'}!</strong><br>This is a static site, so your message hasn't been sent automatically. Please email us directly at <a href="mailto:hello@outboundgame.wiki">hello@outboundgame.wiki</a>.`;
        msgDiv.classList.add('show');
        form.reset();
    });
}

/* ===== 工具函数 ===== */
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
function parseFrontmatter(md) {
    const match = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
    if (!match) return { meta: {}, content: md };
    const yaml = match[1];
    const content = md.slice(match[0].length);
    const meta = {};
    yaml.split('\n').forEach(line => {
        const idx = line.indexOf(':');
        if (idx > 0) meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    });
    return { meta, content };
}
function createVideoCard(video) {
    return `<div class="video-card">
        <a href="video.html?video=${encodeURIComponent(video.id)}">
            <img src="${video.thumbnail}" alt="${escapeHTML(video.title)}" loading="lazy">
            <div class="video-card-info">
                <h3>${escapeHTML(video.title)}</h3>
                <span class="video-date">${new Date(video.date).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})}</span>
            </div>
        </a>
    </div>`;
}
