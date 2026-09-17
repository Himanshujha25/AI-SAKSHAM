# Pentera Attack Chain & Kill Chain Methodology

## 1. Attack Progression Model
Modern automated security validation follows a deterministic attack progression graph representing adversary kill chains:

1. **Reconnaissance & Asset Discovery**:
   - Enumerating exposed ports, API gateways, web application endpoints, DNS subdomains, and cloud assets.
   - Passive and active fingerprinting of tech stacks (web servers, reverse proxies, frameworks, CMS).

2. **Initial Foothold & Vulnerability Exploitation**:
   - Exploiting misconfigurations: Missing CORS, open debug endpoints, weak HTTP security headers, missing authentication.
   - Rogue authentication coerced via network protocols (LLMNR / NBT-NS poisoning, SMB relay, NTLM reflection).
   - Insecure direct object references (IDOR / BOLA) allowing unauthenticated data enumeration.

3. **Credential Exposure & Harvesting**:
   - Harvesting plaintext credentials from environment leaks, exposed `.git`, insecure cookie configurations, or unencrypted HTTP transmissions.
   - Password hash capture (NetNTLMv2, Kerberos tickets) followed by offline cracking or pass-the-hash techniques.

4. **Internal Lateral Movement**:
   - Using compromised tokens or credentials to traverse internal services, microservices, and databases.
   - Exploiting internal service trusts and unsegmented network boundaries.

5. **Privilege Escalation**:
   - Escalating from low-privileged standard user / service account to Domain Admin, Cluster Admin, or Root Administrator.
   - Exploiting token forging, misconfigured IAM roles, sudo misconfigurations, or unpatched local privilege escalation (LPE) vulnerabilities.

6. **Impact & Objective Execution**:
   - Exfiltration of sensitive customer data (PII, PCI, secrets).
   - Ransomware simulation: Emulated encryption, backup disruption, shadow copy deletion.
   - RansomwareReady validation ensuring defensive playbooks are battle-tested.

## 2. Scoring & Criticality Taxonomy
- **Score 9.0 - 10.0 (Critical Threat Achievement)**: Complete domain compromise, domain admin credential exposure, remote code execution (RCE), unauthenticated data exfiltration.
- **Score 7.0 - 8.9 (High Threat Vector)**: Validated service credentials, privilege escalation pathways, authenticated command injection, IDOR on critical entities.
- **Score 4.0 - 6.9 (Medium Threat Vector)**: LLMNR/NBT-NS coercion, missing CSRF/CORS protections, exposed internal error traces, weak session entropy.
- **Score 0.1 - 3.9 (Low / Informational)**: Missing security headers (HSTS, CSP), software version disclosure, minor fingerprinting leaks.
