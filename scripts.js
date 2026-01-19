// 博客应用主程序
class BlogApp {
    constructor() {
        this.blogs = window.blogs || [];
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.init();
    }

    // 初始化应用
    init() {
        this.renderBlogs();
        this.renderSidebar();
        this.bindEvents();
        this.initBackToTop();
    }

    // 绑定事件监听器
    bindEvents() {
        // 分类筛选
        document.querySelectorAll('.nav a[data-category]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.target.dataset.category;
                this.filterByCategory(category);
            });
        });

        // 搜索功能
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');

        searchBtn.addEventListener('click', () => {
            this.searchBlogs();
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchBlogs();
            }
        });

        // 搜索框清空
        searchInput.addEventListener('input', (e) => {
            if (e.target.value === '') {
                this.currentSearch = '';
                this.renderBlogs();
            }
        });

        // 模态框关闭
        const modal = document.getElementById('blogModal');
        const closeBtn = document.querySelector('.close');

        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                document.body.style.overflow = '';
            }
        });

        // 评论表单提交
        const commentForm = document.getElementById('commentForm');
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitComment();
        });
    }

    // 渲染博客列表
    renderBlogs() {
        const blogList = document.getElementById('blogList');
        let filteredBlogs = this.blogs;

        // 应用分类筛选
        if (this.currentFilter !== 'all') {
            filteredBlogs = filteredBlogs.filter(blog => blog.category === this.currentFilter);
        }

        // 应用搜索筛选
        if (this.currentSearch) {
            const searchTerm = this.currentSearch.toLowerCase();
            filteredBlogs = filteredBlogs.filter(blog =>
                blog.title.toLowerCase().includes(searchTerm) ||
                blog.content.toLowerCase().includes(searchTerm) ||
                blog.excerpt.toLowerCase().includes(searchTerm)
            );
        }

        // 生成博客卡片
        if (filteredBlogs.length === 0) {
            blogList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>没有找到相关博客</h3>
                    <p>尝试调整搜索条件或分类</p>
                </div>
            `;
            return;
        }

        blogList.innerHTML = filteredBlogs.map(blog => `
            <article class="blog-card" data-id="${blog.id}">
                <img src="${blog.image}" alt="${blog.title}">
                <div class="blog-card-content">
                    <span class="blog-card-category">${blog.category}</span>
                    <h2 class="blog-card-title">${blog.title}</h2>
                    <p class="blog-card-excerpt">${blog.excerpt}</p>
                    <div class="blog-card-meta">
                        <span class="author"><i class="fas fa-user"></i>${blog.author}</span>
                        <span class="date"><i class="fas fa-calendar"></i>${blog.date}</span>
                    </div>
                </div>
            </article>
        `).join('');

        // 添加博客卡片点击事件
        this.bindBlogCardEvents();
    }

    // 绑定博客卡片点击事件
    bindBlogCardEvents() {
        document.querySelectorAll('.blog-card').forEach(card => {
            card.addEventListener('click', () => {
                const blogId = parseInt(card.dataset.id);
                this.showBlogDetail(blogId);
            });
        });
    }

    // 渲染侧边栏
    renderSidebar() {
        this.renderTags();
        this.renderRecentPosts();
    }

    // 渲染热门标签
    renderTags() {
        const tagsList = document.getElementById('tagsList');
        const allTags = this.blogs.flatMap(blog => blog.tags);
        const tagCounts = {};

        // 统计标签出现次数
        allTags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });

        // 按出现次数排序
        const sortedTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20); // 只显示前20个标签

        tagsList.innerHTML = sortedTags.map(([tag, count]) => `
            <span class="tag" data-tag="${tag}">${tag} (${count})</span>
        `).join('');

        // 添加标签点击事件
        this.bindTagEvents();
    }

    // 绑定标签点击事件
    bindTagEvents() {
        document.querySelectorAll('.tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                const tagName = e.target.dataset.tag;
                this.filterByTag(tagName);
            });
        });
    }

    // 渲染最新文章
    renderRecentPosts() {
        const recentPosts = document.getElementById('recentPosts');
        const sortedBlogs = [...this.blogs]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        recentPosts.innerHTML = sortedBlogs.map(blog => `
            <li>
                <a href="#" data-id="${blog.id}">${blog.title}</a>
                <span class="date">${blog.date}</span>
            </li>
        `).join('');

        // 添加最新文章点击事件
        recentPosts.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const blogId = parseInt(e.target.dataset.id);
                this.showBlogDetail(blogId);
            });
        });
    }

    // 渲染分类统计
    renderCategoryStats() {
        const categoryStats = document.getElementById('categoryStats');
        const categoryCounts = {};

        // 统计分类数量
        this.blogs.forEach(blog => {
            categoryCounts[blog.category] = (categoryCounts[blog.category] || 0) + 1;
        });

        // 按分类名称排序
        const sortedCategories = Object.entries(categoryCounts)
            .sort((a, b) => a[0].localeCompare(b[0]));

        categoryStats.innerHTML = sortedCategories.map(([category, count]) => `
            <li>
                <a href="#" data-category="${category}">${category}</a>
                <span class="count">${count}</span>
            </li>
        `).join('');

        // 添加分类统计点击事件
        categoryStats.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.target.dataset.category;
                this.filterByCategory(category);
            });
        });
    }

    // 根据分类筛选博客
    filterByCategory(category) {
        this.currentFilter = category;
        this.renderBlogs();

        // 更新导航栏激活状态
        document.querySelectorAll('.nav a').forEach(link => {
            link.classList.remove('active');
        });

        document.querySelector(`.nav a[data-category="${category}"]`).classList.add('active');
        document.querySelector('.nav a[href="#"]').classList.remove('active');
    }

    // 根据标签筛选博客
    filterByTag(tag) {
        const filteredBlogs = this.blogs.filter(blog => blog.tags.includes(tag));
        const blogList = document.getElementById('blogList');

        if (filteredBlogs.length === 0) {
            blogList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>没有找到相关博客</h3>
                    <p>尝试调整搜索条件或分类</p>
                </div>
            `;
            return;
        }

        blogList.innerHTML = filteredBlogs.map(blog => `
            <article class="blog-card" data-id="${blog.id}">
                <img src="${blog.image}" alt="${blog.title}">
                <div class="blog-card-content">
                    <span class="blog-card-category">${blog.category}</span>
                    <h2 class="blog-card-title">${blog.title}</h2>
                    <p class="blog-card-excerpt">${blog.excerpt}</p>
                    <div class="blog-card-meta">
                        <span class="author"><i class="fas fa-user"></i>${blog.author}</span>
                        <span class="date"><i class="fas fa-calendar"></i>${blog.date}</span>
                    </div>
                </div>
            </article>
        `).join('');

        // 添加博客卡片点击事件
        this.bindBlogCardEvents();
    }

    // 搜索博客
    searchBlogs() {
        const searchInput = document.getElementById('searchInput');
        this.currentSearch = searchInput.value.trim();
        this.renderBlogs();
    }

    // 显示博客详情
    showBlogDetail(blogId) {
        const blog = this.blogs.find(b => b.id === blogId);
        if (!blog) return;

        const blogDetail = document.getElementById('blogDetail');
        const commentCount = document.getElementById('commentCount');
        const commentsList = document.getElementById('commentsList');
        const modal = document.getElementById('blogModal');

        // 渲染博客详情
        blogDetail.innerHTML = `
            <img src="${blog.image}" alt="${blog.title}">
            <span class="blog-detail-category">${blog.category}</span>
            <h1 class="blog-detail-title">${blog.title}</h1>
            <div class="blog-detail-meta">
                <span><i class="fas fa-user"></i> ${blog.author}</span>
                <span><i class="fas fa-calendar"></i> ${blog.date}</span>
                <span><i class="fas fa-tag"></i> ${blog.tags.join(', ')}</span>
            </div>
            <div class="blog-detail-content">${blog.content}</div>
        `;

        // 渲染评论
        this.renderComments(blog, commentsList, commentCount);

        // 显示模态框
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';

        // 保存当前博客ID到表单
        commentCount.dataset.blogId = blogId;
    }

    // 渲染评论
    renderComments(blog, commentsList, commentCount) {
        commentCount.textContent = blog.comments.length;

        if (blog.comments.length === 0) {
            commentsList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">暂无评论，快来发表您的看法吧！</p>';
            return;
        }

        commentsList.innerHTML = blog.comments.map(comment => `
            <div class="comment">
                <div class="comment-header">
                    <span class="comment-author">${comment.author}</span>
                    <span class="comment-date">${comment.date}</span>
                </div>
                <div class="comment-content">${comment.content}</div>
            </div>
        `).join('');
    }

    // 提交评论
    submitComment() {
        const nameInput = document.getElementById('commentName');
        const contentInput = document.getElementById('commentContent');
        const commentCount = document.getElementById('commentCount');
        const blogId = parseInt(commentCount.dataset.blogId);

        if (!nameInput.value.trim() || !contentInput.value.trim()) {
            alert('请填写完整的评论信息');
            return;
        }

        const blog = this.blogs.find(b => b.id === blogId);
        if (!blog) return;

        // 创建新评论
        const newComment = {
            id: Date.now(),
            author: nameInput.value.trim(),
            date: new Date().toISOString().split('T')[0],
            content: contentInput.value.trim()
        };

        // 添加到博客评论列表
        blog.comments.push(newComment);

        // 重新渲染评论
        const commentsList = document.getElementById('commentsList');
        this.renderComments(blog, commentsList, commentCount);

        // 清空表单
        nameInput.value = '';
        contentInput.value = '';

        // 显示成功提示
        const successMsg = document.createElement('div');
        successMsg.style.cssText = `
            background-color: #d4edda;
            color: #155724;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 20px;
            text-align: center;
        `;
        successMsg.textContent = '评论提交成功！';
        commentsList.insertBefore(successMsg, commentsList.firstChild);

        // 3秒后移除提示
        setTimeout(() => {
            successMsg.remove();
        }, 3000);
    }

    // 初始化返回顶部按钮
    initBackToTop() {
        const backToTop = document.getElementById('backToTop');

        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        });

        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// 登录验证
