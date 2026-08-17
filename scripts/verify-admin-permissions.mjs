import assert from 'assert';
import { getAllowedNav, hasPermission, ROLE_PERMISSIONS } from '../src/admin/permissions.js';

assert.equal(hasPermission('SUPERADMIN', 'system'), true);
assert.equal(hasPermission('ADMIN', 'products'), true);
assert.equal(hasPermission('ADMIN', 'settings'), false);
assert.equal(hasPermission('EDITOR', 'media'), true);
assert.equal(hasPermission('EDITOR', 'users'), false);

const editorNav = getAllowedNav('EDITOR');
const editorLabels = editorNav.map((item) => item.label);
assert.ok(editorLabels.includes('Контент'));
assert.ok(editorLabels.includes('Медиа'));
assert.ok(!editorLabels.includes('Продукты'));
assert.ok(!editorLabels.includes('Настройки'));

const adminNav = getAllowedNav('ADMIN');
assert.ok(adminNav.some((item) => item.key === 'products'));
assert.ok(adminNav.some((item) => item.key === 'users'));
assert.ok(!adminNav.some((item) => item.key === 'settings'));

assert.ok(ROLE_PERMISSIONS.ADMIN.includes('categories'));

console.log(JSON.stringify({ ok: true, editorLabels, adminGroups: adminNav.map((i) => i.label) }, null, 2));
