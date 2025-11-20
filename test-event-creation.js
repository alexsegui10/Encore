// Test creating an event to see merchandising
async function testEventCreation() {
    try {
        console.log('Creating test event...');
        const response = await fetch('http://localhost:3000/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add your admin auth token here if needed
            },
            body: JSON.stringify({
                event: {
                    title: 'Test Event with Merchandising',
                    date: new Date(),
                    price: 50,
                    category: 'test',
                    description: 'Testing merchandising integration'
                }
            })
        });

        const data = await response.json();
        console.log('Event created:');
        console.log(JSON.stringify(data, null, 2));

        if (data.event && data.event.merchandising) {
            console.log('\n✅ Merchandising field present!');
            console.log('Products count:', data.event.merchandising.length);
        } else {
            console.log('\n❌ Merchandising field missing');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testEventCreation();
