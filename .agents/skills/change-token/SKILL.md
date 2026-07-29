---
name: change-token
description: 색상, 폰트, 브레이크포인트 등 INFOUX 토큰을 추가·변경·재매핑할 때 사용. foundation, semantic alias, 생성 CSS와 starter 영향 범위를 먼저 확인한다.
---

# change-token

## 절차

1. 변경 목적이 **브랜드 교체**(brand.json)인지 **표준 변경**(foundation.json)인지 먼저 가른다. 프로젝트 사정이면 brand.json만 고친다.
2. `skill/references/krds-tokens.md`와 `tokens/foundation.json`·`tokens/brand.json`에서 기존 토큰으로 해결 가능한지 확인한다.
3. 사용처를 검색하고 대비, 상태, 다크 표면 등 영향 범위를 기록한다.
4. 원본(`brand.json` 또는 `foundation.json`)만 수정하고 생성물은 빌드로 갱신한다. 브랜드 팔레트는 light·high-contrast 두 모드를 함께 채운다.
5. `npm run build:tokens` → `npm run check:contrast` 후 원본과 starter의 drift를 확인한다.

## 금지

- CSS에서 raw 색상으로 우회
- 기존 의미와 다른 용도로 semantic token 재사용
- 생성된 `tokens/build/tokens.css` 직접 수정
- 사용처 조사 없이 토큰 삭제 또는 이름 변경
- 상태색(danger/warning/success/information)을 브랜드색으로 재정의 — 발주처 CI 요구는 `point`로 받는다
- 대비 위반을 `tokens/contrast-baseline.json`에 추가해 덮기
