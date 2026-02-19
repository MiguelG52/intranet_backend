export default () => ({
    port: parseInt(process.env.SERVER_PORT ?? "3000", 10),
    JWTSecret: process.env.JWT_SECRET_KEY,
    DEV_API_KEY: process.env.DEV_API_KEY,
    database: {
        synchronize:true,
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT ?? "5432", 10),
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        name: process.env.DATABASE_NAME,
        url: process.env.DATABASE_URL,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    },
    email:{
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT ?? "587", 10),
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD,
    }
});