class LoginSystem {
    constructor() {
        // 示例账号密码（实际应用中应使用安全的认证方式）
        this.validUsers = {
            'admin': 'admin123',
            'user': 'user123',
            'test': 'test123'
        };
        this.init();
    }

    init() {
        const loginForm = document.getElementById('loginForm');
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.validateLogin();
        });
    }

    validateLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');

        // 清空之前的错误信息
        errorMessage.classList.remove('show');

        // 验证用户名和密码
        if (this.validUsers[username] && this.validUsers[username] === password) {
            // 登录成功
            this.loginSuccess();
        } else {
            // 登录失败
            errorMessage.textContent = '用户名或密码错误';
            errorMessage.classList.add('show');
        }
    }

    loginSuccess() {
        // 隐藏登录模态框
        const loginModal = document.getElementById('loginModal');
        loginModal.style.display = 'none';
        document.body.style.overflow = '';

        // 显示博客内容
        const main = document.querySelector('.main');
        const footer = document.querySelector('.footer');
        main.classList.add('show');
        footer.classList.add('show');

        // 初始化博客应用
        new BlogApp();
    }
}

// 检查登录状态
class AuthSystem {
    constructor() {
        this.init();
    }

    init() {
        // 检查是否已登录
        if (!this.isLoggedIn()) {
            // 未登录，重定向到登录页面
            window.location.href = 'login.html';
            return;
        }

        // 已登录，显示博客内容
        const main = document.querySelector('.main');
        const footer = document.querySelector('.footer');
        if (main) main.classList.add('show');
        if (footer) footer.classList.add('show');

        // 初始化博客应用
        new BlogApp();
        this.addLogoutButton();
    }

