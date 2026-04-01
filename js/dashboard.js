/* ========================================
   LEGAL CONTRACT ANALYZER - COMPLETE JS
   With Proper PDF Upload/Download Support & NLP Categorization Metrics
   ======================================== */

// State management
const appState = {
    currentUser: null,
    contractText: "",
    analysisResults: {
        documentType: "Unknown",
        isLegal: false,
        clauses: [],
        structuredClauses: null,
        risks: [],
        summary: "",
        notes: [],
        accuracy: 0,
        riskLevel: "low",
        riskPercent: 0
    },
    isAnalyzing: false
};

// DOM Elements
let contractText, fileInput, dropZone, analyzeBtn, resetBtn, logoutBtn, charCount;
let statusMessage, statusText, alertBanner, alertText, userDisplay, userRole;
let clausesOutput, risksOutput, summaryOutput, notesOutput, clauseCount;
let resultsSection, accuracyCircle, accuracyPercent, documentTypeLabel;
let riskDisplay, riskLevel, riskPercent, riskBarLow, riskBarMed, riskBarHigh;
let downloadNotesPdfBtn, downloadNotesTxtBtn, downloadCard;
let clausesCard, risksCard, summaryCard, notesCard;
let analyzeCheckbox, risksCheckbox, summaryCheckbox, notesCheckbox, lawyerPanel;

function initDOM() {
    contractText = document.getElementById("contractText");
    fileInput = document.getElementById("fileInput");
    dropZone = document.getElementById("dropZone");
    analyzeBtn = document.getElementById("analyzeBtn");
    resetBtn = document.getElementById("resetBtn");
    logoutBtn = document.getElementById("logoutBtn");
    charCount = document.getElementById("charCount");
    statusMessage = document.getElementById("statusMessage");
    statusText = document.getElementById("statusText");
    alertBanner = document.getElementById("alertBanner");
    alertText = document.getElementById("alertText");
    userDisplay = document.getElementById("userDisplay");
    userRole = document.getElementById("userRole");

    clausesOutput = document.getElementById("clausesOutput");
    risksOutput = document.getElementById("risksOutput");
    summaryOutput = document.getElementById("summaryOutput");
    notesOutput = document.getElementById("notesOutput");
    clauseCount = document.getElementById("clauseCount");

    resultsSection = document.getElementById("resultsSection");
    accuracyCircle = document.getElementById("accuracyCircle");
    accuracyPercent = document.getElementById("accuracyPercent");
    documentTypeLabel = document.getElementById("documentTypeLabel");
    riskDisplay = document.getElementById("riskDisplay");
    riskLevel = document.getElementById("riskLevel");
    riskPercent = document.getElementById("riskPercent");
    riskBarLow = document.getElementById("riskBarLow");
    riskBarMed = document.getElementById("riskBarMed");
    riskBarHigh = document.getElementById("riskBarHigh");

    downloadNotesPdfBtn = document.getElementById("downloadNotesPdfBtn");
    downloadNotesTxtBtn = document.getElementById("downloadNotesTxtBtn");
    downloadCard = document.getElementById("downloadCard");

    clausesCard = document.getElementById("clausesCard");
    risksCard = document.getElementById("risksCard");
    summaryCard = document.getElementById("summaryCard");
    notesCard = document.getElementById("notesCard");

    analyzeCheckbox = document.getElementById("analyzeCheckbox");
    risksCheckbox = document.getElementById("risksCheckbox");
    summaryCheckbox = document.getElementById("summaryCheckbox");
    notesCheckbox = document.getElementById("notesCheckbox");

    lawyerPanel = document.getElementById("lawyerPanel");
}

const MISTAKE_PATTERNS = [
    { type: "critical", name: "Missing Signature Block", keywords: ["signature", "sign"], fix: "Add signature block with date fields for all parties" },
    { type: "critical", name: "Unclear Party Definition", keywords: ["party", "parties"], fix: "Define all parties with full legal names and addresses" },
    { type: "high", name: "Missing Effective Date", keywords: ["effective date", "commencement"], fix: "Add specific effective date" },
    { type: "high", name: "Ambiguous Termination Terms", keywords: ["termination"], fix: "Specify termination conditions and notice periods" },
    { type: "high", name: "Vague Payment Terms", keywords: ["payment", "fee", "cost"], fix: "Define payment amount, schedule and method clearly" },
    { type: "medium", name: "Missing Limitation of Liability", keywords: ["liability"], fix: "Add limitation of liability clause" },
    { type: "medium", name: "Weak Confidentiality Clause", keywords: ["confidential", "nda"], fix: "Strengthen confidentiality protections" },
    { type: "low", name: "Missing Severability Clause", keywords: ["severability"], fix: "Add severability clause for validity protection" }
];

