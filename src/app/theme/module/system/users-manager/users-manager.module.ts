import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersManagerRoutingModule } from './users-manager-routing.module';
import { MainComponent } from './main/main.component';
import { FormComponent } from './form/form.component';
import { SharedModule } from '@shared';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { TrimInputDirective } from '@core/directives/trim-input.directive';
const COMPONENTS: any[] = [MainComponent];
const COMPONENTS_DYNAMIC: any[] = [FormComponent];
const MODULES: any[] = [
  CommonModule,
  UsersManagerRoutingModule,
  SharedModule,
  TranslateModule,
  MatFormFieldModule,
  MatButtonModule,
  MatInputModule,
  MatIconModule,
  FormsModule,
];

@NgModule({
  declarations: [...COMPONENTS, ...COMPONENTS_DYNAMIC, TrimInputDirective],
  imports: [...MODULES],
})
export class UsersManagerModule {}
