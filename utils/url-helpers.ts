export const addCacheBuster = (url: string | null | undefined): string => {
    if (!url) return '';
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${Date.now()}`;
}; 