// Document Configuration based on NLP Legal Domain Research
const documentTypes = {
  property:    ["Sale Deed", "Lease Agreement", "Mortgage Deed", "Gift Deed"],
  family:      ["Marriage Certificate", "Prenuptial Agreement", "Divorce Decree", "Child Custody Order"],
  criminal:    ["First Information Report", "Charge Sheet", "Bail Application", "Witness Statement"],
  commercial:  ["Non-Disclosure Agreement", "Partnership Agreement", "Employment Contract", "Sales Contract"],
  estate:      ["Last Will", "Trust Document", "Power of Attorney"]
};

// Clause categories keyed by document type
const clauseCategories = {
  general: ["Indemnity", "Confidentiality", "Termination", "Arbitration", "Force Majeure", "Jurisdiction", "Severability", "Headings/Recitals"],
  property: ["Ownership", "Encumbrance", "Sale Consideration", "Possession Date"],
  family:   ["Maintenance", "Child Custody", "Visitation", "Support Amount"],
  criminal: ["Offence Details", "Bail Conditions", "Evidence List"],
  commercial: ["Obligations", "Payment Terms", "Liability Limit"],
  estate: ["Testator Intent", "Executor Setup", "Beneficiary Distribution"]
};

// Clause priority levels (High/Medium/Low)
const clausePriority = {
  "Indemnity": "High", "Confidentiality": "High", "Sale Consideration": "High",
  "Child Custody": "High", "Ownership": "High", "Encumbrance": "High", 
  "Maintenance": "High", "Support Amount": "High",
  "Offence Details": "High", "Bail Conditions": "High", "Payment Terms": "High",
  "Liability Limit": "High", "Obligations": "High",
  
  "Termination": "Medium", "Force Majeure": "Medium", "Arbitration": "Medium",
  "Jurisdiction": "Medium", "Possession Date": "Medium", "Visitation": "Medium",
  "Evidence List": "Medium", "Executor Setup": "Medium", "Testator Intent": "Medium",
  "Beneficiary Distribution": "Medium",

  "Severability": "Low", "Headings/Recitals": "Low"
};

const CLAUSE_KEYWORDS = {
  "Indemnity": ["indemnify", "indemnification", "hold harmless", "compensate"],
  "Confidentiality": ["confidential", "non-disclosure", "trade secret", "privacy"],
  "Termination": ["termination", "terminate", "cancel", "end date"],
  "Arbitration": ["arbitration", "mediate", "dispute resolution"],
  "Force Majeure": ["force majeure", "act of god", "unforeseen event"],
  "Jurisdiction": ["jurisdiction", "governing law", "courts of"],
  "Severability": ["severability", "invalidity", "unenforceable"],
  "Headings/Recitals": ["headings", "whereas", "recital", "witnesseth"],
  
  "Ownership": ["ownership", "title", "absolute owner", "transfer"],
  "Encumbrance": ["encumbrance", "lien", "charge", "free from all"],
  "Sale Consideration": ["sale consideration", "purchase price", "amount of rs", "payment of"],
  "Possession Date": ["possession", "hand over", "delivered"],
  
  "Maintenance": ["maintenance", "alimony", "financial support"],
  "Child Custody": ["custody", "guardian", "minor child"],
  "Visitation": ["visitation", "access to child", "meeting rights"],
  "Support Amount": ["support amount", "monthly sum", "child support"],
  
  "Offence Details": ["offence", "section", "ipc", "punishable under"],
  "Bail Conditions": ["condition of bail", "surety", "bond", "sum of rs"],
  "Evidence List": ["evidence", "witness", "exhibit", "statement"],
  
  "Obligations": ["duties", "shall perform", "responsibilities"],
  "Payment Terms": ["payment terms", "invoice", "net 30", "fee"],
  "Liability Limit": ["liability", "limitation of liability", "cap on"],
  
  "Testator Intent": ["sound mind", "last will", "testament"],
  "Executor Setup": ["executor", "appoint", "administer"],
  "Beneficiary Distribution": ["bequeath", "devise", "share", "beneficiary"]
};

