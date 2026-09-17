const fs = require('fs');
const path = require('path');

// Target directory for custom cybersecurity knowledge files
const AI_FILES_DIR = process.env.AI_FILES_DIR || path.resolve(__dirname, '..', '..', '..', 'ai_files');

let knowledgeCache = {
  files: [],
  combinedText: '',
  lastLoaded: 0,
  stats: { totalFiles: 0, totalBytes: 0, totalWords: 0 },
};

const CACHE_TTL_MS = 30 * 1000; // Refresh check every 30 seconds

/**
 * Ensures the ai_files directory exists.
 */
function ensureDir() {
  try {
    if (!fs.existsSync(AI_FILES_DIR)) {
      fs.mkdirSync(AI_FILES_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('[aiKnowledgeService] Failed to ensure ai_files directory:', err.message);
  }
}

/**
 * Loads and caches all documentation files from ai_files directory.
 */
function loadKnowledge(force = false) {
  const now = Date.now();
  if (!force && knowledgeCache.lastLoaded > 0 && now - knowledgeCache.lastLoaded < CACHE_TTL_MS) {
    return knowledgeCache;
  }

  ensureDir();
  try {
    if (!fs.existsSync(AI_FILES_DIR)) {
      return knowledgeCache;
    }

    const dirents = fs.readdirSync(AI_FILES_DIR, { withFileTypes: true });
    const docs = [];
    let combined = '';
    let totalBytes = 0;
    let totalWords = 0;

    for (const ent of dirents) {
      if (!ent.isFile()) continue;
      const ext = path.extname(ent.name).toLowerCase();
      if (!['.md', '.txt', '.json', '.yaml', '.yml'].includes(ext)) continue;

      const fullPath = path.join(AI_FILES_DIR, ent.name);
      try {
        const stats = fs.statSync(fullPath);
        const content = fs.readFileSync(fullPath, 'utf8');
        const words = content.trim().split(/\s+/).filter(Boolean).length;

        totalBytes += stats.size;
        totalWords += words;

        docs.push({
          name: ent.name,
          sizeBytes: stats.size,
          updatedAt: stats.mtime,
          wordCount: words,
          snippet: content.slice(0, 300),
        });

        combined += `\n\n--- DOCUMENT: ${ent.name} ---\n${content}`;
      } catch (fErr) {
        console.warn(`[aiKnowledgeService] Error reading file ${ent.name}:`, fErr.message);
      }
    }

    knowledgeCache = {
      files: docs,
      combinedText: combined.trim(),
      lastLoaded: now,
      stats: {
        totalFiles: docs.length,
        totalBytes,
        totalWords,
      },
    };

    console.log(`[aiKnowledgeService] Loaded ${docs.length} knowledge documents from ${AI_FILES_DIR} (${totalWords} words)`);
  } catch (err) {
    console.error('[aiKnowledgeService] Failed to load ai_files:', err.message);
  }

  return knowledgeCache;
}

/**
 * Returns a high-density knowledge excerpt to inject into AI system prompts.
 * @param {number} maxChars Maximum character limit for prompt injection
 */
function getKnowledgePromptExcerpt(maxChars = 4000) {
  const cache = loadKnowledge();
  if (!cache.combinedText) return '';

  const snippet = cache.combinedText.length > maxChars
    ? cache.combinedText.slice(0, maxChars) + '\n...[Knowledge excerpt truncated for token safety]...'
    : cache.combinedText;

  return `\n\n[AUTHORITATIVE CYBERSECURITY KNOWLEDGE BASE & PENTERA SPECIFICATIONS (from ai_files)]:\n${snippet}\n\n`;
}

/**
 * Returns summary stats of loaded knowledge files.
 */
function getKnowledgeSummary() {
  const cache = loadKnowledge();
  return {
    directory: AI_FILES_DIR,
    stats: cache.stats,
    files: cache.files,
    lastLoaded: new Date(cache.lastLoaded).toISOString(),
  };
}

module.exports = {
  loadKnowledge,
  getKnowledgePromptExcerpt,
  getKnowledgeSummary,
  AI_FILES_DIR,
};
