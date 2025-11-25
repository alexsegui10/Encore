/**
 * Quick test to check payment endpoint
 */

const testUserUid = 'usr_001'; // UID del usuario (campo de negocio)
const testEventSlug = 'hans-zimmer-valencia'; // Slug del evento (campo de negocio)

fetch('http://localhost:4000/api/payments/create-intent', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        userUid: testUserUid,
        events: [
            { eventSlug: testEventSlug, quantity: 2 }
        ],
        billingDetails: {
            name: 'Test User',
            email: 'test@example.com'
        }
    })
})
.then(res => res.json().then(data => ({status: res.status, data})))
.then(({status, data}) => {
    console.log('Status:', status);
    console.log('Response:', JSON.stringify(data, null, 2));
})
.catch(err => {
    console.error('Error:', err);
});
