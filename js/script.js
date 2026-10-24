'use strict';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwPk5HXjegfZoZOEm_IfEFQXjbr4snwSfKC8zEcDE3K0Xog55vP1tSYidtBh5PO1tZ8/exec';

const form = document.getElementById('requestForm');
const submitBtn = document.getElementById('submitBtn');
const fillRandomBtn = document.getElementById('fillRandomBtn');
const phoneInput = document.getElementById('phone');
const toastEl = document.getElementById('toast');

const NAME_RE = /^[\p{L}\s]+$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const validators = {
  firstName: (v) => validateName(v, 'Имя'),
  lastName: (v) => validateName(v, 'Фамилия'),

  email: (v) => {
    if (!v) return 'Введите email';
    if (!EMAIL_RE.test(v)) return 'Введите корректный email, например name@company.com';
    return '';
  },

  phone: (v) => {
    if (!v) return 'Введите номер телефона';
    const digits = v.replace(/\D/g, '');
    if (!v.startsWith('+998') || digits.length !== 12) {
      return 'Номер должен начинаться с +998 и содержать 12 цифр';
    }
    return '';
  },

  service: (v) => (v ? '' : 'Выберите тип услуги'),
  budget: (v) => (v ? '' : 'Выберите бюджет'),
  deadline: (v) => (v ? '' : 'Выберите срок'),

  description: (v) => {
    if (!v) return 'Опишите ваш проект';
    if (v.length < 30) return `Минимум 30 символов (сейчас ${v.length})`;
    return '';
  },

  pagesCount: (v) => {
    if (v === '') return '';
    const n = Number(v);
    if (!Number.isInteger(n) || n < 1 || n > 100) return 'Введите целое число от 1 до 100';
    return '';
  },

  website: (v) => {
    if (v === '') return '';
    if (!/^https?:\/\//i.test(v)) return 'Ссылка должна начинаться с http:// или https://';
    try {
      const url = new URL(v);
      if (!url.hostname.includes('.')) return 'Введите корректный адрес сайта';
    } catch (e) {
      return 'Введите корректный адрес сайта';
    }
    return '';
  },
};

function validateName(v, label) {
  if (!v) return `Введите ${label.toLowerCase()}`;
  if (v.length < 2) return `${label}: минимум 2 символа`;
  if (!NAME_RE.test(v)) return `${label}: только буквы и пробелы`;
  return '';
}

function getValue(name) {
  return form.elements[name].value.trim();
}

function setError(name, message) {
  const field = form.elements[name];
  const errorEl = document.getElementById(name + 'Error');
  errorEl.textContent = message;
  field.classList.toggle('invalid', Boolean(message));
}

function validateField(name) {
  const message = validators[name](getValue(name));
  setError(name, message);
  return !message;
}

function validateAll() {
  let firstInvalid = null;
  Object.keys(validators).forEach((name) => {
    if (!validateField(name) && !firstInvalid) firstInvalid = form.elements[name];
  });
  if (firstInvalid) firstInvalid.focus();
  return !firstInvalid;
}

function clearAllErrors() {
  Object.keys(validators).forEach((name) => setError(name, ''));
}

Object.keys(validators).forEach((name) => {
  const field = form.elements[name];
  const eventName = field.tagName === 'SELECT' ? 'change' : 'input';
  field.addEventListener(eventName, () => {
    if (field.classList.contains('invalid')) setError(name, '');
  });
});

function formatPhone(raw) {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('998')) digits = digits.slice(3);
  digits = digits.slice(0, 9);
  if (!digits) return '';
  const parts = [
    digits.slice(0, 2),
    digits.slice(2, 5),
    digits.slice(5, 7),
    digits.slice(7, 9),
  ].filter(Boolean);
  return '+998 ' + parts.join(' ');
}

phoneInput.addEventListener('input', () => {
  phoneInput.value = formatPhone(phoneInput.value);
});

