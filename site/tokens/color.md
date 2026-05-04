---
title: 색상 토큰
order: 2
---

색상 토큰은 KRDS(범정부 UI/UX 디자인 시스템) 정본을 따른다. KRDS는 primary/secondary/gray/success/warning/danger/info 모두 5/10/20/30/40/50/60/70/80/90/95의 11단계 스케일을 제공한다.

토큰 출처:
- KRDS 정본: `tokens/krds-base.json` (`--krds-light-color-*` / `--krds-dark-color-*`)
- INFOMIND 시맨틱 별칭: `tokens/infomind-overrides.json` (`--color-*`)
- 빌드: `tokens/build/tokens.css` (자동 생성)

전체 카탈로그 — [skill/references/krds-tokens.md](https://github.com/iux-pub/guide/blob/main/skill/references/krds-tokens.md)

## KRDS 정본 — Primary

11단계. **50이 기본 강조**. 40/60은 hover/pressed 변종.

<div class="color-grid">
  <div class="color-swatch" style="background:var(--krds-light-color-primary-5);color:#000">
    <span class="color-swatch__name">--krds-light-color-primary-5</span>
    <span class="color-swatch__desc">가장 옅은 primary 배경</span>
  </div>
  <div class="color-swatch" style="background:var(--krds-light-color-primary-30);color:#000">
    <span class="color-swatch__name">--krds-light-color-primary-30</span>
    <span class="color-swatch__desc">옅은 강조</span>
  </div>
  <div class="color-swatch" style="background:var(--krds-light-color-primary-50);color:#fff">
    <span class="color-swatch__name">--krds-light-color-primary-50</span>
    <span class="color-swatch__desc">기본 강조 (CTA, 버튼)</span>
  </div>
  <div class="color-swatch" style="background:var(--krds-light-color-primary-70);color:#fff">
    <span class="color-swatch__name">--krds-light-color-primary-70</span>
    <span class="color-swatch__desc">진한 강조</span>
  </div>
  <div class="color-swatch" style="background:var(--krds-light-color-primary-90);color:#fff">
    <span class="color-swatch__name">--krds-light-color-primary-90</span>
    <span class="color-swatch__desc">가장 진한 primary</span>
  </div>
</div>

## KRDS 정본 — Secondary

11단계. 보조 강조용.

<div class="color-grid">
  <div class="color-swatch" style="background:var(--krds-light-color-secondary-30);color:#000">
    <span class="color-swatch__name">--krds-light-color-secondary-30</span>
  </div>
  <div class="color-swatch" style="background:var(--krds-light-color-secondary-50);color:#fff">
    <span class="color-swatch__name">--krds-light-color-secondary-50</span>
  </div>
  <div class="color-swatch" style="background:var(--krds-light-color-secondary-70);color:#fff">
    <span class="color-swatch__name">--krds-light-color-secondary-70</span>
  </div>
</div>

## KRDS 정본 — Gray

11단계. 0/100은 흰색/검정에 매우 근접. 본문 텍스트는 90, 보조 텍스트는 70 권장.

<div class="color-grid">
  <div class="color-swatch" style="background:var(--krds-light-color-gray-0);color:#000;border:1px solid #ddd">
    <span class="color-swatch__name">--krds-light-color-gray-0</span>
    <span class="color-swatch__desc">흰색 근접 (배경)</span>
  </div>
  <div class="color-swatch" style="background:var(--krds-light-color-gray-30);color:#000">
    <span class="color-swatch__name">--krds-light-color-gray-30</span>
    <span class="color-swatch__desc">테두리·구분선</span>
  </div>
  <div class="color-swatch" style="background:var(--krds-light-color-gray-50);color:#fff">
    <span class="color-swatch__name">--krds-light-color-gray-50</span>
    <span class="color-swatch__desc">중간 그레이</span>
  </div>
  <div class="color-swatch" style="background:var(--krds-light-color-gray-70);color:#fff">
    <span class="color-swatch__name">--krds-light-color-gray-70</span>
    <span class="color-swatch__desc">보조 텍스트</span>
  </div>
  <div class="color-swatch" style="background:var(--krds-light-color-gray-90);color:#fff">
    <span class="color-swatch__name">--krds-light-color-gray-90</span>
    <span class="color-swatch__desc">본문 텍스트</span>
  </div>
  <div class="color-swatch" style="background:var(--krds-light-color-gray-100);color:#fff">
    <span class="color-swatch__name">--krds-light-color-gray-100</span>
    <span class="color-swatch__desc">검정 근접</span>
  </div>
</div>

## KRDS 정본 — Semantic (Success / Warning / Danger / Info)

각각 11단계. 기본은 50.

<div class="color-grid">
  <div class="color-swatch" style="background:var(--krds-light-color-success-50);color:#fff">
    <span class="color-swatch__name">--krds-light-color-success-50</span>
    <span class="color-swatch__desc">성공·완료</span>
  </div>
  <div class="color-swatch" style="background:var(--krds-light-color-warning-50);color:#000">
    <span class="color-swatch__name">--krds-light-color-warning-50</span>
    <span class="color-swatch__desc">경고</span>
  </div>
  <div class="color-swatch" style="background:var(--krds-light-color-danger-50);color:#fff">
    <span class="color-swatch__name">--krds-light-color-danger-50</span>
    <span class="color-swatch__desc">오류·삭제·위험</span>
  </div>
  <div class="color-swatch" style="background:var(--krds-light-color-info-50);color:#fff">
    <span class="color-swatch__name">--krds-light-color-info-50</span>
    <span class="color-swatch__desc">정보·안내</span>
  </div>
</div>

## INFOMIND 시맨틱 별칭

KRDS 토큰을 가리키는 의미 기반 alias. 컴포넌트 작성 시 이쪽을 우선 권장한다.

| 토큰 | KRDS 매핑 (예시) | 의미 |
|------|--------------|------|
| `--color-primary` | `--krds-light-color-primary-50` | 브랜드 강조 |
| `--color-text` | `--krds-light-color-gray-90` | 본문 텍스트 |
| `--color-text-secondary` | `--krds-light-color-gray-70` | 보조 텍스트 |
| `--color-text-disabled` | `--krds-light-color-gray-50` | 비활성 텍스트 |
| `--color-text-inverse` | `--krds-light-color-gray-0` | 어두운 배경 위 텍스트 |
| `--color-bg` | `--krds-light-color-gray-0` | 기본 배경 |
| `--color-bg-secondary` | `--krds-light-color-gray-5` | 보조 배경 |
| `--color-border` | `--krds-light-color-gray-30` | 기본 테두리 |
| `--color-border-light` | `--krds-light-color-gray-10` | 옅은 테두리 |
| `--color-danger` / `--color-warning` / `--color-success` / `--color-info` | KRDS 50 | 시맨틱 |

매핑 정의는 `tokens/infomind-overrides.json`. 프로젝트별 변경은 이 파일에서 한다.

## 다크 모드

KRDS는 light/dark 양쪽 토큰을 발행한다. 다크 모드 적용 시 `--krds-dark-color-*`가 자동으로 활성화된다.

```css
/* tokens/build/tokens.css는 :root에 light, [data-theme="dark"]에 dark를 매핑 */
:root { /* light tokens */ }
[data-theme="dark"] { /* dark tokens */ }
```

## 사용 예시

```css
/* KRDS 정본으로 작성 */
.card {
  color: var(--krds-light-color-gray-90);
  background: var(--krds-light-color-gray-0);
  border: 1px solid var(--krds-light-color-gray-30);
}

.card--featured {
  border-color: var(--krds-light-color-primary-50);
}

/* INFOMIND 시맨틱 별칭으로 작성 (권장) */
.card {
  color: var(--color-text);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
}

.card--featured {
  border-color: var(--color-primary);
}
```

## 프로젝트별 오버라이드

`tokens/infomind-overrides.json`에서 시맨틱 별칭이나 `infomind-*` 네임스페이스를 정의한다.

```json
{
  "infomind-brand": {
    "primary":      { "value": "#FF5733", "type": "color" },
    "primary-text": { "value": "#FFFFFF", "type": "color" }
  }
}
```

저장 후 `npm run build:tokens && npm run build:css` 실행. **KRDS 정본(`tokens/krds-base.json`)은 수정 금지** — 외부 갱신만 동기화한다.
