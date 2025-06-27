import { runOpenAITests } from './openai-api.test';

// Test runner utility
export class TestRunner {
  static async runAllTests(): Promise<void> {
    console.log('🧪 SmartVIN Test Suite');
    console.log('=====================\n');
    
    try {
      // Run OpenAI API tests
      await runOpenAITests();
      
      console.log('\n✅ All test suites completed!');
      
    } catch (error) {
      console.error('\n❌ Test suite failed:', error);
      throw error;
    }
  }
  
  static async runOpenAITestsOnly(): Promise<void> {
    console.log('🤖 OpenAI API Tests Only');
    console.log('========================\n');
    
    await runOpenAITests();
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--openai-only')) {
    TestRunner.runOpenAITestsOnly().catch(console.error);
  } else {
    TestRunner.runAllTests().catch(console.error);
  }
}