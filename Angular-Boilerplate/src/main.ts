import { bootstrapApplication } from '@angular/platform-browser';
import { registerLicense } from '@syncfusion/ej2-base';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Register Syncfusion license key
registerLicense('Ngo9BigBOggjHTQxAR8/V1JGaF5cXGpCf0x0R3xbf1x2ZFJMY1xbR3BPMyBoS35RcEViWHped3dVRWZZU0dyVEFf');

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
