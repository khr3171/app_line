/** 응답 스프레드시트의 확장 프로그램 > Apps Script에 붙여 넣으세요.
 * Script Properties: APP_URL=https://your-project.vercel.app
 *                    WEBHOOK_SECRET=서버의 SHEETS_WEBHOOK_SECRET과 같은 무작위 값
 * 폼 질문명이나 다른 응답 열은 변경하지 않습니다. 끝 열에 접수ID만 추가합니다.
 */
const TARGET_GID = 1209279667;
function responseSheet_() { return SpreadsheetApp.getActiveSpreadsheet().getSheets().find(s=>s.getSheetId()===TARGET_GID); }
function assignIds_() {
  const sheet=responseSheet_();if(!sheet)throw new Error('응답 탭을 찾지 못했습니다.');
  const headers=sheet.getRange(1,1,1,sheet.getLastColumn()).getDisplayValues()[0];
  let column=headers.indexOf('접수ID')+1;
  if(!column){column=headers.length+1;sheet.getRange(1,column).setValue('접수ID');}
  if(sheet.getLastRow()<2)return;
  const range=sheet.getRange(2,column,sheet.getLastRow()-1,1);const ids=range.getValues();
  let changed=false;ids.forEach(row=>{if(!row[0]){row[0]=Utilities.getUuid();changed=true;}});
  if(changed)range.setValues(ids);SpreadsheetApp.flush();
}
function notifyApp_() {
  const props=PropertiesService.getScriptProperties();const app=props.getProperty('APP_URL'),secret=props.getProperty('WEBHOOK_SECRET');
  if(!/^https:\/\//.test(app||'')||!secret||secret.length<32)throw new Error('Script Properties 설정을 확인하세요.');
  const response=UrlFetchApp.fetch(app.replace(/\/$/,'')+'/api?action=webhook',{method:'post',contentType:'application/json',payload:'{}',headers:{'x-sheet-secret':secret},muteHttpExceptions:true});
  // 응답 원문과 비밀 값, 대상자 데이터는 로그에 남기지 않음
  if(response.getResponseCode()!==200)throw new Error('앱 동기화 실패. 상태 코드: '+response.getResponseCode()+'. 관리앱에서 수동 동기화하세요.');
}
function onIntakeSubmit(e) {
  if(e&&e.range&&e.range.getSheet().getSheetId()!==TARGET_GID)return;
  const lock=LockService.getScriptLock();lock.waitLock(30000);
  try {assignIds_();notifyApp_();} finally {lock.releaseLock();}
}
/** 최초 1회 실행: 기존 응답에 고정 UUID를 발급. */
function prepareExistingResponses() {const lock=LockService.getScriptLock();lock.waitLock(30000);try{assignIds_();}finally{lock.releaseLock();}}
/** 최초 1회 실행: 제출 및 매시간 복구 동기화 트리거 설치. 중복 설치하지 않음. */
function installTriggers() {
  const triggers=ScriptApp.getProjectTriggers();
  if(!triggers.some(t=>t.getHandlerFunction()==='onIntakeSubmit'&&t.getEventType()===ScriptApp.EventType.ON_FORM_SUBMIT))ScriptApp.newTrigger('onIntakeSubmit').forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet()).onFormSubmit().create();
  if(!triggers.some(t=>t.getHandlerFunction()==='retrySync'))ScriptApp.newTrigger('retrySync').timeBased().everyHours(1).create();
}
function retrySync() {onIntakeSubmit();}
