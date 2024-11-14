import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { TranslateService, TranslateLoader } from '@ngx-translate/core';
import { Subject, of } from 'rxjs';
import * as fallbackLangData from '../../../../assets/i18n/en-US.json';

@Injectable({
  providedIn: 'root',
})
export class AppTranslationService {
  private onLanguageChanged = new Subject<string>();
  languageChanged$ = this.onLanguageChanged.asObservable();

  constructor(private translate: TranslateService) {
    this.addLanguages(['en-US', 'vi-VN', 'zh-CN']);
    this.setDefaultLanguage('en-US');
  }

  addLanguages(lang: string[]) {
    this.translate.addLangs(lang);
  }

  setDefaultLanguage(lang: string) {
    this.translate.setDefaultLang(lang);
  }

  getDefaultLanguage() {
    return this.translate.defaultLang;
  }

  getBrowserLanguage() {
    return this.translate.getBrowserLang();
  }

  getCurrentLanguage() {
    return this.translate.currentLang;
  }

  getLoadedLanguages() {
    return this.translate.langs;
  }

  useBrowserLanguage(): string | void {
    const browserLang = this.getBrowserLanguage();

    if (browserLang?.match(/en-US|vi-VN|zh-CN/)) {
      this.changeLanguage(browserLang);
      return browserLang;
    }
  }

  useDefaultLanguage() {
    return this.changeLanguage(null);
  }

  changeLanguage(language: string | null) {
    if (!language) {
      language = this.getDefaultLanguage();
    }

    if (language !== this.translate.currentLang) {
      const lang = language;

      setTimeout(() => {
        this.translate.use(lang);
        this.onLanguageChanged.next(lang);
      });
    }

    return language;
  }

  getTranslation(key: string | Array<string>, interpolateParams?: object) {
    return this.translate.instant(key, interpolateParams);
  }

  getTranslationAsync(key: string | Array<string>, interpolateParams?: object) {
    return this.translate.get(key, interpolateParams);
  }
}

export class TranslateLanguageLoader implements TranslateLoader {
  http = inject(HttpClient);

  public getTranslation(lang: string) {
    if (lang === 'en') return of(fallbackLangData);

    return this.http.get(`/assets/i18n/${lang}.json`);
  }
}