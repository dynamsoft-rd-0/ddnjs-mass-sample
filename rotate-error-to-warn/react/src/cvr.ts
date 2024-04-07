import "dynamsoft-license";
import "dynamsoft-capture-vision-router";
import "dynamsoft-document-normalizer";

import { CoreModule } from 'dynamsoft-core';
import { LicenseManager } from 'dynamsoft-license';

LicenseManager.initLicense("DLS2eyJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSJ9");

CoreModule.engineResourcePaths = {
  std: "https://cdn.jsdelivr.net/npm/dynamsoft-capture-vision-std@1.0.0/dist/",
  dip: "https://cdn.jsdelivr.net/npm/dynamsoft-image-processing@2.0.30/dist/",
  core: "https://cdn.jsdelivr.net/npm/dynamsoft-core@3.0.30/dist/",
  license: "https://cdn.jsdelivr.net/npm/dynamsoft-license@3.0.20/dist/",
  cvr: "https://cdn.jsdelivr.net/npm/dynamsoft-capture-vision-router@2.0.30/dist/",
  ddn: "https://cdn.jsdelivr.net/npm/dynamsoft-document-normalizer@2.0.21/dist/",
  dce: "https://cdn.jsdelivr.net/npm/dynamsoft-camera-enhancer@4.0.2/dist/",
};

CoreModule.loadWasm(["DDN"]).catch((ex: any) => {
  let errMsg = ex.message || ex;
  console.error(errMsg);
  alert(errMsg);
});
