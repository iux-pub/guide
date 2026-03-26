---
title: 색상 토큰
order: 2
---

색상 토큰은 `src/scss/1-settings/_tokens-color.scss`에 정의되어 있다. KRDS(한국형 디자인 시스템) 기반 시맨틱 색상과 중립 팔레트로 구성된다.

## Primary

프로젝트별 `:root` 오버라이드로 변경 가능한 주 색상이다.

<div class="color-grid">
  <div class="color-swatch" style="background:#256ef4;color:#fff">
    <span class="color-swatch__name">--color-primary</span>
    <span class="color-swatch__value">#256ef4</span>
    <span class="color-swatch__desc">주 강조 색상</span>
  </div>
  <div class="color-swatch" style="background:#6a9df7;color:#000">
    <span class="color-swatch__name">--color-primary-light</span>
    <span class="color-swatch__value">#6a9df7</span>
    <span class="color-swatch__desc">밝은 강조 (장식용, 텍스트 배치 금지)</span>
  </div>
  <div class="color-swatch" style="background:#083891;color:#fff">
    <span class="color-swatch__name">--color-primary-dark</span>
    <span class="color-swatch__value">#083891</span>
    <span class="color-swatch__desc">어두운 강조 (흰색 텍스트 안전)</span>
  </div>
</div>

## Gray Scale

기존 프로젝트 값 기반의 중립 팔레트이다.

<div class="color-grid">
  <div class="color-swatch" style="background:#222;color:#fff">
    <span class="color-swatch__name">--color-gray-900</span>
    <span class="color-swatch__value">#222</span>
    <span class="color-swatch__desc">가장 어두운 회색</span>
  </div>
  <div class="color-swatch" style="background:#333;color:#fff">
    <span class="color-swatch__name">--color-gray-800</span>
    <span class="color-swatch__value">#333</span>
    <span class="color-swatch__desc">부제목 텍스트</span>
  </div>
  <div class="color-swatch" style="background:#555;color:#fff">
    <span class="color-swatch__name">--color-gray-700</span>
    <span class="color-swatch__value">#555</span>
    <span class="color-swatch__desc">캡션, 소텍스트</span>
  </div>
  <div class="color-swatch" style="background:#666;color:#fff">
    <span class="color-swatch__name">--color-gray-600</span>
    <span class="color-swatch__value">#666</span>
    <span class="color-swatch__desc">보조 텍스트</span>
  </div>
  <div class="color-swatch" style="background:#999;color:#000">
    <span class="color-swatch__name">--color-gray-500</span>
    <span class="color-swatch__value">#999</span>
    <span class="color-swatch__desc">비활성 텍스트</span>
  </div>
  <div class="color-swatch" style="background:#b1b8be;color:#000">
    <span class="color-swatch__name">--color-gray-400</span>
    <span class="color-swatch__value">#b1b8be</span>
    <span class="color-swatch__desc">장식용 보더 (텍스트 불가)</span>
  </div>
  <div class="color-swatch" style="background:#ccc;color:#000">
    <span class="color-swatch__name">--color-gray-300</span>
    <span class="color-swatch__value">#ccc</span>
    <span class="color-swatch__desc">구분선 (텍스트 불가)</span>
  </div>
  <div class="color-swatch" style="background:#ddd;color:#000">
    <span class="color-swatch__name">--color-gray-200</span>
    <span class="color-swatch__value">#ddd</span>
    <span class="color-swatch__desc">연한 보더</span>
  </div>
  <div class="color-swatch" style="background:#efefef;color:#000">
    <span class="color-swatch__name">--color-gray-100</span>
    <span class="color-swatch__value">#efefef</span>
    <span class="color-swatch__desc">연한 배경</span>
  </div>
  <div class="color-swatch" style="background:#f8f8f8;color:#000">
    <span class="color-swatch__name">--color-gray-50</span>
    <span class="color-swatch__value">#f8f8f8</span>
    <span class="color-swatch__desc">가장 연한 배경</span>
  </div>
</div>

## Semantic

KRDS 기준 상태 표시 색상이다.

