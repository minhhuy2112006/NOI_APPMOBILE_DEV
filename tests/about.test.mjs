import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { topics, articles, organizationDirectory, filterOrganizations, stories } from '../src/features/about/content.ts';
import { campaigns } from '../src/features/campaigns/data.ts';

test('about has exactly nine unique destinations and no removed grid entries', () => {
  assert.deepEqual(topics.map(t => t.title), ['Về NOI', 'Sứ mệnh', 'Cách hoạt động', 'Tổ chức', 'Tác động cộng đồng', 'Cam kết minh bạch', 'Tham gia cùng NOI', 'Tin tức & câu chuyện', 'Tiêu chuẩn cộng đồng']);
  assert.equal(new Set(topics.map(t => t.id)).size, 9);
  const dynamic = new Set(['organizations', 'impact', 'join', 'stories']);
  for (const topic of topics) assert.ok(dynamic.has(topic.id) || articles[topic.id]?.every(p => p.title && p.text));
  const grid = fs.readFileSync('src/features/about/AboutScreen.tsx', 'utf8');
  assert.match(grid, /topics\.map/);
  assert.match(grid, /pathname: '\/about\/\[section\]'/);
  assert.match(grid, /section: topic.id/);
  assert.ok(!grid.includes('assistant.open'));
  const route = fs.readFileSync('src/app/about/[section].tsx', 'utf8');
  assert.match(route, /AboutDetailScreen/);
});
test('organization count deduplicates campaigns, search is accent insensitive and category combines', () => {
  const directory = organizationDirectory(campaigns);
  assert.equal(directory.reduce((n, o) => n + o.campaigns.length, 0), campaigns.length);
  assert.equal(directory.length, new Set(campaigns.map(c => c.organization)).size);
  const found = filterOrganizations(campaigns, 'mam xanh', 'Môi trường');
  assert.equal(found.length, 1);
  assert.equal(found[0].campaigns.length, 2);
  assert.equal(filterOrganizations(campaigns, 'mam xanh', 'Giáo dục').length, 0);
  assert.equal(filterOrganizations(campaigns, 'khong-ton-tai', '').length, 0);
});
test('editorial content includes four steps, five standards and three story categories', () => {
  assert.deepEqual(articles['how-it-works'].map(p => p.title.split(' · ')[1]), ['Khám phá', 'Tham gia', 'Kết nối', 'Lan tỏa']);
  assert.deepEqual(articles.standards.map(p => p.title), ['Tôn trọng', 'Trung thực', 'Văn minh', 'An toàn', 'Trách nhiệm']);
  assert.equal(new Set(stories.map(s => s.category)).size, 3);
});
