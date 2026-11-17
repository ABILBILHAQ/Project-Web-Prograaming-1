-- Database: pkkmb_feedback
-- Dapat diimpor langsung melalui phpMyAdmin (http://localhost/phpmyadmin)
-- atau dijalankan via terminal MySQL

CREATE DATABASE IF NOT EXISTS `pkkmb_feedback` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `pkkmb_feedback`;

-- 1. Tabel Feedback
CREATE TABLE IF NOT EXISTS `feedback` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) DEFAULT NULL,
  `prodi` VARCHAR(100) NOT NULL,
  `comment` TEXT NOT NULL,
  `sentiment` ENUM('positive', 'negative', 'neutral') NOT NULL,
  `confidence` DECIMAL(3,2) NOT NULL DEFAULT 0.85,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_sentiment` (`sentiment`),
  INDEX `idx_prodi` (`prodi`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabel Admin Users
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'admin',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Data Awal Admin
INSERT INTO `users` (`id`, `email`, `password`, `role`, `created_at`)
VALUES ('admin-001', 'admin@pkkmb.ac.id', 'Admin#PKKMB2026', 'admin', NOW())
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

-- 4. Data Awal Feedback (Sample Data PKKMB)
INSERT INTO `feedback` (`id`, `name`, `prodi`, `comment`, `sentiment`, `confidence`, `created_at`) VALUES
('f1a2b3c4-0001-4000-8000-000000000001', 'Muhammad Rizky', 'Teknik Informatika', 'Materi pengenalan prodi dan kurikulum sangat jelas dan informatif. Kakak pendamping kelompok sangat ramah dan membantu kami!', 'positive', 0.96, DATE_SUB(NOW(), INTERVAL 35 MINUTE)),
('f1a2b3c4-0002-4000-8000-000000000002', 'Aisyah Putri', 'Sistem Informasi', 'Acara pembukaannya megah dan sangat berkesan, namun waktu istirahat dan ibadah siang terasa agak terburu-buru.', 'neutral', 0.78, DATE_SUB(NOW(), INTERVAL 120 MINUTE)),
('f1a2b3c4-0003-4000-8000-000000000003', 'Budi Santoso', 'Teknik Elektro', 'Sound system di aula utama beberapa kali kresek-kresek dan suara pemateri jadi kurang jelas di bagian belakang.', 'negative', 0.89, DATE_SUB(NOW(), INTERVAL 240 MINUTE)),
('f1a2b3c4-0004-4000-8000-000000000004', 'Citra Dewi', 'Manajemen', 'Expo UKM dan organisasi mahasiswa sangat inspiratif! Saya jadi tahu minat organisasi yang ingin diikuti.', 'positive', 0.94, DATE_SUB(NOW(), INTERVAL 360 MINUTE)),
('f1a2b3c4-0005-4000-8000-000000000005', NULL, 'Ilmu Komunikasi', 'Penugasan resume materi PKKMB agak terlalu banyak dalam tenggat waktu yang sempit, mahasiswa baru jadi kurang tidur.', 'negative', 0.92, DATE_SUB(NOW(), INTERVAL 480 MINUTE)),
('f1a2b3c4-0006-4000-8000-000000000006', 'Dimas Anggara', 'Teknik Mesin', 'Panitia sangat disiplin dan menjaga ketertiban dengan baik tanpa ada bentak-bentakan atau perpeloncoan.', 'positive', 0.91, DATE_SUB(NOW(), INTERVAL 600 MINUTE)),
('f1a2b3c4-0007-4000-8000-000000000007', 'Eka Rahmawati', 'Akuntansi', 'Konsumsi makan siang enak dan higienis, pembagiannya juga tertib dan cepat.', 'positive', 0.95, DATE_SUB(NOW(), INTERVAL 750 MINUTE)),
('f1a2b3c4-0008-4000-8000-000000000008', 'Fajar Nugraha', 'Ilmu Hukum', 'Suhu ruangan gedung serbaguna agak panas saat siang hari karena beberapa pendingin ruangan tidak menyala optimal.', 'neutral', 0.81, DATE_SUB(NOW(), INTERVAL 900 MINUTE)),
('f1a2b3c4-0009-4000-8000-000000000009', 'Gita Permata', 'Farmasi', 'Kegiatan campus tour sangat bermanfaat untuk mengenali lokasi laboratorium, perpustakaan, dan gedung fakultas.', 'positive', 0.93, DATE_SUB(NOW(), INTERVAL 1100 MINUTE)),
('f1a2b3c4-0010-4000-8000-000000000010', NULL, 'Psikologi', 'Rundown acara sering molor dari jadwal yang dibagikan sebelumnya, mohon manajemen waktu diperbaiki untuk sesi berikutnya.', 'negative', 0.85, DATE_SUB(NOW(), INTERVAL 1300 MINUTE)),
('f1a2b3c4-0011-4000-8000-000000000011', 'Hafiz Pratama', 'Kedokteran', 'Tim medis dan K3 PKKMB sangat sigap saat ada teman yang pusing atau tidak enak badan saat upacara.', 'positive', 0.97, DATE_SUB(NOW(), INTERVAL 1500 MINUTE)),
('f1a2b3c4-0012-4000-8000-000000000012', 'Intan Nuraini', 'Hubungan Internasional', 'Ice breaking dan yel-yel kelompoknya seru sekali, membuat kami yang awalnya canggung jadi cepat akrab.', 'positive', 0.98, DATE_SUB(NOW(), INTERVAL 1700 MINUTE))
ON DUPLICATE KEY UPDATE `id` = VALUES(`id`);
