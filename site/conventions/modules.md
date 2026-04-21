---
title: 모듈 시스템
order: 4
---

<!-- 자동 생성 — rules.json에서 생성됨. 직접 수정 금지. npm run build:rules로 갱신. -->

Dart Sass @use/@forward 모듈 시스템 규칙이다.

## 규칙 요약

| ID | 규칙 | 심각도 | 검증 |
|----|------|--------|------|
| R-03 | @use/@forward만 사용 — @import 금지 | error | check-violations.js |

---

## R-03 — @use/@forward만 사용 — @import 금지

**심각도:** 🔴 error &nbsp; **검증:** check-violations.js

> Dart Sass에서 @import는 deprecated. 전역 네임스페이스 오염과 다중 로드 문제를 유발한다. @use는 명시적 네임스페이스로 의존성을 관리하고 @forward로 공개 API를 제어한다.

**❌ 금지**

```scss
@import 'variables';   // 밑줄 없는 @import
@import '../settings/tokens';   // 경로 @import
```

**✅ 올바른 형식**

```scss
@use '../1-settings' as settings;   // 레이어 네임스페이스
@use '../2-tools/responsive' as resp;   // 파일 네임스페이스
@forward 'btn';   // 인덱스 파일에서 공개
```

---
