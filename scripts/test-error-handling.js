const API_BASE_URL = 'http://localhost:3000/api'

async function testErrorHandling() {
  console.log('Testing Error Handling in API Routes...\n')

  const tests = [
    {
      name: 'Invalid task ID format',
      method: 'GET',
      url: `${API_BASE_URL}/tasks/invalid-id`,
      expectedStatus: 400,
      expectedError: 'Validation Error',
    },
    {
      name: 'Non-existent task',
      method: 'GET',
      url: `${API_BASE_URL}/tasks/cmbajrw2h0000tohkqjqiykso`,
      expectedStatus: 404,
      expectedError: 'ApiError',
    },
    {
      name: 'Invalid request body',
      method: 'POST',
      url: `${API_BASE_URL}/tasks`,
      body: { title: '' }, // Empty title should fail validation
      expectedStatus: 400,
      expectedError: 'Validation Error',
    },
    {
      name: 'Missing required fields',
      method: 'POST',
      url: `${API_BASE_URL}/tasks`,
      body: { description: 'Test' }, // Missing title
      expectedStatus: 400,
      expectedError: 'Validation Error',
    },
    {
      name: 'Invalid priority value',
      method: 'POST',
      url: `${API_BASE_URL}/tasks`,
      body: { title: 'Test', priority: 'INVALID' },
      expectedStatus: 400,
      expectedError: 'Validation Error',
    },
    {
      name: 'Invalid status value',
      method: 'POST',
      url: `${API_BASE_URL}/tasks`,
      body: { title: 'Test', status: 'INVALID' },
      expectedStatus: 400,
      expectedError: 'Validation Error',
    },
    {
      name: 'Invalid pagination parameters',
      method: 'GET',
      url: `${API_BASE_URL}/tasks?page=-1&limit=200`,
      expectedStatus: 400,
      expectedError: 'ApiError',
    },
    {
      name: 'Invalid sort field',
      method: 'GET',
      url: `${API_BASE_URL}/tasks?sortBy=invalid`,
      expectedStatus: 400,
      expectedError: 'ApiError',
    },
    {
      name: 'Invalid sort order',
      method: 'GET',
      url: `${API_BASE_URL}/tasks?sortOrder=invalid`,
      expectedStatus: 400,
      expectedError: 'ApiError',
    },
    {
      name: 'Update non-existent task',
      method: 'PATCH',
      url: `${API_BASE_URL}/tasks/cmbajrw2h0000tohkqjqiykso`,
      body: { title: 'Updated' },
      expectedStatus: 404,
      expectedError: 'ApiError',
    },
    {
      name: 'Delete non-existent task',
      method: 'DELETE',
      url: `${API_BASE_URL}/tasks/cmbajrw2h0000tohkqjqiykso`,
      expectedStatus: 404,
      expectedError: 'ApiError',
    },
  ]

  let passed = 0
  let failed = 0

  for (const test of tests) {
    try {
      console.log(`\n📝 Testing: ${test.name}`)
      console.log(`   Method: ${test.method} ${test.url}`)
      if (test.body) {
        console.log(`   Body: ${JSON.stringify(test.body)}`)
      }

      const options = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
        },
      }

      if (test.body) {
        options.body = JSON.stringify(test.body)
      }

      const response = await fetch(test.url, options)
      const data = await response.json()

      console.log(`   Status: ${response.status}`)
      console.log(`   Response: ${JSON.stringify(data, null, 2)}`)

      if (response.status === test.expectedStatus) {
        if (test.expectedError && data.error !== test.expectedError) {
          console.log(`   ❌ FAILED: Expected error "${test.expectedError}" but got "${data.error}"`)
          failed++
        } else {
          console.log(`   ✅ PASSED`)
          passed++
        }
      } else {
        console.log(`   ❌ FAILED: Expected status ${test.expectedStatus} but got ${response.status}`)
        failed++
      }
    } catch (error) {
      console.log(`   ❌ FAILED: ${error.message}`)
      failed++
    }
  }

  console.log('\n========================================')
  console.log(`Total tests: ${tests.length}`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log('========================================\n')

  if (failed > 0) {
    console.log('⚠️  Some tests failed!')
  } else {
    console.log('🎉 All tests passed!')
  }
}

// Run tests after a short delay to ensure server is ready
setTimeout(testErrorHandling, 1000)