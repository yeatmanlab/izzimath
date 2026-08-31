// Shared SVG. Used by the build (print sheets) and the browser (screen), so a
// character's avatar and every manipulative are drawn from one source.
//
// Avatars come in two variants:
//   av-*  full colour, for screen
//   ln-*  1-bit line art, for print on a home inkjet (no fills, saves ink)

export const SPRITES = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<symbol id="av-kiwi" viewBox="0 0 64 64">
  <g fill="#C4762F" stroke="#C4762F" stroke-width="1.6" stroke-linejoin="round">
    <path d="M14.4 20.6 5 17.8l8.2 8z"/><path d="M12.2 28.2 2.6 28.4l9.4 6.2z"/><path d="M12.6 36.2 3.6 39.4l10.2 4.2z"/><path d="M16.4 42.6 9.6 48.4l9.6.6z"/>
    <path d="M49.6 20.6 59 17.8l-8.2 8z"/><path d="M51.8 28.2 61.4 28.4l-9.4 6.2z"/><path d="M51.4 36.2 60.4 39.4 50.2 43.6z"/><path d="M47.6 42.6 54.4 48.4l-9.6.6z"/>
  </g>
  <ellipse cx="32" cy="33" rx="21" ry="17.6" fill="#D89B54"/>
  <path d="M32 15.6c11 0 17.4 5.6 17.4 12.4H14.6c0-6.8 6.4-12.4 17.4-12.4z" fill="#EDBB7C"/>
  <ellipse cx="15.6" cy="36" rx="4.2" ry="2.6" fill="#F0805F" opacity=".4"/>
  <ellipse cx="48.4" cy="36" rx="4.2" ry="2.6" fill="#F0805F" opacity=".4"/>
  <ellipse cx="21.4" cy="24.6" rx="5" ry="3.2" fill="#F8DCAF" opacity=".7"/>
  <ellipse cx="42.6" cy="24.6" rx="5" ry="3.2" fill="#F8DCAF" opacity=".7"/>
  <circle cx="22" cy="30.6" r="5.9" fill="#261506"/><circle cx="42" cy="30.6" r="5.9" fill="#261506"/>
  <circle cx="24.2" cy="28.3" r="2.5" fill="#fff"/><circle cx="44.2" cy="28.3" r="2.5" fill="#fff"/>
  <circle cx="20" cy="32.8" r="1.1" fill="#fff" opacity=".7"/><circle cx="40" cy="32.8" r="1.1" fill="#fff" opacity=".7"/>
  <path d="M17.6 38.4c0 6.2 6.4 10.6 14.4 10.6s14.4-4.4 14.4-10.6c0-2.6-6.4-4.2-14.4-4.2s-14.4 1.6-14.4 4.2z" fill="#F6DDB4"/>
  <circle cx="29.4" cy="37.6" r="1.05" fill="#A5561A"/><circle cx="34.6" cy="37.6" r="1.05" fill="#A5561A"/>
  <path d="M21.8 41.2c2.8 4.4 6.2 6.4 10.2 6.4s7.4-2 10.2-6.4" stroke="#A5561A" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <path d="M22.6 47.4c1.7 1.9 3.6 2.8 5.4 2.8 1.5 0 2.9-.6 4-1.8 1.1 1.2 2.5 1.8 4 1.8 1.8 0 3.7-.9 5.4-2.8" fill="none" stroke="#C4762F" stroke-width="2.4" stroke-linecap="round"/>
</symbol>
<symbol id="av-georgie" viewBox="0 0 64 64">
  <path d="M20 32C13 24 9 13.5 10.4 5.8 17 7.4 25.6 15.2 29.2 23.2z" fill="#D2966A"/>
  <path d="M44 32c7-8 11-18.5 9.6-26.2C47 7.4 38.4 15.2 34.8 23.2z" fill="#D2966A"/>
  <path d="M21.6 28.6C16.4 22 13.4 15 14.2 10.4c4.6 1.8 10 7.2 12 13z" fill="#F3A6BD"/>
  <path d="M42.4 28.6C47.6 22 50.6 15 49.8 10.4c-4.6 1.8-10 7.2-12 13z" fill="#F3A6BD"/>
  <ellipse cx="32" cy="35.5" rx="19.2" ry="18.2" fill="#E5AF80"/>
  <ellipse cx="32" cy="28.5" rx="14" ry="9.5" fill="#F1C59B"/>
  <ellipse cx="17.6" cy="40" rx="4.4" ry="2.9" fill="#F58FB0" opacity=".5"/>
  <ellipse cx="46.4" cy="40" rx="4.4" ry="2.9" fill="#F58FB0" opacity=".5"/>
  <circle cx="23.2" cy="34" r="6.4" fill="#2A1418"/><circle cx="40.8" cy="34" r="6.4" fill="#2A1418"/>
  <circle cx="25.5" cy="31.4" r="2.6" fill="#fff"/><circle cx="43.1" cy="31.4" r="2.6" fill="#fff"/>
  <circle cx="21.2" cy="36.4" r="1.2" fill="#fff" opacity=".75"/><circle cx="38.8" cy="36.4" r="1.2" fill="#fff" opacity=".75"/>
  <ellipse cx="32" cy="45" rx="10.2" ry="7.6" fill="#FAE1C6"/>
  <ellipse cx="32" cy="41.2" rx="3.7" ry="2.9" fill="#2A1418"/>
  <ellipse cx="30.7" cy="40.4" rx="1.1" ry=".7" fill="#fff" opacity=".45"/>
  <path d="M26.2 44.8C27.7 50.6 36.3 50.6 37.8 44.8z" fill="#2A1418"/>
  <path d="M29 47.4h6c0 4.6-6 4.6-6 0z" fill="#F4879F"/>
