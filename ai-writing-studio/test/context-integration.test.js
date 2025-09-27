#!/usr/bin/env node

/**
 * Context Integration Tests
 * Validates the entire context flow to prevent regression
 */

import fetch from 'node-fetch';
import assert from 'assert';

const API_URL = 'http://localhost:3001';

// Test utilities
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

function log(message, type = 'info') {
  const color = type === 'success' ? colors.green :
                 type === 'error' ? colors.red :
                 colors.yellow;
  console.log(`${color}${message}${colors.reset}`);
}

// Test suite
class ContextIntegrationTests {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  // Test 1: Context extraction from various formats
  async testContextExtraction() {
    log('\n📋 Test 1: Context Extraction');

    const testCases = [
      {
        input: '[Context - Current Paragraph: "The dragon flew"] \n\nWhat do you think?',
        expectedContext: 'The dragon flew',
        expectedType: 'current_paragraph'
      },
      {
        input: '[Context: "Test content"]\n\nReview this',
        expectedContext: 'Test content',
        expectedType: 'generic'
      },
      {
        input: 'Just a normal message',
        expectedContext: null,
        expectedType: 'none'
      }
    ];

    for (const testCase of testCases) {
      const response = await fetch(`${API_URL}/api/debug/validate-context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: testCase.input })
      });

      const result = await response.json();

      if (testCase.expectedContext) {
        assert(result.valid, 'Context should be valid');
        assert(result.extracted.hasContext, 'Should have context');
        assert.equal(result.extracted.type, testCase.expectedType, `Type should be ${testCase.expectedType}`);
      } else {
        assert(!result.extracted.hasContext, 'Should not have context');
      }
    }

    log('✅ Context extraction tests passed', 'success');
    return true;
  }

  // Test 2: Context injection into system prompts
  async testContextInjection() {
    log('\n📋 Test 2: Context Injection');

    const response = await fetch(`${API_URL}/api/debug/test-injection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt: 'You are a helpful assistant.',
        context: 'The user is writing about dragons.',
        agentName: 'Plot Architect'
      })
    });

    const result = await response.json();

    assert(result.injected.includes('DOCUMENT CONTEXT'), 'Should include context header');
    assert(result.injected.includes('dragons'), 'Should include the actual context');
    assert(result.injected.includes('Plot Architect'), 'Should include agent name');

    log('✅ Context injection tests passed', 'success');
    return true;
  }

  // Test 3: End-to-end context flow
  async testEndToEndFlow() {
    log('\n📋 Test 3: End-to-End Context Flow');

    const response = await fetch(`${API_URL}/api/debug/test-context-flow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'plot-architect',
        message: 'What do you think about this opening?',
        context: 'It was a dark and stormy night when the dragon appeared.'
      })
    });

    const result = await response.json();

    assert(result.success, 'Flow should succeed');
    assert(result.steps.length >= 4, 'Should have at least 4 steps');

    // Verify each step
    for (const step of result.steps) {
      assert(step.success, `Step ${step.step} should succeed`);
    }

    // Check that context was used
    const agentStep = result.steps.find(s => s.step === 'Agent Processing');
    assert(agentStep?.contextUsed, 'Agent should use context');

    log('✅ End-to-end flow tests passed', 'success');
    return true;
  }

  // Test 4: Team mode context handling
  async testTeamModeContext() {
    log('\n📋 Test 4: Team Mode Context');

    // First, load the team
    const loadResponse = await fetch(`${API_URL}/api/team/load`, {
      method: 'POST'
    });

    const loadResult = await loadResponse.json();
    assert(loadResult.success, 'Team should load successfully');

    // Test team with context
    const message = '[Context - Current Paragraph: "The hero entered the castle"]\n\nHow can I improve this opening?';

    const response = await fetch(`${API_URL}/api/team/collaborate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: message,
        options: {
          shareContext: true,
          maxAgents: 2
        }
      })
    });

    const result = await response.json();

    assert(result.success, 'Team collaboration should succeed');
    assert(result.collaboration?.responses?.length > 0, 'Should have team responses');

    // Check if responses reference the context
    const hasContextReference = result.collaboration.responses.some(r => {
      const text = (r.response || r.message || '').toLowerCase();
      return text.includes('castle') || text.includes('hero') || text.includes('opening');
    });

    assert(hasContextReference, 'At least one agent should reference the context');

    log('✅ Team mode context tests passed', 'success');
    return true;
  }

  // Test 5: Metrics and monitoring
  async testMetrics() {
    log('\n📋 Test 5: Metrics and Monitoring');

    const response = await fetch(`${API_URL}/api/debug/metrics`);
    const result = await response.json();

    assert(result.service, 'Should have service metrics');
    assert(typeof result.service.totalRequests === 'number', 'Should track total requests');
    assert(typeof result.service.contextRequests === 'number', 'Should track context requests');
    assert(result.service.contextRate, 'Should calculate context rate');

    log('✅ Metrics tests passed', 'success');
    return true;
  }

  // Run all tests
  async runAll() {
    log('\n🧪 Starting Context Integration Tests\n');

    // Check if debug mode is enabled
    const healthResponse = await fetch(`${API_URL}/api/health`);
    const health = await healthResponse.json();

    if (!health.debugMode) {
      log('⚠️  Debug mode is not enabled. Set DEBUG_CONTEXT=true in .env', 'error');
      log('    Some tests will be skipped.', 'error');
    }

    const tests = [
      { name: 'Context Extraction', fn: () => this.testContextExtraction() },
      { name: 'Context Injection', fn: () => this.testContextInjection() },
      { name: 'End-to-End Flow', fn: () => this.testEndToEndFlow() },
      { name: 'Team Mode Context', fn: () => this.testTeamModeContext() },
      { name: 'Metrics', fn: () => this.testMetrics() }
    ];

    for (const test of tests) {
      try {
        if (!health.debugMode && test.name !== 'Team Mode Context') {
          log(`⏭️  Skipping ${test.name} (debug mode required)`, 'error');
          continue;
        }

        await test.fn();
        this.passed++;
      } catch (error) {
        log(`❌ ${test.name} failed: ${error.message}`, 'error');
        console.error(error.stack);
        this.failed++;
      }
    }

    // Summary
    log('\n' + '='.repeat(50));
    log(`\n📊 Test Results:`, 'info');
    log(`   ✅ Passed: ${this.passed}`, 'success');
    log(`   ❌ Failed: ${this.failed}`, this.failed > 0 ? 'error' : 'success');

    if (this.failed === 0) {
      log('\n🎉 All tests passed! Context flow is working correctly.', 'success');
    } else {
      log('\n⚠️  Some tests failed. Check the context implementation.', 'error');
      process.exit(1);
    }
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${API_URL}/api/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Main
async function main() {
  const serverRunning = await checkServer();

  if (!serverRunning) {
    log('❌ Server is not running. Start it with: npm start', 'error');
    process.exit(1);
  }

  const tests = new ContextIntegrationTests();
  await tests.runAll();
}

main().catch(error => {
  log(`Fatal error: ${error.message}`, 'error');
  console.error(error);
  process.exit(1);
});