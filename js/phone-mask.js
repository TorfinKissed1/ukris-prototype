// Маска телефона, одна на весь сайт (та же, что в ukris-hotdeals).
// Формат +7 (XXX) XXX-XX-XX, сервер всё равно принимает и нормализует сырые цифры:
// маска это удобство ввода, а не проверка.
// Номер другой страны набирают с плюса и своего кода: такому скобки не рисуем, остаются
// плюс, цифры и пробелы.

const PREFIX = '+7 (';
// Длиннее пятнадцати цифр международных номеров не бывает, сервер такой не примет.
const FOREIGN_DIGITS = 15;

const digitsOf = (value) => String(value).replace(/\D/g, '');

// Плюс и следом не семёрка это код другой страны. Восьмёрка после плюса тоже: с неё
// начинаются +84 и +86, а российский номер с восьмёрки пишут без плюса.
const isForeign = (value) => /^\+[0-689]/.test(String(value));

function foreign(value) {
  let out = '+';
  let digits = 0;

  for (const char of String(value).slice(1)) {
    if (char === ' ') {
      out += char;
    } else if (/\d/.test(char) && digits < FOREIGN_DIGITS) {
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
function subscriber(value) {
  const digits = digitsOf(value);
  let rest;

  if (value.indexOf(PREFIX) === 0) {
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

function format(rest) {
  if (!rest) {
    return PREFIX;
  }

  let out = PREFIX + rest.slice(0, 3);

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

function caretAfterDigit(formatted, count) {
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

function attach(input) {
  // Значение с сервера приходит цифрами: в базе телефон хранится нормализованным,
  // а человеку его надо показать в привычном виде.
  if (isForeign(input.value)) {
    input.value = foreign(input.value);
  } else if (digitsOf(input.value).length > 1) {
    input.value = format(subscriber(input.value));
  }

  let previous = digitsOf(input.value);

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

    if (isForeign(input.value)) {
      // Чистка идёт посимвольно, поэтому место каретки это длина вычищенного
      // куска слева от неё.
      const position = foreign(input.value.slice(0, caret)).length;

      input.value = foreign(input.value);
      previous = digitsOf(input.value);
      input.setSelectionRange(position, position);

      return;
    }

    let typedBefore = digitsOf(input.value.slice(0, caret)).length;
    const digits = digitsOf(input.value);
    let rest = subscriber(input.value);

    // Стёрли скобку или дефис: цифр столько же, значит убираем цифру руками.
    if (deleting && digits.length === previous.length && digits.length > 1) {
      rest = rest.slice(0, -1);
      typedBefore = Math.max(1, typedBefore - 1);
    }

    // Стёрли последнюю цифру: убираем и подставленный нами префикс, иначе «+7 (»
    // не удаляется backspace вообще.
    const formatted = (!digits.length || (deleting && !rest)) ? '' : format(rest);

    input.value = formatted;
    previous = digitsOf(formatted);

    // В отформатированной строке цифр может быть больше, чем в набранной: семёрку кода
    // страны рисуем мы. Без поправки каретка встаёт перед только что введённой цифрой.
    const shift = Math.max(0, previous.length - digits.length);
    const position = formatted ? caretAfterDigit(formatted, Math.max(typedBefore + shift, 1)) : 0;

    input.setSelectionRange(position, position);
  });

  input.addEventListener('focus', () => {
    if (input.value) {
      return;
    }

    input.value = PREFIX;
    previous = '7';

    requestAnimationFrame(() => {
      input.setSelectionRange(input.value.length, input.value.length);
    });
  });

  input.addEventListener('blur', () => {
    if (digitsOf(input.value).length <= 1) {
      input.value = '';
      previous = '';
    }
  });
}

document.querySelectorAll('[data-phone-mask]').forEach(attach);
