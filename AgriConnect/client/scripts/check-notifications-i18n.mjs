import assert from 'node:assert/strict';
import { SUPPORTED_LANGUAGES, translations } from '../src/i18n/translations.js';

const notificationKeys = [
  'notification_center',
  'notification_unread',
  'notification_unread_count',
  'notification_mark_all_read',
  'notification_mark_read',
  'notification_delete',
  'notification_load_error',
  'notification_action_error',
  'notification_delete_error',
  'notification_retry',
  'notification_loading',
  'notification_empty',
  'notification_load_more',
  'notification_generic_title',
  'notification_generic_message',
  'notification_this_job',
  'notification_new_application_title',
  'notification_new_application_message',
  'notification_application_accepted_title',
  'notification_application_accepted_message',
  'notification_application_rejected_title',
  'notification_application_rejected_message',
  'notification_application_withdrawn_title',
  'notification_application_withdrawn_message',
  'notification_job_updated_title',
  'notification_job_updated_message',
  'notification_job_closed_title',
  'notification_job_closed_message'
];

function placeholders(value) {
  return [...value.matchAll(/\{\{(\w+)\}\}/g)].map(match => match[1]).sort();
}

for (const { code } of SUPPORTED_LANGUAGES) {
  for (const key of notificationKeys) {
    const translation = translations[code]?.[key];
    assert.equal(typeof translation, 'string', `Missing ${code} translation for ${key}`);
    assert.ok(translation.trim(), `Empty ${code} translation for ${key}`);
    assert.deepEqual(placeholders(translation), placeholders(translations.en[key]), `Placeholder mismatch in ${code} translation for ${key}`);
  }
}

console.log(`Notification translations verified: ${notificationKeys.length} keys in ${SUPPORTED_LANGUAGES.length} languages.`);
