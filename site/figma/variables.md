---
title: Variable 네이밍
order: 4
---

피그마 Variable의 네이밍 규칙과 KRDS+INFOMIND CSS Custom Property와의 매핑을 정의한다. Variable을 일관되게 관리하면 디자인 토큰과 코드 토큰이 1:1로 연결되어 디자인-퍼블리싱 간 오차가 줄어든다.

## Variable Collection 구성

KRDS 정본과 INFOMIND 시맨틱 별칭을 별도 Collection으로 관리한다.

| Collection 이름 | 포함 Variable | Mode |
|----------------|--------------|------|
| `KRDS Color` | KRDS 정본 색상 (Primary/Secondary/Gray/Semantic/Button) | Light, Dark |
| `KRDS Padding` | `--krds-padding-1` ~ `--krds-padding-8` | Default |
| `KRDS Gap` | `--krds-gap-1` ~ `--krds-gap-6` | Default |
| `KRDS Size` | `--krds-size-height-1` ~ `--krds-size-height-9` | Default |
| `KRDS Radius` | `--krds-radius-{small1~3, medium1~4, large1~3}` | Default |
| `KRDS Font` | `--krds-font-size-1` ~ `--krds-font-size-15` | Default |
| `INFOMIND Semantic` | 시맨틱 별칭 (`--color-text`, `--spacing-N`, `--text-body-medium` 등) | Default |

## Variable 네이밍 규칙

### 기본 구조

슬래시(`/`)를 구분자로 사용하여 계층을 표현한다.

```
KRDS / 카테고리 / 그룹 / 인덱스   (KRDS 정본)
INFOMIND / 카테고리 / 의미        (시맨틱 별칭)
```

### 대소문자 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| Collection prefix | 대문자 | `KRDS`, `INFOMIND` |
| 카테고리 | PascalCase | `Color`, `Padding`, `Font` |
| 그룹 | PascalCase | `Primary`, `Gray`, `Button` |
| 인덱스/이름 | camelCase 또는 숫자 | `5`, `50`, `text`, `medium2` |

## KRDS Color Variable 매핑

KRDS는 primary/secondary/gray/success/warning/danger/info 모두 5/10/20/30/40/50/60/70/80/90/95의 11단계 스케일을 발행한다.

### Primary 11단계

| 피그마 Variable | CSS Custom Property |
|----------------|---------------------|
| `KRDS / Color / Primary / 5` | `--krds-light-color-primary-5` |
| `KRDS / Color / Primary / 30` | `--krds-light-color-primary-30` |
| `KRDS / Color / Primary / 50` | `--krds-light-color-primary-50` (기본 강조) |
| `KRDS / Color / Primary / 70` | `--krds-light-color-primary-70` |
| `KRDS / Color / Primary / 90` | `--krds-light-color-primary-90` |

### Gray 11단계

| 피그마 Variable | CSS Custom Property | 권장 용도 |
|----------------|---------------------|----------|
| `KRDS / Color / Gray / 0` | `--krds-light-color-gray-0` | 흰색 근접 (배경) |
| `KRDS / Color / Gray / 30` | `--krds-light-color-gray-30` | 테두리·구분선 |
| `KRDS / Color / Gray / 50` | `--krds-light-color-gray-50` | 비활성 텍스트 |
| `KRDS / Color / Gray / 70` | `--krds-light-color-gray-70` | 보조 텍스트 |
| `KRDS / Color / Gray / 90` | `--krds-light-color-gray-90` | 본문 텍스트 |
| `KRDS / Color / Gray / 100` | `--krds-light-color-gray-100` | 검정 근접 |

### Semantic (Success/Warning/Danger/Info)

각각 11단계. 기본은 50.

| 피그마 Variable | CSS Custom Property |
|----------------|---------------------|
| `KRDS / Color / Success / 50` | `--krds-light-color-success-50` |
| `KRDS / Color / Warning / 50` | `--krds-light-color-warning-50` |
| `KRDS / Color / Danger / 50` | `--krds-light-color-danger-50` |
| `KRDS / Color / Info / 50` | `--krds-light-color-info-50` |

### Button 컴포넌트 토큰

| 피그마 Variable | CSS Custom Property |
|----------------|---------------------|
| `KRDS / Color / Button / Primary / Fill` | `--krds-light-color-button-primary-fill` |
| `KRDS / Color / Button / Primary / Fill-Hover` | `--krds-light-color-button-primary-fill-hover` |
| `KRDS / Color / Button / Primary / Fill-Pressed` | `--krds-light-color-button-primary-fill-pressed` |
| `KRDS / Color / Button / Secondary / Fill` | `--krds-light-color-button-secondary-fill` |
| `KRDS / Color / Button / Secondary / Border` | `--krds-light-color-button-secondary-border` |

## INFOMIND 시맨틱 별칭 매핑

KRDS 토큰을 가리키는 의미 기반 alias. 컴포넌트 작성 시 우선 권장.

### Color

