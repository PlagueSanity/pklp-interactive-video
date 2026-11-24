# Multiple ADM sessions

The teacher dashboard now shows one tab per ADM. Choose a tab to view its session state,
student link, results, CSV export, and record-clearing action. A teacher can keep multiple
ADMs open simultaneously. Closing one ADM does not close another teacher's or lesson's session.

Main teachers can use **New ADM** to start from an empty editor, or **Duplicate ADM** to
copy the selected lesson's video and questions into a new ADM. Copies have a new lesson ID,
no student records, and start closed. Open Teacher Studio to change the copy's video and questions.
Existing teacher permissions are retained: other teachers can run lessons and see their own
results; lesson editing and creation remain main-teacher actions.

English is the default dashboard and studio interface. Select Filipino using the language
control. The choice is remembered on that browser. Teacher-authored lesson titles, questions,
answers, and feedback are not translated when the interface language changes.
English mode always uses English as its fallback. API validation errors follow the selected
interface language; requests default to English unless Filipino is explicitly selected.

## Compatibility and storage

- Existing links without a `lesson` parameter still open the original ADM.
- The original ADM preserves its legacy open/closed state until explicitly changed.
- Other ADMs start closed unless the teacher has explicitly opened them.
- Teacher sections and the connected results spreadsheet remain shared across that teacher's
  ADMs. Dashboard results and CSVs are filtered by both teacher and lesson ID. No new Google
  Sheet tabs are required.
- Session states are stored under `admSessions` in the existing main settings / teacher
  records and mirrored through the existing Google storage integration. No Apps Script
  redeployment is needed. Student submissions and previous lesson files are not migrated.
- Render must already have its permanent Google storage configured, as before. Otherwise
  local changes can be lost when the free instance restarts.

## Validation

Run `npm ci`, then `npm test` with Node 24. The integration test starts an isolated server
and uses generated data inside `.artifacts/`; it does not read production credentials or
write to a real Google Sheet. It covers independent session toggles, teacher isolation,
video editing, copying without records, answer-key protection, CSV filtering, and restart
persistence. Browser QA also checked the dashboard tabs and both interface languages.
Language regression tests check every dashboard translation key, English source markup,
studio/library label translations, request language headers, and localized validation errors.

For development, `DATA_DIR` can point to an isolated data directory containing `lesson.json`.
Production defaults to the existing `data/` directory.
