import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres.xpkpogppwvkeugylqyhy:wf3UERLQtJ34iCNvkz48zVQ8PTnaGk@aws-0-us-east-1.pooler.supabase.com:5432/postgres";

console.log('Testing database connection...');
console.log('URL:', DATABASE_URL.replace(/:[^:@]+@/, ':****@'));

const client = postgres(DATABASE_URL, {
    prepare: false,
    max: 1,
    connect_timeout: 30,
});

async function test() {
    try {
        const start = Date.now();
        const result = await client`SELECT NOW() as current_time`;
        const elapsed = Date.now() - start;

        console.log('✓ Connection successful!');
        console.log('Current time:', result[0].current_time);
        console.log('Query took:', elapsed, 'ms');

        await client.end();
        process.exit(0);
    } catch (error) {
        console.error('✗ Connection failed:', error);
        process.exit(1);
    }
}

test();
