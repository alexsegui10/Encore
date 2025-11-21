import S from 'fluent-json-schema';

// Schema for creating a payment intent
export const createPaymentIntentSchema = {
    body: S.object()
        .prop('userId', S.string().required().description('User ID making the purchase'))
        .prop('currency', S.string().default('eur').description('Currency code (e.g., eur, usd)'))
        .prop('items', S.array()
            .items(
                S.object()
                    .prop('eventId', S.string().required().description('Event ID'))
                    .prop('quantity', S.integer().minimum(1).required().description('Quantity of tickets'))
                    .prop('unitPrice', S.number().minimum(0).required().description('Price per ticket'))
            )
            .default([])
            .description('Array of event items to purchase')
        )
        .prop('products', S.array()
            .items(
                S.object()
                    .prop('productId', S.string().required().description('Product ID'))
                    .prop('quantity', S.integer().minimum(1).required().description('Quantity of products'))
                    .prop('unitPrice', S.number().minimum(0).required().description('Price per product'))
            )
            .default([])
            .description('Array of products to purchase')
        ),
    response: {
        200: S.object()
            .prop('clientSecret', S.string().required().description('Stripe client secret for payment'))
            .prop('orderId', S.string().required().description('Order ID'))
            .prop('amount', S.number().required().description('Total amount in cents')),
        400: S.object()
            .prop('error', S.string().required().description('Error message')),
        500: S.object()
            .prop('error', S.string().required().description('Error message'))
    }
};

// Schema for webhook endpoint (no validation needed, Stripe sends the payload)
export const webhookSchema = {
    response: {
        200: S.object()
            .prop('received', S.boolean().const(true))
    }
};
