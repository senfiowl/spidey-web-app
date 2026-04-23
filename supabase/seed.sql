-- ============================================================
-- Spidey – Seed data (12 tarantulas from the design prototype)
-- ============================================================

INSERT INTO spiders
  (name, species, common_name, origin, habitat, body_size, span, toxicity, sex, age, temp_range, humidity_range, last_fed, molts, notes, color)
VALUES
  (
    'Helene', 'Theraphosa blondi', 'Goliath Bird Eater',
    'Venezuela, Brasilien, Guyana', 'Tropischer Regenwald',
    '13 cm', '30 cm', 'mild', 'Weibchen', '6 Jahre',
    '26–28 °C', '80–85 %', '2026-04-18',
    ARRAY['2023-03','2024-01','2024-11','2025-09'],
    'Helene ist sehr scheu und versteckt sich tagsüber gern. Abends aktiver. Liebt große Grillen.',
    'oklch(0.42 0.08 65)'
  ),
  (
    'Marina', 'Caribena versicolor', 'Antilles Pinktoe',
    'Martinique (Karibik)', 'Baumkronen, tropisch',
    '6 cm', '14 cm', 'sehr mild', 'Weibchen', '2 Jahre',
    '24–26 °C', '75–85 %', '2026-04-20',
    ARRAY['2025-02','2025-10'],
    'Marina ist wunderschön – türkis als Jungtier, violett-rot als Adulte. Baut komplexe Röhrennetze.',
    'oklch(0.55 0.18 280)'
  ),
  (
    'Greta', 'Brachypelma hamorii', 'Mexican Red Knee',
    'Mexiko', 'Halbwüste, Trockensavanne',
    '8 cm', '16 cm', 'mild', 'Weibchen', '8 Jahre',
    '22–26 °C', '50–60 %', '2026-04-15',
    ARRAY['2022-06','2023-08','2024-10'],
    'Sehr ruhige, handzahme Vogelspinne. Ideal für Anfänger. Frisst gerne Heuschrecken.',
    'oklch(0.58 0.14 48)'
  ),
  (
    'Nyx', 'Chromatopelma cyaneopubescens', 'Green Bottle Blue',
    'Venezuela (Halbinsel Paraguaná)', 'Trockengebüsch',
    '7 cm', '15 cm', 'mild', 'Männchen', '3 Jahre',
    '24–28 °C', '50–65 %', '2026-04-19',
    ARRAY['2024-07','2025-04'],
    'Nyx ist die farbenprächtiste im Bestand. Sehr aktiv, baut viel Netz.',
    'oklch(0.52 0.20 195)'
  ),
  (
    'Ebony', 'Grammostola pulchra', 'Brazilian Black',
    'Brasilien, Uruguay', 'Grasland, Pampa',
    '8 cm', '18 cm', 'sehr mild', 'Weibchen', '12 Jahre',
    '22–25 °C', '60–70 %', '2026-04-10',
    ARRAY['2023-11','2025-01'],
    'Ebony ist samtartig schwarz – eine der schönsten Vogelspinnen überhaupt. Langsam wachsend.',
    'oklch(0.22 0.01 200)'
  ),
  (
    'Persephone', 'Poecilotheria metallica', 'Gooty Sapphire',
    'Indien (Andhra Pradesh)', 'Baumhöhlen, Trockenwald',
    '7 cm', '20 cm', 'mittel', 'Weibchen', '4 Jahre',
    '24–28 °C', '70–75 %', '2026-04-17',
    ARRAY['2024-03','2025-02'],
    'Hochgradig geschützte Art. Sehr schnell und defensiv – nur für erfahrene Halter.',
    'oklch(0.48 0.20 250)'
  ),
  (
    'Rosie', 'Grammostola rosea', 'Chilean Rose',
    'Chile, Bolivien, Argentinien', 'Wüste, Atacama-Rand',
    '7 cm', '15 cm', 'sehr mild', 'Weibchen', '15 Jahre',
    '20–24 °C', '40–55 %', '2026-03-28',
    ARRAY['2022-05','2024-06'],
    'Rosie fastet seit einem Jahr – völlig normal für die Art. Extrem langlebig.',
    'oklch(0.60 0.10 5)'
  ),
  (
    'Kali', 'Hapalopus sp. Colombia', 'Pumpkin Patch',
    'Kolumbien', 'Grasland, Zwergform',
    '3.5 cm', '8 cm', 'mild', 'Weibchen', '2 Jahre',
    '24–26 °C', '65–75 %', '2026-04-21',
    ARRAY['2025-06','2025-12'],
    'Mini-Vogelspinne mit wunderschönem Muster – orange Flecken auf schwarzem Grund.',
    'oklch(0.65 0.18 55)'
  ),
  (
    'Athena', 'Avicularia avicularia', 'Common Pinktoe',
    'Südamerika (weit verbreitet)', 'Regenwaldkronen',
    '6 cm', '13 cm', 'sehr mild', 'Weibchen', '3 Jahre',
    '24–27 °C', '75–85 %', '2026-04-19',
    ARRAY['2024-09','2025-07'],
    'Springt gern – Deckel gut sichern! Gesellige Art, baut große Gespinstsäcke.',
    'oklch(0.50 0.09 140)'
  ),
  (
    'Shadow', 'Lasiodora parahybana', 'Brazilian Salmon Pink',
    'Brasilien (Paraíba)', 'Atlantischer Regenwald',
    '10 cm', '26 cm', 'mild', 'Männchen', '4 Jahre',
    '24–27 °C', '70–80 %', '2026-04-16',
    ARRAY['2024-04','2025-03'],
    'Shadow ist ein echter Fraßteufel. Einer der größten Tarantula-Arten nach dem Goliath.',
    'oklch(0.38 0.06 60)'
  ),
  (
    'Luna', 'Nhandu chromatus', 'White Striped Birdeater',
    'Brasilien, Paraguay', 'Savanne, Cerrado',
    '8 cm', '18 cm', 'mittel', 'Weibchen', '3 Jahre',
    '24–27 °C', '65–75 %', '2026-04-14',
    ARRAY['2024-08','2025-06'],
    'Luna ist defensiv und schießt gern Brennhaare. Trotzdem faszinierend zu beobachten.',
    'oklch(0.45 0.03 200)'
  ),
  (
    'Fauna', 'Acanthoscurria geniculata', 'Giant White Knee',
    'Brasilien (Amazonas)', 'Tropischer Regenwald',
    '9 cm', '22 cm', 'mittel', 'Weibchen', '5 Jahre',
    '25–28 °C', '70–80 %', '2026-04-18',
    ARRAY['2023-07','2024-06','2025-05'],
    'Fauna ist sehr aktiv und gräbt gern. Braucht viel Substrat zum Buddeln.',
    'oklch(0.35 0.04 155)'
  );
