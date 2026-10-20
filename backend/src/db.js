import pg from 'pg';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const {Pool}=pg;
export const pool=new Pool({connectionString:process.env.DATABASE_URL,max:10,idleTimeoutMillis:30000,connectionTimeoutMillis:10000,ssl:process.env.PGSSL==='true'?{rejectUnauthorized:true}:undefined});
export async function initializeDatabase(){const here=path.dirname(fileURLToPath(import.meta.url));const schema=await fs.readFile(path.resolve(here,'../../database/schema.sql'),'utf8');await pool.query(schema)}
