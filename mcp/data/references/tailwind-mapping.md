# Tailwind v4 매핑

INFOUX는 Tailwind v4 `@theme`에 색상과 폰트만 공개한다.

## 색상 유틸리티

| Tailwind | 토큰 | 용도 |
|----------|------|------|
| `bg-primary` | `--color-primary` | 메인 액션 |
| `bg-primary-hover` | `--color-primary-hover` | hover 상태 |
| `bg-primary-pressed` | `--color-primary-pressed` | active 상태 |
| `text-text` | `--color-text` | 본문 텍스트 |
| `text-text-bolder` | `--color-text-bolder` | 강조 텍스트 |
| `text-text-subtle` | `--color-text-subtle` | 보조 텍스트 |
| `text-text-disabled` | `--color-text-disabled` | 비활성 텍스트 |
| `text-text-inverse` | `--color-text-inverse` | 어두운 배경 위 텍스트 |
| `bg-bg` | `--color-bg` | 기본 배경 |
| `bg-bg-subtler` | `--color-bg-subtler` | 보조 배경 |
| `bg-surface` | `--color-surface` | 카드/패널 표면 |
| `border-border` | `--color-border` | 기본 보더 |
| `border-border-light` | `--color-border-light` | 약한 보더 |
| `border-border-primary` | `--color-border-primary` | 활성 보더 |
| `text-danger-text` | `--color-danger-text` | 오류 텍스트 |
| `bg-danger-surface` | `--color-danger-surface` | 오류 배경 |

컴포넌트 CSS는 `bg-[var(--color-primary)]`·`text-[var(--color-text-inverse)]`처럼 임의값 안에 토큰을 쓰는 형식을 기본으로 한다. 위 유틸리티와 같은 토큰을 가리킨다. Tailwind 기본 팔레트(`bg-gray-50`, `text-white`, `from-violet-600` 등)는 `@theme`에서 비워 두었으므로 쓰지 않는다(R-01).

단계 색상은 예외적으로만 사용한다.

| Tailwind | 토큰 |
|----------|------|
| `bg-primary-{5..95}` | `--color-primary-{5..95}` |
| `bg-secondary-{5..95}` | `--color-secondary-{5..95}` |
| `bg-[var(--color-gray-{0,5,10,..,95,100})]` | `--color-gray-*` — `bg-gray-50` 형식은 Tailwind 팔레트 이름과 겹쳐 R-01 오류다 |
| `bg-danger-{5..95}` | `--color-danger-*` |
| `bg-warning-{5..95}` | `--color-warning-*` |
| `bg-success-{5..95}` | `--color-success-*` |
| `bg-information-{5..95}` | `--color-information-*` |

## 폰트 유틸리티

| Tailwind | 토큰 |
|----------|------|
| `font-sans` | `--font-sans` |
| `font-mono` | `--font-mono` |

## 직접값 사용

간격, 크기, 타이포 스케일, 반경, 그림자, 모션, z-index는 Tailwind rem 임의값(arbitrary value) 또는 CSS 직접값으로 작성한다.

```css
.card {
  @apply p-[2.4rem] rounded-[0.6rem] shadow-[0_0_0.2rem_0_#00000014,_0_0.8rem_1.6rem_0_#0000001f];
}
```

그림자는 KRDS 3단계 검정 알파(`#0000000d`·`#00000014`·`#0000001f`)만 조합한다. 색 있는 글로우 그림자, 장식 그라데이션, 글래스(`backdrop-blur-*`)는 쓰지 않는다(R-34).

### Tailwind 기본 스케일 금지 (R-37)

루트 글자 크기가 62.5%(1rem = 10px)라서 Tailwind 기본 스케일은 의도보다 37.5% 작게 렌더된다. 기본 글자 크기·숫자 행간·숫자 간격/크기·컨테이너 폭 유틸은 쓰지 않고 rem 임의값으로 바꾼다.

| Tailwind 기본 | 16px 루트에서 의도한 값 | 이 저장소에서 실제 렌더 | 대신 쓰는 값 |
|---------------|------------------------|------------------------|--------------|
| `p-4` | 16px | 10px | `p-[1.6rem]` |
| `gap-2` | 8px | 5px | `gap-[0.8rem]` (KRDS `gap-3`) |
| `mt-10` | 40px | 25px | `mt-[4rem]` |
| `min-h-12` | 48px | 30px | `min-h-[4.8rem]` |
| `text-sm` | 14px | 8.75px | `text-[1.4rem]` |
| `leading-6` | 24px | 15px | `leading-[1.6]` (비율) |
| `max-w-md` | 448px | 280px | `max-w-[44.8rem]` 또는 `.container` |

이름 행간(`leading-relaxed` 등)과 `max-w-prose`는 허용한다. 반경도 같은 원인으로 작아진다(`rounded-lg` 8px → 5px) — `rounded-[0.8rem]`을 쓴다. 반경·그림자·z-index 기본값은 지금은 오류가 아니라 경고(R-01)다.
