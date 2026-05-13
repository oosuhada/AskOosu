const MAX_REDACTION_INPUT_LENGTH = 8000;

const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const bearerTokenPattern = /\bBearer\s+[A-Za-z0-9._~+/=-]{16,}\b/gi;
const privateKeyPattern =
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g;
const apiKeyPattern =
  /\b(?:sk|pk|rk|xoxb|xoxp|ghp|github_pat|glpat|AIza|AKIA)[A-Za-z0-9._-]{16,}\b/g;
const labeledSecretPattern =
  /\b(?:api[_-]?key|token|secret|password|passwd|pwd|authorization)\s*[:=]\s*["']?[^"'\s]{8,}/gi;
const longSecretPattern =
  /\b(?=[A-Za-z0-9+/_-]*[A-Za-z])(?=[A-Za-z0-9+/_-]*\d)[A-Za-z0-9+/_=-]{32,}\b/g;
const koreanIdNumberPattern = /\b\d{6}[-\s]?[1-4]\d{6}\b/g;
const creditCardPattern = /\b(?:\d[ -]*?){13,19}\b/g;
const phonePattern =
  /(?<!\d)(?:\+?\d{1,3}[-.\s]?)?(?:0\d{1,2}[-.\s]?)?\d{3,4}[-.\s]?\d{4}(?!\d)/g;

export function redactSensitiveText(value: string, maxLength = 2000) {
  const compactValue = value
    .slice(0, MAX_REDACTION_INPUT_LENGTH)
    .replace(/\s+/g, ' ')
    .trim();

  if (!compactValue) return '';

  return compactValue
    .replace(privateKeyPattern, '[REDACTED_SECRET]')
    .replace(bearerTokenPattern, 'Bearer [REDACTED_TOKEN]')
    .replace(emailPattern, '[REDACTED_EMAIL]')
    .replace(koreanIdNumberPattern, '[REDACTED_ID_NUMBER]')
    .replace(creditCardPattern, (match) =>
      isLikelyCreditCard(match) ? '[REDACTED_CARD]' : match
    )
    .replace(phonePattern, '[REDACTED_PHONE]')
    .replace(labeledSecretPattern, (match) => {
      const [label = 'secret'] = match.split(/[:=]/);
      return `${label.trim()}=[REDACTED_SECRET]`;
    })
    .replace(apiKeyPattern, '[REDACTED_TOKEN]')
    .replace(longSecretPattern, '[REDACTED_SECRET]')
    .slice(0, maxLength)
    .trim();
}

export function hasRedactionMarker(value: string) {
  return /\[REDACTED_[A-Z_]+\]/.test(value);
}

function isLikelyCreditCard(value: string) {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (Number.isNaN(digit)) return false;

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}
