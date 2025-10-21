export default () => ({
    port: parseInt(process.env.SERVER_PORT ?? "3000", 10),
    database: {
        sincronize:true,
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT ?? "5432", 10),
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        name: process.env.DATABASE_NAME,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    },
});