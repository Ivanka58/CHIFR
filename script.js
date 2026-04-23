// ============ STATE ============
const STATE = {
    currentScreen: 'splash',
    phone: '',
    code: '',
    isVerified: true,
    isBanned: false,
    banType: null, // 'temp' | 'perm' | null
    slogans: [
        'Безопасность превыше всего',
        'Твои данные — твоя крепость',
        'Шифруй или погибни',
        'Приватность — не роскошь',
        'Шрифт никогда не спит'
    ],
    sloganIndex: 0
};


// ============ DOM ELEMENTS ============
const screens = {
    splash: document.getElementById('splash-screen'),
    login: document.getElementById('login-screen'),
    code: document.getElementById('code-screen'),
    main: document.getElementById('main-screen'),
    chat: document.getElementById('chat-screen'),
    contactProfile: document.getElementById('contact-profile-screen')
};


const phoneInput = document.getElementById('phone-input');
const loginBtn = document.getElementById('login-btn');
const backToLogin = document.getElementById('back-to-login');
const phoneDisplay = document.getElementById('phone-display');
const codeDigits = document.querySelectorAll('.code-digit');
const verifyBtn = document.getElementById('verify-btn');
const timerEl = document.getElementById('timer');
const sloganText = document.getElementById('slogan-text');


const navBtns = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');


const chatTest = document.getElementById('chat-test');
const backFromChat = document.getElementById('back-from-chat');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatHeaderInfo = document.getElementById('chat-header-info');
const chatHeaderName = document.getElementById('chat-header-name');
const headerVerified = document.getElementById('header-verified');
const chatVerified = document.getElementById('chat-verified');
const chatInputArea = document.getElementById('chat-input-area');


const backFromContact = document.getElementById('back-from-contact');
const contactMenuBtn = document.getElementById('contact-menu-btn');
const contactDropdown = document.getElementById('contact-dropdown');
const contactAvatar = document.getElementById('contact-avatar');
const contactProfileName = document.getElementById('contact-profile-name');
const contactPhone = document.getElementById('contact-phone');
const contactStatus = document.getElementById('contact-status');


const btnEdits = document.querySelectorAll('.btn-edit');


// ============ LOCALSTORAGE ============
function loadUserData() {
    const name = localStorage.getItem('shrift_user_name');
    const status = localStorage.getItem('shrift_user_status');
    const phone = localStorage.getItem('shrift_user_phone');
    
    if (name) document.getElementById('user-name').textContent = name;
    if (status) document.getElementById('user-status').textContent = status;
    if (phone) document.getElementById('user-phone').textContent = phone;
}


function saveUserData(field, value) {
    const map = {
        'name': 'shrift_user_name',
        'status': 'shrift_user_status',
        'phone': 'shrift_user_phone'
    };
    localStorage.setItem(map[field], value);
}


// ============ SCREEN NAVIGATION ============
function showScreen(screenName) {
    Object.values(screens).forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });
    
    const target = screens[screenName];
    if (target) {
        target.style.display = 'flex';
        // Force reflow
        void target.offsetWidth;
        target.classList.add('active');
        STATE.currentScreen = screenName;
    }
}


// ============ SPLASH ============
function startSplash() {
    // Slogan rotation
    const sloganInterval = setInterval(() => {
        STATE.sloganIndex = (STATE.sloganIndex + 1) % STATE.slogans.length;
        sloganText.style.opacity = '0';
        setTimeout(() => {
            sloganText.textContent = STATE.slogans[STATE.sloganIndex];
            sloganText.style.opacity = '1';
        }, 500);
    }, 1500);


    // Auto transition to login
    setTimeout(() => {
        clearInterval(sloganInterval);
        showScreen('login');
    }, 3000);
}


// ============ PHONE MASK ============
function formatPhone(value) {
    const digits = value.replace(/\D/g, '').replace(/^7/, '').replace(/^8/, '');
    let formatted = '+7';
    if (digits.length > 0) formatted += ' (' + digits.slice(0, 3);
    if (digits.length >= 3) formatted += ')';
    if (digits.length > 3) formatted += ' ' + digits.slice(3, 6);
    if (digits.length >= 6) formatted += '-' + digits.slice(6, 8);
    if (digits.length >= 8) formatted += '-' + digits.slice(8, 10);
    return formatted;
}


phoneInput.addEventListener('input', (e) => {
    const cursorPos = e.target.selectionStart;
    const oldLen = e.target.value.length;
    
    e.target.value = formatPhone(e.target.value);
    
    const newLen = e.target.value.length;
    e.target.setSelectionRange(cursorPos + (newLen - oldLen), cursorPos + (newLen - oldLen));
    
    const digits = e.target.value.replace(/\D/g, '');
    loginBtn.disabled = digits.length !== 11; // +7 + 10 digits
});


phoneInput.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && phoneInput.value.length <= 3) {
        e.preventDefault();
    }
});


// ============ LOGIN ============
loginBtn.addEventListener('click', () => {
    STATE.phone = phoneInput.value;
    phoneDisplay.textContent = STATE.phone;
    showScreen('code');
    startTimer();
    codeDigits[0].focus();
});


backToLogin.addEventListener('click', () => {
    showScreen('login');
});


// ============ CODE INPUT ============
codeDigits.forEach((input, index) => {
    input.addEventListener('input', (e) => {
        if (e.target.value.length === 1) {
            if (index < 3) codeDigits[index + 1].focus();
        }
        checkCode();
    });
    
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
            codeDigits[index - 1].focus();
        }
    });
    
    input.addEventListener('paste', (e) => {
        e.preventDefault();
        const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
        paste.split('').forEach((char, i) => {
            if (codeDigits[i]) codeDigits[i].value = char;
        });
        if (codeDigits[paste.length]) codeDigits[paste.length].focus();
        checkCode();
    });
});


