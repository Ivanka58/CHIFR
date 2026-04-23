// ---------- ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ----------
let currentPhone = "";
let isVerified = false; // статус верификации собеседника
let isBanned = false;
let currentMenuChatId = null;

// ---------- АНИМАЦИЯ СЛОГАНОВ ----------
const phrases = ["Твой разговор. Твои правила.", "Абсолютная приватность.", "Код — твоё оружие.", "Никакой слежки."];
let phraseIndex = 0, charIndex = 0, isDeleting = false;
const taglineElement = document.getElementById('tagline');
function typeEffect() {
    if (!taglineElement) return;
    const current = phrases[phraseIndex];
    if (isDeleting) { taglineElement.textContent = current.substring(0, charIndex-1); charIndex--; }
    else { taglineElement.textContent = current.substring(0, charIndex+1); charIndex++; }
    if (!isDeleting && charIndex === current.length) { isDeleting = true; setTimeout(typeEffect, 2000); }
    else if (isDeleting && charIndex === 0) { isDeleting = false; phraseIndex = (phraseIndex+1)%phrases.length; setTimeout(typeEffect, 500); }
    else { setTimeout(typeEffect, isDeleting ? 50 : 100); }
}

// ---------- НАВИГАЦИЯ ПО ЭКРАНАМ ----------
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// ---------- ПЕРЕКЛЮЧЕНИЕ ТАБОВ ----------
function initTabs() {
    const btns = document.querySelectorAll('.menu-btn');
    const tabs = { chats: 'chats-tab', profile: 'profile-tab', settings: 'settings-tab' };
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.getElementById(tabs[tab]).classList.add('active');
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// ---------- ЛОГИН + КОД ----------
function initAuth() {
    const phoneInput = document.getElementById('phone-number');
    const reqBtn = document.getElementById('request-code-btn');
    const verifyBtn = document.getElementById('verify-code-btn');
    const codeInput = document.getElementById('code-input');
    document.getElementById('start-btn').onclick = () => showScreen('login-screen');
    document.getElementById('back-from-login').onclick = () => showScreen('splash-screen');
    document.getElementById('back-from-code').onclick = () => showScreen('login-screen');
    phoneInput.addEventListener('input', (e) => { let v = e.target.value.replace(/\D/g,'').slice(0,10); e.target.value=v; reqBtn.disabled = v.length!==10; });
    reqBtn.onclick = () => { if(phoneInput.value.length===10) { currentPhone = +7 ${phoneInput.value}; showScreen('code-screen'); } };
    codeInput.addEventListener('input', (e) => { let v = e.target.value.replace(/\D/g,'').slice(0,4); e.target.value=v; verifyBtn.disabled = v.length!==4; });
    verifyBtn.onclick = () => { if(codeInput.value === '1234') { showScreen('main-screen'); initTabs(); loadUserData(); } else alert('Неверный код, нужно 1234'); };
}

// ---------- ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ (локальное хранилище) ----------
function loadUserData() {
    const name = localStorage.getItem('shrifft_name') || 'Иван';
    const status = localStorage.getItem('shrifft_status') || 'Онлайн';
    const phone = localStorage.getItem('shrifft_phone')  (currentPhone  '+7 123 456 78 90');
    document.getElementById('profile-name').innerText = name;
    document.getElementById('profile-status').innerText = status;
    document.getElementById('info-name').innerText = name;
    document.getElementById('info-status-text').innerText = status;
    document.getElementById('info-phone').innerText = phone;
}
function saveUserData(field, val) {
    localStorage.setItem(shrifft_${field}, val);
loadUserData();
}
function initProfileEdit() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            let field = btn.dataset.field;
            let curr = field==='name'?localStorage.getItem('shrifft_name')'Иван': field==='status'?localStorage.getItem('shrifft_status')'Онлайн': localStorage.getItem('shrifft_phone')||'+7 123 456 78 90';
            let newVal = prompt(Введите ${field}, curr);
            if(newVal && newVal.trim()) saveUserData(field, newVal.trim());
        });
    });
}

