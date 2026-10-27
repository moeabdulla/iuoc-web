/* Original IUoC mark; paired with the same wordmark in both navigation areas. */
/* eslint-disable @next/next/no-img-element */
export function Brand() {
  return (
    <span className="iuoc-brand">
      <span className="iuoc-brand-mark" aria-hidden="true">
        <img
          className="iuoc-emblem"
          src="/brand/iuoc-emblem.png"
          width="40"
          height="40"
          alt=""
        />
      </span>
      <span>Project IUoC</span>
    </span>
  );
}
