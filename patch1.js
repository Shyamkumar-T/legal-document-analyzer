const fs = require('fs');
let content = fs.readFileSync('dashboard.js', 'utf8');

const docConfig = `// Document Configuration based on NLP Legal Domain Research
const documentTypes = {
  property:    ["Sale Deed", "Lease Agreement", "Mortgage Deed", "Gift Deed"],
  family:      ["Marriage Certificate", "Prenuptial Agreement", "Divorce Decree", "Child Custody Order"],
  criminal:    ["First Information Report", "Charge Sheet", "Bail Application", "Witness Statement"],
  commercial:  ["Non-Disclosure Agreement", "Partnership Agreement", "Employment Contract", "Sales Contract"],
  estate:      ["Last Will", "Trust Document", "Power of Attorney"]
};

const clauseCategories = {
  general: ["Indemnity", "Confidentiality", "Termination", "Arbitration", "Force Majeure", "Jurisdiction", "Severability", "Headings/Recitals"],
  property: ["Ownership", "Encumbrance", "Sale Consideration", "Possession Date"],
  family:   ["Maintenance", "Child Custody", "Visitation", "Support Amount"],
  criminal: ["Offence Details", "Bail Conditions", "Evidence List"],
  commercial: ["Obligations", "Payment Terms", "Liability Limit"],
  estate: ["Testator Intent", "Executor Setup", "Beneficiary Distribution"]
};

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

// Auto-generate DOCUMENT_TYPES
const DOCUMENT_TYPES = [];
for (const [cat, types] of Object.entries(documentTypes)) {
  types.forEach(t => {
     let defaultKw = t.toLowerCase().split(' ');
     if (t === "First Information Report") defaultKw.push("fir", "police station", "ipc");
     if (t === "Charge Sheet") defaultKw.push("crpc", "magistrate");
     if (t === "Sale Deed") defaultKw.push("conveyance", "vendee");
     DOCUMENT_TYPES.push({ type: t, category: cat, keywords: [t.toLowerCase(), ...defaultKw] });
  });
}
DOCUMENT_TYPES.push({ type: "Software Requirements Specification (SRS)", category: "non_legal", keywords: ["srs", "software requirements", "functional requirements", "use case", "system architecture"] });
DOCUMENT_TYPES.push({ type: "Source Code / Programming File", category: "non_legal", keywords: ["function", "const", "var", "let", "import", "export", "class", "public static void", "def ", "include"] });

`;

let start1 = content.indexOf('// Document Classification (Enhanced for Advocates');
let end1 = content.indexOf('function detectDocumentType(text) {');
content = content.substring(0, start1) + docConfig + content.substring(end1);

// UPDATE 2: detectDocumentType
const detectDocCode = `function detectDocumentType(text) {
    let bestMatch = { type: "Unknown", category: "unknown", confidence: 0 };
    
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
        
        const hitRatio = keywordHits / Math.min(doc.keywords.length, 3);
        let score = Math.min(100, Math.round(hitRatio * 95));
        
        if (text.includes(doc.type.toLowerCase())) score = Math.min(100, score + 20);

        if (score > bestMatch.confidence) {
            bestMatch = { type: doc.type, category: doc.category, confidence: score };
        }
    });

    if (bestMatch.confidence < 50 && (text.includes("agreement") || text.includes("contract"))) {
        return { type: "Generic Legal Contract", category: "commercial", confidence: 85 };
    }

    return bestMatch;
}

`;
let start2 = content.indexOf('function detectDocumentType(text) {');
let end2 = content.indexOf('// ========================================', start2);
content = content.substring(0, start2) + detectDocCode + content.substring(end2);

// UPDATE 3: performAnalysis
const performCode = `function performAnalysis() {
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
            \`⚠️ Alert: AI Confidence is \${confidence}%. Minimum 90% required. \`,
            confidence < 90 ? "Document does not contain sufficient clear legal markers for analysis." : "This appears to be a non-legal file."
        ];
        appState.analysisResults.summary = \`Status: Analysis Halted.\\n\\nModel confidence is \${confidence}% (fails >90% strict accuracy threshold). Detected as: \${appState.analysisResults.documentType}. Please upload a valid, clearly legible legal document.\`;
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

`;
let start3 = content.indexOf('function performAnalysis() {');
let end3 = content.indexOf('function calculateAccuracy() {');
content = content.substring(0, start3) + performCode + content.substring(end3);


fs.writeFileSync('dashboard.js', content);
console.log('Patch part 1 done');
