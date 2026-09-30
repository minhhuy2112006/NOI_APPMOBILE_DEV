import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

function loadFixtureModule(path, imports = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  new Function('require', 'exports', compiled)(name => {
    if (!(name in imports)) throw new Error(`Unexpected import: ${name}`);
    return imports[name];
  }, exports);
  return exports;
}
const data = loadFixtureModule('../src/features/campaigns/data.ts');
const { applyFilters, emptyFilters } = loadFixtureModule('../src/features/campaigns/filters.ts', { './data': data });
test('combined resource, skill, format, city and status filters', () => {
  assert.deepEqual(applyFilters({ ...emptyFilters, city: 'Hà Nội', resource: 'Vật phẩm', skill: 'Đọc sách', format: 'Trực tiếp', status: 'Đang tuyển' }).map(item => item.id), ['trang-sach']);
});
test('Vietnamese keyword searches skill and organization without accents', () => {
  assert.deepEqual(applyFilters({ ...emptyFilters, query: 'nau an' }).map(item => item.id), ['bua-com']);
});
test('full campaigns are excluded by recruiting status', () => {
  assert.equal(applyFilters({ ...emptyFilters, status: 'Đang tuyển' }).some(item => item.id === 'bua-com'), false);
});
test('unsupported category yields empty results; reset restores list', () => {
  assert.equal(applyFilters({ ...emptyFilters, category: 'Khẩn cấp' }).length, 0);
  assert.equal(applyFilters(emptyFilters).length, data.campaigns.length);
});
