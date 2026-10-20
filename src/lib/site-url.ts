const SITE_URL_PATTERN = /^https?:\/\/[^\s/]+(\/\S*[^\s/])?$/;

export function validateSiteUrl(value: string | undefined): string {
  if (!value || !SITE_URL_PATTERN.test(value)) {
    throw new Error(
      `VITE_SITE_URL must be an absolute http(s) URL without a trailing slash, got "${value ?? ""}".`,
    );
  }

  return value;
}
