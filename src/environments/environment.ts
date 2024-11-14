// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
const port: string = ':6001';
const protocol: string = window.location.protocol;
const hostname: string = window.location.hostname;
const ip: string = `${hostname}${port}`;
const apiUrl: string = `${protocol}//${ip}`;
export const environment = {
  production: false,
  baseUrl: `${apiUrl}/`,
  apiUrl: `${apiUrl}/api/`,
  allowedDomains: [ip],
  disallowedRoutes: [`${apiUrl}/api/auth`],
  useHash: false,
  loginUrl: '/login',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
