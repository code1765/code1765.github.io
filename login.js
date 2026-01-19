// 登录系统
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

    // 初始化
    init() {
        // 检查是否已登录
        if (this.isLoggedIn()) {
            window.location.href = 'index.html';
            return;
        }

        // 绑定表单提交事件
        const loginForm = document.getElementById('loginForm');
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.validateLogin();
        });

        // 添加表单交互效果
        this.addFormEffects();
    }

    // 验证登录
    validateLogin() {
        const username = document.getElementById('username').value;
        const errorMessage = document.getElementById('errorMessage');

        // 清空之前的错误信息
        errorMessage.classList.remove('show');

        // 任意输入都能成功登录
        this.loginSuccess(username || 'user');
    }

    // 登录成功处理
    loginSuccess(username) {
        // 保存登录状态
        const now = new Date();
        const expirationTime = now.getTime() + (1 * 24 * 60 * 60 * 1000); // 默认1天过期

        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('username', username);
        localStorage.setItem('expirationTime', expirationTime.toString());

        // 直接跳转，不使用过场动画
        window.location.href = 'index.html';
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
    }



    // 添加表单交互效果
    addFormEffects() {
        // 移除了标签上升效果，保留空函数以保持代码结构
    }
}

// 页面加载完成后初始化登录系统
document.addEventListener('DOMContentLoaded', () => {
    new LoginSystem();
});

// 添加页面加载动画
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});