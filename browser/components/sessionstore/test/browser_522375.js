function test() {
  var startup_info = Services.startup.getStartupInfo();
  // No .process info on mac

  // on linux firstPaint can happen after everything is loaded (especially with remote X)
  if (startup_info.firstPaint) {
    ok(
      startup_info.main <= startup_info.firstPaint,
      "main ran before first paint " + uneval(startup_info)
    );
  }

  ok(
    startup_info.main < startup_info.sessionRestored,
    "Session restored after main " + uneval(startup_info)
  );
}
