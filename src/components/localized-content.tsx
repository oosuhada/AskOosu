import type { ReactNode } from 'react';

export type LocalizedValue = {
  ko: ReactNode;
  en: ReactNode;
};

export function LocalizedText({ ko, en }: LocalizedValue) {
  return (
    <>
      <span className="lang-ko" lang="ko">
        {ko}
      </span>
      <span className="lang-en" lang="en">
        {en}
      </span>
    </>
  );
}

export function LocalizedBlock({ ko, en }: LocalizedValue) {
  return (
    <>
      <div className="lang-ko" lang="ko">
        {ko}
      </div>
      <div className="lang-en" lang="en">
        {en}
      </div>
    </>
  );
}
