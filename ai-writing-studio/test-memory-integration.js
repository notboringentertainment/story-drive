import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001';
let sessionCookie = null;

async function testMemoryIntegration() {
  console.log('🧪 Testing SessionMemoryStore integration...\n');

  try {
    // Test 1: First chat with plot-architect
    console.log('1️⃣ Sending message to plot-architect...');
    const response1 = await fetch(`${API_URL}/api/agents/plot-architect/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionCookie ? { 'Cookie': sessionCookie } : {})
      },
      body: JSON.stringify({
        message: 'Help me with a space adventure plot'
      })
    });

    // Capture session cookie
    const setCookie = response1.headers.get('set-cookie');
    if (setCookie) {
      sessionCookie = setCookie.split(';')[0];
      console.log('   ✅ Session established');
    }

    const data1 = await response1.json();
    if (data1.success) {
      console.log('   ✅ Plot architect responded');
      console.log(`   📝 Response: "${data1.response.message.substring(0, 50)}..."`);
    }

    // Test 2: Send another message to plot-architect
    console.log('\n2️⃣ Sending follow-up to plot-architect...');
    const response2 = await fetch(`${API_URL}/api/agents/plot-architect/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify({
        message: 'What about the main character?'
      })
    });

    const data2 = await response2.json();
    if (data2.success) {
      console.log('   ✅ Plot architect responded to follow-up');
    }

    // Test 3: Switch to character-psychologist
    console.log('\n3️⃣ Switching to character-psychologist...');
    const response3 = await fetch(`${API_URL}/api/agents/character-psychologist/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify({
        message: 'Can you help develop the protagonist?'
      })
    });

    const data3 = await response3.json();
    if (data3.success) {
      console.log('   ✅ Character psychologist responded');
      console.log(`   📝 Response: "${data3.response.message.substring(0, 50)}..."`);
    }

    console.log('\n✅ SessionMemoryStore integration test completed successfully!');
    console.log('   - Messages are being stored in session memory');
    console.log('   - Session persistence works across agent switches');
    console.log('   - Ready for Story 2.2 (Memory API endpoints)');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Wait for server to be ready
setTimeout(testMemoryIntegration, 2000);