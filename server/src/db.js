import mysql from "mysql2/promise";
import "dotenv/config";

const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_PORT = Number(process.env.DB_PORT) || 3307;
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "pkkmb_feedback";

let pool = null;

export async function getDbPool() {
  if (pool) return pool;

  const tryConnect = async (port) => {
    // 1. Cek / buat database jika belum ada
    const tempConn = await mysql.createConnection({
      host: DB_HOST,
      port,
      user: DB_USER,
      password: DB_PASSWORD,
    });

    await tempConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await tempConn.end();

    // 2. Buat connection pool ke database
    const newPool = mysql.createPool({
      host: DB_HOST,
      port,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });

    // Inisialisasi tabel jika belum ada
    await initTables(newPool);
    console.log(`[MySQL] Berhasil terhubung ke database '${DB_NAME}' pada port ${port}`);
    return newPool;
  };

  try {
    pool = await tryConnect(DB_PORT);
    return pool;
  } catch (err) {
    console.warn(`[MySQL] Gagal terhubung ke port ${DB_PORT}: ${err.message}`);
    const fallbackPort = DB_PORT === 3307 ? 3306 : 3307;
    console.log(`[MySQL] Mencoba fallback ke port ${fallbackPort}...`);
    try {
      pool = await tryConnect(fallbackPort);
      return pool;
    } catch (fallbackErr) {
      console.error(`[MySQL] Gagal koneksi database di port ${DB_PORT} dan ${fallbackPort}:`, fallbackErr.message);
      throw fallbackErr;
    }
  }
}

async function initTables(p) {
  // 1. Tabel feedback
  await p.query(`
    CREATE TABLE IF NOT EXISTS \`feedback\` (
      \`id\` VARCHAR(50) NOT NULL,
      \`name\` VARCHAR(100) DEFAULT NULL,
      \`prodi\` VARCHAR(100) NOT NULL,
      \`comment\` TEXT NOT NULL,
      \`sentiment\` ENUM('positive', 'negative', 'neutral') NOT NULL,
      \`confidence\` DECIMAL(3,2) NOT NULL DEFAULT 0.85,
      \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      INDEX \`idx_sentiment\` (\`sentiment\`),
      INDEX \`idx_prodi\` (\`prodi\`),
      INDEX \`idx_created_at\` (\`created_at\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 2. Tabel users (admin)
  await p.query(`
    CREATE TABLE IF NOT EXISTS \`users\` (
      \`id\` VARCHAR(50) NOT NULL,
      \`email\` VARCHAR(255) NOT NULL,
      \`password\` VARCHAR(255) NOT NULL,
      \`role\` VARCHAR(50) NOT NULL DEFAULT 'admin',
      \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`idx_email\` (\`email\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 3. Pastikan admin default terdaftar
  await p.query(`
    INSERT INTO \`users\` (\`id\`, \`email\`, \`password\`, \`role\`, \`created_at\`)
    VALUES ('admin-001', 'admin@pkkmb.ac.id', 'Admin#PKKMB2026', 'admin', NOW())
    ON DUPLICATE KEY UPDATE \`email\` = VALUES(\`email\`);
  `);
}