| 피그마 Variable | CSS Custom Property | KRDS 매핑 (예시) |
|----------------|---------------------|------------------|
| `INFOMIND / Color / Primary` | `--color-primary` | `--krds-light-color-primary-50` |
| `INFOMIND / Color / Text` | `--color-text` | `--krds-light-color-gray-90` |
| `INFOMIND / Color / Text / Secondary` | `--color-text-secondary` | `--krds-light-color-gray-70` |
| `INFOMIND / Color / Text / Disabled` | `--color-text-disabled` | `--krds-light-color-gray-50` |
| `INFOMIND / Color / Text / Inverse` | `--color-text-inverse` | `--krds-light-color-gray-0` |
| `INFOMIND / Color / Bg` | `--color-bg` | `--krds-light-color-gray-0` |
| `INFOMIND / Color / Bg / Secondary` | `--color-bg-secondary` | `--krds-light-color-gray-5` |
| `INFOMIND / Color / Border` | `--color-border` | `--krds-light-color-gray-30` |
| `INFOMIND / Color / Border / Light` | `--color-border-light` | `--krds-light-color-gray-10` |

## KRDS Padding/Gap/Size Variable 매핑

| 피그마 Variable | CSS Custom Property | 권장 용도 |
|----------------|---------------------|----------|
| `KRDS / Padding / 1` ~ `8` | `--krds-padding-1` ~ `--krds-padding-8` | 컨테이너·컴포넌트 패딩 |
| `KRDS / Gap / 1` ~ `6` | `--krds-gap-1` ~ `--krds-gap-6` | flex/grid gap |
| `KRDS / Size / Height / 5` (32px) | `--krds-size-height-5` | 버튼 xsmall |
| `KRDS / Size / Height / 6` (40px) | `--krds-size-height-6` | 버튼 small |
| `KRDS / Size / Height / 7` (48px) | `--krds-size-height-7` | **버튼 medium = 모바일 권장** |
| `KRDS / Size / Height / 8` (56px) | `--krds-size-height-8` | 버튼 large |
| `KRDS / Size / Height / 9` (64px) | `--krds-size-height-9` | 버튼 xlarge |

INFOMIND 시맨틱 별칭(`--spacing-N`)은 정수 N=4px 단위 (예: `--spacing-4` = 16px).

## KRDS Radius Variable 매핑

| 피그마 Variable | CSS Custom Property | 값 |
|----------------|---------------------|-----|
| `KRDS / Radius / Small / 1` ~ `3` | `--krds-radius-small1` ~ `--krds-radius-small3` | 2~4px |
| `KRDS / Radius / Medium / 1` ~ `4` | `--krds-radius-medium1` ~ `--krds-radius-medium4` | 6~10px |
| `KRDS / Radius / Large / 1` ~ `3` | `--krds-radius-large1` ~ `--krds-radius-large3` | 12~16px |
| `KRDS / Radius / Full` | `--krds-radius-full` | 9999px |

## KRDS Font Size Variable 매핑

| 피그마 Variable | CSS Custom Property | 권장 용도 |
|----------------|---------------------|----------|
| `KRDS / Font / Size / 3` (13px) | `--krds-font-size-3` | 캡션·라벨 |
| `KRDS / Font / Size / 5` (15px) | `--krds-font-size-5` | 보조 본문 |
| `KRDS / Font / Size / 7` (17px) | `--krds-font-size-7` | **본문** |
| `KRDS / Font / Size / 9` (19px) | `--krds-font-size-9` | 큰 본문·소제목 |
| `KRDS / Font / Size / 11` (24px) | `--krds-font-size-11` | 제목 |
| `KRDS / Font / Size / 13` (32px) | `--krds-font-size-13` | 섹션 제목 |
| `KRDS / Font / Size / 15` (48px) | `--krds-font-size-15` | 디스플레이 |

INFOMIND 시맨틱 별칭(`--text-body-{xsmall,small,medium,large}` / `--text-heading-{small,medium,large,xlarge}`)도 발행됨.

## 변환 패턴 요약

1. KRDS 토큰: 슬래시(`/`)를 하이픈(`-`)으로, PascalCase를 소문자로, 그룹/인덱스 결합 (예: `KRDS / Color / Primary / 50` → `--krds-light-color-primary-50`)
2. INFOMIND 시맨틱: 슬래시(`/`)를 하이픈(`-`)으로 (예: `INFOMIND / Color / Text / Secondary` → `--color-text-secondary`)
3. `--` 접두사 필수
4. 모드 전환은 `data-theme="dark"` 또는 `prefers-color-scheme`으로 KRDS dark 토큰 자동 활성

## 다크 모드

KRDS는 light/dark 양쪽 토큰을 발행한다. 피그마에서도 KRDS Color Collection을 Light/Dark Mode로 분리해 관리한다.

```css
:root {
  /* light tokens — 자동 적용 */
}

[data-theme="dark"] {
  /* --krds-dark-color-* 자동 적용 */
}
```

## 절대 금지

- 옛 시맨틱 토큰 (`--color-primary-light`, `--font-size-2xl`, `--spacing-md`, `--radius-base` 등) — KRDS 마이그레이션에서 폐기
- raw hex (피그마 Variable이 아닌 직접 hex 입력) — KRDS 또는 INFOMIND Variable만
- KRDS 카탈로그 외 임의 색상·간격 추가 — UX팀 결정 후 `tokens/infomind-overrides.json` 갱신

## 관련 문서

- [색상 토큰](/tokens/color/) — KRDS 정본 + INFOMIND 시맨틱 별칭
- [타이포그래피 토큰](/tokens/typography/) — KRDS font-size + INFOMIND text 시맨틱
- [간격 토큰](/tokens/spacing/) — KRDS padding/gap/size-height 스케일
- [그리드 토큰](/tokens/grid/) — KRDS 표준 그리드와 컨테이너 규격
- [Auto Layout 규칙](/figma/auto-layout/) — 피그마 Auto Layout과 KRDS 토큰 매핑
