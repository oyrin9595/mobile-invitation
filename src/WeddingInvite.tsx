import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { WeddingData } from "./data/wedding";
import { galleryImageUrls } from "./data/galleryImages.generated";
import { useReveal } from "./hooks/useReveal";
import styles from "./WeddingInvite.module.css";

type Props = { data: WeddingData };

export function WeddingInvite({ data }: Props) {
  const [toast, setToast] = useState(false);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    if (!lightbox) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
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
  }, [lightbox]);

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

  return (
    <>
      <header className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden />
        <p className={styles.eyebrow}>Wedding Invitation</p>
        <div className={styles.names}>
          <span className={styles.name}>{data.couple.groom}</span>
          <span className={styles.ampersand} aria-hidden>
            &
          </span>
          <span className={styles.name}>{data.couple.bride}</span>
        </div>
        <p className={styles.kicker}>{data.headline}</p>
        <p className={styles.subline}>{data.subline}</p>
        <span className={styles.scrollHint}>SCROLL</span>
      </header>

      <RevealSection>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Invitation</h2>
          <div className={styles.message}>
            {data.message.map((line) => (
              <p key={line}>{line}</p>
            ))}
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
          <a className={styles.mapBtn} href={data.venue.mapUrl} target="_blank" rel="noreferrer">
            지도에서 보기
          </a>
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
          <div className={styles.accounts}>
            {data.accounts.map((acc) => (
              <div key={acc.number} className={styles.accountRow}>
                <div className={styles.accountMeta}>
                  <p className={styles.accountHolder}>{acc.holder}</p>
                  <p className={styles.accountBank}>{acc.bank}</p>
                  <p className={`${styles.accountNum} mono-nums`}>{acc.number}</p>
                </div>
                <button
                  type="button"
                  className={styles.copyBtn}
                  onClick={() => void copyNumber(acc.number)}
                >
                  복사
                </button>
              </div>
            ))}
          </div>
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
                    onClick={() => setLightbox({ src, alt })}
                    aria-label={`${alt} 전체 화면으로 보기`}
                  >
                    <img
                      className={styles.galleryImg}
                      src={src}
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

      {lightbox ? (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label="갤러리 전체 화면"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={(e) => {
              e.stopPropagation();
              setLightbox(null);
            }}
            aria-label="닫기"
          >
            닫기
          </button>
          <img
            className={styles.lightboxImg}
            src={lightbox.src}
            alt={lightbox.alt}
            draggable={false}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </>
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
