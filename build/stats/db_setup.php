<?php
// db_setup.php - Скрипт для инициализации базы данных SQLite

// Путь к файлу базы данных
$dbPath = __DIR__ . '/analytics.db';

try {
    // Создаем соединение с базой данных
    $db = new SQLite3($dbPath);
    
    // Включаем режим проверки внешних ключей
    $db->exec('PRAGMA foreign_keys = ON');
    
    // Создаем таблицу посетителей
    $db->exec('
    CREATE TABLE IF NOT EXISTS visitors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        visitor_id TEXT NOT NULL UNIQUE, -- уникальный идентификатор посетителя (хеш)
        ip_address TEXT NOT NULL,
        user_agent TEXT,
        device_type TEXT,
        operating_system TEXT,
        browser TEXT,
        country TEXT,
        first_visit_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_visit_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )');
    
    // Создаем таблицу посещений
    $db->exec('
    CREATE TABLE IF NOT EXISTS visits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        visitor_id TEXT NOT NULL,
        page_url TEXT NOT NULL,
        referrer TEXT,
        visit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id)
    )');
    
    // Создаем индексы для ускорения запросов
    $db->exec('CREATE INDEX IF NOT EXISTS idx_visitor_id ON visitors(visitor_id)');
    $db->exec('CREATE INDEX IF NOT EXISTS idx_visit_time ON visits(visit_time)');
    $db->exec('CREATE INDEX IF NOT EXISTS idx_page_url ON visits(page_url)');
    
    echo "База данных успешно инициализирована!\n";
    
} catch (Exception $e) {
    die("Ошибка при инициализации базы данных: " . $e->getMessage());
} finally {
    if (isset($db)) {
        $db->close();
    }
}
?>