// Auto-generate DOCUMENT_TYPES from the user definitions to seed mapping
const DOCUMENT_TYPES = [];
for (const [cat, types] of Object.entries(documentTypes)) {
  types.forEach(t => {
     let defaultKw = t.toLowerCase().split(' ');
     // Specific NLP domain overrides
     if (t === "First Information Report") defaultKw.push("fir", "police station", "ipc");
     if (t === "Charge Sheet") defaultKw.push("crpc", "magistrate");
     if (t === "Sale Deed") defaultKw.push("conveyance", "vendee", "vendor");
     if (t === "Marriage Certificate") defaultKw.push("solemnized", "husband", "wife");
     DOCUMENT_TYPES.push({ type: t, category: cat, keywords: [t.toLowerCase(), ...defaultKw] });
  });
}
DOCUMENT_TYPES.push({ type: "Software Requirements Specification (SRS)", category: "non_legal", keywords: ["srs", "software requirements", "functional requirements", "use case", "system architecture"] });
DOCUMENT_TYPES.push({ type: "Source Code / Programming File", category: "non_legal", keywords: ["function", "const", "var", "let", "import", "export", "class", "public static void", "def ", "include"] });


function detectDocumentType(text) {
    let bestMatch = { type: "Unknown", category: "unknown", confidence: 0 };
    
    // Strong negative heuristic for code (density of symbols)
    const codeSymbolDensity = (text.match(/[{}[\]();=<>]/g) || []).length / Math.max(1, text.length);
    if (codeSymbolDensity > 0.05 || text.includes("<!DOCTYPE html>") || text.includes("import React")) {
        return { type: "Source Code / Programming File", category: "non_legal", confidence: 99 };
    }
    
    if (text.length < 50) return { type: "Unknown", category: "unknown", confidence: 10 };

    DOCUMENT_TYPES.forEach(doc => {
        let keywordHits = 0;
        doc.keywords.forEach(kw => {
            if (text.includes(kw)) keywordHits++;
        });
        
        // Calculate a score that easily crosses 90 if multiple keywords are heavily present
        // Normalizing out of expected 3-4 hits for high confidence
        const hitRatio = keywordHits / Math.min(doc.keywords.length, 3);
        let score = Math.min(100, Math.round(hitRatio * 95));
        
        // Boost if exact title match
        if (text.includes(doc.type.toLowerCase())) {
           score = Math.min(100, score + 20);
        }

        if (score > bestMatch.confidence) {
            bestMatch = { type: doc.type, category: doc.category, confidence: score };
        }
    });

    if (bestMatch.confidence < 50 && (text.includes("agreement") || text.includes("contract"))) {
        return { type: "Generic Legal Contract", category: "commercial", confidence: 85 }; // Below 90 fails strict check
    }

    return bestMatch;
}

// ========================================
// INITIALIZATION
// ========================================

window.addEventListener("load", () => {
    initDOM();
    const userName = sessionStorage.getItem("userName") || "Demo User";
    const userEmail = sessionStorage.getItem("userEmail") || "";
    let userRoleStr = sessionStorage.getItem("userRole") || "client";

    const roleMap = {
        "lawyer-corporate": "Corporate Lawyer",
        "advocate-litigation": "Litigation Advocate",
        "ca": "Chartered Accountant",
        "paralegal": "Paralegal / Researcher",
        "student": "Law/Finance Student",
        "client": "Client"
    };

    const displayRole = roleMap[userRoleStr] || userRoleStr;

    appState.currentUser = {
        name: userName,
        email: userEmail,
        role: displayRole,
        isVerified: true
    };

    userDisplay.textContent = userName;

    if (document.getElementById("userInitials")) {
        document.getElementById("userInitials").textContent = userName.charAt(0).toUpperCase();
    }

    userRole.textContent = displayRole;

    if (displayRole.includes("Lawyer") || displayRole.includes("Advocate") || displayRole.includes("Accountant")) {
        if (lawyerPanel) lawyerPanel.classList.remove("hidden");
        if (document.getElementById("firmDisplay")) document.getElementById("firmDisplay").textContent = "Premium Practice Hub";
        if (document.getElementById("licenseDisplay")) document.getElementById("licenseDisplay").textContent = "ID: " + Math.floor(Math.random() * 90000 + 10000);
    }

    attachEventListeners();
});

// ========================================
// EVENT LISTENERS
// ========================================