<div class="color-grid">
  <div class="color-swatch" style="background:#de3412;color:#fff">
    <span class="color-swatch__name">--color-danger</span>
    <span class="color-swatch__value">#de3412</span>
    <span class="color-swatch__desc">오류, 삭제, 위험</span>
  </div>
  <div class="color-swatch" style="background:#c78500;color:#000">
    <span class="color-swatch__name">--color-warning</span>
    <span class="color-swatch__value">#c78500</span>
    <span class="color-swatch__desc">경고 (대형 텍스트만 사용)</span>
  </div>
  <div class="color-swatch" style="background:#228738;color:#fff">
    <span class="color-swatch__name">--color-success</span>
    <span class="color-swatch__value">#228738</span>
    <span class="color-swatch__desc">성공, 완료</span>
  </div>
  <div class="color-swatch" style="background:#0b78cb;color:#fff">
    <span class="color-swatch__name">--color-info</span>
    <span class="color-swatch__value">#0b78cb</span>
    <span class="color-swatch__desc">정보, 안내</span>
  </div>
</div>

## Text

텍스트 전용 색상 토큰이다.

<div class="color-grid">
  <div class="color-swatch" style="background:#1e2124;color:#fff">
    <span class="color-swatch__name">--color-text</span>
    <span class="color-swatch__value">#1e2124</span>
    <span class="color-swatch__desc">본문 텍스트 (대비 16.2:1)</span>
  </div>
  <div class="color-swatch" style="background:#666;color:#fff">
    <span class="color-swatch__name">--color-text-secondary</span>
    <span class="color-swatch__value">#666</span>
    <span class="color-swatch__desc">보조 텍스트 (대비 5.7:1)</span>
  </div>
  <div class="color-swatch" style="background:#999;color:#000">
    <span class="color-swatch__name">--color-text-disabled</span>
    <span class="color-swatch__value">#999</span>
    <span class="color-swatch__desc">비활성 텍스트 (WCAG 예외)</span>
  </div>
</div>

## Background

배경 색상 토큰이다.

<div class="color-grid">
  <div class="color-swatch" style="background:#fff;color:#000;border:1px solid #ddd">
    <span class="color-swatch__name">--color-bg</span>
    <span class="color-swatch__value">#fff</span>
    <span class="color-swatch__desc">기본 배경</span>
  </div>
  <div class="color-swatch" style="background:#f8f8f8;color:#000;border:1px solid #ddd">
    <span class="color-swatch__name">--color-bg-secondary</span>
    <span class="color-swatch__value">#f8f8f8</span>
    <span class="color-swatch__desc">보조 배경</span>
  </div>
</div>

## Border

테두리 색상 토큰이다.

<div class="color-grid">
  <div class="color-swatch" style="background:#ccc;color:#000">
    <span class="color-swatch__name">--color-border</span>
    <span class="color-swatch__value">#ccc</span>
    <span class="color-swatch__desc">기본 테두리</span>
  </div>
  <div class="color-swatch" style="background:#efefef;color:#000">
    <span class="color-swatch__name">--color-border-light</span>
    <span class="color-swatch__value">#efefef</span>
    <span class="color-swatch__desc">연한 테두리</span>
  </div>
</div>

## 기본

<div class="color-grid">
  <div class="color-swatch" style="background:#fff;color:#000;border:1px solid #ddd">
    <span class="color-swatch__name">--color-white</span>
    <span class="color-swatch__value">#fff</span>
  </div>
  <div class="color-swatch" style="background:#000;color:#fff">
    <span class="color-swatch__name">--color-black</span>
    <span class="color-swatch__value">#000</span>
  </div>
</div>

## 사용 예시

```scss
// 카드 컴포넌트에 색상 토큰 적용
.card {
  color: var(--color-text);
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);

  &__title {
    color: var(--color-gray-900);
  }

  &--featured {
    border-color: var(--color-primary);
  }
}
```

## 프로젝트별 오버라이드

`_project-overrides.scss`에서 Primary 색상을 변경할 수 있다.

```scss
// _project-overrides.scss
:root {
  --color-primary: #0066cc;
  --color-primary-light: #4d99e6;
  --color-primary-dark: #004c99;
}
```
