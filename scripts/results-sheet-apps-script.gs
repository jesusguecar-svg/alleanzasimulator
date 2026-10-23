/**
 * Alleanza Academy — scheduled exam results receiver.
 *
 * Paste this into Extensions → Apps Script of the Google Sheet that should collect results,
 * then Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone).
 * Put the web app URL in VITE_RESULTS_WEBHOOK_URL on Vercel and redeploy the site.
 *
 * Sheets (created automatically):
 *   Registrations — one row per student, status goes registered → started → submitted.
 *   Results       — one summary row per submitted attempt.
 *   Responses     — one row per question of every submitted attempt.
 */

const REGISTRATION_HEADERS = ['Registration ID', 'Name', 'Email', 'Slot', 'Language', 'Lines', 'Status', 'Attempts', 'Score %', 'Registered at', 'Last update', 'Preview'];
const RESULT_HEADERS = ['Submitted at', 'Name', 'Email', 'Slot', 'Language', 'Lines', 'Attempt', 'Score %', 'Correct', 'Incorrect', 'Unanswered', 'Total', 'Time used (min)', 'Auto-submitted', 'Tab switches', 'Domain breakdown', 'Preview', 'Registration ID'];
const RESPONSE_HEADERS = ['Submitted at', 'Name', 'Email', 'Registration ID', 'Number', 'Question ID', 'Domain', 'Question', 'Student answer', 'Correct answer', 'Correct'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const event = JSON.parse(e.postData.contents);
    if (event.type === 'registered') upsertRegistration_(event, { status: 'registered' });
    if (event.type === 'started') upsertRegistration_(event, { status: 'started', attempts: event.attempt });
    if (event.type === 'submitted') recordSubmission_(event);
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function sheet_(name, headers) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function upsertRegistration_(event, changes) {
  const sheet = sheet_('Registrations', REGISTRATION_HEADERS);
  const ids = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues().map((row) => row[0]);
  const rowIndex = ids.indexOf(event.registrationId) + 1;
  const now = new Date();

  if (rowIndex < 1) {
    sheet.appendRow([event.registrationId, event.name || '', event.email || '', event.slot || event.slotId || '', event.language || '', event.lines || '',
      changes.status, changes.attempts || 0, changes.score === undefined ? '' : changes.score, now, now, event.preview ? 'PREVIEW' : '']);
    return;
  }

  const row = sheet.getRange(rowIndex, 1, 1, REGISTRATION_HEADERS.length).getValues()[0];
  const set = (header, value) => { if (value !== undefined && value !== '') row[REGISTRATION_HEADERS.indexOf(header)] = value; };
  set('Name', event.name);
  set('Email', event.email);
  set('Slot', event.slot || event.slotId);
  set('Language', event.language);
  set('Lines', event.lines);
  set('Status', changes.status);
  set('Attempts', changes.attempts);
  set('Score %', changes.score);
  set('Last update', now);
  sheet.getRange(rowIndex, 1, 1, REGISTRATION_HEADERS.length).setValues([row]);
}

function recordSubmission_(event) {
  const submittedAt = new Date(event.submittedAt);
  const preview = event.preview ? 'PREVIEW' : '';
  const domains = (event.domains || []).map((d) => `${d.domain}: ${d.correct}/${d.total} (${d.percent}%)`).join('\n');

  sheet_('Results', RESULT_HEADERS).appendRow([submittedAt, event.name, event.email, event.slot, event.language, event.lines, event.attempt,
    event.score, event.correct, event.incorrect, event.unanswered, event.total, Math.round(event.elapsedSeconds / 6) / 10,
    event.autoSubmitted ? 'Yes' : 'No', event.tabSwitches, domains, preview, event.registrationId]);

  const responses = (event.responses || []).map((r) => [submittedAt, event.name, event.email, event.registrationId, r.number, r.id, r.domain,
    r.question, r.selectedAnswer || '(unanswered)', r.correctAnswer, r.correct ? 'Yes' : 'No']);
  if (responses.length) {
    const sheet = sheet_('Responses', RESPONSE_HEADERS);
    sheet.getRange(sheet.getLastRow() + 1, 1, responses.length, RESPONSE_HEADERS.length).setValues(responses);
  }

  upsertRegistration_(event, { status: 'submitted', attempts: event.attempt, score: event.score });
}