</symbol>
<symbol id="av-flame" viewBox="0 0 64 64">
  <ellipse cx="12.8" cy="19" rx="9.6" ry="9" fill="#A8431C"/>
  <ellipse cx="51.2" cy="19" rx="9.6" ry="9" fill="#A8431C"/>
  <ellipse cx="13.8" cy="20.6" rx="6" ry="5.5" fill="#F7E6CF"/>
  <ellipse cx="50.2" cy="20.6" rx="6" ry="5.5" fill="#F7E6CF"/>
  <path d="M32 12c12 0 20.5 8.5 20.5 20.5S44 55 32 55 11.5 44.5 11.5 32.5 20 12 32 12z" fill="#C0512A"/>
  <path d="M32 15c8.6 0 14.8 5.4 16.4 13H15.6C17.2 20.4 23.4 15 32 15z" fill="#D66D3B"/>
  <path d="M14.6 29.5c-1.2 9 2 16.8 8.4 21 2.7 1.8 5.9 2.6 9 2.6s6.3-.8 9-2.6c6.4-4.2 9.6-12 8.4-21-3.2 5.6-9.4 8.4-17.4 8.4s-14.2-2.8-17.4-8.4z" fill="#FCF1E2"/>
  <ellipse cx="22.4" cy="26.2" rx="5.4" ry="3.8" fill="#FCF1E2"/>
  <ellipse cx="41.6" cy="26.2" rx="5.4" ry="3.8" fill="#FCF1E2"/>
  <path d="M22.6 33.8c-1.4 5.6-1 10.6 1.4 14.6" stroke="#B14A22" stroke-width="3.6" fill="none" stroke-linecap="round" opacity=".9"/>
  <path d="M41.4 33.8c1.4 5.6 1 10.6-1.4 14.6" stroke="#B14A22" stroke-width="3.6" fill="none" stroke-linecap="round" opacity=".9"/>
  <circle cx="22.8" cy="30.4" r="4.7" fill="#2B1508"/><circle cx="41.2" cy="30.4" r="4.7" fill="#2B1508"/>
  <circle cx="24.5" cy="28.7" r="1.8" fill="#fff"/><circle cx="42.9" cy="28.7" r="1.8" fill="#fff"/>
  <path d="M32 39.6c2.4 0 4 1.5 4 3.1s-1.8 2.9-4 2.9-4-1.3-4-2.9 1.6-3.1 4-3.1z" fill="#2B1508"/>
  <path d="M32 45.6v2" stroke="#2B1508" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M27.8 47.6c1.2 2.9 3 3.4 4.2 1.5 1.2 1.9 3 1.4 4.2-1.5" stroke="#2B1508" stroke-width="1.7" fill="none" stroke-linecap="round"/>
</symbol>
<symbol id="av-none" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="21" fill="none" stroke="#93A0C8" stroke-width="2" stroke-dasharray="5 5"/>
  <path d="M32 22v20M22 32h20" stroke="#93A0C8" stroke-width="2.4" stroke-linecap="round"/>