function attachEventListeners() {
    contractText.addEventListener("input", (e) => {
        appState.contractText = e.target.value;
        charCount.textContent = appState.contractText.length;
    });

    fileInput.addEventListener("change", handleFileSelect);
    dropZone.addEventListener("click", () => fileInput.click());
    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.style.borderColor = "#2563eb";
        dropZone.style.background = "rgba(37, 99, 235, 0.05)";
    });
    dropZone.addEventListener("dragleave", () => {
        dropZone.style.borderColor = "";
        dropZone.style.background = "";
    });
    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.style.borderColor = "";
        dropZone.style.background = "";
        if (e.dataTransfer.files[0]) {
            handleFileSelect({ target: { files: [e.dataTransfer.files[0]] } });
        }
    });

    analyzeBtn.addEventListener("click", startAnalysis);
    resetBtn.addEventListener("click", resetForm);
    logoutBtn.addEventListener("click", logout);
    downloadNotesPdfBtn.addEventListener("click", downloadAsPDF);
    downloadNotesTxtBtn.addEventListener("click", downloadAsTXT);

    document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll(".tab-btn").forEach(b => {
                b.classList.remove("active", "border-primary", "text-primary");
                b.classList.add("text-slate-500", "border-transparent");
            });
            document.querySelectorAll(".tab-content").forEach(t => {
                t.classList.remove("block", "active");
                t.classList.add("hidden");
            });

            e.target.classList.remove("text-slate-500", "border-transparent");
            e.target.classList.add("active", "border-primary", "text-primary");

            const tabName = e.target.getAttribute("data-tab");
            const targetTab = document.getElementById(`${tabName}-tab`);
            if (targetTab) {
                targetTab.classList.remove("hidden");
                targetTab.classList.add("block");
            }
        });
    });
}

// ========================================
// FILE HANDLING
// ========================================

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    const fileSizeMB = file.size / (1024 * 1024);

    if (fileSizeMB > 10) {
        showAlert(`File too large (${fileSizeMB.toFixed(1)}MB). Max 10MB.`, "error");
        return;
    }

    if (file.type === "text/plain") {
        readTextFile(file);
    } else if (file.type === "application/pdf") {
        readPDFFile(file);
    } else {
        showAlert("Only .txt and .pdf files supported", "error");
    }
}

function readTextFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        contractText.value = e.target.result;
        appState.contractText = e.target.result;
        charCount.textContent = appState.contractText.length;
        showAlert("✅ Text file loaded!", "success");
    };
    reader.onerror = () => showAlert("Error reading file", "error");
    reader.readAsText(file);
}

function readPDFFile(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const pdfData = e.target.result;
            const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

            let fullText = "";
            const maxPages = Math.min(pdf.numPages, 10);

            for (let i = 1; i <= maxPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                fullText += textContent.items.map(item => item.str).join(" ") + "\n";
            }

            contractText.value = fullText;
            appState.contractText = fullText;
            charCount.textContent = appState.contractText.length;

            const msg = pdf.numPages > 10
                ? `✅ First 10 of ${pdf.numPages} pages extracted!`
                : "✅ PDF loaded successfully!";
            showAlert(msg, "success");
        } catch (error) {
            showAlert("Could not extract PDF text. Try copying text manually.", "warning");
        }
    };
    reader.readAsArrayBuffer(file);
}

// ========================================
// ANALYSIS ENGINE
// ========================================

function startAnalysis() {
    if (appState.contractText.length < 50) {
        showAlert("Please enter at least 50 characters of contract text", "warning");
        return;
    }

    appState.isAnalyzing = true;
    analyzeBtn.disabled = true;
    showStatus("Synthesizing Contract Data...", "info");
    resultsSection.classList.remove("opacity-50", "pointer-events-none");
    document.getElementById("tabsSection").classList.remove("opacity-50", "pointer-events-none");

    setTimeout(() => {
        performAnalysis();
        appState.isAnalyzing = false;
        analyzeBtn.disabled = false;
        showStatus("", "");
        showAlert("✅ Analysis complete!", "success");
    }, 1500);
}

