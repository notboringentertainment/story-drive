# Story 1.3: Auto-Save Implementation - Brownfield Addition

## User Story

As a writer,
I want my work to be automatically saved,
So that I never lose progress.

## Story Context

**Existing System Integration:**

- Integrates with: TipTap editor module, existing Express.js API, file storage system
- Technology: JavaScript debouncing, localStorage, Express routes, JSON file storage
- Follows pattern: Existing API route patterns, file naming conventions, error handling
- Touch points: Editor update events, `/api/documents` endpoints, storage layer

**Story Dependencies:**

- **Prerequisite:** Story 1.1 (TipTap Editor) and Story 1.2 (Layout) must be complete
- **Blocks:** Story 1.4 (Context Passing) - requires functional save/load for document state
- **Related to:** Epic 2 (Cross-Agent Memory) - both involve document/context persistence
- **Critical:** Must maintain TipTap editor instance reference for Story 1.4 compatibility

## Acceptance Criteria

**Functional Requirements:**

1. Auto-save triggers every 2 minutes for active documents
2. Auto-save triggers after 5 seconds of typing inactivity
3. Save indicator displays "Saving...", "Saved", and "Failed to save" states with timestamps

**Integration Requirements:**

4. Existing agent chat API calls continue uninterrupted during saves
5. New save endpoints follow existing REST API patterns
6. Integration with file storage maintains current directory structure
7. Document saves don't interfere with agent context operations

**Quality Requirements:**

8. Save operations complete in under 100ms for typical documents (<100KB)
9. Version history maintains last 10 saves with timestamps
10. No data loss verified through recovery testing
11. Failed saves trigger retry logic with exponential backoff
12. Documentation updated with save behavior and recovery procedures

## Technical Notes

- **Integration Approach:** Extend existing `/api` routes, use current file storage patterns, implement debounced saves
- **Existing Pattern Reference:** Follow pattern from agent conversation save endpoints (`/api/conversations`)
- **Key Constraints:** Must coexist with agent data storage, respect existing file permissions, handle concurrent saves

## Implementation Details

```javascript
// Auto-save manager following existing patterns
const AutoSaveManager = {
  init: function(editor) {
    this.editor = editor;
    this.saveTimer = null;
    this.intervalTimer = null;
    this.retryCount = 0;

    this.setupAutoSave();
    this.setupSaveIndicator();
  },

  setupAutoSave: function() {
    // Debounced save on content change
    this.editor.on('update', () => {
      this.showStatus('typing');
      clearTimeout(this.saveTimer);
      this.saveTimer = setTimeout(() => {
        this.save();
      }, 5000); // 5 seconds of inactivity
    });

    // Periodic save every 2 minutes
    this.intervalTimer = setInterval(() => {
      if (this.hasUnsavedChanges()) {
        this.save();
      }
    }, 120000); // 2 minutes
  },

  save: async function() {
    this.showStatus('saving');

    const document = {
      content: this.editor.getHTML(),
      timestamp: Date.now(),
      version: this.getNextVersion()
    };

    try {
      const response = await fetch('/api/documents/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(document)
      });

      if (response.ok) {
        this.saveToLocalStorage(document); // Backup
        this.updateVersionHistory(document);
        this.showStatus('saved');
        this.retryCount = 0;
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      this.handleSaveError(error);
    }
  },

  handleSaveError: function(error) {
    this.showStatus('failed');
    console.error('Save failed:', error);

    // Exponential backoff retry
    if (this.retryCount < 3) {
      const delay = Math.pow(2, this.retryCount) * 1000;
      this.retryCount++;
      setTimeout(() => this.save(), delay);
    } else {
      this.notifyUserOfFailure();
    }
  },

  showStatus: function(status) {
    const indicator = document.querySelector('.save-indicator');
    const messages = {
      typing: '...',
      saving: 'Saving...',
      saved: `Saved ${new Date().toLocaleTimeString()}`,
      failed: 'Failed to save - retrying...'
    };

    indicator.textContent = messages[status];
    indicator.className = `save-indicator save-${status}`;
  }
};
```

```javascript
// Express route following existing patterns
app.post('/api/documents/save', authenticate, async (req, res) => {
  try {
    const { content, timestamp, version } = req.body;
    const userId = req.user.id;
    const documentId = req.body.documentId || generateId();

    // Save to file system following existing pattern
    const filePath = path.join(
      config.documentsPath,
      userId,
      `${documentId}-v${version}.json`
    );

    await fs.writeFile(filePath, JSON.stringify({
      content,
      timestamp,
      version,
      userId,
      documentId
    }));

    // Maintain version history
    await updateVersionHistory(userId, documentId, version);

    res.json({ success: true, documentId, version });
  } catch (error) {
    console.error('Document save error:', error);
    res.status(500).json({ error: 'Save failed' });
  }
});
```

## Testing Approach

1. **Unit Tests:**
   - Debounce logic triggers correctly
   - Version numbering increments properly
   - Retry logic with backoff works

2. **Integration Tests:**
   - Saves don't block agent interactions
   - Concurrent saves handled correctly
   - Version history maintained accurately

