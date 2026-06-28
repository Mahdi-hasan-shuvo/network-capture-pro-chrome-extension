// Minimal ZIP writer (STORE method, no compression).
// Exposes globalThis.NCPZip = { create(files) -> Uint8Array }
// files: Array<{name: string, data: Uint8Array}>
(function () {
  let crcTable = null;
  function buildCrcTable() {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[i] = c >>> 0;
    }
    return t;
  }
  function crc32(buf) {
    if (!crcTable) crcTable = buildCrcTable();
    let c = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function dosTimeDate(d) {
    const t = ((d.getHours() & 0x1F) << 11) | ((d.getMinutes() & 0x3F) << 5) | ((Math.floor(d.getSeconds() / 2)) & 0x1F);
    const dd = (((d.getFullYear() - 1980) & 0x7F) << 9) | (((d.getMonth() + 1) & 0x0F) << 5) | (d.getDate() & 0x1F);
    return { t: t & 0xFFFF, d: dd & 0xFFFF };
  }

  function create(files) {
    const enc = new TextEncoder();
    const now = new Date();
    const { t: dosT, d: dosD } = dosTimeDate(now);

    const local = [];
    const central = [];
    let offset = 0;

    for (const f of files) {
      const nameBytes = enc.encode(f.name);
      const data = f.data instanceof Uint8Array ? f.data : enc.encode(String(f.data ?? ''));
      const crc = crc32(data);
      const size = data.length;

      const lh = new Uint8Array(30 + nameBytes.length);
      const ldv = new DataView(lh.buffer);
      ldv.setUint32(0, 0x04034b50, true);
      ldv.setUint16(4, 20, true);          // version needed
      ldv.setUint16(6, 0x0800, true);      // flags: UTF-8 names
      ldv.setUint16(8, 0, true);           // method: store
      ldv.setUint16(10, dosT, true);
      ldv.setUint16(12, dosD, true);
      ldv.setUint32(14, crc, true);
      ldv.setUint32(18, size, true);
      ldv.setUint32(22, size, true);
      ldv.setUint16(26, nameBytes.length, true);
      ldv.setUint16(28, 0, true);
      lh.set(nameBytes, 30);
      local.push(lh, data);

      const ch = new Uint8Array(46 + nameBytes.length);
      const cdv = new DataView(ch.buffer);
      cdv.setUint32(0, 0x02014b50, true);
      cdv.setUint16(4, 20, true);          // version made by
      cdv.setUint16(6, 20, true);          // version needed
      cdv.setUint16(8, 0x0800, true);
      cdv.setUint16(10, 0, true);
      cdv.setUint16(12, dosT, true);
      cdv.setUint16(14, dosD, true);
      cdv.setUint32(16, crc, true);
      cdv.setUint32(20, size, true);
      cdv.setUint32(24, size, true);
      cdv.setUint16(28, nameBytes.length, true);
      cdv.setUint16(30, 0, true);
      cdv.setUint16(32, 0, true);
      cdv.setUint16(34, 0, true);
      cdv.setUint16(36, 0, true);
      cdv.setUint32(38, 0, true);
      cdv.setUint32(42, offset, true);
      ch.set(nameBytes, 46);
      central.push(ch);

      offset += lh.length + size;
    }

    const centralSize = central.reduce((a, b) => a + b.length, 0);
    const centralOffset = offset;

    const eocd = new Uint8Array(22);
    const edv = new DataView(eocd.buffer);
    edv.setUint32(0, 0x06054b50, true);
    edv.setUint16(4, 0, true);
    edv.setUint16(6, 0, true);
    edv.setUint16(8, files.length, true);
    edv.setUint16(10, files.length, true);
    edv.setUint32(12, centralSize, true);
    edv.setUint32(16, centralOffset, true);
    edv.setUint16(20, 0, true);

    const total = offset + centralSize + 22;
    const out = new Uint8Array(total);
    let p = 0;
    for (const part of local)   { out.set(part, p); p += part.length; }
    for (const part of central) { out.set(part, p); p += part.length; }
    out.set(eocd, p);
    return out;
  }

  globalThis.NCPZip = { create, crc32 };
})();
