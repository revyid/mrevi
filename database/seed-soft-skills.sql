-- Soft skills accordion (home page, below the skill cards).
-- site_settings is key/value, so this is content seeding, not a schema change.
-- Safe to re-run: upserts on the unique key.
-- Edit later from admin -> Settings -> Soft Skills; this file is only the seed.

INSERT INTO site_settings (key, value) VALUES
  ('soft_skills_count', '5'),
  ('section_softskills_line1', 'KECERDASIAN'),
  ('section_softskills_line2', 'LUNAK'),

  ('soft_skill_1_title', 'Komunikasi yang Efektif'),
  ('soft_skill_1_short', 'Mampu menyampaikan ide teknis dengan bahasa yang mudah dipahami, secara lisan maupun tulisan.'),
  ('soft_skill_1_long',  'Dalam setiap proyek, komunikasi yang jelas adalah kunci kolaborasi yang sukses. Saya terbiasa menyusun dokumentasi teknis yang ringkas, memberikan presentasi yang terstruktur, dan tetap terbuka pada umpan balik. Dari diskusi desain dengan klien non-teknis sampai code review dengan fellow developer, pendekatan saya berpusat pada kejernihan dan empati.'),

  ('soft_skill_2_title', 'Kolaborasi & Kerja Sama Tim'),
  ('soft_skill_2_short', 'Pengalaman bekerja lintas fungsi - developer, desainer, dan pemangku kepentingan bisnis.'),
  ('soft_skill_2_long',  'Produk terbaik lahir dari kolaborasi yang genuine. Sepanjang karier saya terbiasa mengoordinasikan lintas fungsi: menyelaraskan prioritas dengan product owner, berdiskusi dengan desainer UI/UX soal interaksi, sampai menyelesaikan merge conflict bersama anggota tim lain. Kontribusi di komunitas open source dan forum teknis memperkuat kemampuan saya bekerja di lingkungan yang beragam.'),

  ('soft_skill_3_title', 'Pemecahan Masalah & Analisis'),
  ('soft_skill_3_short', 'Pendekatan sistematis terhadap masalah teknis - dari memetakan akar masalah sampai memilih solusi yang bertahan lama.'),
  ('soft_skill_3_long',  'Saat menemukan bug yang sulit atau requirement yang bertentangan, saya tidak langsung loncat ke solusi. Saya mulai dengan memetakan masalah, mengumpulkan data (log, metrics, user feedback), menemukan akar masalah, lalu menilai beberapa alternatif sebelum memutuskan jalannya. Pendekatan ini mengurangi rework dan menghasilkan solusi yang lebih tahan lama.'),

  ('soft_skill_4_title', 'Adaptabilitas & Pembelajaran Berkelanjutan'),
  ('soft_skill_4_short', 'Fleksibel menghadapi perubahan teknologi, requirement yang berevolusi, dan lingkungan kerja yang dinamis.'),
  ('soft_skill_4_long',  'Dunia teknologi bergerak cepat, dan saya menempatkan diri sebagai pembelajar seumur hidup. Dari mengadopsi framework baru sampai mempelajari praktik deployment, saya terbuka pada perubahan dan melihatnya sebagai peluang untuk berkembang. Keterampilan ini vital di proyek dengan timeline ketat dan requirement yang terus berkembang.'),

  ('soft_skill_5_title', 'Kepemimpinan Teknis & Pengaruh'),
  ('soft_skill_5_short', 'Mampu memandu diskusi teknis, mengarahkan tim yang lebih junior, dan mengambil keputusan arsitektur yang seimbang antara idealisme dan realita.'),
  ('soft_skill_5_long',  'Kepemimpinan teknis bukan soal menunjuk siapa yang bertanggung jawab, tapi menciptakan lingkungan di mana setiap anggota tim bisa berkontribusi maksimal. Saya sering berperan sebagai technical lead di fase perencanaan: memetakan arsitektur, mendefinisikan standar kode, dan memastikan keputusan teknis selaras dengan tujuan bisnis. Di saat yang sama saya menjaga komunikasi dua arah.')
ON CONFLICT (key) DO UPDATE SET
  value      = EXCLUDED.value,
  updated_at = NOW();
