const STORAGE_KEYS = {
  MESSAGE_COUNT: 'askoosu_message_count',
  POPUP_SHOWN: 'askoosu_wiki_prompt_shown',
  LAST_RESET: 'askoosu_last_reset',
  RATE_LIMIT_REACHED: 'askoosu_legacy_limit_reached',
} as const;

const MESSAGE_LIMIT = Number.POSITIVE_INFINITY;

export class FastfolioTracking {
  static incrementMessageCount(): number {
    if (typeof window === 'undefined') return 0;

    const currentCount = parseInt(
      localStorage.getItem(STORAGE_KEYS.MESSAGE_COUNT) || '0'
    );
    const newCount = currentCount + 1;
    localStorage.setItem(STORAGE_KEYS.MESSAGE_COUNT, newCount.toString());

    return newCount;
  }

  static getMessageCount(): number {
    if (typeof window === 'undefined') return 0;
    return parseInt(localStorage.getItem(STORAGE_KEYS.MESSAGE_COUNT) || '0');
  }

  static shouldShowPopup(): boolean {
    if (typeof window === 'undefined') return false;

    const messageCount = this.getMessageCount();
    const popupShown =
      localStorage.getItem(STORAGE_KEYS.POPUP_SHOWN) === 'true';

    return messageCount >= 2 && !popupShown;
  }

  static hasReachedLimit(): boolean {
    if (typeof window === 'undefined') return false;
    const count = this.getMessageCount();
    return count >= MESSAGE_LIMIT;
  }

  static shouldShowRateLimitPopup(): boolean {
    if (typeof window === 'undefined') return false;
    return false;
  }

  static getRemainingMessages(): number {
    const count = this.getMessageCount();
    return Number.isFinite(MESSAGE_LIMIT)
      ? Math.max(0, MESSAGE_LIMIT - count)
      : Number.POSITIVE_INFINITY;
  }

  static markPopupShown(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.POPUP_SHOWN, 'true');
  }

  static resetSession(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.POPUP_SHOWN, 'false');
    localStorage.setItem(STORAGE_KEYS.LAST_RESET, Date.now().toString());
  }

  static resetForTesting(): void {
    // Admin/testing function to fully reset
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.MESSAGE_COUNT);
    localStorage.removeItem(STORAGE_KEYS.POPUP_SHOWN);
    localStorage.removeItem(STORAGE_KEYS.RATE_LIMIT_REACHED);
    localStorage.removeItem(STORAGE_KEYS.LAST_RESET);
  }
}