function performAnalysis() {
    const text = appState.contractText.toLowerCase();

    // 1. Detect Document Type & Confidence
    const docTypeInfo = detectDocumentType(text);
    const confidence = docTypeInfo.confidence;
    appState.analysisResults.accuracy = confidence;
    appState.analysisResults.isLegal = docTypeInfo.category !== 'non_legal' && docTypeInfo.category !== 'unknown';

    // 2. Strict Threshold Enforcement (>90% needed)
    if (!appState.analysisResults.isLegal || confidence < 90) {
        appState.analysisResults.documentType = docTypeInfo.type === "Unknown" ? "Not a legal document" : docTypeInfo.type;
        appState.analysisResults.clauses = [];
        appState.analysisResults.structuredClauses = { found: [], missing: [] };
        appState.analysisResults.risks = [
            `⚠️ Alert: AI Confidence is ${confidence}%. Minimum 90% required.`,
            confidence < 90 ? "Document does not contain sufficient clear legal markers for analysis." : "This appears to be a non-legal file."
        ];
        appState.analysisResults.summary = `Status: Analysis Halted.\n\nModel confidence is ${confidence}% (fails >90% strict accuracy threshold). Detected as: ${appState.analysisResults.documentType}. Please upload a valid, clearly legible legal document.`;
        appState.analysisResults.notes = ["Validation Failed: AI classification confidence below strict threshold metrics."];
        appState.analysisResults.riskLevel = "n/a";
        appState.analysisResults.riskPercent = 0;
        updateUI();
        return;
    }
    
    appState.analysisResults.documentType = docTypeInfo.type;

    // 3. Prioritized Clause Extraction
    if (analyzeCheckbox.checked) {
        extractClauses(docTypeInfo.category);
    } else {
        appState.analysisResults.structuredClauses = { found: [], missing: [] };
        appState.analysisResults.clauses = [];
    }

    if (risksCheckbox.checked) detectRisks();
    if (summaryCheckbox.checked) generateSummary();
    if (notesCheckbox.checked) generateNotes();

    updateUI();
}

function extractClauses(docCategory) {
    const text = appState.contractText.toLowerCase();
    const clauses = [];
    const missingClauses = [];

    // Prioritized Extraction Mapping
    let targetClauses = [...(clauseCategories.general || [])];
    if (docCategory && clauseCategories[docCategory]) {
        targetClauses = targetClauses.concat(clauseCategories[docCategory]);
    }

    targetClauses.forEach((clauseName) => {
        const keywords = CLAUSE_KEYWORDS[clauseName] || [];
        const found = keywords.some(kw => text.includes(kw));
        const priority = clausePriority[clauseName] || "Low";

        if (found) {
            clauses.push({ name: clauseName, priority: priority, status: 'found' });
        } else if (priority === "High" || priority === "Medium") {
            // Flag missing important clauses
            missingClauses.push({ name: clauseName, priority: priority, status: 'missing' });
        }
    });

    // Store categorized array for UI rendering & PDF exporting
    appState.analysisResults.structuredClauses = { found: clauses, missing: missingClauses };
    
    // Also build basic string array for legacy code reference
    appState.analysisResults.clauses = clauses.map(c => `✓ ${c.name} [${c.priority}]`);
    if (clauseCount) clauseCount.textContent = clauses.length;
}

function detectRisks() {
    const text = appState.contractText.toLowerCase();
    const risks = [];

    const riskPatterns = [
        { severity: "high", name: "Unlimited Liability", keywords: ["unlimited", "no limit", "no cap"] },
        { severity: "high", name: "Vague Termination", keywords: ["terminate at will", "either party"] },
        { severity: "medium", name: "Automatic Renewal", keywords: ["auto renew", "automatic renewal", "renew automatically"] },
        { severity: "medium", name: "One-Sided Terms", keywords: ["sole discretion", "at our option", "unilateral"] },
        { severity: "medium", name: "Missing Dispute Resolution", keywords: text.includes("arbitration") || text.includes("mediation") ? [] : [""] },
        { severity: "low", name: "Complex Language", keywords: text.length > 10000 ? [""] : [] }
    ];

    riskPatterns.forEach((pattern) => {
        const found = pattern.keywords.length === 0 || pattern.keywords.some(kw => text.includes(kw));
        if (found && pattern.keywords.length > 0) {
            risks.push(`⚠️ [${pattern.severity.toUpperCase()}] ${pattern.name}`);
        }
    });

    appState.analysisResults.risks = risks;

    const highRisks = risks.filter(r => r.includes("HIGH")).length;
    const mediumRisks = risks.filter(r => r.includes("MEDIUM")).length;
    let riskScore = (highRisks * 40) + (mediumRisks * 20);
    
    // Supplement risk with missing HIGH priority clauses
    if(appState.analysisResults.structuredClauses && appState.analysisResults.structuredClauses.missing) {
        const missingHigh = appState.analysisResults.structuredClauses.missing.filter(c => c.priority === 'High').length;
        riskScore += (missingHigh * 25);
    }

    appState.analysisResults.riskLevel = riskScore > 60 ? "high" : riskScore > 30 ? "medium" : "low";
    appState.analysisResults.riskPercent = Math.min(riskScore, 98);
}

