import { Injectable } from '@angular/core';
import { LocalStoreManagerService } from '../base/localstore-manager.service';
import { NavigationExtras, Router } from '@angular/router';
import { Observable, Subject, map } from 'rxjs';
import { ConfigurationService } from '../base/configuration.service';
import { Utilities } from '@core/helpers/base/utilities';
import { DBkeys } from '@core/helpers/constants/dbkeys.constants';
import { LoginResponse, IdToken } from '@core/models/system/users/login-response.model';
import { PermissionValues } from '@core/models/system/users/permission.model';
import { OidcHelperService } from '../base/oidc-helper.service';
import { JwtHelper } from '@core/helpers/base/jwt-helper';
import { User } from '@core/models/system/users/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private router: Router,
    private oidcHelperService: OidcHelperService,
    private configurations: ConfigurationService,
    private localStorage: LocalStoreManagerService
  ) {
    this.initializeLoginStatus();
  }
  public get loginUrl() {
    return this.configurations.loginUrl;
  }
  public get homeUrl() {
    return this.configurations.homeUrl;
  }

  public loginRedirectUrl: string | null = null;
  public logoutRedirectUrl: string | null = null;

  public reLoginDelegate: { (): void } | undefined;

  private previousIsLoggedInCheck = false;
  private loginStatus = new Subject<boolean>();

  private initializeLoginStatus() {
    this.localStorage.getInitEvent().subscribe(() => {
      this.reevaluateLoginStatus();
    });
  }

  gotoPage(page: string, preserveParams = true) {
    const navigationExtras: NavigationExtras = {
      queryParamsHandling: preserveParams ? 'merge' : '',
      preserveFragment: preserveParams,
    };

    this.router.navigate([page], navigationExtras);
  }

  gotoHomePage() {
    this.router.navigate([this.homeUrl]);
  }

  redirectLoginUser() {
    const redirect =
      this.loginRedirectUrl &&
      this.loginRedirectUrl !== '/' &&
      this.loginRedirectUrl !== ConfigurationService.defaultHomeUrl
        ? this.loginRedirectUrl
        : this.homeUrl;
    this.loginRedirectUrl = null;

    const urlParamsAndFragment = Utilities.splitInTwo(redirect, '#');
    const urlAndParams = Utilities.splitInTwo(urlParamsAndFragment.firstPart, '?');

    const navigationExtras: NavigationExtras = {
      fragment: urlParamsAndFragment.secondPart,
      queryParams: urlAndParams.secondPart
        ? Utilities.getQueryParamsFromString(urlAndParams.secondPart)
        : null,
      queryParamsHandling: 'merge',
    };

    this.router.navigate([urlAndParams.firstPart], navigationExtras);
  }

  redirectLogoutUser() {
    const redirect = this.logoutRedirectUrl ? this.logoutRedirectUrl : this.loginUrl;
    this.logoutRedirectUrl = null;

    this.router.navigate([redirect]);
  }

  redirectForLogin() {
    this.loginRedirectUrl = this.router.url;
    this.router.navigate([this.loginUrl]);
  }

  reLogin() {
    if (this.reLoginDelegate) {
      this.reLoginDelegate();
    } else {
      this.redirectForLogin();
    }
  }

  refreshLogin() {
    return this.oidcHelperService
      .refreshLogin()
      .pipe(map(resp => this.processLoginResponse(resp, this.rememberMe)));
  }

  loginWithPassword(userName: string, password: string, rememberMe?: boolean) {
    if (this.isLoggedIn) {
      this.logout();
    }

    return this.oidcHelperService
      .loginWithPassword(userName, password)
      .pipe(map(resp => this.processLoginResponse(resp, rememberMe)));
  }

  private processLoginResponse(response: LoginResponse, rememberMe?: boolean) {
    const idToken = response.id_token;
    const accessToken = response.access_token;
    const refreshToken = response.refresh_token;

    if (idToken == null) {
      throw new Error('idToken cannot be null');
    }

    if (accessToken == null) {
      throw new Error('accessToken cannot be null');
    }

    rememberMe = rememberMe ?? this.rememberMe;

    const accessTokenExpiry = new Date();
    accessTokenExpiry.setSeconds(accessTokenExpiry.getSeconds() + response.expires_in);

    const jwtHelper = new JwtHelper();
    const decodedIdToken = jwtHelper.decodeToken(idToken) as IdToken;

    const permissions: PermissionValues[] = Array.isArray(decodedIdToken.permission)
      ? decodedIdToken.permission
      : [decodedIdToken.permission];

    if (!this.isLoggedIn) {
      this.configurations.import(decodedIdToken.configuration);
    }

    const user = new User(
      decodedIdToken.sub,
      decodedIdToken.name,
      decodedIdToken.fullName,
      decodedIdToken.email,
      decodedIdToken.jobTitle,
      decodedIdToken.phoneNumber,
      Array.isArray(decodedIdToken.role) ? decodedIdToken.role : [decodedIdToken.role]
    );

    user.isEnabled = true;

    this.saveUserDetails(
      user,
      permissions,
      accessToken,
      refreshToken,
      accessTokenExpiry,
      rememberMe
    );

    this.reevaluateLoginStatus(user);

    return user;
  }

  private saveUserDetails(
    user: User,
    permissions: PermissionValues[],
    accessToken: string,
    refreshToken: string,
    expiresIn: Date,
    rememberMe: boolean
  ) {
    if (rememberMe) {
      this.localStorage.savePermanentData(accessToken, DBkeys.ACCESS_TOKEN);
      this.localStorage.savePermanentData(refreshToken, DBkeys.REFRESH_TOKEN);
      this.localStorage.savePermanentData(expiresIn, DBkeys.TOKEN_EXPIRES_IN);
      this.localStorage.savePermanentData(permissions, DBkeys.USER_PERMISSIONS);
      this.localStorage.savePermanentData(user, DBkeys.CURRENT_USER);
    } else {
      this.localStorage.saveSyncedSessionData(accessToken, DBkeys.ACCESS_TOKEN);
      this.localStorage.saveSyncedSessionData(refreshToken, DBkeys.REFRESH_TOKEN);
      this.localStorage.saveSyncedSessionData(expiresIn, DBkeys.TOKEN_EXPIRES_IN);
      this.localStorage.saveSyncedSessionData(permissions, DBkeys.USER_PERMISSIONS);
      this.localStorage.saveSyncedSessionData(user, DBkeys.CURRENT_USER);
    }

    this.localStorage.savePermanentData(rememberMe, DBkeys.REMEMBER_ME);
  }

  logout(): void {
    this.localStorage.deleteData(DBkeys.ACCESS_TOKEN);
    this.localStorage.deleteData(DBkeys.REFRESH_TOKEN);
    this.localStorage.deleteData(DBkeys.TOKEN_EXPIRES_IN);
    this.localStorage.deleteData(DBkeys.USER_PERMISSIONS);
    this.localStorage.deleteData(DBkeys.CURRENT_USER);

    this.configurations.clearLocalChanges();

    this.reevaluateLoginStatus();
  }

  private reevaluateLoginStatus(currentUser?: User | null) {
    const user = currentUser ?? this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    const isLoggedIn = user != null;

    if (this.previousIsLoggedInCheck !== isLoggedIn) {
      setTimeout(() => {
        this.loginStatus.next(isLoggedIn);
      });
    }

    this.previousIsLoggedInCheck = isLoggedIn;
  }

  getLoginStatusEvent(): Observable<boolean> {
    return this.loginStatus.asObservable();
  }

  get currentUser(): User | null {
    const user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    this.reevaluateLoginStatus(user);

    return user;
  }

  get userPermissions(): PermissionValues[] {
    return this.localStorage.getDataObject<PermissionValues[]>(DBkeys.USER_PERMISSIONS) ?? [];
  }

  get accessToken(): string | null {
    return this.oidcHelperService.accessToken;
  }

  get accessTokenExpiryDate(): Date | null {
    return this.oidcHelperService.accessTokenExpiryDate;
  }

  get refreshToken(): string | null {
    return this.oidcHelperService.refreshToken;
  }

  get isSessionExpired(): boolean {
    return this.oidcHelperService.isSessionExpired;
  }

  get isLoggedIn(): boolean {
    return this.currentUser != null;
  }

  get rememberMe(): boolean {
    return this.localStorage.getDataObject<boolean>(DBkeys.REMEMBER_ME) === true;
  }
}
