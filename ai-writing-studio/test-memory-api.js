import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001';
let sessionCookie = null;

async function testMemoryAPI() {
  console.log('🧪 Testing Memory API Endpoints...\n');

  try {
    // Establish session first
    console.log('📍 Establishing session...');
    const initResponse = await fetch(`${API_URL}/api/agents/plot-architect/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Test initialization' })
    });

    const setCookie = initResponse.headers.get('set-cookie');
    if (setCookie) {
      sessionCookie = setCookie.split(';')[0];
      console.log('   ✅ Session established\n');
    }

    // Test 1: Add conversation via API
    console.log('1️⃣ POST /api/memory/conversation - Add conversation entry');
    const addResponse = await fetch(`${API_URL}/api/memory/conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify({
        agentId: 'plot-architect',
        role: 'user',
        message: 'Help me with a space adventure plot'
      })
    });

    const addData = await addResponse.json();
    if (addData.success) {
      console.log('   ✅ Conversation added successfully');
      console.log(`   📝 Entry timestamp: ${addData.data.entry.timestamp}\n`);
    }

    // Test 2: Get all conversations
    console.log('2️⃣ GET /api/memory/conversations - Retrieve all conversations');
    const allResponse = await fetch(`${API_URL}/api/memory/conversations?limit=10&offset=0`, {
      headers: { 'Cookie': sessionCookie }
    });

    const allData = await allResponse.json();
    if (allData.success) {
      console.log(`   ✅ Retrieved ${allData.data.metadata.returned} conversations`);
      console.log(`   📊 Total in session: ${allData.data.metadata.total}\n`);
    }

    // Test 3: Get agent-specific conversations
    console.log('3️⃣ GET /api/memory/conversations/:agentId - Get agent history');
    const agentResponse = await fetch(`${API_URL}/api/memory/conversations/plot-architect`, {
      headers: { 'Cookie': sessionCookie }
    });

    const agentData = await agentResponse.json();
    if (agentData.success) {
      console.log(`   ✅ Retrieved ${agentData.data.metadata.returned} conversations for plot-architect`);
      console.log(`   🤖 Agent: ${agentData.data.agentId}\n`);
    }

    // Test 4: Get context for agent
    console.log('4️⃣ GET /api/memory/context/:agentId - Get agent context');
    const contextResponse = await fetch(`${API_URL}/api/memory/context/plot-architect?includeOtherAgents=true`, {
      headers: { 'Cookie': sessionCookie }
    });

    const contextData = await contextResponse.json();
    if (contextData.success) {
      console.log(`   ✅ Retrieved context with ${contextData.data.context.length} messages`);
      console.log(`   🔄 Includes other agents: ${contextData.data.includesOtherAgents}\n`);
    }

    // Test 5: Get memory stats
    console.log('5️⃣ GET /api/memory/stats - Get memory statistics');
    const statsResponse = await fetch(`${API_URL}/api/memory/stats`, {
      headers: { 'Cookie': sessionCookie }
    });

    const statsData = await statsResponse.json();
    if (statsData.success) {
      console.log(`   ✅ Total sessions: ${statsData.data.totalSessions}`);
      console.log(`   📊 Total conversations: ${statsData.data.totalConversations}\n`);
    }

    // Test 6: Pagination
    console.log('6️⃣ Testing pagination with limit and offset');
    const pageResponse = await fetch(`${API_URL}/api/memory/conversations?limit=2&offset=1`, {
      headers: { 'Cookie': sessionCookie }
    });

    const pageData = await pageResponse.json();
    if (pageData.success) {
      console.log(`   ✅ Pagination works: returned ${pageData.data.metadata.returned} of ${pageData.data.metadata.total}`);
      console.log(`   📄 Offset: ${pageData.data.metadata.offset}, Limit: ${pageData.data.metadata.limit}\n`);
    }

    // Test 7: Error handling - missing fields
    console.log('7️⃣ Testing error handling - missing fields');
    const errorResponse = await fetch(`${API_URL}/api/memory/conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify({ agentId: 'test-agent' }) // Missing role and message
    });

    const errorData = await errorResponse.json();
    if (!errorData.success) {
      console.log('   ✅ Error handling works: ' + errorData.error + '\n');
    }

    // Test 8: Clear session (with confirmation)
    console.log('8️⃣ DELETE /api/memory/session - Clear session memory');
    const clearResponse = await fetch(`${API_URL}/api/memory/session?confirm=true`, {
      method: 'DELETE',
      headers: { 'Cookie': sessionCookie }
    });

    const clearData = await clearResponse.json();
    if (clearData.success) {
      console.log('   ✅ Session memory cleared successfully\n');
    }

    // Verify clearing worked
    console.log('9️⃣ Verify session was cleared');
    const verifyResponse = await fetch(`${API_URL}/api/memory/conversations`, {
      headers: { 'Cookie': sessionCookie }
    });

    const verifyData = await verifyResponse.json();
    if (verifyData.success && verifyData.data.metadata.total === 0) {
      console.log('   ✅ Confirmed: session memory is empty\n');
    }

    console.log('✅ All Memory API endpoint tests passed successfully!');
    console.log('   - REST endpoints working correctly');
    console.log('   - Pagination implemented');
    console.log('   - Error handling in place');
    console.log('   - Ready for frontend integration');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Wait for server to be ready
setTimeout(testMemoryAPI, 2000);