// Проверка форм до отправки: вместо всплывающих подсказок браузера ошибка выезжает под полем.
// Без скрипта форму проверяет сам браузер (required, type="email", pattern), сервер проверяет
// всё заново в любом случае. Текст ошибки берётся из data-error-required и data-error-format
// у поля, иначе общий по типу поля.

const DEFAULT_MESSAGES = {
  checkbox: 'Подтвердите согласие на обработку персональных данных',
  email: 'Введите электронную почту',
  tel: 'Введите номер телефона',
  text: 'Заполните поле',
};
const FORMAT_MESSAGES = {
  email: 'Введите корректный email',
  tel: 'Введите номер телефона полностью',
  text: 'Проверьте, что поле заполнено верно',
};
// Российский номер в маске: +7 и десять цифр.
const PHONE_DIGITS = 11;

let errorCount = 0;

function fieldOf(control) {
  return control.closest('.field-box') || control.closest('.field');
}

function errorClassOf(field) {
  return field.matches('.field-box') ? 'field-box--error' : 'field--error';
}

function problemOf(control) {
  const type = control.type in DEFAULT_MESSAGES ? control.type : 'text';
  const digits = control.value.replace(/\D/g, '');
  let empty = control.value.trim() === '';
  if (control.type === 'checkbox') {
    empty = !control.checked;
  } else if (control.type === 'tel') {
    // Маска ставит «+7 (» уже при фокусе: одна семёрка это ещё пустое поле.
    empty = digits.length <= 1;
  }

  if (empty) {
    return control.required ? control.dataset.errorRequired || DEFAULT_MESSAGES[type] : null;
  }
  const phoneShort = control.type === 'tel' && control.value.startsWith('+7') && digits.length < PHONE_DIGITS;
  if (control.validity.typeMismatch || control.validity.patternMismatch || phoneShort) {
    return control.dataset.errorFormat || FORMAT_MESSAGES[type];
  }
  return null;
}

function showError(control, message) {
  const field = fieldOf(control);
  let error = field.querySelector('.field__error');
  if (!error) {
    errorCount += 1;
    error = document.createElement('p');
    error.className = 'field__error';
    error.id = `field-error-${errorCount}`;
    const text = document.createElement('span');
    text.className = 'field__error-text';
    error.append(text);
    field.append(error);
  }
  error.firstElementChild.textContent = message;
  field.classList.add(errorClassOf(field));
  control.setAttribute('aria-invalid', 'true');
  control.setAttribute('aria-describedby', error.id);
}

function hideError(control) {
  const field = fieldOf(control);
  const error = field.querySelector('.field__error');
  if (!error) {
    return;
  }
  field.classList.remove(errorClassOf(field));
  control.removeAttribute('aria-invalid');
  control.removeAttribute('aria-describedby');
  // Строка ошибки уезжает вверх и убирается, чтобы не оставлять пустой отступ под полем.
  const remove = () => {
    if (!field.classList.contains(errorClassOf(field))) {
      error.remove();
    }
  };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    remove();
    return;
  }
  error.addEventListener('transitionend', remove, { once: true });
}

function controlsOf(form) {
  return [...form.querySelectorAll('input, textarea')].filter((control) => control.required || control.pattern
    || control.type === 'email' || control.type === 'tel');
}

document.querySelectorAll('form').forEach((form) => {
  if (controlsOf(form).some((control) => control.required)) {
    form.noValidate = true;
  }
});

document.addEventListener('submit', (event) => {
  const form = event.target;
  if (!form.noValidate) {
    return;
  }
  let firstInvalid = null;
  controlsOf(form).forEach((control) => {
    const message = problemOf(control);
    if (message) {
      showError(control, message);
      firstInvalid = firstInvalid || control;
    } else {
      hideError(control);
    }
  });
  if (firstInvalid) {
    event.preventDefault();
    firstInvalid.focus();
  }
});

// Исправил поле, ошибка сразу уходит; новую покажет следующая попытка отправки.
function recheck(event) {
  const control = event.target;
  if (control.getAttribute('aria-invalid') === 'true' && !problemOf(control)) {
    hideError(control);
  }
}

document.addEventListener('input', recheck);
document.addEventListener('change', recheck);
