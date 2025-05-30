const API_BASE_URL = 'http://localhost:3000/api'

async function testBasicSanitization() {
  console.log('Testing Basic Input Sanitization...\n')

  try {
    // Test 1: Create task with potentially dangerous input
    console.log('1. Testing XSS protection in task creation...')
    const createResponse = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      },
      body: JSON.stringify({
        title: '<script>alert("xss")</script>Clean Title',
        description: '<img src="x" onerror="alert(1)">Safe description',
        priority: 'HIGH'
      })
    })

    if (createResponse.status === 201) {
      const task = await createResponse.json()
      console.log('✅ Task created successfully')
      console.log(`   Title: ${task.title}`)
      console.log(`   Description: ${task.description}`)
      
      // Check if dangerous content was removed
      if (!task.title.includes('<script>') && !task.description.includes('onerror')) {
        console.log('✅ XSS content was properly sanitized')
      } else {
        console.log('❌ XSS content was not sanitized!')
      }

      // Test 2: Test search with dangerous input
      console.log('\n2. Testing search parameter sanitization...')
      const searchResponse = await fetch(`${API_BASE_URL}/tasks?search=${encodeURIComponent('<script>alert("search")</script>')}`)
      
      if (searchResponse.status === 200) {
        console.log('✅ Search handled dangerous input safely')
      } else {
        console.log('❌ Search failed to handle dangerous input')
      }

      // Test 3: Test input length limits
      console.log('\n3. Testing input length validation...')
      const longTitleResponse = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:3000'
        },
        body: JSON.stringify({
          title: 'A'.repeat(300), // Too long
          description: 'Valid description'
        })
      })

      if (longTitleResponse.status === 400) {
        console.log('✅ Long title properly rejected')
      } else {
        console.log('❌ Long title was not rejected')
      }

      // Cleanup
      console.log('\n4. Cleaning up test task...')
      const deleteResponse = await fetch(`${API_BASE_URL}/tasks/${task.id}`, {
        method: 'DELETE',
        headers: {
          'Origin': 'http://localhost:3000'
        }
      })
      
      if (deleteResponse.status === 200) {
        console.log('✅ Test task cleaned up')
      }
      
    } else {
      console.log(`❌ Failed to create task: ${createResponse.status}`)
      const error = await createResponse.json()
      console.log('Error:', error)
    }

    console.log('\n✅ Basic sanitization tests completed!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run test after a short delay
setTimeout(testBasicSanitization, 1000)