const API_URL = 'http://localhost:3000/api/tasks';

async function testAPI() {
  console.log('Testing Task API Routes...\n');

  try {
    // Test 1: Create a task
    console.log('1. Creating a new task...');
    const createResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Task from API',
        description: 'This is a test task created via API',
        priority: 'HIGH',
        status: 'PENDING'
      })
    });
    const newTask = await createResponse.json();
    console.log('Created task:', newTask);
    console.log('');

    // Test 2: Get all tasks
    console.log('2. Fetching all tasks...');
    const getAllResponse = await fetch(API_URL);
    const allTasks = await getAllResponse.json();
    console.log(`Found ${allTasks.length} tasks`);
    console.log('');

    // Test 3: Get single task
    console.log('3. Fetching single task...');
    const getOneResponse = await fetch(`${API_URL}/${newTask.id}`);
    const singleTask = await getOneResponse.json();
    console.log('Fetched task:', singleTask);
    console.log('');

    // Test 4: Update task
    console.log('4. Updating task...');
    const updateResponse = await fetch(`${API_URL}/${newTask.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Updated Test Task',
        status: 'IN_PROGRESS'
      })
    });
    const updatedTask = await updateResponse.json();
    console.log('Updated task:', updatedTask);
    console.log('');

    // Test 5: Search tasks
    console.log('5. Searching tasks...');
    const searchResponse = await fetch(`${API_URL}?search=Updated`);
    const searchResults = await searchResponse.json();
    console.log(`Search found ${searchResults.length} tasks`);
    console.log('');

    // Test 6: Delete task
    console.log('6. Deleting task...');
    const deleteResponse = await fetch(`${API_URL}/${newTask.id}`, {
      method: 'DELETE'
    });
    const deleteResult = await deleteResponse.json();
    console.log('Delete result:', deleteResult);
    console.log('');

    console.log('✅ All API tests completed successfully!');
  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
}

// Wait a bit for server to be ready
setTimeout(testAPI, 2000);