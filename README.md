# 선을 넘어, 함께 · GitHub Pages 체험판

이 폴더는 개발 소스가 아니라 빌드가 끝난 재업로드용 파일입니다. JavaScript와 CSS를 index.html 한 파일에 포함했으므로 npm 설치나 GitHub Actions 빌드가 필요하지 않습니다.

## 업로드 순서

1. GitHub의 khr3171/app_line 저장소 첫 화면으로 갑니다.
2. Add file → Upload files를 누릅니다.
3. **이 폴더 자체가 아니라 안에 있는 index.html, README.md, .nojekyll 파일을 모두 선택**해 끌어다 놓습니다. 업로드 목록에 index.html이 바로 보여야 합니다. `경계선_어플_재업로드/index.html`처럼 앞에 폴더명이 붙으면 안 됩니다.
4. main 브랜치에 Commit changes로 저장합니다. 기존 index.html과 README.md는 같은 이름의 새 파일로 갱신됩니다. 기존 src, api 등은 삭제할 필요가 없습니다.
5. 저장소 Settings → Pages → Build and deployment에서 **Source: Deploy from a branch / Branch: main / Folder: /(root)**로 설정하고 Save를 누릅니다. 이미 이 설정이면 변경할 필요가 없습니다. 이번 패키지는 GitHub Actions를 선택하지 않습니다.
6. Pages 게시가 완료되면 https://khr3171.github.io/app_line/ 에서 Ctrl+F5로 새로고침합니다. Actions의 pages build and deployment가 실패하면 해당 실행의 오류 내용을 확인합니다.

## 체험 로그인

- 관리자: 사서원 / 1234
- 기관 담당자: 연계기관 / demo1234!

## 이번 버전의 범위

신청자 명단, 아동·청소년/청년 프로그램, 서비스 상태, 기관 의견, 참고사항, 회의·계정 관리 화면을 가상 데이터로 체험할 수 있습니다. 변경 사항은 현재 브라우저의 localStorage에 저장됩니다. 다른 사용자·기기와 공유되는 운영 데이터가 아니며 실제 개인정보를 입력하지 마세요. 브라우저 데이터 삭제 시 체험 기록도 사라집니다. 이 체험판의 로그인은 실제 개인정보 접근을 보호하는 운영 인증이 아닙니다.

Firebase 저장 및 실제 구글 폼·시트 자동 연동은 포함하지 않았습니다. 서버용 개발 소스는 원래 바탕화면 `경계선_어플` 폴더에 그대로 보존되어 있습니다. 이 index.html은 GitHub Pages 체험판 전용입니다. 향후 실제 운영 연결에는 원래 개발 소스를 사용합니다.

준비한 파일을 로컬에서 검증했으며, GitHub 업로드와 원격 사이트 게시 완료 여부는 사용자가 업로드한 뒤 확인해야 합니다.