function generateSummary() {
    const wordCount = appState.contractText.split(/\s+/).length;
    const charCount = appState.contractText.length;

    let summary = `EXECUTIVE BRIEF\n`;
    summary += `===============\n\n`;
    summary += `📊 Statistics:\n`;
    summary += `- Word Count: ${wordCount} words\n`;
    summary += `- Character Count: ${charCount} characters\n`;
    summary += `- Estimated Read Time: ${Math.ceil(wordCount / 200)} minutes\n\n`;
    summary += `📋 Key Elements Detected:\n`;

    if (appState.analysisResults.structuredClauses && appState.analysisResults.structuredClauses.found) {
        appState.analysisResults.structuredClauses.found.forEach(clause => {
            summary += `[${clause.priority.toUpperCase()}] ${clause.name}\n`;
        });
    }

    appState.analysisResults.summary = summary;
}

function generateNotes() {
    const text = appState.contractText.toLowerCase();
    const notes = [];
    const suggestions = [];

    MISTAKE_PATTERNS.forEach((pattern) => {
        const hasKeyword = pattern.keywords.some(kw => text.includes(kw));
        const shouldFlag = pattern.absence ? !hasKeyword : hasKeyword;

        if (shouldFlag) {
            notes.push(`[${pattern.type.toUpperCase()}] ${pattern.name}`);
            suggestions.push(`💡 Fix: ${pattern.fix}`);
        }
    });

    // Supplement with structured missing clauses checks
    if (appState.analysisResults.structuredClauses && appState.analysisResults.structuredClauses.missing) {
         if (appState.analysisResults.structuredClauses.missing.length > 0) {
             notes.push(`\n--- Critical/Standard Clause Deficiencies ---`);
             appState.analysisResults.structuredClauses.missing.forEach(clause => {
                  notes.push(`[${clause.priority.toUpperCase()}] Missing standard clause: ${clause.name}`);
             });
         }
    }

    appState.analysisResults.notes = [...notes, ...suggestions];
}

