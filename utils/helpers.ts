
import * as pvtsutils from 'pvtsutils';

/**
 * Converts an ArrayBuffer to a PEM-formatted string.
 * @param der The ArrayBuffer containing DER-encoded data.
 * @param label The label for the PEM block (e.g., "PRIVATE KEY").
 * @returns The PEM-formatted string.
 */
export function toPEM(der: ArrayBuffer, label: string): string {
  const b64 = pvtsutils.Convert.ToBase64(der);
  const body = b64.replace(/(.{64})/g, "$1\n");
  return `-----BEGIN ${label}-----\n${body}\n-----END ${label}-----\n`;
}

/**
 * Converts an IPv4 or IPv6 string to a hex-encoded ArrayBuffer.
 * @param ip The IP address string.
 * @returns The hex-encoded ArrayBuffer.
 */
export function ipToBuf(ip: string): ArrayBuffer {
  // IPv4
  if (ip.includes('.')) {
    const parts = ip.split('.').map(part => parseInt(part, 10));
    if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
      throw new Error('Invalid IPv4 address');
    }
    return new Uint8Array(parts).buffer;
  }
  // IPv6
  if (ip.includes(':')) {
    const parts = ip.split(':');
    if (parts.length > 8) throw new Error('Invalid IPv6 address');
    
    const hexParts: number[] = [];
    const emptyIndex = parts.indexOf('');
    
    if (emptyIndex !== -1) {
      if (parts.indexOf('', emptyIndex + 1) !== -1) throw new Error('Invalid IPv6 address');
      const start = parts.slice(0, emptyIndex);
      const end = parts.slice(emptyIndex + 1);
      const missing = 8 - (start.length + end.length);
      
      parts.splice(emptyIndex, 1, ...Array(missing).fill('0'));
    }
    
    if (parts.length !== 8) throw new Error('Invalid IPv6 address');

    for (const part of parts) {
      const val = parseInt(part || '0', 16);
      if (isNaN(val) || val < 0 || val > 0xFFFF) throw new Error('Invalid IPv6 address part');
      hexParts.push(val >> 8); // High byte
      hexParts.push(val & 0xFF); // Low byte
    }
    
    return new Uint8Array(hexParts).buffer;
  }
  throw new Error('Invalid IP address format');
}
