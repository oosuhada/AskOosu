type SearchParamsLike = Pick<URLSearchParams, 'get'> | null | undefined;

const DEBUG_UI_ENABLED =
  process.env.NEXT_PUBLIC_ASKOOSU_DEBUG_UI_ENABLED === 'true';

export function isAskOosuDebugUiEnabled(searchParams?: SearchParamsLike) {
  if (!DEBUG_UI_ENABLED) return false;

  const params = searchParams ?? getBrowserSearchParams();
  return params?.get('debug') === 'true';
}

function getBrowserSearchParams() {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search);
}
