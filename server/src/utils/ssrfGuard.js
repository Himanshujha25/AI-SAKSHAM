const dns = require('node:dns/promises');
const net = require('node:net');

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    // 0.0.0.0/8
    if (parts[0] === 0) return true;
    // 10.0.0.0/8
    if (parts[0] === 10) return true;
    // 100.64.0.0/10 (Carrier-Grade NAT)
    if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;
    // 127.0.0.0/8 (Loopback)
    if (parts[0] === 127) return true;
    // 169.254.0.0/16 (Link-Local & Cloud Instance Metadata)
    if (parts[0] === 169 && parts[1] === 254) return true;
    // 172.16.0.0/12 (Private Class B)
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16 (Private Class C)
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 192.0.2.0/24 (TEST-NET-1)
    if (parts[0] === 192 && parts[1] === 0 && parts[2] === 2) return true;
    // 198.51.100.0/24 (TEST-NET-2)
    if (parts[0] === 198 && parts[1] === 51 && parts[2] === 100) return true;
    // 203.0.113.0/24 (TEST-NET-3)
    if (parts[0] === 203 && parts[1] === 0 && parts[2] === 113) return true;
    // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
    if (parts[0] >= 224) return true;
  } else if (net.isIPv6(ip)) {
    const norm = ip.toLowerCase();
    if (norm === '::1' || norm === '::') return true;
    if (norm.startsWith('fe80:')) return true; // link-local
    if (norm.startsWith('fc') || norm.startsWith('fd')) return true; // unique local
  }
  return false;
}

async function validateSafeUrl(urlStr, { allowLocalhost = false } = {}) {
  let parsed;
  try {
    parsed = new URL(urlStr);
  } catch (e) {
    throw new Error('Invalid URL format');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP and HTTPS protocols are allowed');
  }

  const hostname = parsed.hostname.toLowerCase();

  // Strict blacklist for known cloud metadata and link-local endpoints
  const BLOCKED_HOSTNAMES = [
    'metadata.google.internal',
    '169.254.169.254',
    'metadata.azure.com',
    'instance-data',
  ];

  if (BLOCKED_HOSTNAMES.includes(hostname) || hostname.endsWith('.metadata.google.internal')) {
    throw new Error('Access to cloud metadata endpoints is prohibited (SSRF prevention)');
  }

  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    if (!allowLocalhost) {
      throw new Error('Access to loopback localhost is prohibited (SSRF prevention)');
    }
    return true;
  }

  // If hostname is directly an IP literal
  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      if (allowLocalhost && (hostname === '127.0.0.1' || hostname === '::1')) {
        return true;
      }
      throw new Error(`Direct IP "${hostname}" is in a private/restricted network range (SSRF prevention)`);
    }
    return true;
  }

  // Resolve DNS to verify all IP destinations
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    for (const record of addresses) {
      if (isPrivateIp(record.address)) {
        if (allowLocalhost && (record.address === '127.0.0.1' || record.address === '::1')) {
          continue;
        }
        throw new Error(`Target hostname resolves to private network IP (${record.address}). SSRF protection blocked request.`);
      }
    }
  } catch (err) {
    if (err.message.includes('SSRF protection') || err.message.includes('private/restricted')) {
      throw err;
    }
    throw new Error(`DNS resolution failed for hostname "${hostname}": ${err.message}`);
  }

  return true;
}

module.exports = { isPrivateIp, validateSafeUrl };
