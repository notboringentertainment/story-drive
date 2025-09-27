// Test script for auto-save functionality
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001';

async function testAutoSave() {
    console.log('Testing Auto-Save API Endpoint...\n');

    // Test 1: Save a document
    console.log('Test 1: Saving a document...');
    const saveResponse = await fetch(`${API_URL}/api/documents/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            documentId: 'test_doc_123',
            content: '<p>This is a test document for auto-save functionality.</p>',
            timestamp: Date.now(),
            version: 1,
            wordCount: 8
        })
    });

    const saveResult = await saveResponse.json();
    console.log('Save response:', saveResult);

    if (saveResult.success) {
        console.log('✅ Document saved successfully\n');
    } else {
        console.log('❌ Failed to save document\n');
        return;
    }

    // Test 2: Load the document
    console.log('Test 2: Loading the saved document...');
    const loadResponse = await fetch(`${API_URL}/api/documents/${saveResult.documentId}`);
    const loadResult = await loadResponse.json();

    if (loadResult.success) {
        console.log('✅ Document loaded successfully');
        console.log('Document content:', loadResult.document.content.substring(0, 50) + '...');
        console.log('Version:', loadResult.document.version);
    } else {
        console.log('❌ Failed to load document');
    }

    // Test 3: Save a new version
    console.log('\nTest 3: Saving version 2...');
    const version2Response = await fetch(`${API_URL}/api/documents/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            documentId: 'test_doc_123',
            content: '<p>This is version 2 of the test document with more content.</p>',
            timestamp: Date.now(),
            version: 2,
            wordCount: 11
        })
    });

    const version2Result = await version2Response.json();
    if (version2Result.success) {
        console.log('✅ Version 2 saved successfully');
    }

    // Test 4: Test performance (should be under 100ms)
    console.log('\nTest 4: Performance test...');
    const startTime = Date.now();

    const perfResponse = await fetch(`${API_URL}/api/documents/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            documentId: 'perf_test_' + Date.now(),
            content: '<p>Performance test document with some content to measure save time.</p>'.repeat(10),
            timestamp: Date.now(),
            version: 1,
            wordCount: 100
        })
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    if (perfResponse.ok) {
        console.log(`✅ Save completed in ${duration}ms`);
        if (duration < 100) {
            console.log('✅ Performance requirement met (<100ms)');
        } else {
            console.log(`⚠️ Performance requirement not met (${duration}ms > 100ms)`);
        }
    }

    console.log('\n✅ All tests completed!');
}

// Run the tests
testAutoSave().catch(console.error);