    // 检查是否已登录
    isLoggedIn() {
        const loggedIn = localStorage.getItem('loggedIn');
        const expirationTime = localStorage.getItem('expirationTime');

        if (loggedIn === 'true' && expirationTime) {
            const now = new Date();
            if (now.getTime() < parseInt(expirationTime)) {
                return true;
            } else {
                // 登录已过期
                this.logout();
            }
        }
        return false;
    }

    // 登出处理
    logout() {
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('expirationTime');
        window.location.href = 'login.html';
    }

    // 添加登出按钮
    addLogoutButton() {
        try {
            // 创建登出按钮
            const logoutBtn = document.createElement('button');
            logoutBtn.textContent = '登出';
            logoutBtn.className = 'btn btn-logout';
            logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> 登出';
            logoutBtn.style.cssText = 'background: rgba(255, 255, 255, 0.8); color: #3a6ea5; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.3s ease;';
            logoutBtn.addEventListener('mouseover', () => {
                logoutBtn.style.background = 'rgba(173, 216, 230, 0.3)';
            });
            logoutBtn.addEventListener('mouseout', () => {
                logoutBtn.style.background = 'rgba(255, 255, 255, 0.8)';
            });

            // 添加点击事件
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });

            // 添加到导航栏
            const nav = document.querySelector('.nav ul');
            if (nav) {
                const li = document.createElement('li');
                li.style.cssText = 'display: flex; align-items: center; gap: 10px;';

                // 添加登录用户信息
                const username = localStorage.getItem('username');
                const userInfo = document.createElement('span');
                userInfo.className = 'user-info';
                userInfo.style.cssText = 'color: #3a6ea5; font-weight: 500; font-size: 14px;';
                userInfo.innerHTML = `欢迎, <strong>${username}</strong>`;

                li.appendChild(userInfo);
                li.appendChild(logoutBtn);
                nav.appendChild(li);
            }
        } catch (error) {
            console.error('添加登出按钮失败:', error);
        }
    }
}

// 页面加载完成后初始化认证系统
document.addEventListener('DOMContentLoaded', () => {
    new AuthSystem();
});

// 添加一些额外的交互效果
window.addEventListener('load', () => {
    // 导航栏滚动效果
    let lastScrollTop = 0;
    const header = document.querySelector('.header');

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // 向下滚动且超过100px，隐藏导航栏
            header.style.transform = 'translateY(-100%)';
        } else {
            // 向上滚动，显示导航栏
            header.style.transform = 'translateY(0)';
        }

        lastScrollTop = scrollTop;
    });

    // 卡片悬停效果增强
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('.blog-card')) {
            e.target.closest('.blog-card').style.transform = 'translateY(-8px) scale(1.02)';
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest('.blog-card')) {
            e.target.closest('.blog-card').style.transform = 'translateY(-5px) scale(1)';
        }
    });

    // 平滑滚动到锚点
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (this.getAttribute('href') === '#' && !this.dataset.category) {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        });
    });
});