3. **Recovery Tests:**
   - Documents recoverable from localStorage
   - Version history allows rollback
   - Network failures handled gracefully

## Current Implementation Status

**Completed Components:**
- ✅ Frontend `auto-save-manager.js` created with all required features
- ✅ Backend `/api/documents/save` endpoint implemented in server.js
- ✅ Backend `/api/documents/:documentId` recovery endpoint implemented
- ✅ Version management system (keeps last 10 versions)
- ✅ localStorage backup system implemented
- ✅ Retry logic with exponential backoff implemented

**Remaining Work:**
- ❌ AutoSaveManager not initialized in EditorModule
- ❌ Integration between components not connected
- ❌ End-to-end testing not performed
- ❌ Implementation report not created

## Integration Requirements (TO BE COMPLETED)

**Critical Integration Points:**

### Primary Integration:
The AutoSaveManager needs to be initialized properly while maintaining compatibility with Story 1.4 (Context Passing).

1. **In `editor-module.js` after line 76 (after loadFromStorage):**
```javascript
// Initialize AutoSaveManager if available
if (typeof AutoSaveManager !== 'undefined') {
    // Pass the TipTap editor instance for proper integration
    // Note: AutoSaveManager.init expects editor element but we need to maintain
    // the TipTap instance reference for Story 1.4 context passing
    AutoSaveManager.init(this.editor);
    console.log('✅ AutoSaveManager initialized');

    // Store reference for Story 1.4 context passing
    window.editorInstance = this.editor;
} else {
    console.log('ℹ️ AutoSaveManager not available, using basic save');
}
```

### AutoSaveManager Compatibility Fix:
**IMPORTANT:** The AutoSaveManager currently expects a DOM element but needs updating to work with TipTap editor instance for Story 1.4 compatibility.

2. **Update in `auto-save-manager.js` line 17-30:**
```javascript
init: function(editor) {
    if (this.isInitialized) {
        console.warn('AutoSaveManager already initialized');
        return;
    }

    // Handle both TipTap instance and DOM element
    if (editor && editor.on) {
        // TipTap editor instance passed
        this.editor = editor;
        this.editorElement = editor.options.element;
    } else {
        // DOM element passed (backward compatibility)
        this.editorElement = editor;
        this.editor = null;
    }

    this.documentId = this.getOrCreateDocumentId();
    this.setupAutoSave();
    this.setupSaveIndicator();
    this.loadVersionHistory();

    this.isInitialized = true;
    console.log('✅ AutoSaveManager initialized');
}
```

2. **Verify in `writing-studio.html`:**
   - AutoSaveManager script is loaded (line 225: confirmed present)
   - Script load order is correct (after editor-module.js)

## Testing Checklist (TO BE COMPLETED)

### Integration Testing:
- [ ] Open http://localhost:3001/writing-studio.html
- [ ] Enable editor with toggle button
- [ ] Type content and wait 5 seconds - verify "Saving..." appears
- [ ] Verify "Saved [timestamp]" appears after save completes
- [ ] Check `ai-writing-studio/documents/default-user/` for saved JSON files
- [ ] Make 10+ edits to test version history cleanup
- [ ] Refresh page and verify content loads from server

### Failure Recovery Testing:
- [ ] Stop server while typing
- [ ] Verify "Failed to save - retrying..." appears
- [ ] Verify retry attempts (1s, 2s, 4s delays)
- [ ] Verify localStorage backup contains content
- [ ] Restart server and verify save resumes

### Concurrent Usage Testing:
- [ ] Open agent chat while editing document
- [ ] Send messages to agents while auto-save is active
- [ ] Verify no performance degradation
- [ ] Verify no console errors

## Definition of Done

- [ ] AutoSaveManager properly initialized in EditorModule
- [ ] Auto-save triggers after 5 seconds of inactivity
- [ ] Auto-save triggers every 2 minutes for active documents
- [ ] Save indicator shows correct states with timestamps
- [ ] Documents save to server filesystem
- [ ] Version history maintains last 10 versions
- [ ] localStorage backup works on save failure
- [ ] No interference with agent chat operations
- [ ] All tests in checklist pass
- [ ] Implementation report created (story-1.3-implementation-report.md)

## Risk and Compatibility Check

**Minimal Risk Assessment:**

- **Primary Risk:** Save operations interfere with agent API calls or cause data corruption
- **Mitigation:** Separate save queue, file locking, atomic writes, localStorage backup
- **Rollback:** Disable auto-save via flag, manual save still available, recover from localStorage

**Compatibility Verification:**

- [x] No breaking changes to existing APIs (new endpoints only)
- [x] Database changes are additive only (new document storage)
- [x] UI changes follow existing status indicator patterns
- [x] Performance impact is negligible (<100ms saves)

## Deployment Notes

- Deploy with Stories 1.1 and 1.2
- Monitor save endpoint performance
- Track save failure rates
- Verify file system has adequate space
- Test under load (multiple users saving simultaneously)

## Estimation

- **Development:** 4 hours
- **Testing:** 2 hours
- **API integration:** 1 hour
- **Total:** 7 hours (1 day)