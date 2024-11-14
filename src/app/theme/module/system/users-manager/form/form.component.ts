import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import ValidationUsers from '@core/helpers/system/validation-users';
import { AccountService } from '@core/services/auth/account.service';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<FormComponent>,
    private formBuilder: FormBuilder,
    private userServies: AccountService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  users: FormGroup<{
    jobTitle: FormControl<string | null>;
    fullName: FormControl<string | null>;
    userName: FormControl<string | null>;
    password: FormControl<string | null>;
    confirmPassword: FormControl<string | null>;
    email: FormControl<string | null>;
    roles: FormControl<string[] | null>;
    phoneNumber: FormControl<string | null>;
  }> = new FormGroup({
    jobTitle: new FormControl(''),
    fullName: new FormControl(''),
    userName: new FormControl(''),
    password: new FormControl(''),
    confirmPassword: new FormControl(''),
    email: new FormControl(),
    roles: new FormControl(['']),
    phoneNumber: new FormControl(''),
  });

  roles = ['superadmin', 'admin', 'user', 'guest'];
  loading = false;
  ngOnInit(): void {
    this.usersForm();
  }

  usersForm() {
    const passwordValidators = this.data.value ? [] : [Validators.required];
    this.users = this.formBuilder.group(
      {
        jobTitle: ['', Validators.required],
        fullName: ['', Validators.required],
        userName: [
          '',
          [Validators.required, Validators.pattern(ValidationUsers.whitespacePattern)],
        ],
        password: ['', passwordValidators],
        confirmPassword: ['', passwordValidators],
        email: ['', Validators.required],
        roles: [['guest'], [Validators.required, ValidationUsers.atLeastOneSelectedValidator]],
        phoneNumber: ['', [Validators.required, Validators.pattern(ValidationUsers.phonePattern)]],
      },
      {
        validators: [ValidationUsers.match('password', 'confirmPassword')],
      }
    );

    if (!this.data.value) {
      this.users.reset();
    } else {
      this.users.patchValue(this.data.value);
    }
  }

  addTag(name: string) {
    return { name, tag: true };
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.users.valid) {
      if (this.data.value) {
        this.userServies.updateUser(this.data.value).subscribe({
          next: (val: any) => {
            console.log('val: ', val);
            alert('users details updated!');
            this.dialogRef.close(true);
          },
          error: (err: any) => {
            console.error(err);
            alert('Error while updating the users!');
          },
        });
      } else {
        this.userServies.newUser(this.data.value).subscribe({
          next: (val: any) => {
            console.log('val: ', val);
            alert('Employee added successfully!');
            this.users.reset();
            this.dialogRef.close(true);
          },
          error: (err: any) => {
            console.error(err);
            alert('Error while adding the employee!');
          },
        });
      }
    }
  }
}
