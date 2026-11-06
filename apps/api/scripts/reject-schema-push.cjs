console.error('This database uses SQL migrations and integrity triggers. Use prisma:deploy; db push would omit the required triggers and backfills.');
process.exitCode = 1;
