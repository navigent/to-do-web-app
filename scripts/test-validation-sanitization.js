const API_BASE_URL = 'http://localhost:3000/api'

async function testValidationAndSanitization() {
  console.log('Testing Input Validation and Sanitization...\n')

  const tests = [
    // XSS Protection Tests
    {
      name: 'XSS in task title',
      method: 'POST',
      url: `${API_BASE_URL}/tasks`,
      body: { 
        title: '<script>alert("xss")</script>Test Task',
        description: 'Safe description'
      },
      expectedStatus: 201,
      expectSanitized: true,
      checkField: 'title'
    },
    {
      name: 'XSS in task description',
      method: 'POST',
      url: `${API_BASE_URL}/tasks`,
      body: { 
        title: 'Safe title',
        description: '<img src="x" onerror="alert(1)">Malicious description'
      },
      expectedStatus: 201,
      expectSanitized: true,
      checkField: 'description'
    },
    
    // Input Length Validation
    {
      name: 'Title too long',
      method: 'POST',
      url: `${API_BASE_URL}/tasks`,
      body: { 
        title: 'A'.repeat(300), // Exceeds 255 character limit
        description: 'Valid description'
      },
      expectedStatus: 400,
      expectError: true
    },
    {
      name: 'Description too long',
      method: 'POST',
      url: `${API_BASE_URL}/tasks`,
      body: { 
        title: 'Valid title',
        description: 'A'.repeat(1100) // Exceeds 1000 character limit
      },
      expectedStatus: 400,
      expectError: true
    },
    
    // Dangerous Characters in Search
    {
      name: 'SQL injection in search',
      method: 'GET',
      url: `${API_BASE_URL}/tasks?search=' OR 1=1 --`,
      expectedStatus: 200,
      expectSanitized: true
    },
    {
      name: 'XSS in search parameter',
      method: 'GET',
      url: `${API_BASE_URL}/tasks?search=<script>alert("xss")</script>`,
      expectedStatus: 200,
      expectSanitized: true
    },
    
    // Prototype Pollution Tests
    {
      name: 'Prototype pollution attempt',
      method: 'POST',
      url: `${API_BASE_URL}/tasks`,
      body: { 
        title: 'Test',
        description: 'Test',
        '__proto__': { isAdmin: true },
        'constructor': { prototype: { isAdmin: true } }
      },
      expectedStatus: 400,
      expectError: true
    },
    
    // Rate Limiting Tests
    {
      name: 'Rate limiting test (multiple requests)',
      method: 'BURST',
      url: `${API_BASE_URL}/tasks`,
      requestCount: 35, // Exceeds 30 requests per minute for POST
      body: { title: 'Rate limit test', description: 'Test' },
      expectedStatus: 429,
      expectRateLimit: true
    },
    
    // CSRF Protection Tests
    {
      name: 'Missing Origin header',
      method: 'POST',
      url: `${API_BASE_URL}/tasks`,
      body: { title: 'CSRF test', description: 'Test' },
      removeOrigin: true,
      expectedStatus: 403,
      expectError: true
    },
    
    // Content Type Validation
    {
      name: 'Invalid content type',
      method: 'POST',
      url: `${API_BASE_URL}/tasks`,
      body: 'title=test&description=test', // Form data instead of JSON
      contentType: 'application/x-www-form-urlencoded',
      expectedStatus: 400,
      expectError: true
    },
    
    // Large Request Body
    {
      name: 'Request body too large',
      method: 'POST',
      url: `${API_BASE_URL}/tasks`,
      body: { 
        title: 'Test',
        description: 'A'.repeat(10000), // Very large description
        extraData: 'B'.repeat(50000) // Additional large data
      },
      expectedStatus: 413,
      expectError: true
    },
    
    // Special Characters Sanitization
    {
      name: 'Null bytes in input',
      method: 'POST',
      url: `${API_BASE_URL}/tasks`,
      body: { 
        title: 'Test\x00Title',
        description: 'Description\x00with\x00nulls'
      },
      expectedStatus: 201,
      expectSanitized: true
    },
    
    // Invalid JSON Structure
    {
      name: 'Invalid JSON structure',
      method: 'POST',
      url: `${API_BASE_URL}/tasks`,
      body: '{"title": "test", "description":}', // Invalid JSON
      rawBody: true,
      expectedStatus: 400,
      expectError: true
    }
  ]

  let passed = 0
  let failed = 0
  let createdTaskIds = []

  for (const test of tests) {
    try {
      console.log(`\n📝 Testing: ${test.name}`)
      
      if (test.method === 'BURST') {
        // Rate limiting test - send multiple requests quickly
        const results = await Promise.all(
          Array(test.requestCount).fill().map(() => 
            makeRequest(test.url, test.method, test.body, test)
          )
        )
        
        const rateLimitResponses = results.filter(r => r.status === 429)
        if (rateLimitResponses.length > 0) {
          console.log(`   ✅ PASSED - Rate limiting triggered after ${results.length - rateLimitResponses.length} requests`)
          passed++
        } else {
          console.log(`   ❌ FAILED - Rate limiting not triggered`)
          failed++
        }
        continue
      }

      const response = await makeRequest(test.url, test.method, test.body, test)
      const data = response.status !== 413 ? await response.json().catch(() => ({})) : {}
      
      console.log(`   Status: ${response.status}`)
      console.log(`   Response: ${JSON.stringify(data, null, 2)}`)

      // Store created task IDs for cleanup
      if (response.status === 201 && data.id) {
        createdTaskIds.push(data.id)
      }

      let testPassed = false

      if (response.status === test.expectedStatus) {
        if (test.expectSanitized && response.status === 201) {
          // Check if input was sanitized
          const fieldValue = data[test.checkField] || JSON.stringify(data)
          if (!fieldValue.includes('<script>') && !fieldValue.includes('onerror') && !fieldValue.includes('\x00')) {
            console.log(`   ✅ PASSED - Input was properly sanitized`)
            testPassed = true
          } else {
            console.log(`   ❌ FAILED - Input was not sanitized: ${fieldValue}`)
          }
        } else if (test.expectError && (data.error || response.status >= 400)) {
          console.log(`   ✅ PASSED - Error properly returned`)
          testPassed = true
        } else if (test.expectRateLimit && response.status === 429) {
          console.log(`   ✅ PASSED - Rate limiting enforced`)
          testPassed = true
        } else if (!test.expectError && !test.expectSanitized && !test.expectRateLimit) {
          console.log(`   ✅ PASSED - Request handled correctly`)
          testPassed = true
        }
      } else {
        console.log(`   ❌ FAILED - Expected status ${test.expectedStatus} but got ${response.status}`)
      }

      if (testPassed) {
        passed++
      } else {
        failed++
      }

    } catch (error) {
      console.log(`   ❌ FAILED - Error: ${error.message}`)
      failed++
    }
  }

  // Cleanup created tasks
  console.log(`\n🧹 Cleaning up ${createdTaskIds.length} created tasks...`)
  for (const id of createdTaskIds) {
    try {
      await fetch(`${API_BASE_URL}/tasks/${id}`, { method: 'DELETE' })
    } catch (error) {
      console.log(`   Warning: Could not delete task ${id}`)
    }
  }

  console.log('\n========================================')
  console.log(`Total tests: ${tests.length}`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log('========================================\n')

  if (failed > 0) {
    console.log('⚠️  Some validation/sanitization tests failed!')
  } else {
    console.log('🎉 All validation and sanitization tests passed!')
  }
}

async function makeRequest(url, method, body, options = {}) {
  const requestOptions = {
    method: method === 'BURST' ? 'POST' : method,
    headers: {}
  }

  // Set content type
  if (['POST', 'PUT', 'PATCH'].includes(requestOptions.method)) {
    requestOptions.headers['Content-Type'] = options.contentType || 'application/json'
  }

  // Set origin header for CSRF protection (unless test removes it)
  if (!options.removeOrigin) {
    requestOptions.headers['Origin'] = 'http://localhost:3000'
  }

  // Set body
  if (body !== undefined && ['POST', 'PUT', 'PATCH'].includes(requestOptions.method)) {
    if (options.rawBody) {
      requestOptions.body = body
    } else {
      requestOptions.body = JSON.stringify(body)
    }
  }

  return fetch(url, requestOptions)
}

// Run tests after a short delay to ensure server is ready
setTimeout(testValidationAndSanitization, 1000)