# 🔬 Saksham AI (SentinelAI) — Solution Architecture & Improvement Roadmap

## 1. हम स्कैन कैसे कर रहे हैं? (How We Scan Right Now)

Saksham AI का स्कैनिंग इंजन 2 लेयर्स पर काम करता है: **Automated Live Probing Engine** + **Gemini AI Threat Analysis Engine**.

### 📡 Phase 1: Live HTTP Probing & Asset Discovery (`scannerEngine.js`)
1. **HTTP/HTTPS Connection Probe**:
   - टारगेट URL पर लाइव HTTP Request भेजता है।
   - Server Status, Latency (Response Time ms), और Server Banners चेक करता है।
2. **Security Header Inspection**:
   - **Content-Security-Policy (CSP)** (XSS सुरक्षा)
   - **Strict-Transport-Security (HSTS)** (HTTPS एन्फोर्समेंट)
   - **X-Frame-Options** (Clickjacking सुरक्षा)
   - **X-Content-Type-Options** (MIME-Sniffing सुरक्षा)
   - **Access-Control-Allow-Origin (CORS)** (API Data Leakage)
3. **HTML & JS Bundle Parsing**:
   - HTML रिस्पॉन्स से `<script src="...">`, `href="..."`, और API एंडपॉइंट्स (जैसे `/api/v1/...`, `/auth/...`) एक्सट्रैक्ट करता है।
   - अटैक सरफेस (Attack Surface Assets) की लिस्ट तैयार करता है।

### ⚡ Phase 2: 8-Stage Assessment Pipeline (`assessmentWorker.js`)
स्कैनर 8 रियल-टाइम चरणों (Stages) से गुजरता है:
1. `reconnaissance`: डोमेन, सर्वर बैनर और बेसिक कनेक्टिविटी चेक।
2. `endpointDiscovery`: एसेट और एंडपॉइंट्स की खोज।
3. `technologyAnalysis`: स्टैक (React, Express, Node.js) का पता लगाना।
4. `securityChecks`: हेडर्स, CORS और मिसकॉन्फ़िगरेशन ऑडिट।
5. `verification`: पाई गई कमियों का सत्यापन (Verification status check)।
6. `aiAnalysis`: Gemini AI द्वारा थ्रेट इम्पैक्ट और सीवीएसएस (CVSS) विश्लेषण।
7. `riskScoring`: weighted deduction फार्मूला द्वारा 0–100 का **Security Score** कैलकुलेशन।
8. `reportGeneration`: रिपोर्ट तैयार करना और डेटाबेस में सेव करना।

---

## 2. हम क्या-क्या यूज़ कर रहे हैं? (Tech Stack & Components Used)

| लेयर (Layer) | टेक्नोलॉजी / टूल (Technology Used) | रोल / कार्य (Role & Function) |
| :--- | :--- | :--- |
| **Frontend UI** | React 19 + Vite + TailwindCSS | डार्क SOC डैशबोर्ड, रिस्पॉन्सिव लेआउट |
| **Animations** | Framer Motion | स्मूथ ट्रांजिशन, मोडल एनीमेशन, टोस्ट स्लाइड |
| **Data Flow UI** | Custom SVG & Recharts | Attack surface डेटा फ्लो लाइन्स और सेवेरिटी पाई चार्ट |
| **Sound Engine** | Native Web Audio API | शून्य लेटेंसी वाले साइबर साउंड इफ़ेक्ट (`alert`, `toast`, `click`) |
| **Backend Core** | Node.js + Express.js | REST APIs, सेशंस, ऑथेंटिकेशन |
| **Database** | MongoDB + Mongoose | प्रोजेक्ट्स, टारगेट्स, असेसमेंट्स और फाइंडिंग्स स्टोरेज |
| **Real-time Sync** | Socket.io | लाइव स्कैन प्रोग्रेस और एक्टिविटी स्ट्रीमिंग |
| **AI Threat Engine** | Google Gemini 2.5 Flash (`@google/genai`) | स्वचालित थ्रेट समरी, CVSS एनालिसिस, और फिक्स गाइड |

---

## 3. इसे और बेहतर (Improve) कैसे करें? (Future Enhancements & Features to Add)

यदि आप इस प्रोजेक्ट को एक कमर्शियल/प्रॉडक्शन-ग्रेड SaaS SOC प्रोडक्ट में बदलना चाहते हैं, तो निम्नलिखित फ़ीचर्स जोड़े जा सकते हैं:

### 🚀 1. Dynamic Headless Crawler (Playwright / Puppeteer Integration)
- **Problem**: वर्तमान में बेसिक HTML रिस्पॉन्स से लिंक एक्सट्रैक्ट होते हैं। स्पै (SPA - Single Page Apps) में जावास्क्रिप्ट एग्जीक्यूट होने के बाद दिखने वाले AJAX एंडपॉइंट्स मिस हो सकते हैं।
- **Improvement**: **Headless Chrome / Playwright** जोड़ें जो पेजों को रेंडर करके सभी इनविजिबल API कॉल्स और DOM फॉर्म्स ऑटो-कैप्चर करे।

### 🛡️ 2. Deep DAST Vulnerability Payloads (Nuclei / OWASP ZAP Integration)
- **Problem**: वर्तमान में केवल नॉन-डैमेजिंग हेडर्स और स्ट्रक्चरल असेसमेंट होता है।
- **Improvement**: **Nuclei Engine** या **OWASP ZAP API** इंटीग्रेट करें जो SQL Injection, Cross-Site Scripting (XSS), SSRF, और Command Injection के लिए सेफ पेलोड्स टेस्ट करे।

### 📜 3. Automated Fix-Patch Generator (AI Auto-Remediation)
- **Problem**: डेवलपर को फिक्स करने के लिए कोड खुद लिखना पड़ता है।
- **Improvement**: Gemini AI से 1-क्लिक **Automated Patch Snippets** जनरेट करवाएं (जैसे Nginx Config snippet, Express HSTS middleware code, CSP header snippet, Dockerfile hardening script)।

### ⏱️ 4. Scheduled Continuous Scanning (Cron Jobs)
- **Problem**: अभी स्कैन मैन्युअली ट्रिगर करना पड़ता है।
- **Improvement**: **Cron Jobs** जोड़ें ताकि हर 24 घंटे में ऑटोमैटिक बैकग्राउंड स्कैन हो और नया थ्रेट मिलने पर डेवलपर को तुरंत ईमेल/स्लैक अलर्ट जाए।

### 📊 5. PDF / Executive Security Report Export
- **Problem**: यूजर को डैशबोर्ड पर ही रिपोर्ट दिखती है।
- **Improvement**: 1-क्लिक **Enterprise PDF Report Generation** (जैसे OWASP Top-10 Compliance Report) ताकि क्लाइंट्स या ऑडिटर्स को शेयर किया जा सके।
