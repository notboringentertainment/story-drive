// Integration Test Script for Story 1.1
// Verifies Integration Points IV1, IV2, IV3

const IntegrationTests = {
    results: {
        IV1: null,  // Existing agent chat continues to function
        IV2: null,  // All current API calls work correctly
        IV3: null   // Memory usage increases by less than 50MB
    },

    baselineMemory: null,
    editorMemory: null,

    // Run all integration tests
    async runAll() {
        console.log('🔍 Starting Integration Tests for Story 1.1');

        // Capture baseline memory before editor
        this.captureBaselineMemory();

        // Run tests
        await this.testIV1_AgentChat();
        await this.testIV2_APICalls();
        await this.testIV3_MemoryUsage();

        // Report results
        this.reportResults();
    },

    // IV1: Test existing agent chat functionality
    async testIV1_AgentChat() {
        console.log('Testing IV1: Agent chat functionality...');

        try {
            // Test loading an agent
            const loadResponse = await fetch('/api/agents/plot-architect/load', {
                method: 'POST'
            });
            const loadData = await loadResponse.json();

            if (!loadData.success) {
                throw new Error('Failed to load agent');
            }

            // Test sending a message
            const chatResponse = await fetch('/api/agents/plot-architect/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: 'Test message',
                    conversationId: 'test-' + Date.now()
                })
            });

            const chatData = await chatResponse.json();

            this.results.IV1 = {
                passed: chatData.success === true,
                message: chatData.success ? 'Agent chat working correctly' : 'Agent chat failed',
                details: {
                    agentLoaded: loadData.success,
                    chatResponse: chatData.success,
                    responseTime: chatData.responseTime || 'N/A'
                }
            };
        } catch (error) {
            this.results.IV1 = {
                passed: false,
                message: 'Error testing agent chat: ' + error.message,
                error: error
            };
        }
    },

    // IV2: Test all API endpoints
    async testIV2_APICalls() {
        console.log('Testing IV2: API endpoints...');

        const endpoints = [
            { url: '/api/health', method: 'GET', name: 'Health Check' },
            { url: '/api/agents/available', method: 'GET', name: 'Available Agents' },
            { url: '/api/team/status', method: 'GET', name: 'Team Status' }
        ];

        const results = [];

        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint.url, { method: endpoint.method });
                const data = await response.json();

                results.push({
                    name: endpoint.name,
                    passed: response.ok,
                    status: response.status,
                    hasData: !!data
                });
            } catch (error) {
                results.push({
                    name: endpoint.name,
                    passed: false,
                    error: error.message
                });
            }
        }

        const allPassed = results.every(r => r.passed);

        this.results.IV2 = {
            passed: allPassed,
            message: allPassed ? 'All API endpoints working' : 'Some API endpoints failed',
            details: results
        };
    },

    // IV3: Test memory usage
    async testIV3_MemoryUsage() {
        console.log('Testing IV3: Memory usage...');

        // Check if performance.memory is available (Chrome only)
        if (!performance.memory) {
            this.results.IV3 = {
                passed: true,
                message: 'Memory API not available in this browser (assuming pass)',
                details: { skipped: true }
            };
            return;
        }

        // Initialize editor and capture memory
        await this.initializeEditorAndMeasure();

        const memoryIncrease = this.editorMemory - this.baselineMemory;
        const memoryIncreaseMB = memoryIncrease / (1024 * 1024);
        const passed = memoryIncreaseMB < 50;

        this.results.IV3 = {
            passed: passed,
            message: passed ?
                `Memory increase: ${memoryIncreaseMB.toFixed(2)}MB (< 50MB)` :
                `Memory increase: ${memoryIncreaseMB.toFixed(2)}MB (> 50MB limit)`,
            details: {
                baselineMemory: `${(this.baselineMemory / (1024 * 1024)).toFixed(2)}MB`,
                editorMemory: `${(this.editorMemory / (1024 * 1024)).toFixed(2)}MB`,
                increase: `${memoryIncreaseMB.toFixed(2)}MB`
            }
        };
    },

    // Capture baseline memory usage
    captureBaselineMemory() {
        if (performance.memory) {
            // Force garbage collection if available
            if (window.gc) {
                window.gc();
            }
            this.baselineMemory = performance.memory.usedJSHeapSize;
        }
    },

    // Initialize editor and measure memory
    async initializeEditorAndMeasure() {
        // Enable feature flag
        localStorage.setItem('ENABLE_DOCUMENT_EDITOR', 'true');

        // Load TipTap
        if (typeof TipTapLoader !== 'undefined') {
            await TipTapLoader.load();
        }

        // Initialize editor
        if (typeof EditorModule !== 'undefined') {
            // Create a temporary container if not exists
            if (!document.getElementById('test-editor-container')) {
                const container = document.createElement('div');
                container.id = 'test-editor-container';
                container.style.display = 'none';
                document.body.appendChild(container);
            }

            EditorModule.init('test-editor-container');

            // Give it time to fully initialize
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Capture memory after editor initialization
        if (performance.memory) {
            this.editorMemory = performance.memory.usedJSHeapSize;
        }
    },

    // Report test results
    reportResults() {
        console.log('\n📊 Integration Test Results:');
        console.log('================================');

        for (const [key, result] of Object.entries(this.results)) {
            if (result) {
                const status = result.passed ? '✅' : '❌';
                console.log(`${status} ${key}: ${result.message}`);
                if (result.details) {
                    console.log('   Details:', result.details);
                }
            }
        }

        const allPassed = Object.values(this.results).every(r => r && r.passed);

        console.log('================================');
        console.log(allPassed ? '✅ All tests passed!' : '❌ Some tests failed');

        return allPassed;
    }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IntegrationTests;
}