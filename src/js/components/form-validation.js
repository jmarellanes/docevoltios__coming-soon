import { successSend, failureSend } from '../partials/form-response-animation';

function validateForm() {
  // TODO: Add "x" icon to error messages.
  // TODO: Fix bug - Con slide-in al escribir en los campos por segunda vez.

  // Add the novalidate attribute when the JS loads
  const forms = document.querySelectorAll('.validate');
  const form = document.querySelector('.form');

  for (var i = 0; i < forms.length; i++) {
    forms[i].setAttribute('novalidate', true);
  }

  // Validate the field
  var hasError = function (field) {
    // Don't validate submits, buttons, file and reset inputs, and disabled fields
    if (
      field.disabled ||
      field.type === 'file' ||
      field.type === 'reset' ||
      field.type === 'submit' ||
      field.type === 'button'
    )
      return;

    // Get validity
    const validity = field.validity;

    // If valid, return null
    if (validity.valid) return;

    // If field is required and empty
    if (validity.valueMissing) return 'Please fill out this field.';

    // If not the right type
    if (validity.typeMismatch) {
      // Email
      if (field.type === 'email') return 'Please enter an email address.';

      // URL
      if (field.type === 'url') return 'Please enter a URL.';
    }

    // If too short
    if (validity.tooShort)
      return (
        'Please lengthen this text to ' +
        field.getAttribute('minLength') +
        ' characters or more. You are currently using ' +
        field.value.length +
        ' characters.'
      );

    // If too long
    if (validity.tooLong)
      return (
        'Please shorten this text to no more than ' +
        field.getAttribute('maxLength') +
        ' characters. You are currently using ' +
        field.value.length +
        ' characters.'
      );

    // If number input isn't a number
    if (validity.badInput) return 'Please enter a number.';

    // If a number value doesn't match the step interval
    if (validity.stepMismatch) return 'Please select a valid value.';

    // If a number field is over the max
    if (validity.rangeOverflow)
      return (
        'Please select a value that is no more than ' +
        field.getAttribute('max') +
        '.'
      );

    // If a number field is below the min
    if (validity.rangeUnderflow)
      return (
        'Please select a value that is no less than ' +
        field.getAttribute('min') +
        '.'
      );

    // If pattern doesn't match
    if (validity.patternMismatch) {
      // If pattern info is included, return custom error
      if (field.hasAttribute('title')) return field.getAttribute('title');

      // Otherwise, generic error
      return 'Please match the requested format.';
    }

    // If all else fails, return a generic catchall error
    return 'The value you entered for this field is invalid.';
  };

  // Show an error message
  var showError = function (field, error) {
    // Add error class to field
    field.classList.add('error');

    // If the field is a radio button and part of a group, error all and get the last item in the group
    if (field.type === 'radio' && field.name) {
      var group = document.getElementsByName(field.name);
      if (group.length > 0) {
        for (var i = 0; i < group.length; i++) {
          // Only check fields in current form
          if (group[i].form !== field.form) continue;
          group[i].classList.add('error');
        }
        field = group[group.length - 1];
      }
    }

    // Get field id or name
    var id = field.id || field.name;
    if (!id) return;

    // Check if error message field already exists
    // If not, create one
    let message = field.form.querySelector('.error-message#error-for-' + id);
    if (!message) {
      message = document.createElement('div');
      message.className = 'form__error-message error-message';
      message.id = 'error-for-' + id;

      // If the field is a radio button or checkbox, insert error after the label
      var label;
      if (field.type === 'radio' || field.type === 'checkbox') {
        label =
          field.form.querySelector('label[for="' + id + '"]') ||
          field.parentNode;
        if (label) {
          label.parentNode.insertBefore(message, label.nextSibling);
        }
      }

      // Otherwise, insert it after form__container
      if (!label) {
        // field.parentNode.parentNode.insertBefore(message, null);
        field.parentNode.insertBefore(message, field.nextSibling);
      }
    }

    // Add ARIA role to the field
    field.setAttribute('aria-describedby', 'error-for-' + id);

    // Update error message
    message.innerHTML = `<span><p>${error}</p></span>`;

    // Show error message
    message.style.opacity = '0';
    window.getComputedStyle(message).opacity;
    message.classList.remove('visually-hidden');
    message.style.opacity = 1;
    message.classList.add('slide-in');
  };

  // Remove the error message
  var removeError = function (field) {
    // Remove error class to field
    field.classList.remove('error');

    // Remove ARIA role from the field
    field.removeAttribute('aria-describedby');

    // If the field is a radio button and part of a group, remove error from all and get the last item in the group
    if (field.type === 'radio' && field.name) {
      var group = document.getElementsByName(field.name);
      if (group.length > 0) {
        for (var i = 0; i < group.length; i++) {
          // Only check fields in current form
          if (group[i].form !== field.form) continue;
          group[i].classList.remove('error');
        }
        field = group[group.length - 1];
      }
    }

    // Get field id or name
    var id = field.id || field.name;
    if (!id) return;

    // Check if an error message is in the DOM
    var message = field.form.querySelector(
      '.error-message#error-for-' + id + ''
    );
    if (!message) return;

    // If so, hide it
    message.classList.remove('slide-in');
    message.style.opacity = 0;
    setTimeout(() => {
      message.innerHTML = '';
      message.classList.add('visually-hidden');
    }, 600);
  };

  // Listen to all blur events
  // TODO: Listen events only on article.contact
  document.addEventListener(
    'blur',
    function (event) {
      const formCheck = event.target.form;

      // Only run if the field is in a form to be validated
      if (
        formCheck === null ||
        formCheck === undefined ||
        formCheck === '' ||
        !formCheck.classList.contains('validate')
      )
        return;

      // Validate the field
      var error = hasError(event.target);

      // If there's an error, show it
      if (error) {
        showError(event.target, error);
        return;
      }

      // Otherwise, remove any existing error message
      removeError(event.target);
    },
    true
  );

  // Check all fields on submit
  form.addEventListener(
    'submit',
    function (event) {
      // Only run if the field is in a form to be validated
      if (!event.target.classList.contains('validate')) return;

      // Get all of the form elements
      var fields = event.target.elements;

      // Validate each field
      // Store the first field with an error to a variable so we can bring it into focus later
      var error, hasErrors;
      for (var i = 0; i < fields.length; i++) {
        error = hasError(fields[i]);
        if (error) {
          showError(fields[i], error);
          if (!hasErrors) {
            hasErrors = fields[i];
          }
        }
      }

      // If there are errrors, don't submit form and focus on first element with error
      if (hasErrors) {
        event.preventDefault();
        hasErrors.focus();
      } else {
        event.preventDefault();
        let formData = new FormData(form);

        function handleErrors(response) {
          if (!response.ok) {
            throw Error(response.statusText);
          }
          return response;
        }

        fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(formData).toString(),
        })
          .then(handleErrors)
          .then(() => {
            return successSend();
          })
          .catch((error) => {
            console.log('error is', error);
            return failureSend();
          });
      }
    },
    false
  );
}

export { validateForm };
