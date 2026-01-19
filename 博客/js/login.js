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

        // 加载记住的用户名
        this.loadRememberedUser();

        // 添加表单交互效果
        this.addFormEffects();
    }

    // 验证登录
    validateLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        const errorMessage = document.getElementById('errorMessage');

        // 清空之前的错误信息
        errorMessage.classList.remove('show');

        // 验证用户名和密码
        if (this.validUsers[username] && this.validUsers[username] === password) {
            // 登录成功
            this.loginSuccess(username, rememberMe);
        } else {
            // 登录失败
            errorMessage.textContent = '用户名或密码错误';
            errorMessage.classList.add('show');
            
            // 添加抖动动画
            const loginForm = document.getElementById('loginForm');
            loginForm.classList.add('shake');
            setTimeout(() => {
                loginForm.classList.remove('shake');
            }, 500);
        }
    }

    // 登录成功处理
    loginSuccess(username, rememberMe) {
        // 保存登录状态
        const now = new Date();
        const expirationTime = now.getTime() + (rememberMe ? 7 * 24 * 60 * 60 * 1000 : 1 * 24 * 60 * 60 * 1000);
        
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('username', username);
        localStorage.setItem('expirationTime', expirationTime.toString());
        
        // 如果选择记住我，保存用户名到localStorage
        if (rememberMe) {
            localStorage.setItem('rememberedUser', username);
        } else {
            localStorage.removeItem('rememberedUser');
        }

        // 页面跳转
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

    // 加载记住的用户名
    loadRememberedUser() {
        const rememberedUser = localStorage.getItem('rememberedUser');
        if (rememberedUser) {
            document.getElementById('username').value = rememberedUser;
            document.getElementById('rememberMe').checked = true;
        }
    }

    // 添加表单交互效果
    addFormEffects() {
        const inputs = document.querySelectorAll('.login-form input');
        
        inputs.forEach(input => {
            // 输入框聚焦效果
            input.addEventListener('focus', () => {
                const formGroup = input.closest('.form-group');
                formGroup.classList.add('focused');
            });
            
            // 输入框失焦效果
            input.addEventListener('blur', () => {
                const formGroup = input.closest('.form-group');
                if (!input.value) {
                    formGroup.classList.remove('focused');
                }
            });
            
            // 实时输入效果
            input.addEventListener('input', () => {
                const formGroup = input.closest('.form-group');
                if (input.value) {
                    formGroup.classList.add('filled');
                } else {
                    formGroup.classList.remove('filled');
                }
            });
        });
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