// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // Dev: LEER = same-origin. Die Requests gehen an den Dev-Server (Port 8100),
  // der sie per proxy.conf.json containerintern an die API (4100) weiterreicht.
  // Grund: Der Browser laeuft unter Windows und erreicht 4100 im Devcontainer
  // nur, wenn dieser Port zusaetzlich weitergeleitet ist. Über den Proxy genügt
  // EIN weitergeleiteter Port — und CORS entfällt.
  apiBaseUrl: '',
  // Upload-Handler (/Upload/...) und Media (/api/media/...) ebenfalls same-origin.
  webBaseUrl: '',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
