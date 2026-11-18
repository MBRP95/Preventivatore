import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const editorSrc = fs.readFileSync(path.join(root, "modifica_listini.html"), "utf8");
const indexSrc = fs.readFileSync(path.join(root, "index.html"), "utf8");

function grab(fnName) {
  const start = editorSrc.indexOf("function " + fnName);
  assert.ok(start >= 0, fnName + " assente");
  let depth = 0;
  let i = editorSrc.indexOf("{", start);
  for (; i < editorSrc.length; i++) {
    const ch = editorSrc[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        i++;
        break;
      }
    }
  }
  return editorSrc.slice(start, i);
}

test("catalogScriptJson legge il listino vero di index.html", () => {
  const catalogScriptJson = new Function(grab("catalogScriptJson") + "; return catalogScriptJson;")();
  const catalog = catalogScriptJson(indexSrc, "promo-catalog");
  assert.ok(catalog.length > 100);
  const data = JSON.parse(catalog);
  assert.ok(data.flat);
  assert.ok(data.commodity.light.private.length >= 1);
});

test("index espone pubblicazione Firebase e regole listini", () => {
  assert.match(indexSrc, /__publishListinoFirebase/);
  assert.match(indexSrc, /__readPublishedListino/);
  assert.match(indexSrc, /listini","published"/);
  assert.match(indexSrc, /firebasePublishMode/);
  assert.match(indexSrc, /__patchClienteFlyers/);
  assert.match(indexSrc, /flyerCount/);
  assert.match(indexSrc, /extractClienteFlyers/);
  assert.match(indexSrc, /resolvePublishedPair/);
  assert.match(indexSrc, /__persistDueListinoPromotion/);
  assert.match(indexSrc, /promoteDueFromDom/);
  assert.match(indexSrc, /catalogJsonForFirebase/);
  assert.match(indexSrc, /__ensurePublishedFlyers/);
  assert.match(indexSrc, /usableFlyerPages/);
  assert.match(indexSrc, /id="clienteFrame"/);
  assert.match(indexSrc, /__refreshClienteCatalog/);
  assert.match(indexSrc, /modeBusy/);
  assert.match(indexSrc, /__clienteSetFlyers/);
  assert.match(indexSrc, /lightClienteFlyersForWrite/);
  assert.match(indexSrc, /__refreshSellerCatalog/);
  assert.match(indexSrc, /applySellerCatalog/);
  assert.match(indexSrc, /qart--gas\{margin-right:2px;max-width:168px\}/);
  assert.match(indexSrc, /flatLockedLabel\(\)/);
  assert.match(indexSrc, /setFlyerZoom/);
  assert.match(indexSrc, /Math\.floor\(boxH\*0\.62\)/);
  assert.match(indexSrc, /applyCtaBreath/);
  assert.match(indexSrc, /--handle-size/);
  assert.match(indexSrc, /--bg-soft:#f3f3f0/);
  assert.match(indexSrc, /--brand-yellow:#FFD000/);
  assert.match(indexSrc, /Prima layout a px naturali del flyer/);
  assert.doesNotMatch(indexSrc, /flyerZoomBtns|flyerZoomIn|flyerZoomOut/);
  assert.doesNotMatch(indexSrc, /\.cta-text\{[^}]*text-overflow:ellipsis/);
  assert.doesNotMatch(indexSrc.slice(0, indexSrc.indexOf('id="cliente-app"')), /"PER 2 ANNI"/);
  assert.doesNotMatch(indexSrc, /window\.top\.location\.reload\(\)/);
  const rules = fs.readFileSync(path.join(root, "firestore.rules"), "utf8");
  assert.match(rules, /match \/listini\/\{docId\}/);
  assert.match(rules, /docId == 'published'/);
  assert.match(rules, /flyer-\[0-9\]\+/);
});