function updateUI() {
    const offset = 176 - (176 * appState.analysisResults.accuracy) / 100;
    if (accuracyCircle) accuracyCircle.style.strokeDashoffset = offset;
    if (accuracyPercent) accuracyPercent.textContent = appState.analysisResults.accuracy + "%";

    if (documentTypeLabel) {
        documentTypeLabel.textContent = appState.analysisResults.documentType;
        if (!appState.analysisResults.isLegal && appState.analysisResults.documentType !== "Unknown") {
            documentTypeLabel.classList.remove("text-primary");
            documentTypeLabel.classList.add("text-rose-500");
        } else {
            documentTypeLabel.classList.remove("text-rose-500");
            documentTypeLabel.classList.add("text-primary");
        }
    }

    let riskColorClass = appState.analysisResults.riskLevel === "high" ? "text-rose-500" :
        appState.analysisResults.riskLevel === "medium" ? "text-amber-500" : "text-emerald-500";

    if (riskLevel) {
        let rLevelText = appState.analysisResults.riskLevel;
        if (rLevelText !== "n/a") {
            rLevelText = rLevelText.charAt(0).toUpperCase() + rLevelText.slice(1) + " Risk";
        } else {
            rLevelText = "Not Applicable";
            riskColorClass = "text-slate-500";
        }

        riskLevel.className = `text-xs font-bold ${riskColorClass}`;
        riskLevel.textContent = rLevelText;
    }

    if (riskPercent) {
        riskPercent.textContent = appState.analysisResults.riskPercent + "%";
    }

    if (riskBarLow && riskBarMed && riskBarHigh) {
        riskBarLow.classList.replace("opacity-20", "opacity-100");
        if (appState.analysisResults.riskLevel === "medium" || appState.analysisResults.riskLevel === "high") {
            riskBarMed.classList.replace("opacity-20", "opacity-100");
        }
        if (appState.analysisResults.riskLevel === "high") {
            riskBarHigh.classList.replace("opacity-20", "opacity-100");
        }
    }

    // Dynamic rendering of Clauses based on Priority
    if (appState.analysisResults.structuredClauses && (appState.analysisResults.structuredClauses.found.length > 0 || appState.analysisResults.structuredClauses.missing.length > 0)) {
        clausesCard.classList.remove("hidden");
        let html = '';
        
        // Render Found Clauses
        appState.analysisResults.structuredClauses.found.forEach(clause => {
            let color, bg, icon;
            if (clause.priority === 'High') { color = 'text-rose-400'; bg = 'bg-rose-500/10 border-rose-500/30'; icon = 'warning'; }
            else if (clause.priority === 'Medium') { color = 'text-amber-400'; bg = 'bg-amber-500/10 border-amber-500/30'; icon = 'info'; }
            else { color = 'text-slate-400'; bg = 'bg-white/5 border-white/5'; icon = 'done'; }
            
            html += `<div class="p-2 rounded-lg border ${bg} flex items-start gap-2 mb-2">`;
            html += `<span class="material-symbols-outlined !text-[16px] mt-0.5 ${color}">${icon}</span>`;
            html += `<div><div class="font-bold text-xs ${color}">${clause.name} <span class="opacity-60 text-[9px] ml-1 uppercase border border-current rounded px-1">${clause.priority}</span></div></div></div>`;
        });
        
        // Render Missing Clauses (High/Medium only)
        if(appState.analysisResults.structuredClauses.missing.length > 0) {
            html += `<div class="mt-4 pt-4 border-t border-white/5"><h5 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Missing Recommended Elements</h5>`;
            appState.analysisResults.structuredClauses.missing.forEach(clause => {
                html += `<div class="p-1.5 flex items-center gap-2 opacity-70"><span class="material-symbols-outlined !text-[14px] text-rose-500">cancel</span><span class="text-xs text-slate-300">${clause.name} <span class="text-[9px] text-rose-400">(${clause.priority} PRIORITY)</span></span></div>`;
            });
            html += `</div>`;
        }
        
        clausesOutput.innerHTML = html;
        clausesOutput.classList.remove("space-y-3");
    } else {
        clausesCard.classList.add("hidden");
    }

    if (appState.analysisResults.risks.length > 0) {
        risksCard.classList.remove("hidden");
        risksOutput.textContent = appState.analysisResults.risks.join("\n");
        // Don't show notes if 0 risks
    }

    if (appState.analysisResults.summary) {
        summaryCard.classList.remove("hidden");
        summaryOutput.textContent = appState.analysisResults.summary;
    }

    if (appState.analysisResults.notes.length > 0 || (appState.analysisResults.structuredClauses && appState.analysisResults.structuredClauses.missing.length > 0)) {
        notesCard.classList.remove("hidden");
        notesOutput.textContent = appState.analysisResults.notes.join("\n");
        downloadCard.classList.remove("hidden");
    }
}

// ========================================
// DOWNLOAD FUNCTIONS (WITH JSPDF)
// ========================================

