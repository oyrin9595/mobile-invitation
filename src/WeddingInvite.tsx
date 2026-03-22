import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { GiftAccountRow, WeddingData } from "./data/wedding";
import { galleryImageUrls } from "./data/galleryImages.generated";
import { venueMapEmbedSrc } from "./mapEmbed";
import { NaverMapPreview } from "./NaverMapPreview";
import { publicAssetUrl } from "./publicAssetUrl";
import { useReveal } from "./hooks/useReveal";
import styles from "./WeddingInvite.module.css";

type Props = { data: WeddingData };

export function WeddingInvite({ data }: Props) {
  const [toast, setToast] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const swipeRef = useRef<{ x: number; y: number } | null>(null);
  const suppressBackdropClickRef = useRef(false);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") {
        setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i));
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((i) =>
          i !== null && i < galleryImageUrls.length - 1 ? i + 1 : i
        );
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("wheel", onWheel, { passive: false });
    document.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("wheel", onWheel);
      document.removeEventListener("touchmove", onTouchMove);
    };
  }, [lightboxIndex]);

  const onLightboxPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    swipeRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onLightboxPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const start = swipeRef.current;
    swipeRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* 캡처 없음 */
    }
    if (start === null) return;

    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const minSwipe = 56;
    if (Math.abs(dx) < minSwipe || Math.abs(dx) < Math.abs(dy) * 1.15) return;

    if (dx < 0) {
      setLightboxIndex((i) =>
        i !== null && i < galleryImageUrls.length - 1 ? i + 1 : i
      );
    } else {
      setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i));
    }
    suppressBackdropClickRef.current = true;
    window.setTimeout(() => {
      suppressBackdropClickRef.current = false;
    }, 400);
  }, []);

  const onLightboxPointerCancel = useCallback(() => {
    swipeRef.current = null;
  }, []);

  const goLightboxPrev = useCallback(() => {
    setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i));
  }, []);

  const goLightboxNext = useCallback(() => {
    setLightboxIndex((i) =>
      i !== null && i < galleryImageUrls.length - 1 ? i + 1 : i
    );
  }, []);

  const showCopied = useCallback(() => {
    setToast(true);
    window.setTimeout(() => setToast(false), 2200);
  }, []);

  const copyNumber = useCallback(
    async (num: string) => {
      try {
        await navigator.clipboard.writeText(num.replace(/\s/g, ""));
        showCopied();
      } catch {
        /* 클립보드 권한 없음 등 */
      }
    },
    [showCopied]
  );

  const venueMapSrc = venueMapEmbedSrc(data.venue);
  const naverClientId =
    (import.meta.env.VITE_NAVER_MAP_CLIENT_ID as string | undefined)?.trim() ||
    data.venue.naverMapClientId?.trim() ||
    "";
  const naverScriptQuery = data.venue.naverMapScriptQuery ?? "ncpClientId";
  const showJsNaverMap = Boolean(naverClientId && data.venue.mapPreview);

  return (
    <>
      <header className={styles.heroStack}>
        <div className={styles.heroVisual} aria-label="웨딩 비주얼">
          <div className={styles.heroBg} aria-hidden>
            <img
              className={styles.heroBgIllu}
              src={publicAssetUrl("/illustration.jpg")}
              alt=""
              fetchPriority="high"
            />
            <img
              className={styles.heroBgPhoto}
              src={publicAssetUrl("/image.jpg")}
              alt=""
              fetchPriority="high"
            />
            <div className={styles.heroBgScrim} />
          </div>
          <span className={styles.scrollHint}>SCROLL</span>
        </div>

        <div className={styles.heroCopy}>
          <div className={styles.heroCopyInner}>
            <p className={styles.heroDateEyebrow}>Wedding Day</p>
            <p className={styles.heroDatePrimary}>{data.hero.dateLine}</p>
            {data.hero.timeLine ? (
              <p className={styles.heroDateTime}>{data.hero.timeLine}</p>
            ) : null}
            <div className={styles.heroCopyDivider} aria-hidden />
            <p className={styles.introEyebrow}>Wedding Invitation</p>
            <div className={styles.introNames}>
              <span className={styles.introName}>{data.couple.groom}</span>
              <span className={styles.introAmpersand} aria-hidden>
                &
              </span>
              <span className={styles.introName}>{data.couple.bride}</span>
            </div>
            <p className={styles.introKicker}>{data.headline}</p>
            <p className={styles.introSubline}>{data.subline}</p>
          </div>
        </div>
      </header>

      <RevealSection>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Invitation</h2>
          <div className={styles.message}>
            {data.message.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <div className={styles.familyLines}>
            <div
              className={
                data.familyPresentation.groomMotherGu
                  ? `${styles.familyLinesGrid} ${styles.familyLinesGridGu}`
                  : `${styles.familyLinesGrid} ${styles.familyLinesGridPlain}`
              }
            >
              <span className={styles.familyFather}>{data.familyPresentation.groomParents[0]}</span>
              <span className={styles.familyDot} aria-hidden>
                ·
              </span>
              {data.familyPresentation.groomMotherGu ? (
                <span className={styles.familyGuSlot}>
                  <span className={styles.familyGu}>故</span>
                </span>
              ) : null}
              <span className={styles.familyMother}>{data.familyPresentation.groomParents[1]}</span>
              <span className={styles.familyRelation}>의 아들</span>
              <span className={styles.familyName}>{data.couple.groom}</span>

              <span className={styles.familyFather}>{data.familyPresentation.brideParents[0]}</span>
              <span className={styles.familyDot} aria-hidden>
                ·
              </span>
              {data.familyPresentation.groomMotherGu ? (
                <span className={styles.familyGuSlot} aria-hidden />
              ) : null}
              <span className={styles.familyMother}>{data.familyPresentation.brideParents[1]}</span>
              <span className={styles.familyRelation}>의 딸</span>
              <span className={styles.familyName}>{data.couple.bride}</span>
            </div>
          </div>
        </div>
      </RevealSection>

      <RevealSection>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Date</h2>
          <ul className={styles.scheduleList}>
            {data.schedule.map((item) => (
              <li key={item.label + item.datetime} className={styles.scheduleItem}>
                <span className={styles.scheduleLabel}>{item.label}</span>
                <span className={`${styles.scheduleWhen} mono-nums`}>{item.datetime}</span>
                {item.note ? <span className={styles.scheduleNote}>{item.note}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      </RevealSection>

      <RevealSection>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Venue</h2>
          <p className={styles.venueName}>{data.venue.name}</p>
          {data.venue.hall ? <p className={styles.venueHall}>{data.venue.hall}</p> : null}
          <p className={styles.venueAddr}>{data.venue.address}</p>
          {showJsNaverMap && data.venue.mapPreview ? (
            <NaverMapPreview
              clientId={naverClientId}
              scriptQuery={naverScriptQuery}
              lat={data.venue.mapPreview.lat}
              lng={data.venue.mapPreview.lng}
            />
          ) : venueMapSrc ? (
            <div className={styles.mapPreviewWrap}>
              <iframe
                title={`${data.venue.name} 위치 지도 미리보기`}
                src={venueMapSrc}
                className={styles.mapPreviewFrame}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          ) : null}
          <a className={styles.mapBtn} href={data.venue.mapUrl} target="_blank" rel="noreferrer">
            지도에서 보기
          </a>
        </div>
      </RevealSection>

      <RevealSection>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Gallery</h2>
          <p
            style={{
              textAlign: "center",
              margin: "0 0 1rem",
              fontSize: "0.82rem",
              color: "var(--muted)",
            }}
          >
            {data.galleryCaption}
          </p>
          <div className={styles.galleryGrid}>
            {galleryImageUrls.map((src: string, i: number) => {
              const alt = `웨딩 사진 ${i + 1}`;
              return (
                <div key={src} className={styles.galleryCell}>
                  <button
                    type="button"
                    className={styles.galleryThumb}
                    onClick={() => setLightboxIndex(i)}
                    aria-label={`${alt} 전체 화면으로 보기`}
                  >
                    <img
                      className={styles.galleryImg}
                      src={publicAssetUrl(src)}
                      alt={alt}
                      loading="lazy"
                      draggable={false}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </RevealSection>

      <RevealSection>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Gift</h2>
          <p className={styles.message} style={{ marginBottom: "1.25rem" }}>
            <span style={{ display: "block", fontSize: "0.88rem", lineHeight: 1.75 }}>
              축하의 마음만으로도 충분합니다.
              <br />
              부득이하게 전하시려면 아래 계좌를 이용해 주세요.
            </span>
          </p>
          <div className={styles.accountSides}>
            <details className={styles.accountDisclosure}>
              <summary className={styles.accountDisclosureSummary}>
                {data.giftAccounts.groomSide.sideTitle}
                <span className={styles.accountDisclosureChevron} aria-hidden>
                  ▼
                </span>
              </summary>
              <div className={styles.accountDisclosureBody}>
                {data.giftAccounts.groomSide.groups.map((group) => (
                  <div key={group.groupLabel} className={styles.accountGroup}>
                    <p className={styles.accountGroupLabel}>{group.groupLabel}</p>
                    <GiftAccountBlock accounts={group.accounts} onCopy={copyNumber} />
                  </div>
                ))}
              </div>
            </details>
            <details className={styles.accountDisclosure}>
              <summary className={styles.accountDisclosureSummary}>
                {data.giftAccounts.brideSide.sideTitle}
                <span className={styles.accountDisclosureChevron} aria-hidden>
                  ▼
                </span>
              </summary>
              <div className={styles.accountDisclosureBody}>
                {data.giftAccounts.brideSide.groups.map((group) => (
                  <div key={group.groupLabel} className={styles.accountGroup}>
                    <p className={styles.accountGroupLabel}>{group.groupLabel}</p>
                    <GiftAccountBlock accounts={group.accounts} onCopy={copyNumber} />
                  </div>
                ))}
              </div>
            </details>
          </div>
        </div>
      </RevealSection>

      <footer className={styles.footer}>
        <p className={styles.footerEn}>Thank you</p>
        <p className={styles.footerKo}>
          {data.couple.groom} · {data.couple.bride}
          <br />
          드림
        </p>
      </footer>

      <div className={`${styles.toast} ${toast ? styles.show : ""}`} role="status">
        계좌번호를 복사했어요
      </div>

      {lightboxIndex !== null ? (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={`갤러리 ${lightboxIndex + 1}번째, 총 ${galleryImageUrls.length}장`}
          onClick={() => {
            if (suppressBackdropClickRef.current) return;
            setLightboxIndex(null);
          }}
        >
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(null);
            }}
            aria-label="닫기"
          >
            <svg
              className={styles.lightboxCloseIcon}
              viewBox="0 0 24 24"
              width="24"
              height="24"
              aria-hidden="true"
            >
              <path
                d="M7 7l10 10M17 7L7 17"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.lightboxNav} ${styles.lightboxNavPrev}`}
            disabled={lightboxIndex <= 0}
            onClick={(e) => {
              e.stopPropagation();
              goLightboxPrev();
            }}
            aria-label="이전 사진"
          >
            ‹
          </button>
          <button
            type="button"
            className={`${styles.lightboxNav} ${styles.lightboxNavNext}`}
            disabled={lightboxIndex >= galleryImageUrls.length - 1}
            onClick={(e) => {
              e.stopPropagation();
              goLightboxNext();
            }}
            aria-label="다음 사진"
          >
            ›
          </button>
          <div
            className={styles.lightboxStage}
            onPointerDown={onLightboxPointerDown}
            onPointerUp={onLightboxPointerUp}
            onPointerCancel={onLightboxPointerCancel}
          >
            <img
              className={styles.lightboxImg}
              src={publicAssetUrl(galleryImageUrls[lightboxIndex])}
              alt={`웨딩 사진 ${lightboxIndex + 1}`}
              draggable={false}
              onClick={(e) => e.stopPropagation()}
            />
            <p className={styles.lightboxCounter} aria-hidden>
              {lightboxIndex + 1} / {galleryImageUrls.length}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}

function GiftAccountBlock({
  accounts,
  onCopy,
}: {
  accounts: GiftAccountRow[];
  onCopy: (num: string) => void;
}) {
  return (
    <div className={styles.accountRows}>
      {accounts.map((acc) => (
        <div key={`${acc.holder}-${acc.number}`} className={styles.accountRow}>
          <div className={styles.accountMeta}>
            <p className={styles.accountHolder}>{acc.holder}</p>
            <p className={styles.accountBank}>{acc.bank}</p>
            <p className={`${styles.accountNum} mono-nums`}>{acc.number}</p>
          </div>
          <button type="button" className={styles.copyBtn} onClick={() => void onCopy(acc.number)}>
            복사
          </button>
        </div>
      ))}
    </div>
  );
}

function RevealSection({ children }: { children: ReactNode }) {
  const { ref, visible } = useReveal<HTMLElement>();
  return (
    <section ref={ref} className={`${styles.section} reveal ${visible ? "is-visible" : ""}`}>
      {children}
    </section>
  );
}
