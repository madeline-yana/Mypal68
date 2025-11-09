/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { prefs, asyncStore, features } from "./prefs";
import { isDevelopment, isTesting } from "devtools-environment";
import { getDocument } from "./editor/source-documents";
import type { Source, URL } from "../types";

function findSource(dbg: any, url: URL): Source {
  const sources = dbg.selectors.getSourceList();
  return sources.find(s => (s.url || "").includes(url));
}

function findSources(dbg: any, url: URL): Source[] {
  const sources = dbg.selectors.getSourceList();
  return sources.filter(s => (s.url || "").includes(url));
}

function evaluate(dbg: Object, expression: any) {
  return dbg.client.evaluate(expression);
}

function bindSelectors(obj: Object): Object {
  return Object.keys(obj.selectors).reduce((bound, selector) => {
    bound[selector] = (a, b, c) =>
      obj.selectors[selector](obj.store.getState(), a, b, c);
    return bound;
  }, {});
}

function getCM(): Object {
  const cm: any = document.querySelector(".CodeMirror");
  return cm?.CodeMirror;
}

function formatMappedLocation(mappedLocation) {
  const { location, generatedLocation } = mappedLocation;
  return {
    original: `(${location.line}, ${location.column})`,
    generated: `(${generatedLocation.line}, ${generatedLocation.column})`,
  };
}

function formatMappedLocations(locations) {
  return console.table(locations.map(loc => formatMappedLocation(loc)));
}

function formatSelectedColumnBreakpoints(dbg) {
  const positions = dbg.selectors.getBreakpointPositionsForSource(
    dbg.selectors.getSelectedSource().id
  );

  return formatMappedLocations(positions);
}

function getDocumentForUrl(dbg, url) {
  const source = findSource(dbg, url);
  return getDocument(source.id);
}

const diff = (a, b) => Object.keys(a).filter(key => !Object.is(a[key], b[key]));

export function setupHelper(obj) {
  const selectors = bindSelectors(obj);
  const dbg = {
    ...obj,
    selectors,
    prefs,
    asyncStore,
    features,
    getCM,
    helpers: {
      findSource: url => findSource(dbg, url),
      findSources: url => findSources(dbg, url),
      evaluate: expression => evaluate(dbg, expression),
      dumpThread: () => dbg.connection.tabConnection.threadFront.dumpThread(),
      getDocument: url => getDocumentForUrl(dbg, url),
    },
    formatters: {
      mappedLocations: locations => formatMappedLocations(locations),
      mappedLocation: location => formatMappedLocation(location),
      selectedColumnBreakpoints: () => formatSelectedColumnBreakpoints(dbg),
    },
    diff,
  };

  window.dbg = dbg;

  if (isDevelopment() && !isTesting()) {
    console.group("Development Notes");
    const baseUrl = "https://firefox-devtools.github.io/debugger";
    const localDevelopmentUrl = `${baseUrl}/docs/dbg.html`;
    console.log("Debugging Tips", localDevelopmentUrl);
    console.log("dbg", window.dbg);
    console.groupEnd();
  }
}
