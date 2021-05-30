// Express-session variables must be declaration merged with typescript
declare module 'express-session' {
    interface SessionData {
        username: string,
        output: string,
        success: boolean
    }
}

export default 'express-session'