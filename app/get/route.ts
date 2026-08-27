import { type NextRequest, NextResponse } from 'next/server';

/**
 * `iuoc.ca/get` — one link that lands on the right store.
 *
 * The app used to share a store URL chosen by `Platform.select`, which picks
 * the store the SENDER is on. Sharing is the one feature where the sender and
 * the receiver are different people by definition, so every iPhone user who
 * sent the app to an Android friend sent them a page they could not install
 * from. Deciding here moves the choice onto the device that actually opens it.
 *
 * Keeping the ids here rather than in the app also means a listing URL can
 * change without an app release — links already sent keep working.
 */

const APP_STORE = 'https://apps.apple.com/app/id6803721415';
const PLAY_STORE =
  'https://play.google.com/store/apps/details?id=com.iuoc.app';
/** Desktop and anything unrecognised: the page that explains what this is. */
const FALLBACK = 'https://iuoc.ca/app';

export const dynamic = 'force-dynamic';

export function GET(request: NextRequest) {
  const ua = request.headers.get('user-agent') ?? '';

  // iPadOS reports a desktop Safari UA, so `iPad` alone is not enough — the
  // Macintosh + touch combination is how an iPad has identified itself since
  // iPadOS 13. Checking it keeps iPad users out of the Play Store.
  const isApple =
    /iPhone|iPad|iPod/i.test(ua) ||
    (/Macintosh/i.test(ua) && /Mobile|Touch/i.test(ua));
  const isAndroid = /Android/i.test(ua);

  const target = isApple ? APP_STORE : isAndroid ? PLAY_STORE : FALLBACK;

  // 302, not 301. A permanent redirect is cached by the browser and by every
  // intermediary, and this destination is per-device — one cached 301 from a
  // phone would send that browser to the wrong store forever.
  return NextResponse.redirect(target, 302);
}