let toastTimer;
function showToast(message, isError = false) {
  toastEl.textContent = message;
  toastEl.classList.toggle('toast--error', isError);
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 4500);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!validateAll()) return;

  if (SCRIPT_URL.includes('PASTE_YOUR')) {
    showToast('Укажите URL Apps Script в js/script.js (SCRIPT_URL)', true);
    return;
  }

  const data = {};
  new FormData(form).forEach((value, key) => {
    data[key] = String(value).trim();
  });

  submitBtn.disabled = true;
  submitBtn.textContent = 'Отправляем...';

  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data),
    });

    form.reset();
    clearAllErrors();
    showToast('✅ Заявка отправлена! Мы свяжемся с вами в ближайшее время.');
  } catch (err) {
    console.error(err);
    showToast('Не удалось отправить заявку. Проверьте интернет и попробуйте ещё раз.', true);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Отправить заявку';
  }
});


const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[rand(0, arr.length - 1)];

const FIRST_NAMES = [
  { ru: 'Алишер', en: 'alisher' }, { ru: 'Дилшод', en: 'dilshod' },
  { ru: 'Азиза', en: 'aziza' }, { ru: 'Мадина', en: 'madina' },
  { ru: 'Сергей', en: 'sergey' }, { ru: 'Анна', en: 'anna' },
  { ru: 'Тимур', en: 'timur' }, { ru: 'Камила', en: 'kamila' },
];
const LAST_NAMES = [
  { ru: 'Каримов', en: 'karimov' }, { ru: 'Рахимова', en: 'rakhimova' },
  { ru: 'Юсупов', en: 'yusupov' }, { ru: 'Иванова', en: 'ivanova' },
  { ru: 'Саидов', en: 'saidov' }, { ru: 'Петров', en: 'petrov' },
  { ru: 'Хасанова', en: 'khasanova' }, { ru: 'Назаров', en: 'nazarov' },
];
const COMPANIES = [
  { name: 'WeCraft Studio', domain: 'wecraft.uz' },
  { name: 'TechNova', domain: 'technova.uz' },
  { name: 'Silk Road Logistics', domain: 'silkroad.uz' },
  { name: 'GreenMarket', domain: 'greenmarket.uz' },
  { name: 'Orion Group', domain: 'oriongroup.uz' },
];
const POSITIONS = ['CEO', 'Marketing Manager', 'Product Owner', 'CTO', 'Директор по развитию', 'Основатель'];
const OPERATORS = ['90', '91', '93', '94', '95', '97', '99', '33', '88'];
const DESCRIPTIONS = [
  'Нужен многостраничный корпоративный сайт для IT-компании. Есть готовый Figma-макет, референсы в описании. Важна адаптивность и SEO-оптимизация.',
  'Хотим запустить интернет-магазин с каталогом на 200 товаров, онлайн-оплатой через Payme и Click и личным кабинетом покупателя.',
  'Требуется лендинг для презентации нового продукта: яркий дизайн, анимации, форма заявки и интеграция с Telegram-ботом.',
  'Планируем мобильное приложение для записи клиентов в салон красоты: календарь мастеров, push-уведомления, онлайн-оплата.',
  'Нужен редизайн логотипа и фирменного стиля для кофейни: логотип, палитра, шрифты, визитки и оформление меню.',
];

function setField(name, value) {
  form.elements[name].value = value;
}

function randomFutureDate() {
  const d = new Date();
  d.setDate(d.getDate() + rand(14, 365));
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function randomSelectValue(selectName) {
  const options = [...form.elements[selectName].options].filter((o) => o.value !== '');
  return pick(options).value;
}

fillRandomBtn.addEventListener('click', () => {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  const company = pick(COMPANIES);

  setField('firstName', first.ru);
  setField('lastName', last.ru);
  setField('email', `${first.en}.${last.en}@${company.domain}`);
  setField('phone', formatPhone('998' + pick(OPERATORS) + String(rand(1000000, 9999999))));
  setField('company', company.name);
  setField('position', pick(POSITIONS));

  setField('service', randomSelectValue('service'));
  setField('budget', randomSelectValue('budget'));
  setField('deadline', randomSelectValue('deadline'));
  setField('launchDate', randomFutureDate());
  setField('pagesCount', rand(1, 100));
  setField('description', pick(DESCRIPTIONS));

  setField('website', `https://${company.domain.replace('.uz', '')}-old.uz`);
  setField('source', randomSelectValue('source'));
  setField('contactMethod', randomSelectValue('contactMethod'));

  clearAllErrors();
});