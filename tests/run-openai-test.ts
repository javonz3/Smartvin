#!/usr/bin/env ts-node

import { runOpenAIIntegrationTest } from './openai-integration-test';

// Simple test runner script
async function main() {
  console.log('🚀 Starting OpenAI API Integration Test...\n');
  
  try {
    await runOpenAIIntegrationTest();
    console.log('\n🎉 Test suite completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Test suite failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}