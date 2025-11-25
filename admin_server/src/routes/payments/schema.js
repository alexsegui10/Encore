import S from 'fluent-json-schema';

// Schema for creating a payment intent
export const createPaymentIntentSchema = {
    body: S.object()
        .prop('userUid', S.string().required().description('User UID making the purchase'))
        .prop('currency', S.string().default('eur').description('Currency code (e.g., eur, usd)'))
        .prop('events', S.array()
            .items(
                S.object()
                    .prop('eventSlug', S.string().required().description('Event slug'))
                    .prop('quantity', S.integer().minimum(1).required().description('Quantity of tickets'))
            )
            .required()
            .description('Array of event items to purchase')
        )
        .prop('billingDetails', S.object()
            .prop('name', S.string())
            .prop('email', S.string().format('email'))
            .description('Optional billing details')
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
