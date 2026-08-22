import { getAdminToken } from '../adminApi';
import { apiFetch } from '../../lib/apiClient';

const asCmsError = (error) => {
  const message = error?.message || 'REQUEST_FAILED';
  const next = new Error(message);
  if (/INVALID_SESSION/i.test(message) || error?.code === 'INVALID_SESSION') next.code = 'INVALID_SESSION';
  else if (/FORBIDDEN|Недостаточно/i.test(message) || error?.code === 'FORBIDDEN') next.code = 'FORBIDDEN';
  else if (/SLUG_EXISTS/i.test(message) || error?.code === 'SLUG_EXISTS') next.code = 'SLUG_EXISTS';
  else if (/CMS_NOT_INSTALLED/i.test(message) || error?.code === 'CMS_NOT_INSTALLED') next.code = 'CMS_NOT_INSTALLED';
  else next.code = 'REQUEST_FAILED';
  return next;
};

export const cmsRequest = async (action, entity, { id = null, data = {} } = {}) => {
  const token = getAdminToken();
  if (!token) {
    const error = new Error('INVALID_SESSION');
    error.code = 'INVALID_SESSION';
    throw error;
  }
  try {
    return await apiFetch('/admin/cms', {
      method: 'POST',
      adminToken: token,
      body: { action, entity, id, data },
    });
  } catch (error) {
    throw asCmsError(error);
  }
};

export const cmsList = (entity, data = {}) => cmsRequest('list', entity, { data });
export const cmsGet = (entity, id) => cmsRequest('get', entity, { id });
export const cmsCreate = (entity, data) => cmsRequest('create', entity, { data });
export const cmsUpdate = (entity, id, data) => cmsRequest('update', entity, { id, data });
export const cmsDelete = (entity, id) => cmsRequest('delete', entity, { id });
export const cmsPublish = (entity, id) => cmsRequest('publish', entity, { id });
export const cmsUnpublish = (entity, id) => cmsRequest('unpublish', entity, { id });
export const cmsArchive = (entity, id) => cmsRequest('archive', entity, { id });
export const cmsReorder = (entity, items, extra = {}) =>
  cmsRequest('reorder', entity, { data: { items, ...extra } });
export const cmsHideBlock = (id) => cmsRequest('hide_block', 'page_blocks', { id });
export const cmsShowBlock = (id) => cmsRequest('show_block', 'page_blocks', { id });
