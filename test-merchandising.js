// Test script to verify cross-server communication
async function testRandomProducts() {
    try {
        console.log('Testing random products endpoint...');
        const response = await fetch('http://localhost:5000/product/random?count=3');

        if (!response.ok) {
            console.error(`Failed: ${response.status} ${response.statusText}`);
            return;
        }

        const data = await response.json();
        console.log('Success! Random products:');
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testRandomProducts();
