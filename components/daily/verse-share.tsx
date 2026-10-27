"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Copy, Download, Share2, X } from "lucide-react";
import {
  shareTranslation,
  verseLink,
  type ShareVerse,
} from "@/lib/daily/verse-share";
import {
  DEFAULT_TRANSLATION_KEY,
  DEFAULT_TRANSLATION,
} from "@/lib/daily/quran-config";
import { addPngAttribution } from "@/lib/daily/png-attribution";
import catalog from "@/public/quran/v1.1-b6/catalog.json";
import "./verse-share.css";

export function VerseShare({
  verse,
  translationKey = DEFAULT_TRANSLATION_KEY,
  translationName = DEFAULT_TRANSLATION.name,
  translationAttribution = DEFAULT_TRANSLATION.attribution,
  onClose,
}: {
  verse: ShareVerse;
  translationKey?: string;
  translationName?: string;
  translationAttribution?: string;
  onClose: () => void;
}) {
  const card = useRef<HTMLDivElement>(null);
  const [appearance, setAppearance] = useState("light");
  const [prepared, setImage] = useState<{
    file: File;
    url: string;
    key: string;
  } | null>(null);
  const [status, setStatus] = useState("");
  const [failedKey, setFailed] = useState("");
  const [retry, setRetry] = useState(0);
  const link = verseLink(
    typeof window === "undefined" ? "https://iuoc.ca" : window.location.origin,
    verse,
    translationKey,
  );
  const source =
    catalog.translations.find((t) => t.key === translationKey) ??
    catalog.translations[0];
  const credits = `${translationAttribution} · version ${source.version} · ${source.license}
Arabic: Tanzil Project · https://tanzil.net/`;
  const imageKey = `${verse.surah}:${verse.ayah}:${translationAttribution}:${appearance}:${retry}`;
  const image = prepared?.key === imageKey ? prepared : null;
  const failed = failedKey === imageKey;
  useEffect(() => {
    let cancelled = false,
      objectUrl = "";
    async function prepare() {
      try {
        await document.fonts.ready;
        const node = card.current;
        if (!node) return;
        await Promise.all(
          Array.from(node.querySelectorAll("img"), (img) => img.decode()),
        );
        const { toBlob } = await import("html-to-image");
        const rendered = await toBlob(node, {
          pixelRatio: 3,
          preferredFontFormat: "woff2",
          width: 360,
        });
        if (!rendered) throw new Error("Image unavailable");
        const png = addPngAttribution(
          new Uint8Array(await rendered.arrayBuffer()),
          `${credits}

${catalog.notice}`,
        );
        const blob = new Blob([png.buffer], { type: "image/png" });
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setImage({
          file: new File(
            [blob],
            `iuoc-quran-${verse.surah}-${verse.ayah}.png`,
            { type: "image/png" },
          ),
          url: objectUrl,
          key: imageKey,
        });
      } catch {
        if (!cancelled) setFailed(imageKey);
      }
    }
    void prepare();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [verse, translationName, translationAttribution, imageKey, credits]);
  async function copy(text: string, message: string) {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(message);
    } catch {
      setStatus("Copy unavailable. Select and copy the link below.");
    }
  }
  async function shareImage() {
    if (!image) return;
    try {
      if (navigator.canShare?.({ files: [image.file] })) {
        await navigator.share({
          files: [image.file],
          title: `${verse.name} ${verse.surah}:${verse.ayah}`,
          text: `${link}

${credits}`,
        });
      } else
        setStatus(
          "Use Download image to save this card, then share it from your photos or files.",
        );
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError"))
        setStatus(
          "Sharing unavailable here. You can download the image instead.",
        );
    }
  }
  async function shareLink() {
    if (!navigator.share) {
      await copy(link, "Verse link copied.");
      return;
    }
    try {
      await navigator.share({
        title: `${verse.name} ${verse.surah}:${verse.ayah}`,
        url: link,
      });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError"))
        setStatus("Use Copy verse link to share this ayah.");
    }
  }
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="verse-share-overlay" />
        <Dialog.Content
          className="verse-share-dialog"
          aria-describedby="verse-share-description"
        >
          <header>
            <div>
              <Dialog.Title>Share an ayah</Dialog.Title>
              <Dialog.Description id="verse-share-description">
                {verse.name} · {verse.surah}:{verse.ayah}
              </Dialog.Description>
            </div>
            <Dialog.Close aria-label="Close sharing">
              <X size={21} />
            </Dialog.Close>
          </header>
          <div className="verse-share-body">
            <div
              className="verse-share-style"
              role="group"
              aria-label="Image appearance"
            >
              <button
                aria-pressed={appearance === "light"}
                onClick={() => setAppearance("light")}
              >
                Ivory
              </button>
              <button
                aria-pressed={appearance === "dark"}
                onClick={() => setAppearance("dark")}
              >
                Emerald
              </button>
            </div>
            <div className="verse-share-preview">
              <VerseImageCard verse={verse} appearance={appearance} />
              <div className="verse-share-export" aria-hidden="true">
                <VerseImageCard
                  cardRef={card}
                  verse={verse}
                  appearance={appearance}
                />
              </div>
            </div>
            <div className="verse-share-actions">
              <button onClick={shareImage} disabled={!image}>
                <Share2 size={17} /> Share image
              </button>
              {image ? (
                <a href={image.url} download={image.file.name}>
                  <Download size={17} /> Download image
                </a>
              ) : (
                <span role="status">
                  {failed ? "Image could not be prepared." : "Preparing image…"}
                </span>
              )}
              {failed && (
                <button onClick={() => setRetry((n) => n + 1)}>
                  Retry image
                </button>
              )}
              <button onClick={shareLink} disabled={!link}>
                <Share2 size={17} /> Share link
              </button>
              <button
                onClick={() => copy(link, "Verse link copied.")}
                disabled={!link}
              >
                <Copy size={17} /> Copy verse link
              </button>
              <button
                onClick={() =>
                  copy(
                    `${verse.arabic}\n\n${shareTranslation(verse.translation, verse.ayah)}\n\n${verse.name} ${verse.surah}:${verse.ayah}\n${credits}\n${link}`,
                    "Verse text copied.",
                  )
                }
              >
                <Copy size={17} /> Copy text
              </button>
            </div>
            <label className="verse-share-link">
              Direct verse link
              <input
                readOnly
                value={link}
                onFocus={(event) => event.currentTarget.select()}
              />
            </label>
            <details className="verse-share-credits">
              <summary>Sources</summary>
              <p>
                {translationAttribution} · {source.version}
              </p>
              <a href={source.url} target="_blank" rel="noreferrer">
                Translation source
              </a>
              <p>
                Arabic:{" "}
                <a href="https://tanzil.net/" target="_blank" rel="noreferrer">
                  Tanzil Project
                </a>{" "}
                · CC BY 3.0
              </p>
            </details>
            <p role="status" className="verse-share-status">
              {status}
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function VerseImageCard({
  verse,
  appearance,
  cardRef,
}: {
  verse: ShareVerse;
  appearance: string;
  cardRef?: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={cardRef}
      className="verse-image-card"
      data-appearance={appearance}
    >
      <div className="verse-image-ornament" aria-hidden="true">
        ✦
      </div>
      <p className="verse-image-arabic" lang="ar" dir="rtl">
        {verse.arabic}
      </p>
      <p className="verse-image-translation">
        {shareTranslation(verse.translation, verse.ayah)}
      </p>
      <p className="verse-image-reference">
        {verse.name} · Quran {verse.surah}:{verse.ayah}
      </p>
      <div className="verse-image-brand">
        {/* Same-origin original mark is intentionally embedded in PNG exports. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/iuoc-emblem.png" alt="" />
        Project IUoC · iuoc.ca
      </div>
    </div>
  );
}