</symbol>
<symbol id="ln-kiwi" viewBox="0 0 64 64">
  <g fill="#111" stroke="#111" stroke-width="1.6" stroke-linejoin="round">
    <path d="M14.4 20.6 5 17.8l8.2 8z"/><path d="M12.2 28.2 2.6 28.4l9.4 6.2z"/><path d="M12.6 36.2 3.6 39.4l10.2 4.2z"/><path d="M16.4 42.6 9.6 48.4l9.6.6z"/>
    <path d="M49.6 20.6 59 17.8l-8.2 8z"/><path d="M51.8 28.2 61.4 28.4l-9.4 6.2z"/><path d="M51.4 36.2 60.4 39.4 50.2 43.6z"/><path d="M47.6 42.6 54.4 48.4l-9.6.6z"/>
  </g>
  <ellipse cx="32" cy="33" rx="21" ry="17.6" fill="none" stroke="#111" stroke-width="2.6"/>
  <circle cx="22" cy="30.6" r="4.4" fill="#111"/><circle cx="42" cy="30.6" r="4.4" fill="#111"/>
  <path d="M17.6 38.4c0 6.2 6.4 10.6 14.4 10.6s14.4-4.4 14.4-10.6c0-2.6-6.4-4.2-14.4-4.2s-14.4 1.6-14.4 4.2z" fill="none" stroke="#111" stroke-width="2"/>
  <circle cx="29.4" cy="37.6" r="1" fill="#111"/><circle cx="34.6" cy="37.6" r="1" fill="#111"/>
  <path d="M21.8 41.2c2.8 4.4 6.2 6.4 10.2 6.4s7.4-2 10.2-6.4" stroke="#111" stroke-width="2.2" fill="none" stroke-linecap="round"/>
</symbol>
<symbol id="ln-georgie" viewBox="0 0 64 64">
  <path d="M20 32C13 24 9 13.5 10.4 5.8 17 7.4 25.6 15.2 29.2 23.2z" fill="none" stroke="#111" stroke-width="2.6" stroke-linejoin="round"/>
  <path d="M44 32c7-8 11-18.5 9.6-26.2C47 7.4 38.4 15.2 34.8 23.2z" fill="none" stroke="#111" stroke-width="2.6" stroke-linejoin="round"/>
  <ellipse cx="32" cy="35.5" rx="19.2" ry="18.2" fill="none" stroke="#111" stroke-width="2.6"/>
  <circle cx="23.2" cy="34" r="4.6" fill="#111"/><circle cx="40.8" cy="34" r="4.6" fill="#111"/>
  <ellipse cx="32" cy="45" rx="10.2" ry="7.6" fill="none" stroke="#111" stroke-width="2"/>
  <ellipse cx="32" cy="41.2" rx="3.4" ry="2.7" fill="#111"/>
  <path d="M26.2 44.8C27.7 50.6 36.3 50.6 37.8 44.8" fill="none" stroke="#111" stroke-width="2.2" stroke-linecap="round"/>
</symbol>
<symbol id="ln-flame" viewBox="0 0 64 64">
  <ellipse cx="12.8" cy="19" rx="9.6" ry="9" fill="none" stroke="#111" stroke-width="2.5"/>
  <ellipse cx="51.2" cy="19" rx="9.6" ry="9" fill="none" stroke="#111" stroke-width="2.5"/>
  <ellipse cx="13.8" cy="20.6" rx="5.4" ry="5" fill="none" stroke="#111" stroke-width="1.6"/>
  <ellipse cx="50.2" cy="20.6" rx="5.4" ry="5" fill="none" stroke="#111" stroke-width="1.6"/>
  <path d="M32 12c12 0 20.5 8.5 20.5 20.5S44 55 32 55 11.5 44.5 11.5 32.5 20 12 32 12z" fill="none" stroke="#111" stroke-width="2.6"/>
  <path d="M14.6 29.5c-1.2 9 2 16.8 8.4 21 2.7 1.8 5.9 2.6 9 2.6s6.3-.8 9-2.6c6.4-4.2 9.6-12 8.4-21" fill="none" stroke="#111" stroke-width="2"/>
  <path d="M22.6 34.6c-1.2 5-.8 9.6 1.4 13.4" stroke="#111" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <path d="M41.4 34.6c1.2 5 .8 9.6-1.4 13.4" stroke="#111" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <circle cx="22.8" cy="30.4" r="4.3" fill="#111"/><circle cx="41.2" cy="30.4" r="4.3" fill="#111"/>
  <path d="M32 39.6c2.4 0 4 1.5 4 3.1s-1.8 2.9-4 2.9-4-1.3-4-2.9 1.6-3.1 4-3.1z" fill="#111"/>
  <path d="M27.8 47.6c1.2 2.9 3 3.4 4.2 1.5 1.2 1.9 3 1.4 4.2-1.5" fill="none" stroke="#111" stroke-width="1.8" stroke-linecap="round"/>
</symbol>
</defs></svg>`;

export const avatar = (ch, cls = '') =>
  `<svg class="${cls}" aria-hidden="true"><use href="#av-${ch}"/></svg>`;
export const lineArt = (ch, cls = '') =>
  `<svg class="${cls}" aria-hidden="true"><use href="#ln-${ch}"/></svg>`;
