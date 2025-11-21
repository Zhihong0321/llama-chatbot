#!/usr/bin/env node

/**
 * Simple script to verify API connection
 * Run with: node verify-api.js
 */

const API_URL = 'https://eternalgy-rag-llamaindex-production.up.railway.app';

console.log('🔍 Verifying LlamaIndex API Connection...\n');
console.log(`API URL: ${API_URL}\n`);

async function checkEndpoint(path, description) {
  try {
    console.log(`Testing ${description}...`);
    const response = await fetch(`${API_URL}${path}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${description} - OK`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Response:`, JSON.stringify(data, null, 2).split('\n').slice(0, 5).join('\n'));
      console.log('');
      return true;
    } else {
      console.log(`❌ ${description} - FAILED`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Error:`, data);
      console.log('');
      return false;
    }
  } catch (error) {
    console.log(`❌ ${description} - ERROR`);
    console.log(`   ${error.message}`);
    console.log('');
    return false;
  }
}

async function main() {
  const results = [];
  
  // Test root endpoint
  results.push(await checkEndpoint('/', 'Root endpoint'));
  
  // Test health endpoint
  results.push(await checkEndpoint('/health', 'Health check'));
  
  // Test documents endpoint
  results.push(await checkEndpoint('/documents', 'List documents'));
  
  // Summary
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('═══════════════════════════════════════');
  console.log(`Summary: ${passed}/${total} endpoints accessible`);
  console.log('═══════════════════════════════════════\n');
  
  if (passed === total) {
    console.log('✅ All endpoints are accessible!');
    console.log('✅ API is ready for testing');
    console.log('\nNext steps:');
    console.log('1. Start frontend: npm run dev');
    console.log('2. Open browser: http://localhost:5173');
    console.log('3. Follow REAL-API-TEST-PLAN.md for testing\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some endpoints are not accessible');
    console.log('⚠️  Check API server status and configuration\n');
    process.exit(1);
  }
}

main();
