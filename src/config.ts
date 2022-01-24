import * as dotenv from 'dotenv';
import * as path from 'path';

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            BOT_TOKEN: string;
            CLIENT_ID: string;
        }
    }
}

dotenv.config({ path: path.join(process.cwd(), '.env') });

export const BOT_TOKEN = process.env.BOT_TOKEN;
export const CLIENT_ID = process.env.CLIENT_ID;
