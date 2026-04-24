/**
 * utils/search/index.js
 *
 * Driver factory — returns the correct search backend based on the SEARCH_DRIVER
 * environment variable.
 *
 *   SEARCH_DRIVER=mongo  (default) → regex queries against MongoDB
 *   SEARCH_DRIVER=meili            → Meilisearch full-text search
 *
 * All controllers call getSearch() and use the returned driver's methods.
 * Swapping backends requires only an env-var change + server restart.
 */

import * as mongoSearch from './mongoSearch.js';
import * as meiliSearch from './meiliSearch.js';

let _driver = null;

/**
 * Return the singleton search driver.
 *
 * Interface:
 *   searchHelpers(q, filters, {page, limit})  → {hits, total, driver}
 *   searchServices(q, filters, {page, limit}) → {hits, total, driver}
 *   indexHelper(doc)
 *   indexService(doc)
 *   removeHelper(id)
 *   removeService(id)
 *   reindexAll({onProgress})
 *   syncOnStartup()
 *   ping()
 */
export function getSearch() {
  if (_driver) return _driver;

  const driver = (process.env.SEARCH_DRIVER ?? 'mongo').toLowerCase();

  if (driver === 'meili') {
    _driver = meiliSearch;
  } else {
    _driver = mongoSearch;
  }

  return _driver;
}

/** Reset the singleton (used between benchmark states). */
export function resetSearch() {
  _driver = null;
}
