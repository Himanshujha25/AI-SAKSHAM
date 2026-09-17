# 🧮 AI-SAKSHAM — All Calculations Explained Simply (ELI5)

> **"Explain like I'm 5 years old"** — Here is exactly how every score, grade, timer, and number in AI-SAKSHAM is calculated. No fancy jargon.

---

## 1. 🛡️ Overall Security Health Score (0 to 100)

Think of your security score like a school test:
- You start with **100 marks** (Perfect score).
- Every time the scanner finds a bug/vulnerability, it cuts your marks.
- The bigger the danger, the bigger the penalty!

### The Penalty Table:
| Finding Severity | What it means | Marks Deducted |
| :--- | :--- | :---: |
| 🔴 **Critical** | Anyone can hack your server right now | **-15 points** |
| 🟠 **High** | Easy to steal sensitive data | **-10 points** |
| 🟡 **Medium** | Missing security settings / bad config | **-5 points** |
| 🔵 **Low** | Small leak or outdated header | **-2 points** |
| ⚪ **Info** | Just an informational notice | **-0.5 points** |

### The Exact Math Formula:
$$\text{Penalty} = (\text{Critical} \times 15) + (\text{High} \times 10) + (\text{Medium} \times 5) + (\text{Low} \times 2) + (\text{Info} \times 0.5)$$

$$\text{Final Score} = 100 - \text{Penalty}$$
*(Score can never go below 0 or above 100)*

### 📝 Real Example:
Say your API has:
- 1 High bug (-10)
- 2 Medium bugs (-10)
- 1 Low bug (-2)

$$\text{Total Penalty} = 10 + 10 + 2 = 22$$
$$\text{Your Score} = 100 - 22 = \mathbf{78/100}$$

---

## 2. 🚫 What If The Server Is Dead / Unreachable?

If you try to test an API that doesn't exist or is turned off (e.g. `localhost:3001` when it's closed):
- **Old dumb way:** It used to give 98/100 because it couldn't find bugs. That was wrong!
- **Our new way:** **NO SCORE (N/A)**.
- **Why?** You cannot grade a student who didn't show up for the exam!

---

## 3. 🎓 Report Card Letter Grades (A+ to F)

Based on your final score:
- **90 to 100** 👉 **A+** (Fort Knox! Extremely safe)
- **80 to 89** 👉 **A** (Great security, only tiny fixes needed)
- **70 to 79** 👉 **B** (Okay, but has noticeable weaknesses)
- **60 to 69** 👉 **C** (Bad, needs urgent developer fixes)
- **Below 60** 👉 **F** (Danger zone! Vulnerable to hackers)

---

## 4. ⏳ Fix Deadline Timers (SLA Hours)

When a bug is found, how fast do developers HAVE to fix it?
- 🔴 **Critical:** **24 Hours** (Drop everything and fix today)
- 🟠 **High:** **7 Days** (168 hours)
- 🟡 **Medium:** **30 Days** (720 hours)
- 🔵 **Low / Info:** **90 Days** (2,160 hours)

---

## 5. ⚡ CVSS v3.1 Danger Level (0.0 to 10.0)

Every single bug has a standard CVSS score from 0.0 to 10.0:
- **9.0 to 10.0** ➡️ **Critical**
- **7.0 to 8.9** ➡️ **High**
- **4.0 to 6.9** ➡️ **Medium**
- **0.1 to 3.9** ➡️ **Low**
- **0.0** ➡️ **Informational**

---

## 6. 🚀 Bulk API Test Speed & Stats

When you run 8 or 50 APIs in 1-Click:
1. **Latency (ms):** Stopwatch from when the request left to when the answer came back.
   $$\text{ms} = \text{Time Finished} - \text{Time Started}$$
2. **Average Speed:** 
   $$\text{Avg Latency} = \frac{\text{Sum of all API times}}{\text{Total number of APIs}}$$
3. **Status Breakdown:**
   - **2xx / 3xx:** Success (Passed ✅)
   - **4xx:** Client Errors (Wrong token, missing password, or not found ⚠️)
   - **5xx / ERR:** Server Errors or Connection refused ❌

---

## 7. 🤖 Neural Threat Engine AI Triaging

When our fine-tuned AI reviews a finding:
1. It looks at the **HTTP Evidence** (Status, Headers, Body).
2. Checks against **250,000+ CVE database entries**.
3. If real evidence exists 👉 **Confidence 1.0 (Confirmed)**.
4. If no real proof 👉 **Dropped (0% False Positives)**.
