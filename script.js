// ---------- РАБОТА С ЭКРАНАМИ И МЕНЮ ----------
let currentPhone = "";

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Навигация по вкладкам в главном меню
function initMainTabs() {
    const menuBtns = document.querySelectorAll('.menu-btn');
    const tabs = {
        chats: document.getElementById('chats-tab'),
        profile: document.getElementById('profile-tab'),
        settings: document.getElementById('settings-tab')
    };

    function activateTab(tabId) {
        Object.values(tabs).forEach(tab => tab.classList.remove('active'));
        tabs[tabId].classList.add('active');
        menuBtns.forEach(btn => {
            if (btn.dataset.tab === tabId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    menuBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            activateTab(btn.dataset.tab);
        });
    });
    
    // Активируем вкладку чатов по умолчанию
    activateTab('chats');
}

// ---------- ЛОГИКА ВХОДА ----------
function initAuth() {
    const phoneInput = document.getElementById('phone-number');
    const requestBtn = document.getElementById('request-code-btn');
    const backFromLogin = document.getElementById('back-from-login');
    const backFromCode = document.getElementById('back-from-code');
    const codeInput = document.getElementById('code-input');
    const verifyBtn = document.getElementById('verify-code-btn');
    const startBtn = document.getElementById('start-btn');

    // Форматирование номера
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 10) value = value.slice(0,10);
        e.target.value = value;
        requestBtn.disabled = value.length !== 10;
    });

    // Кнопка "Продолжить" на экране номера
    requestBtn.addEventListener('click', () => {
        if (phoneInput.value.length === 10) {
            currentPhone = `+7 ${phoneInput.value.slice(0,3)} ${phoneInput.value.slice(3,6)} ${phoneInput.value.slice(6,8)} ${phoneInput.value.slice(8,10)}`;
            showScreen('code-screen');
        }
    });

    // Проверка кода
    codeInput.addEventListener('input', (e) => {
        const val = e.target.value.replace(/\D/g, '');
        if (val.length > 4) val = val.slice(0,4);
        e.target.value = val;
        verifyBtn.disabled = val.length !== 4;
    });

    verifyBtn.addEventListener('click', () => {
        const code = document.getElementById('code-input').value;
        if (code === '1234') {
            // Успешный вход
            showScreen('main-screen');
            initMainTabs();
            loadUserData(); // Загружаем данные в профиль
        } else {
            alert('Неверный код. Попробуйте 1234');
        }
    });

    startBtn.addEventListener('click', () => {
        showScreen('login-screen');
    });

    backFromLogin.addEventListener('click', () => showScreen('splash-screen'));
    backFromCode.addEventListener('click', () => showScreen('login-screen'));
}

// ---------- ПРОФИЛЬ: ЗАГРУЗКА И РЕДАКТИРОВАНИЕ ----------
function loadUserData() {
    // Загружаем данные из localStorage или ставим по умолчанию
    const savedName = localStorage.getItem('shrifft_name') || 'Иван';
    const savedStatus = localStorage.getItem('shrifft_status') || 'Онлайн';
    const savedPhone = localStorage.getItem('shrifft_phone') || currentPhone || '+7 123 456 78 90';
    
    document.getElementById('profile-name').innerText = savedName;
    document.getElementById('profile-status').innerText = savedStatus;
    document.getElementById('info-name').innerText = savedName;
    document.getElementById('info-status').innerText = savedStatus;
    document.getElementById('info-phone').innerText = savedPhone;
}

function saveUserData(field, value) {
    if (field === 'name') {
        localStorage.setItem('shrifft_name', value);
        document.getElementById('profile-name').innerText = value;
        document.getElementById('info-name').innerText = value;
    } else if (field === 'status') {
        localStorage.setItem('shrifft_status', value);
        document.getElementById('profile-status').innerText = value;
        document.getElementById('info-status').innerText = value;
    } else if (field === 'phone') {
        localStorage.setItem('shrifft_phone', value);
        document.getElementById('info-phone').innerText = value;
    }
}

function initProfileEditing() {
    const editBtns = document.querySelectorAll('.edit-btn');
    editBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const field = btn.dataset.field;
            let currentValue = '';
            if (field === 'name') currentValue = localStorage.getItem('shrifft_name') || 'Иван';
            if (field === 'status') currentValue = localStorage.getItem('shrifft_status') || 'Онлайн';
            if (field === 'phone') currentValue = localStorage.getItem('shrifft_phone') || (currentPhone || '+7 123 456 78 90');
            
            const newValue = prompt(`Введите новый ${field}`, currentValue);
            if (newValue && newValue.trim()) {
                saveUserData(field, newValue.trim());
            }
        });
    });
}

// ---------- ЧАТ (тестовый) ----------
function initTestChat() {
    const chatWindow = document.getElementById('chat-window');
    const closeBtn = document.getElementById('close-chat');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-msg-btn');
    const messagesContainer = document.getElementById('chat-messages');
    const chatItem = document.querySelector('.chat-item');

    // Открыть чат
    chatItem.addEventListener('click', () => {
        chatWindow.classList.remove('hidden');
        // Прокрутить вниз, если есть сообщения
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });

    // Закрыть чат
    closeBtn.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
    });

    // Отправить сообщение
    function sendMessage() {
        const text = chatInput.value.trim();
        if (text === "") return;
        
        // Добавляем наше сообщение
        addMessage(text, 'outgoing');
        chatInput.value = '';
        
        // Имитация ответа через 1 секунду
        setTimeout(() => {
            const autoReply = getAutoReply(text);
            addMessage(autoReply, 'incoming');
        }, 800);
    }
    
    function addMessage(text, type) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', type);
        msgDiv.innerText = text;
        messagesContainer.appendChild(msgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    function getAutoReply(userMsg) {
        const msg = userMsg.toLowerCase();
        if (msg.includes('привет') || msg.includes('здарова')) return 'Привет! Рад, что ты тестируешь Шрифт.';
        if (msg.includes('как дела')) return 'Отлично, осваиваюсь в новом мессенджере! А у тебя?';
        if (msg.includes('шифрование')) return 'Скоро здесь будет мощная защита. Следи за новостями!';
        if (msg.includes('дизайн')) return 'Дизайн уникальный, правда? Мы с создателем постарались.';
        return 'Интересно... Расскажи ещё что-нибудь о себе или проекте.';
    }
    
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

// ---------- СОХРАНЕНИЕ НАСТРОЕК (пока просто заглушка) ----------
function initSettings() {
    const checkboxes = document.querySelectorAll('.setting-checkbox');
    checkboxes.forEach(cb => {
        // Загружаем сохранённое состояние
        const key = `setting_${cb.parentElement.parentElement.innerText.trim()}`;
        const saved = localStorage.getItem(key);
        if (saved === 'true') cb.checked = true;
        
        cb.addEventListener('change', () => {
            const settingName = cb.parentElement.parentElement.innerText.trim();
            localStorage.setItem(`setting_${settingName}`, cb.checked);
            console.log(`Настройка "${settingName}" изменена на ${cb.checked}`);
            // Здесь позже будет реальная логика киберфишек
        });
    });
}

// ---------- ЗАПУСК ----------
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initProfileEditing();
    initTestChat();
    initSettings();
});