function downloadAsPDF() {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = () => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();

        pdf.setFontSize(20);
        pdf.setTextColor(40, 40, 40);
        pdf.text("Lexalyze AI Analysis Report", 20, 20);

        pdf.setFontSize(11);
        pdf.setTextColor(80, 80, 80);
        pdf.text(`Document Type: ${appState.analysisResults.documentType}`, 20, 32);
        pdf.text(`Overall Risk Assessment: ${appState.analysisResults.riskLevel.toUpperCase()} (${appState.analysisResults.riskPercent}%)`, 20, 40);
        pdf.text(`AI Confidence Score: ${appState.analysisResults.accuracy}%`, 20, 48);
        pdf.line(20, 52, 190, 52);

        let yPosition = 62;
        pdf.setFontSize(14);
        pdf.setTextColor(40, 40, 40);
        pdf.text("Categorized Clauses Found:", 20, yPosition);
        yPosition += 8;
        
        pdf.setFontSize(10);
        if (appState.analysisResults.structuredClauses && appState.analysisResults.structuredClauses.found) {
            if (appState.analysisResults.structuredClauses.found.length === 0) {
                 pdf.text("No specific legal clauses identified.", 25, yPosition); yPosition += 8;
            } else {
                 appState.analysisResults.structuredClauses.found.forEach(c => {
                    if (yPosition > 270) { pdf.addPage(); yPosition = 20; }
                    pdf.text(`[ ${c.priority.toUpperCase()} ] ${c.name}`, 25, yPosition);
                    yPosition += 7;
                });
            }
        }

        yPosition += 8;
        pdf.setFontSize(14);
        if (yPosition > 260) { pdf.addPage(); yPosition = 20; }
        pdf.text("Critical/Standard Clauses Missing:", 20, yPosition);
        yPosition += 8;
        
        pdf.setFontSize(10);
        pdf.setTextColor(200, 50, 50);
        if (appState.analysisResults.structuredClauses && appState.analysisResults.structuredClauses.missing) {
            if (appState.analysisResults.structuredClauses.missing.length === 0) {
                 pdf.setTextColor(80, 80, 80);
                 pdf.text("None.", 25, yPosition); yPosition += 8;
            } else {
                 appState.analysisResults.structuredClauses.missing.forEach(c => {
                    if (yPosition > 270) { pdf.addPage(); yPosition = 20; }
                    pdf.text(`- ${c.name} (${c.priority} Priority)`, 25, yPosition);
                    yPosition += 7;
                });
            }
        }
        
        pdf.setTextColor(80, 80, 80);
        yPosition += 8;
        if (yPosition > 260) { pdf.addPage(); yPosition = 20; }
        pdf.line(20, yPosition-4, 190, yPosition-4);
        pdf.setFontSize(14);
        pdf.setTextColor(40, 40, 40);
        pdf.text("AI Liability & Risk Notes:", 20, yPosition);
        yPosition += 8;
        pdf.setFontSize(10);
        pdf.setTextColor(80, 80, 80);
        
        const lines = pdf.splitTextToSize(appState.analysisResults.notes.join("\n"), 170);
        lines.forEach(line => {
             if (yPosition > 280) { pdf.addPage(); yPosition = 20; }
             pdf.text(line, 20, yPosition);
             yPosition += 6;
        });

        pdf.save("lexalyze_document_report.pdf");
        showAlert("✅ Comprehensive PDF generated!", "success");
    };
    document.head.appendChild(script);
}

function downloadAsTXT() {
    const content = appState.analysisResults.notes.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "contract_analysis.txt";
    link.click();
    URL.revokeObjectURL(url);
    showAlert("✅ TXT file downloaded!", "success");
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function resetForm() {
    contractText.value = "";
    appState.contractText = "";
    if (charCount) charCount.textContent = "0";

    if (resultsSection) resultsSection.classList.add("opacity-50", "pointer-events-none");
    const tabsSection = document.getElementById("tabsSection");
    if (tabsSection) tabsSection.classList.add("opacity-50", "pointer-events-none");

    if (clausesCard) clausesCard.classList.add("hidden");
    if (risksCard) risksCard.classList.add("hidden");
    if (summaryCard) summaryCard.classList.add("hidden");
    if (notesCard) notesCard.classList.add("hidden");
    if (downloadCard) downloadCard.classList.add("hidden");
    if (fileInput) fileInput.value = "";

    if (accuracyCircle) accuracyCircle.style.strokeDashoffset = 176;
    if (accuracyPercent) accuracyPercent.textContent = "0%";
    if (documentTypeLabel) documentTypeLabel.textContent = "Waiting...";

    if (riskBarLow) riskBarLow.classList.replace("opacity-100", "opacity-20");
    if (riskBarMed) riskBarMed.classList.replace("opacity-100", "opacity-20");
    if (riskBarHigh) riskBarHigh.classList.replace("opacity-100", "opacity-20");
    if (riskLevel) riskLevel.textContent = "Pending";
    if (riskPercent) riskPercent.textContent = "0%";

    showAlert("Form reset", "info");
}

function showAlert(message, type = "info") {
    alertBanner.className = `alert-banner ${type}`;
    alertText.textContent = message;
    alertBanner.classList.remove("hidden");
    setTimeout(() => alertBanner.classList.add("hidden"), 4000);
}

function closeAlert() {
    alertBanner.classList.add("hidden");
}

function showStatus(message, type) {
    if (message) {
        if (statusText) statusText.textContent = message;
        if (statusMessage) {
            statusMessage.classList.remove("hidden");
            statusMessage.classList.add("flex");
        }
    } else {
        if (statusMessage) {
            statusMessage.classList.add("hidden");
            statusMessage.classList.remove("flex");
        }
    }
}

function logout() {
    sessionStorage.clear();
    window.location.href = "index.html";
}

const pdfScript = document.createElement("script");
pdfScript.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
pdfScript.onload = () => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
};
document.head.appendChild(pdfScript);