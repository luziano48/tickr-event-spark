// Deterministic pseudo-QR pattern for the mockup UI.
function cells(seed, size = 25) {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const out = [];
  for (let i = 0; i < size * size; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    out.push(((h >> 16) & 1) === 1);
  }
  return out;
}
const finder = (r, c, size) => {
  const inBox = (r0, c0) => r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7;
  return inBox(0, 0) || inBox(0, size - 7) || inBox(size - 7, 0);
};
export function QrCode({ value, className = "" }) {
  const size = 25;
  const grid = cells(value, size);
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      role="img"
      aria-label={`QR Code ${value}`}
    >
      <rect width={size} height={size} fill="#fff" />
      {grid.map((on, i) => {
        const r = Math.floor(i / size);
        const c = i % size;
        if (finder(r, c, size)) return null;
        return on ? <rect key={i} x={c} y={r} width={1} height={1} fill="#0b0b0b" /> : null;
      })}
      {[
        [0, 0],
        [0, size - 7],
        [size - 7, 0],
      ].map(([r, c]) => (
        <g key={`${r}-${c}`} fill="#0b0b0b">
          <rect x={c} y={r} width={7} height={7} />
          <rect x={c + 1} y={r + 1} width={5} height={5} fill="#fff" />
          <rect x={c + 2} y={r + 2} width={3} height={3} />
        </g>
      ))}
    </svg>
  );
}
