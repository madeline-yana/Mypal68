Services.prefs.setBoolPref("dom.serviceWorkers.enabled", true);
Services.prefs.setBoolPref("dom.push.enabled", true);
const { SitePermissions } = ChromeUtils.import(
  "resource:///modules/SitePermissions.jsm"
);
const { PermissionTestUtils } = ChromeUtils.import(
  "resource://testing-common/PermissionTestUtils.jsm"
);
