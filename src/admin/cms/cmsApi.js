import { getAdminToken } from '../adminApi';
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient';

const requireClient = () => {
  if (!isSupabaseConfigured || !supabase) {
    const error = new Error('ADMIN_CONFIG_MISSING');
    error.code = 'ADMIN_CONFIG_MISSING';
    throw error;
  }
  return supabase;
};

const asCmsError = (error) => {
  const message = error?.message || 'REQUEST_FAILED';
  const next = new Error(message);
  if (/INVALID_SESSION/i.test(message)) next.code = 'INVALID_SESSION';
  else if (/FORBIDDEN|Недостаточно/i.test(message)) next.code = 'FORBIDDEN';
  else if (/SLUG_EXISTS/i.test(message)) next.code = 'SLUG_EXISTS';
  else if (/Could not find the function|PGRST202|404/i.test(message) || error?.code === 'PGRST202') {
    next.code = 'CMS_NOT_INSTALLED';
  } else next.code = 'REQUEST_FAILED';
  return next;
};

export const cmsRequest = async (action, entity, { id = null, data = {} } = {}) => {
  const client = requireClient();
  const token = getAdminToken();
  if (!token) {
    const error = new Error('INVALID_SESSION');
    error.code = 'INVALID_SESSION';
    throw error;
  }
  const { data: payload, error } = await client.rpc('admin_cms', {
    p_token: token,
    p_action: action,
    p_entity: entity,
    p_id: id,
    p_data: data,
  });
  if (error) throw asCmsError(error);
  return payload;
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
