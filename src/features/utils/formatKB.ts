export function formatKB(bytes: number) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}