// ---------- ОТДЕЛЬНАЯ СТРАНИЦА ЧАТА ----------
function openChatPage() {
    document.getElementById('chat-page').classList.remove('hidden');
    renderMessages();
}
function closeChatPage() { document.getElementById('chat-page').classList.add('hidden'); }
function renderMessages() {
    const container = document.getElementById('chat-messages');
    container.innerHTML = '';
    const msgs = JSON.parse(localStorage.getItem('shrifft_msgs') || '[]');
    msgs.forEach(m => { const d = document.createElement('div'); d.className = message ${m.type}; d.innerText = m.text; container.appendChild(d); });
    container.scrollTop = container.scrollHeight;
}
function addMessage(text, type) {
    const msgs = JSON.parse(localStorage.getItem('shrifft_msgs') || '[]');
    msgs.push({ text, type, time: Date.now() });
    localStorage.setItem('shrifft_msgs', JSON.stringify(msgs));
    renderMessages();
}
function initChat() {
    document.getElementById('close-chat-page').onclick = closeChatPage;
    document.getElementById('send-msg-btn').onclick = () => {
        const input = document.getElementById('chat-input');
        if(!input.value.trim()) return;
        addMessage(input.value.trim(), 'outgoing');
        input.value = '';
        setTimeout(() => {
            let reply = "Интересно... расскажи ещё.";
            const lastMsg = JSON.parse(localStorage.getItem('shrifft_msgs')  '[]').pop()?.text.toLowerCase()  '';
            if(lastMsg.includes('привет')) reply = "Привет! Рад общаться в Шрифте.";
            if(lastMsg.includes('шифрование')) reply = "Скоро тут будет мощная защита.";
            addMessage(reply, 'incoming');
        }, 800);
    };
    document.querySelector('.chat-item').onclick = () => { openChatPage(); updateChatHeader(); };
}
function updateChatHeader() {
    const nameSpan = document.getElementById('chat-contact-name');
    const badgeSpan = document.getElementById('chat-contact-verified-badge');
    nameSpan.innerText = 'Шрифт Тест';
    if(isVerified) badgeSpan.style.display = 'inline-block';
    else badgeSpan.style.display = 'none';
}

// ---------- ПРОФИЛЬ СОБЕСЕДНИКА ----------
function openProfilePage() {
    document.getElementById('profile-page').classList.remove('hidden');
    updateProfilePage();
}
function closeProfilePage() { document.getElementById('profile-page').classList.add('hidden'); }
function updateProfilePage() {
    document.getElementById('profile-page-name').innerText = 'Шрифт Тест';
    const badge = document.getElementById('profile-page-verified-badge');
    const verText = document.getElementById('profile-page-verified-text');
    if(isVerified) { badge.style.display = 'inline-block'; verText.innerText = 'Верифицирован'; }
    else { badge.style.display = 'none'; verText.innerText = 'Не верифицирован'; }
}
function showActionMenu(chatId) {
    const menu = document.getElementById('action-menu');
    menu.classList.remove('hidden');
    currentMenuChatId = chatId;
    document.addEventListener('click', function closeMenu(e) { if(!menu.contains(e.target)) { menu.classList.add('hidden'); document.removeEventListener('click', closeMenu); } });
}
function initContactProfile() {
    document.getElementById('chat-contact-header').onclick = openProfilePage;
    document.getElementById('close-profile').onclick = closeProfilePage;
    document.getElementById('chat-menu-btn').onclick = (e) => { e.stopPropagation(); showActionMenu('test'); };
    document.getElementById('profile-menu-dots').onclick = (e) => { e.stopPropagation(); showActionMenu('test'); };
    document.getElementById('action-verify').onclick = () => { if(!isVerified && !isBanned) { isVerified=true; alert('Аккаунт верифицирован'); updateChatHeader(); updateProfilePage(); } document.getElementById('action-menu').classList.add('hidden'); };
    document.getElementById('action-unverify').onclick = () => { if(isVerified) { isVerified=false; alert('Верификация снята'); updateChatHeader(); updateProfilePage(); } document.getElementById('action-menu').classList.add('hidden'); };
    document.getElementById('action-temp-ban').onclick = () => { isBanned=true; isVerified=false; document.getElementById('chat-contact-name').innerText = 'Удаленный аккаунт'; document.getElementById('profile-page-name').innerText = 'Удаленный аккаунт'; alert('Аккаунт забанен (временный бан)'); document.getElementById('action-menu').classList.add('hidden'); };
    document.getElementById('action-perm-ban').onclick = () => { isBanned=true; isVerified=false; document.getElementById('chat-contact-name').innerText = 'Удаленный аккаунт'; document.getElementById('profile-page-name').innerText = 'Удаленный аккаунт'; alert('Аккаунт забанен навсегда'); document.getElementById('action-menu').classList.add('hidden'); };
}

// ---------- СИНЯЯ ГАЛОЧКА С ТУЛТИПОМ ----------
function initVerifiedTooltip() {
    const badge = document.getElementById('chat-contact-verified-badge');
    if(badge) {
        badge.addEventListener('mouseenter', (e) => {
            const tt = document.getElementById('verified-tooltip');
            tt.classList.remove('hidden');
            tt.style.left = (e.pageX - 50) + 'px';
            tt.style.top = (e.pageY - 30) + 'px';
        });
        badge.addEventListener('mouseleave', () => document.getElementById('verified-tooltip').classList.add('hidden'));
    }
}

// ---------- НАСТРОЙКИ (СОХРАНЕНИЕ ЧЕКБОКСОВ) ----------
function initSettings() {
    document.querySelectorAll('.setting-checkbox').forEach(cb => {
        const key = setting_${cb.parentElement.parentElement.innerText.trim()};
        if(localStorage.getItem(key) === 'true') cb.checked = true;
        cb.addEventListener('change', () => localStorage.setItem(key, cb.checked));
    });
}

// ---------- ЗАПУСК ----------
document.addEventListener('DOMContentLoaded', () => {
    typeEffect();
    initAuth();
    initProfileEdit();
    initChat();
    initContactProfile();
    initSettings();
    initVerifiedTooltip();
    loadUserData();
});
