import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function gmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const email = control.value;
    if (!email || email.includes('@gmail.com')) {
      return null; // Valid if the email is either empty (letting other validators handle this) or contains @gmail.com
    } else {
      return { gmail: true }; // Invalid if the email does not contain @gmail.com
    }
  };
}
