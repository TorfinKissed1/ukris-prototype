// Проверка форм до отправки: вместо всплывающих подсказок браузера ошибка выезжает под полем.
// Без скрипта форму проверяет сам браузер (required, type="email", pattern), сервер проверяет
// всё заново в любом случае. Текст ошибки берётся из data-error-required и data-error-format
// у поля, иначе общий по типу поля.

const FORM_DEFAULT_MESSAGES = {
  checkbox: 'Подтвердите согласие на обработку персональных данных',
  email: 'Введите электронную почту',
  tel: 'Введите номер телефона',
  text: 'Заполните поле',
};
const FORM_FORMAT_MESSAGES = {
  email: 'Введите корректный email',
  tel: 'Введите номер телефона полностью',
  text: 'Проверьте, что поле заполнено верно',
};
// Российский номер в маске: +7 и десять цифр.
const FORM_PHONE_DIGITS = 11;

let formErrorCount = 0;

function formFieldOf(control) {
  return control.closest('.field-box') || control.closest('.field');
}

function formErrorClassOf(field) {
  return field.matches('.field-box') ? 'field-box--error' : 'field--error';
}

function formProblemOf(control) {
  const type = control.type in FORM_DEFAULT_MESSAGES ? control.type : 'text';
  const digits = control.value.replace(/\D/g, '');
  let empty = control.value.trim() === '';
  if (control.type === 'checkbox') {
    empty = !control.checked;
  } else if (control.type === 'tel') {
    // Маска ставит «+7 (» уже при фокусе: одна семёрка это ещё пустое поле.
    empty = digits.length <= 1;
  }

  if (empty) {
    return control.required ? control.dataset.errorRequired || FORM_DEFAULT_MESSAGES[type] : null;
  }
  const phoneShort = control.type === 'tel' && control.value.startsWith('+7') && digits.length < FORM_PHONE_DIGITS;
  if (control.validity.typeMismatch || control.validity.patternMismatch || phoneShort) {
    return control.dataset.errorFormat || FORM_FORMAT_MESSAGES[type];
  }
  return null;
}

function showFormError(control, message) {
  const field = formFieldOf(control);
  let error = field.querySelector('.field__error');
  if (!error) {
    formErrorCount += 1;
    error = document.createElement('p');
    error.className = 'field__error';
    error.id = `field-error-${formErrorCount}`;
    const text = document.createElement('span');
    text.className = 'field__error-text';
    error.append(text);
    field.append(error);
  }
  error.firstElementChild.textContent = message;
  field.classList.add(formErrorClassOf(field));
  control.setAttribute('aria-invalid', 'true');
  control.setAttribute('aria-describedby', error.id);
}

function hideFormError(control) {
  const field = formFieldOf(control);
  const error = field.querySelector('.field__error');
  if (!error) {
    return;
  }
  field.classList.remove(formErrorClassOf(field));
  control.removeAttribute('aria-invalid');
  control.removeAttribute('aria-describedby');
  // Строка ошибки уезжает вверх и убирается, чтобы не оставлять пустой отступ под полем.
  const remove = () => {
    if (!field.classList.contains(formErrorClassOf(field))) {
      error.remove();
    }
  };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    remove();
    return;
  }
  error.addEventListener('transitionend', remove, { once: true });
}

function formControlsOf(form) {
  return [...form.querySelectorAll('input, textarea')].filter((control) => control.required || control.pattern
    || control.type === 'email' || control.type === 'tel');
}

document.querySelectorAll('form').forEach((form) => {
  if (formControlsOf(form).some((control) => control.required)) {
    form.noValidate = true;
  }
});

document.addEventListener('submit', (event) => {
  const form = event.target;
  if (!form.noValidate) {
    return;
  }
  let firstInvalid = null;
  formControlsOf(form).forEach((control) => {
    const message = formProblemOf(control);
    if (message) {
      showFormError(control, message);
      firstInvalid = firstInvalid || control;
    } else {
      hideFormError(control);
    }
  });
  if (firstInvalid) {
    event.preventDefault();
    firstInvalid.focus();
  }
});

// Исправил поле, ошибка сразу уходит; новую покажет следующая попытка отправки.
function recheckFormField(event) {
  const control = event.target;
  if (control.getAttribute('aria-invalid') === 'true' && !formProblemOf(control)) {
    hideFormError(control);
  }
}

document.addEventListener('input', recheckFormField);
document.addEventListener('change', recheckFormField);
