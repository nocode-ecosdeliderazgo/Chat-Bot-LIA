// Simple test function to verify Netlify deployment
exports.handler = async (event) => {
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'OPTIONS,GET,POST'
        },
        body: JSON.stringify({ 
            message: 'Test function working!',
            timestamp: new Date().toISOString(),
            method: event.httpMethod
        })
    };
};