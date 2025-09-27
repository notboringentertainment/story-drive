#!/usr/bin/env node

import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001';

async function testTeamContext() {
  console.log('🧪 Testing Team Mode Context Awareness\n');

  try {
    // 1. Load the team
    console.log('1️⃣ Loading team...');
    const loadResponse = await fetch(`${API_URL}/api/team/load`, {
      method: 'POST'
    });
    const loadData = await loadResponse.json();

    if (!loadData.success) {
      throw new Error('Failed to load team');
    }
    console.log('✅ Team loaded successfully\n');

    // 2. Test with document context
    const documentText = "The dragon soared through the stormy clouds, its emerald scales glistening in the lightning flashes. Below, the kingdom of Avaloria trembled at the beast's mighty roar.";
    const userQuestion = "What feedback do you have about my opening paragraph?";

    console.log('2️⃣ Sending request WITH context:');
    console.log(`   Document: "${documentText.substring(0, 50)}..."`);
    console.log(`   Question: "${userQuestion}"\n`);

    // Format message with context (same format as frontend)
    const messageWithContext = `[Context - Current Paragraph: "${documentText}"]\n\n${userQuestion}`;

    const contextResponse = await fetch(`${API_URL}/api/team/collaborate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: messageWithContext,
        options: {
          shareContext: true,
          synthesize: true,
          maxAgents: 2
        }
      })
    });

    const contextData = await contextResponse.json();

    if (contextData.success && contextData.collaboration) {
      console.log('✅ Team responded with context awareness:\n');

      // Check if agents reference the document content
      let contextAware = false;

      for (const response of contextData.collaboration.responses) {
        const message = response.response || response.message;
        console.log(`\n📝 ${response.agent}:`);
        console.log(`   ${message.substring(0, 200)}...`);

        // Check if agent mentions specific elements from the document
        const keywords = ['dragon', 'emerald', 'scales', 'Avaloria', 'lightning', 'stormy', 'kingdom'];
        const mentionsContent = keywords.some(keyword =>
          message.toLowerCase().includes(keyword.toLowerCase())
        );

        if (mentionsContent) {
          contextAware = true;
          console.log(`   ✅ References document content`);
        } else {
          console.log(`   ⚠️  Doesn't reference document content`);
        }
      }

      console.log('\n' + '='.repeat(50));
      if (contextAware) {
        console.log('🎉 SUCCESS: Team agents are context-aware!');
      } else {
        console.log('❌ FAILURE: Team agents did not reference document content');
      }

    } else {
      console.log('❌ Team collaboration failed:', contextData.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test
testTeamContext();