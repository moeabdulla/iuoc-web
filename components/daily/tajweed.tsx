import type { CSSProperties } from "react";
import { toRuns, type TajweedSpan } from "@/lib/daily/tajweed";
import {
  TAJWEED_GROUPS,
  SWATCHES,
  DEFAULT_GROUP_SWATCH,
  resolveTajweedColors,
  type TajweedGroupId,
} from "@/lib/daily/tajweed-groups";
export type TajweedChoices = Partial<Record<TajweedGroupId, string>>;

/** Uses the app's unchanged code-point ranges and palette mapping. No generated
 * lettering, text normalisation, or HTML injection. */
export function TajweedText({
  text,
  spans = [],
  enabled,
  choices,
}: {
  text: string;
  spans?: TajweedSpan[];
  enabled: boolean;
  choices: TajweedChoices;
}) {
  if (!enabled) return text;
  const colors = resolveTajweedColors(choices);
  return toRuns(text, spans).map((run, i) => {
    const color = run.rule ? colors[run.rule] : null;
    return color ? (
      <span
        key={i}
        data-tajweed={run.rule}
        className="tajweed-run"
        style={
          {
            "--tajweed-light": color.light,
            "--tajweed-dark": color.dark,
          } as CSSProperties
        }
      >
        {run.text}
      </span>
    ) : (
      run.text
    );
  });
}
export function TajweedSettings({
  enabled,
  setEnabled,
  choices,
  setChoices,
}: {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  choices: TajweedChoices;
  setChoices: (value: TajweedChoices) => void;
}) {
  const colors = resolveTajweedColors(choices);
  return (
    <section className="tajweed-settings" aria-label="Tajweed settings">
      <label className="tajweed-toggle">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />{" "}
        Tajweed colouring
      </label>
      {enabled && (
        <details>
          <summary>Colours and reading guide</summary>
          <p className="daily-muted">
            Choose the colours you learned. Colouring is a reading aid; the
            Quran text stays unchanged.
          </p>
          <div className="daily-controls tajweed-colors">
            {TAJWEED_GROUPS.map((group) => {
              const color = colors[group.rules[0]];
              return (
                <label key={group.id}>
                  <span>
                    <i
                      className="tajweed-swatch"
                      style={
                        {
                          "--tajweed-light": color?.light ?? "currentColor",
                          "--tajweed-dark": color?.dark ?? "currentColor",
                        } as CSSProperties
                      }
                    />
                    {group.label}
                  </span>
                  <select
                    aria-label={`${group.label} colour`}
                    value={choices[group.id] ?? DEFAULT_GROUP_SWATCH[group.id]}
                    onChange={(e) =>
                      setChoices({ ...choices, [group.id]: e.target.value })
                    }
                  >
                    {SWATCHES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <small>{group.description}</small>
                </label>
              );
            })}
          </div>
          <button className="daily-link" onClick={() => setChoices({})}>
            Reset colours
          </button>
          <p className="daily-sources">
            Annotations adapted from{" "}
            <a
              href="https://github.com/cpfair/quran-tajweed"
              target="_blank"
              rel="noreferrer"
            >
              cpfair/quran-tajweed
            </a>{" "}
            under CC BY 4.0, regenerated against this text. Algorithmic
            annotations, not scholar-verified.
          </p>
        </details>
      )}
    </section>
  );
}
