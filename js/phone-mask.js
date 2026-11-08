// Маска телефона, одна на весь сайт (та же, что в ukris-hotdeals).
// Формат +7 (XXX) XXX-XX-XX, сервер всё равно принимает и нормализует сырые цифры:
// маска это удобство ввода, а не проверка.
// Номер другой страны набирают с плюса и своего кода: такому скобки не рисуем, остаются
// плюс, цифры и пробелы.

const PHONE_PREFIX = '+7 (';
// Длиннее пятнадцати цифр международных номеров не бывает, сервер такой не примет.
const PHONE_FOREIGN_DIGITS = 15;

const phoneDigitsOf = (value) => String(value).replace(/\D/g, '');

// Плюс и следом не семёрка это код другой страны. Восьмёрка после плюса тоже: с неё
// начинаются +84 и +86, а российский номер с восьмёрки пишут без плюса.
const isForeignPhone = (value) => /^\+[0-689]/.test(String(value));

function formatForeignPhone(value) {
  let out = '+';
  let digits = 0;

  for (const char of String(value).slice(1)) {
    if (char === ' ') {
      out += char;
    } else if (/\d/.test(char) && digits < PHONE_FOREIGN_DIGITS) {
      out += char;
      digits++;
    }
  }

  return out;
}

// Абонентские цифры это то, что идёт после +7. Разбор зависит от того, наше ли это
// отображение: «+7 (» рисуем мы, значит первая семёрка наша, а дальше набор человека.
// В чужом тексте первая семёрка или восьмёрка это код страны или межгород, её снимаем.
// Кроме ровно десяти цифр с восьмёрки: это номер без кода страны с городским кодом 812 или 843.
function phoneSubscriber(value) {
  const digits = phoneDigitsOf(value);
  let rest;

  if (value.indexOf(PHONE_PREFIX) === 0) {
    rest = digits.slice(1);
    if (rest.length > 10 && (rest[0] === '7' || rest[0] === '8')) {
      rest = rest.slice(1);
    }
  } else if (digits[0] === '7' || (digits[0] === '8' && digits.length !== 10)) {
    rest = digits.slice(1);
  } else {
    rest = digits;
  }

  return rest.slice(0, 10);
}

function formatPhone(rest) {
  if (!rest) {
    return PHONE_PREFIX;
  }

  let out = PHONE_PREFIX + rest.slice(0, 3);

  if (rest.length >= 3) {
    out += ')';
  }
  if (rest.length > 3) {
    out += ' ' + rest.slice(3, 6);
  }
  if (rest.length > 6) {
    out += '-' + rest.slice(6, 8);
  }
  if (rest.length > 8) {
    out += '-' + rest.slice(8, 10);
  }

  return out;
}

function phoneCaretAfterDigit(formatted, count) {
  let seen = 0;

  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) {
      seen++;
      if (seen === count + 1) {
        return i;
      }
    }
  }

  return formatted.length;
}

function attachPhoneMask(input) {
  // Значение с сервера приходит цифрами: в базе телефон хранится нормализованным,
  // а человеку его надо показать в привычном виде.
  if (isForeignPhone(input.value)) {
    input.value = formatForeignPhone(input.value);
  } else if (phoneDigitsOf(input.value).length > 1) {
    input.value = formatPhone(phoneSubscriber(input.value));
  }

  let previous = phoneDigitsOf(input.value);

  input.addEventListener('input', (event) => {
    const deleting = String(event.inputType || '').indexOf('delete') === 0;
    let caret = input.selectionStart || 0;

    // Плюс после нашего «+7 (»: человек набирает или вставляет номер другой страны,
    // не стирая префикс. Оставляем то, что начинается с его плюса.
    const typedPlus = input.value.indexOf('+', 1);

    if (typedPlus > 0) {
      input.value = input.value.slice(typedPlus);
      caret = Math.max(1, caret - typedPlus);
    }

    // Одинокий плюс оставляем: человек стёр «+7 (» и набирает код своей страны.
    if (input.value === '+') {
      previous = '';

      return;
    }

    if (isForeignPhone(input.value)) {
      // Чистка идёт посимвольно, поэтому место каретки это длина вычищенного
      // куска слева от неё.
      const position = formatForeignPhone(input.value.slice(0, caret)).length;

      input.value = formatForeignPhone(input.value);
      previous = phoneDigitsOf(input.value);
      input.setSelectionRange(position, position);

      return;
    }

    let typedBefore = phoneDigitsOf(input.value.slice(0, caret)).length;
    const digits = phoneDigitsOf(input.value);
    let rest = phoneSubscriber(input.value);

    // Стёрли скобку или дефис: цифр столько же, значит убираем цифру руками.
    if (deleting && digits.length === previous.length && digits.length > 1) {
      rest = rest.slice(0, -1);
      typedBefore = Math.max(1, typedBefore - 1);
    }

    // Стёрли последнюю цифру: убираем и подставленный нами префикс, иначе «+7 (»
    // не удаляется backspace вообще.
    const formatted = (!digits.length || (deleting && !rest)) ? '' : formatPhone(rest);

    input.value = formatted;
    previous = phoneDigitsOf(formatted);

    // В отформатированной строке цифр может быть больше, чем в набранной: семёрку кода
    // страны рисуем мы. Без поправки каретка встаёт перед только что введённой цифрой.
    const shift = Math.max(0, previous.length - digits.length);
    const position = formatted ? phoneCaretAfterDigit(formatted, Math.max(typedBefore + shift, 1)) : 0;

    input.setSelectionRange(position, position);
  });

  input.addEventListener('focus', () => {
    if (input.value) {
      return;
    }

    input.value = PHONE_PREFIX;
    previous = '7';

    requestAnimationFrame(() => {
      input.setSelectionRange(input.value.length, input.value.length);
    });
  });

  input.addEventListener('blur', () => {
    if (phoneDigitsOf(input.value).length <= 1) {
      input.value = '';
      previous = '';
    }
  });
}

document.querySelectorAll('[data-phone-mask]').forEach(attachPhoneMask);
