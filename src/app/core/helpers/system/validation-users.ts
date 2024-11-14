import { AbstractControl, ValidatorFn } from '@angular/forms';

export default class ValidationUsers {
  static phonePattern = /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/;
  static whitespacePattern = /^\S*$/;
  static match(controlName: string, checkControlName: string): ValidatorFn {
    return (controls: AbstractControl) => {
      const control = controls.get(controlName);
      const checkControl = controls.get(checkControlName);

      if (checkControl?.errors && !checkControl.errors.matching) {
        return null;
      }

      if (control?.value !== checkControl?.value) {
        controls.get(checkControlName)?.setErrors({ matching: true });
        return { matching: true };
      } else {
        return null;
      }
    };
  }

  // Hàm validator tùy chỉnh để đảm bảo ít nhất một giá trị được chọn
  static atLeastOneSelectedValidator: ValidatorFn = (control: AbstractControl) => {
    const selectedRoles = control.value;
    return selectedRoles && selectedRoles.length > 0 ? null : { atLeastOneSelected: true };
  };
}
