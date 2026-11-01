# 강의용 라이브 참여 도구

삼육대학교 〈미래직업과 신직업〉 취업특강용. 학생은 폰으로 QR만 찍으면 되고, 결과는 강의 덱 장표에 실시간으로 뜹니다.
기능: **객관식 투표 · 주관식 답변 · 워드클라우드 · 익명 Q&A**

| 화면 | 주소 |
|---|---|
| 학생 (1주차) | https://ceaser501.github.io/lecture-server/?r=w1 |
| 학생 (2주차) | https://ceaser501.github.io/lecture-server/?r=w2 |
| 학생 (3주차) | https://ceaser501.github.io/lecture-server/?r=w3 |
| 강사 관리 (PC · 폰) | https://ceaser501.github.io/lecture-server/admin.html |
| 덱 위젯 예시 | `deck-example.html` (내려받아 `file://`로 열기) |

QR 이미지: `qr/w1.png`, `qr/w2.png`, `qr/w3.png` (인쇄용 1200px, SVG도 있음). 방마다 1개, 질문과 상관없이 그대로 씁니다.

## 구조

```
학생 폰 (index.html) ──응답──▶ Supabase (lv_ 테이블 · 함수) ──실시간 알림──▶ 덱 위젯 (lv-widget.js)
                                    ▲
                강사 관리 (admin.html) ─ 질문 만들기 · 열기/닫기 · Q&A 승인
```

- Supabase 프로젝트: `oneteam-vote` (무료 요금제 프로젝트 2개 제한 때문에 같이 씀). 이 도구의 테이블·함수는 모두 `lv_`로 시작해서 다른 앱과 섞이지 않습니다.
- 학생은 테이블에 직접 접근하지 못하고 `lv_submit`, `lv_state` 같은 함수로만 읽고 씁니다. 덱 위젯도 **집계 결과만** 받습니다 (기기 id는 나가지 않음).
- 실시간: DB 트리거가 방 채널(`lv-w1`)로 「무엇이 바뀌었다」만 알리고, 화면은 알림을 받으면 집계를 다시 읽습니다. 실시간 연결이 안 되면 덱은 3초, 학생 폰은 5초마다 새로 읽습니다.
- 강사 권한: 로그인한 이메일이 `lv_admins` 표에 있어야 합니다.

## 덱에 붙이는 방법

장표 세션에서 할 일. 덱 파일 하나 안에 다 들어가고 외부 파일이 필요 없습니다 (QR 생성기 포함).

1. **CSS**: `lv-widget.css` 내용을 덱의 `<style>` 맨 끝에 붙입니다.
2. **JS**: `lv-widget.js` 내용을 `<script> … </script>`로 감싸 덱의 `</body>` 바로 앞(덱의 다른 스크립트 뒤)에 붙입니다.
3. **장표**: 결과를 띄울 장표에 상자 하나를 넣습니다.

```html
<section class="slide" data-n="12">
  <div class="k">투표</div>
  <h2>AGI, 몇 년 뒤에 올까요?</h2>
  <div class="lv-box" data-room="w1" data-q="agi"></div>
</section>
```

| 속성 | 값 | 뜻 |
|---|---|---|
| `data-room` | `w1` `w2` `w3` | 주차(방) |
| `data-q` | 키 (예: `agi`) | 관리 화면에서 그 키를 붙인 질문의 결과. 장표에 들어오면 자동으로 열림 (강사 로그인 시) |
| | `live` | 지금 열린 질문이 무엇이든 그 결과 (즉석 질문용). 질문 문구도 위젯이 보여 줌 |
| | `qa` | 승인된 Q&A, 「나도 궁금해」 많은 순 |
| `data-close` | `1` | 장표를 떠날 때 질문 닫기 (기본: 열어 둠) |
| `data-open` | `0` | 장표에 들어와도 자동으로 열지 않기 |
| `data-prompt` | `show` / `hide` | 위젯 안에 질문 문구 표시 (기본: 키 연결은 숨김, live는 표시) |
| `data-qr` | `0` | 오른쪽 QR · 주소 · 응답 수 칸 숨기기 |
| `style="height:…"` | 기본 `560px` | 상자 높이. 너비는 장표 폭에 맞음 |

- 위젯은 자기 장표가 `.active`가 될 때만 데이터를 읽고, 장표를 떠나면 멈춥니다.
- 위젯 안 클릭 요소는 모두 `<button>`이라 장표 넘김과 부딪히지 않습니다. 모든 클래스·id는 `lv-`로 시작합니다.
- 색은 덱 토큰(`--bg --card --card2 --ink --sub --mute --acc`)을 그대로 씁니다. 주황 하나로만 강조.
- 키에 맞는 질문이 아직 없으면 「관리 화면에서 `agi` 키로 질문을 등록하세요」라고 작게 나옵니다.
- 인터넷이 끊기면 위젯 오른쪽 아래에 「연결 안 됨」만 작게 뜨고, 장표는 그대로 넘어갑니다.

### 강사 PC에서 한 번만: 덱 로그인

자동 열기·Q&A 답변 완료는 강사 로그인이 필요합니다. 덱을 `file://`로 열면 관리 페이지와 저장 공간이 따로라서 **덱에서 한 번 더** 로그인합니다.
위젯 오른쪽 아래의 흐린 「로그인」을 누르고 강사 계정으로 로그인 → 「● 강사」로 바뀌면 끝. 같은 PC·같은 Chrome이면 계속 유지됩니다.

## 강사 계정

`lv_admins` 표에 이메일이 있는 Supabase Auth 계정만 관리 기능을 쓸 수 있습니다 (저장소에 이메일을 남기지 않으려고 SQL 파일에는 넣지 않음).

```sql
insert into public.lv_admins (email) values ('강사 이메일');
```

## 파일

| 파일 | 내용 |
|---|---|
| `index.html` | 학생 페이지 |
| `admin.html` | 강사 관리 페이지 |
| `lv-widget.css`, `lv-widget.js` | 덱용 조각 (`lv-widget.js`는 만들어진 파일 — 고칠 때는 `src/lv-widget.src.js`를 고치고 `node tools/build.mjs`) |
| `deck-example.html` | 장표 4장짜리 예시 (워드클라우드 · 객관식 · 즉석 질문 · Q&A) |
| `sql/001_lv_init.sql` | 테이블 · 권한(RLS) · 함수 · 실시간 알림 |
| `qr/` | 방별 QR (`node tools/make-qr.mjs`로 다시 만들 수 있음) |
| `tools/load-test.mjs` | 가짜 학생 40명 동시 응답 시험 |
| `docs/리허설_체크리스트.md` | 강의 30분 전에 할 일 |
| `MD5SUMS` | 파일 확인용 md5 |