function checkCode() {
    const code = Array.from(codeDigits).map(d => d.value).join('');
    verifyBtn.disabled = code.length !== 4;
}


function startTimer() {
    let seconds = 59;
    timerEl.textContent = seconds;
    const interval = setInterval(() => {
        seconds--;
        timerEl.textContent = seconds;
        if (seconds <= 0) {
            clearInterval(interval);
            timerEl.parentElement.textContent = 'Отправить код повторно';
            timerEl.parentElement.style.color = '#00E5FF';
            timerEl.parentElement.style.cursor = 'pointer';
        }
    }, 1000);
}


// ============ VERIFY ============
verifyBtn.addEventListener('click', () => {
    const code = Array.from(codeDigits).map(d => d.value).join('');
    if (code === '1234') {
        showScreen('main');
        loadUserData();
    } else {
        codeDigits.forEach(d => {
            d.style.borderColor = '#ff4757';
            setTimeout(() => d.style.borderColor = '', 500);
        });
    }
});


// ============ BOTTOM NAV ============
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        
        navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        tabContents.forEach(t => t.classList.remove('active'));
        document.getElementById(`tab-${tab}`).classList.add('active');
    });
});


// ============ CHAT ============
chatTest.addEventListener('click', () => {
    if (STATE.isBanned) return;
    showScreen('chat');
});


backFromChat.addEventListener('click', () => {
    showScreen('main');
});


function addMessage(text, isUser) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text;
    
    const time = document.createElement('span');
    time.className = 'message-time';
    time.textContent = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    
    msgDiv.appendChild(bubble);
    msgDiv.appendChild(time);
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}


function getBotResponse(text) {
    const lower = text.toLowerCase();
    if (lower.includes('привет')) return 'Привет! Шрифт тебя слышит.';
    if (lower.includes('шифрование')) return 'Мы используем двойное шифрование.';
    if (lower.includes('как дела')) return 'Готов защищать твои данные.';
    return 'Расскажи подробнее.';
}


function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || STATE.isBanned) return;
    
    addMessage(text, true);
    messageInput.value = '';
    
    setTimeout(() => {
        addMessage(getBotResponse(text), false);
    }, 800);
}


sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});


// ============ CONTACT PROFILE ============
chatHeaderInfo.addEventListener('click', () => {
    showScreen('contactProfile');
    contactDropdown.classList.remove('show');
});


backFromContact.addEventListener('click', () => {
    showScreen('chat');
    contactDropdown.classList.remove('show');
});


// Menu toggle
contactMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    contactDropdown.classList.toggle('show');
});


document.addEventListener('click', (e) => {
    if (!contactDropdown.contains(e.target) && e.target !== contactMenuBtn) {
        contactDropdown.classList.remove('show');
    }
});


// Menu actions
document.getElementById('action-verify').addEventListener('click', () => {
    STATE.isVerified = true;
    headerVerified.style.display = 'inline';
    chatVerified.style.display = 'inline';
    contactStatus.textContent = 'Верифицирован';
    contactDropdown.classList.remove('show');
});


document.getElementById('action-unverify').addEventListener('click', () => {
    STATE.isVerified = false;
    headerVerified.style.display = 'none';
    chatVerified.style.display = 'none';
    contactStatus.textContent = 'Не верифицирован';
    contactDropdown.classList.remove('show');
});


function applyBan(type) {
    STATE.isBanned = true;
    STATE.banType = type;
    
    // Visual changes
    contactAvatar.textContent = '✕';
    contactAvatar.style.background = '#2a2a3a';
    contactProfileName.textContent = 'Удаленный аккаунт';
    contactPhone.textContent = '—';
    contactStatus.textContent = 'Заблокирован';
    
    chatHeaderName.textContent = 'Удаленный аккаунт';
    headerVerified.style.display = 'none';
    chatVerified.style.display = 'none';
    
    // Disable chat
    messageInput.disabled = true;
    messageInput.placeholder = 'Чат недоступен';
    sendBtn.disabled = true;
    
    // Update chat card
    const chatName = chatTest.querySelector('.chat-name');
    const chatPreview = chatTest.querySelector('.chat-preview');
    const chatAvatar = chatTest.querySelector('.chat-avatar');
    if (chatName) chatName.textContent = 'Удаленный аккаунт';
    if (chatPreview) chatPreview.textContent = 'Аккаунт удален';
    if (chatAvatar) {
        chatAvatar.textContent = '✕';
        chatAvatar.style.background = '#2a2a3a';
    }
    
    contactDropdown.classList.remove('show');
    
    if (type === 'perm') {
        console.log('Пользователь забанен навсегда');
    }
}


document.getElementById('action-ban-temp').addEventListener('click', () => {
    applyBan('temp');
});


document.getElementById('action-ban-perm').addEventListener('click', () => {
    applyBan('perm');
});


// ============ PROFILE EDITING ============
btnEdits.forEach(btn => {
    btn.addEventListener('click', () => {
        const field = btn.dataset.field;
        const span = btn.previousElementSibling;
        const currentValue = span.textContent;
        
        const newValue = prompt(
            field === 'name' ? 'Введите имя:' :
            field === 'status' ? 'Введите статус:' :
            'Введите номер телефона:',
            currentValue
        );
        
        if (newValue !== null && newValue.trim() !== '') {
            span.textContent = newValue.trim();
            saveUserData(field, newValue.trim());
        }
    });
});


// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
    showScreen('splash');
    startSplash();
});
