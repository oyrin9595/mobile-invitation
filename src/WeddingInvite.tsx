import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { GiftAccountRow, WeddingData } from "./data/wedding";
import { galleryImages } from "./data/galleryImages.generated";
import { NaverDynamicMap, hasNaverMapKey } from "./components/NaverDynamicMap";
import { venueMapEmbedSrc } from "./mapEmbed";
import { publicAssetUrl } from "./publicAssetUrl";
import { useReveal } from "./hooks/useReveal";
import { supabase } from "./lib/supabase";
import styles from "./WeddingInvite.module.css";

type Props = { data: WeddingData };
type GuestbookEntry = {
  id: string;
  name: string;
  message: string;
  created_at: string;
};
const GUESTBOOK_PAGE_SIZE = 5;

export function WeddingInvite({ data }: Props) {
  const [toast, setToast] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [heroTransitionDone, setHeroTransitionDone] = useState(false);
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [guestbookLoading, setGuestbookLoading] = useState(true);
  const [guestbookError, setGuestbookError] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletePasswordById, setDeletePasswordById] = useState<Record<string, string>>({});
  const [openedDeleteId, setOpenedDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [guestbookPage, setGuestbookPage] = useState(1);
  const swipeRef = useRef<{ x: number; y: number } | null>(null);
  const suppressBackdropClickRef = useRef(false);
  const heroPhotoRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const setHeroViewportHeight = () => {
      root.style.setProperty("--hero-vh", `${window.innerHeight * 0.01}px`);
    };

    setHeroViewportHeight();

    const onOrientationChange = () => {
      window.setTimeout(setHeroViewportHeight, 120);
    };

    window.addEventListener("orientationchange", onOrientationChange);
    return () => {
      window.removeEventListener("orientationchange", onOrientationChange);
    };
  }, []);

  useEffect(() => {
    const photoEl = heroPhotoRef.current;
    if (!photoEl) {
      setHeroTransitionDone(true);
      return;
    }

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) {
      setHeroTransitionDone(true);
      return;
    }

    const onAnimationEnd = () => {
      setHeroTransitionDone(true);
    };

    photoEl.addEventListener("animationend", onAnimationEnd, { once: true });
    // 애니메이션 종료 전, 사진 전환이 시작되는 시점에 스크롤 먼저 허용
    const unlockTimer = window.setTimeout(() => {
      setHeroTransitionDone(true);
    }, 1800);
    const fallbackTimer = window.setTimeout(() => {
      setHeroTransitionDone(true);
    }, 9000);

    return () => {
      window.clearTimeout(unlockTimer);
      window.clearTimeout(fallbackTimer);
      photoEl.removeEventListener("animationend", onAnimationEnd);
    };
  }, []);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    if (!heroTransitionDone || lightboxIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [heroTransitionDone, lightboxIndex]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") {
        setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i));
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((i) =>
          i !== null ? (i + 1) % galleryImages.length : i
        );
      }
    };

    const onWheel = (e: WheelEvent) => {
      // 브라우저 확대 제스처(ctrl/cmd + wheel)는 허용
      if (e.ctrlKey || e.metaKey) return;
      e.preventDefault();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("wheel", onWheel);
    };
  }, [lightboxIndex]);

  const fetchGuestbook = useCallback(async () => {
    if (!supabase) {
      setGuestbookError("Supabase 환경변수가 설정되지 않았어요.");
      setGuestbookLoading(false);
      return;
    }
    setGuestbookLoading(true);
    const { data, error } = await supabase
      .from("guestbook_entries")
      .select("id, name, message, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      setGuestbookError("방명록을 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
      setEntries([]);
    } else {
      setGuestbookError(null);
      setEntries(data ?? []);
      setGuestbookPage(1);
    }
    setGuestbookLoading(false);
  }, []);

  useEffect(() => {
    void fetchGuestbook();
  }, [fetchGuestbook]);

  const onLightboxPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (e.pointerType === "touch" && !e.isPrimary) return;
    swipeRef.current = { x: e.clientX, y: e.clientY };
    if (e.pointerType === "mouse") {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  }, []);

  const onLightboxPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const start = swipeRef.current;
    swipeRef.current = null;
    if (e.pointerType === "mouse") {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* 캡처 없음 */
      }
    }
    if (start === null) return;

    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const minSwipe = 56;
    if (Math.abs(dx) < minSwipe || Math.abs(dx) < Math.abs(dy) * 1.15) return;

    if (dx < 0) {
      setLightboxIndex((i) =>
        i !== null ? (i + 1) % galleryImages.length : i
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
    setLightboxIndex((i) => (i !== null ? (i + 1) % galleryImages.length : i));
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

  const onSubmitGuestbook = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!supabase) {
        setGuestbookError("Supabase 환경변수가 설정되지 않았어요.");
        return;
      }

      const name = formName.trim();
      const password = formPassword.trim();
      const message = formMessage.trim();
      if (!name || !password || !message) return;

      setSubmitting(true);
      setGuestbookError(null);

      const { data, error } = await supabase.functions.invoke("create-guestbook-entry", {
        body: { name, password, message },
      });

      if (error) {
        setGuestbookError("방명록 등록에 실패했어요. 잠시 후 다시 시도해주세요.");
      } else {
        const created = data?.entry as GuestbookEntry | undefined;
        if (created) {
          setEntries((prev) => [created, ...prev]);
          setGuestbookPage(1);
        } else {
          await fetchGuestbook();
        }
        setFormName("");
        setFormPassword("");
        setFormMessage("");
      }

      setSubmitting(false);
    },
    [fetchGuestbook, formMessage, formName, formPassword]
  );

  const onDeleteGuestbook = useCallback(
    async (id: string) => {
      if (!supabase) {
        setGuestbookError("Supabase 환경변수가 설정되지 않았어요.");
        return;
      }

      const password = (deletePasswordById[id] ?? "").trim();
      if (!password) {
        setGuestbookError("삭제 비밀번호를 입력해주세요.");
        return;
      }

      setDeletingId(id);
      setGuestbookError(null);

      const { error } = await supabase.functions.invoke("delete-guestbook-entry", {
        body: { id, password },
      });

      if (error) {
        setGuestbookError("비밀번호가 다르거나 삭제에 실패했어요.");
      } else {
        setEntries((prev) => {
          const next = prev.filter((entry) => entry.id !== id);
          const maxPage = Math.max(1, Math.ceil(next.length / GUESTBOOK_PAGE_SIZE));
          setGuestbookPage((current) => (current > maxPage ? maxPage : current));
          return next;
        });
        setOpenedDeleteId((prev) => (prev === id ? null : prev));
        setDeletePasswordById((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }

      setDeletingId(null);
    },
    [deletePasswordById]
  );

  const formatGuestbookDate = useCallback((iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }, []);

  const venueMapSrc = venueMapEmbedSrc(data.venue);
  const totalGuestbookPages = Math.max(1, Math.ceil(entries.length / GUESTBOOK_PAGE_SIZE));
  const guestbookPageNumbers = Array.from({ length: totalGuestbookPages }, (_, i) => i + 1);
  const guestbookPageStart = (guestbookPage - 1) * GUESTBOOK_PAGE_SIZE;
  const pagedEntries = entries.slice(guestbookPageStart, guestbookPageStart + GUESTBOOK_PAGE_SIZE);
  const { year, month, day } = data.calendarDate;
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const dayCells: Array<number | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (dayCells.length % 7 !== 0) {
    dayCells.push(null);
  }
  const weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"];

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
              ref={heroPhotoRef}
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
          <h2 className={`${styles.sectionTitle} ${styles.dateSectionTitle}`}>The Wedding Day</h2>
          <div className={styles.dateCalendarWrap}>
            <p className={`${styles.dateCeremonyTime} mono-nums`}>{data.schedule[0]?.datetime}</p>
            <div className={styles.dateCalendarCard} aria-label="예식 달력">
              <p className={`${styles.dateCalendarYear} mono-nums`}>{year}</p>
              <p className={styles.dateCalendarMonth}>{month}월</p>
              <div className={styles.dateWeekHeader}>
                {weekdayLabels.map((label) => (
                  <span key={label} className={styles.dateWeekLabel}>
                    {label}
                  </span>
                ))}
              </div>
              <div className={styles.dateCalendarGrid}>
                {dayCells.map((cellDay, index) => (
                  <span
                    key={`${cellDay ?? "empty"}-${index}`}
                    className={`${styles.dateCell} ${cellDay === null ? styles.dateCellEmpty : ""} ${
                      cellDay === day ? styles.dateCellHighlight : ""
                    }`}
                    aria-hidden={cellDay === null}
                  >
                    {cellDay ?? ""}
                  </span>
                ))}
              </div>
            </div>
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
            {galleryImages.map((image, i: number) => {
              const alt = `웨딩 사진 ${i + 1}`;
              return (
                <div key={image.full} className={styles.galleryCell}>
                  <button
                    type="button"
                    className={styles.galleryThumb}
                    onClick={() => setLightboxIndex(i)}
                    aria-label={`${alt} 전체 화면으로 보기`}
                  >
                    <img
                      className={styles.galleryImg}
                      src={publicAssetUrl(image.thumb)}
                      alt={alt}
                      loading="lazy"
                      decoding="async"
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
          <h2 className={styles.sectionTitle}>Venue</h2>
          <p className={styles.venueName}>{data.venue.name}</p>
          {data.venue.hall ? <p className={styles.venueHall}>{data.venue.hall}</p> : null}
          <p className={styles.venueAddr}>{data.venue.address}</p>
          {data.venue.mapPreview && hasNaverMapKey() ? (
            <NaverDynamicMap
              className={styles.mapPreviewWrap}
              canvasClassName={styles.mapNaverCanvas}
              lat={data.venue.mapPreview.lat}
              lng={data.venue.mapPreview.lng}
              zoom={17}
              markerTitle={data.venue.name}
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
          <h2 className={styles.sectionTitle}>오시는길</h2>
          <div className={styles.directionsIntro}>
            <p className={styles.directionsVenueLabel}>{data.directions.venueLabel}</p>
            <p className={styles.directionsAddress}>{data.directions.roadAddress}</p>
            {data.directions.phone ? (
              <p className={`${styles.directionsPhone} mono-nums`}>Tel. {data.directions.phone}</p>
            ) : null}
          </div>
          <div className={styles.directionsList}>
            {data.directions.sections.map((section) => (
              <section key={section.title} className={styles.directionsGroup}>
                <h3 className={styles.directionsGroupTitle}>{section.title}</h3>
                <ul className={styles.directionsLines}>
                  {section.lines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </RevealSection>

      <RevealSection>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Account</h2>
          <p className={styles.message} style={{ marginBottom: "1.25rem" }}>
            <span style={{ display: "block", fontSize: "0.88rem", lineHeight: 1.75 }}>
              전해주시는 축하의 마음은 소중하게 간직하여
              <br />
              좋은 부부의 모습으로 보답하겠습니다.
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

      <RevealSection>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Guestbook</h2>
          <form className={styles.guestbookForm} onSubmit={onSubmitGuestbook}>
            <div className={styles.guestbookFormTop}>
              <input
                className={styles.guestbookInput}
                type="text"
                placeholder="이름"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                maxLength={30}
                required
              />
              <input
                className={styles.guestbookInput}
                type="password"
                placeholder="비밀번호"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                minLength={4}
                maxLength={20}
                required
              />
            </div>
            <textarea
              className={styles.guestbookTextarea}
              placeholder="축하 메시지를 남겨주세요."
              value={formMessage}
              onChange={(e) => setFormMessage(e.target.value)}
              maxLength={500}
              rows={4}
              required
            />
            <button className={styles.guestbookSubmit} type="submit" disabled={submitting}>
              {submitting ? "등록 중..." : "방명록 남기기"}
            </button>
          </form>

          {guestbookError ? <p className={styles.guestbookError}>{guestbookError}</p> : null}

          <div className={styles.guestbookList}>
            {guestbookLoading ? (
              <p className={styles.guestbookEmpty}>방명록을 불러오는 중...</p>
            ) : entries.length === 0 ? (
              <p className={styles.guestbookEmpty}>첫 축하 메시지를 남겨주세요.</p>
            ) : (
              pagedEntries.map((entry) => (
                <article key={entry.id} className={styles.guestbookItem}>
                  <div className={styles.guestbookItemHead}>
                    <div className={styles.guestbookHeadLine}>
                      <p className={styles.guestbookName}>{entry.name}</p>
                      <p className={styles.guestbookDate}>{formatGuestbookDate(entry.created_at)}</p>
                    </div>
                    <button
                      type="button"
                      className={styles.guestbookDeleteIconButton}
                      aria-label={openedDeleteId === entry.id ? "삭제 입력 닫기" : "삭제 입력 열기"}
                      onClick={() =>
                        setOpenedDeleteId((prev) => (prev === entry.id ? null : entry.id))
                      }
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </div>
                  <p className={styles.guestbookMessage}>{entry.message}</p>
                  {openedDeleteId === entry.id ? (
                    <div className={styles.guestbookDeleteRow}>
                      <input
                        className={styles.guestbookDeleteInput}
                        type="password"
                        placeholder="삭제 비밀번호"
                        value={deletePasswordById[entry.id] ?? ""}
                        onChange={(e) =>
                          setDeletePasswordById((prev) => ({ ...prev, [entry.id]: e.target.value }))
                        }
                        minLength={4}
                        maxLength={20}
                      />
                      <button
                        type="button"
                        className={styles.guestbookDeleteButton}
                        disabled={deletingId === entry.id}
                        onClick={() => void onDeleteGuestbook(entry.id)}
                      >
                        {deletingId === entry.id ? "삭제 중..." : "삭제"}
                      </button>
                    </div>
                  ) : null}
                </article>
              ))
            )}
          </div>
          {!guestbookLoading && entries.length > GUESTBOOK_PAGE_SIZE ? (
            <div className={styles.guestbookPagination}>
              <button
                type="button"
                className={styles.guestbookPageButton}
                onClick={() => setGuestbookPage((prev) => Math.max(1, prev - 1))}
                disabled={guestbookPage <= 1}
              >
                이전
              </button>
              <div className={styles.guestbookPageNumbers}>
                {guestbookPageNumbers.map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    className={`${styles.guestbookPageNumber} ${
                      guestbookPage === pageNum ? styles.guestbookPageNumberActive : ""
                    }`}
                    onClick={() => setGuestbookPage(pageNum)}
                    aria-current={guestbookPage === pageNum ? "page" : undefined}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className={styles.guestbookPageButton}
                onClick={() => setGuestbookPage((prev) => Math.min(totalGuestbookPages, prev + 1))}
                disabled={guestbookPage >= totalGuestbookPages}
              >
                다음
              </button>
            </div>
          ) : null}
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
          aria-label={`갤러리 ${lightboxIndex + 1}번째, 총 ${galleryImages.length}장`}
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
              src={publicAssetUrl(galleryImages[lightboxIndex].full)}
              alt={`웨딩 사진 ${lightboxIndex + 1}`}
              draggable={false}
              onClick={(e) => e.stopPropagation()}
            />
            <p className={styles.lightboxCounter} aria-hidden>
              {lightboxIndex + 1} / {galleryImages.length}
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
