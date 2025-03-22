<?php
// analytics.php - Скрипт для сбора аналитики

// Предотвращаем вывод ошибок в браузер
error_reporting(0);
ini_set('display_errors', 0);

// Путь к файлу базы данных
$dbPath = __DIR__ . '/analytics.db';

// Создаем анонимную функцию для получения IP-адреса
function getIpAddress() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } else {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }
    return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : '0.0.0.0';
}

// Функция для определения типа устройства
function getDeviceInfo() {
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';

    // Определяем тип устройства
    $deviceType = 'Unknown';
    if (preg_match('/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i', $userAgent)) {
        $deviceType = 'Mobile';
    } elseif (preg_match('/android|ipad|playbook|silk/i', $userAgent)) {
        $deviceType = 'Tablet';
    } elseif (preg_match('/TV|Smart-TV|SMART-TV|SmartTV/i', $userAgent)) {
        $deviceType = 'Smart TV';
    } else {
        $deviceType = 'Desktop';
    }

    // Определяем ОС
    $os = 'Unknown';
    if (preg_match('/windows nt/i', $userAgent)) {
        $os = 'Windows';
    } elseif (preg_match('/macintosh|mac os x/i', $userAgent)) {
        $os = 'macOS';
    } elseif (preg_match('/linux/i', $userAgent)) {
        $os = 'Linux';
    } elseif (preg_match('/iphone|ipad|ipod/i', $userAgent)) {
        $os = 'iOS';
    } elseif (preg_match('/android/i', $userAgent)) {
        $os = 'Android';
    }

    // Определяем браузер
    $browser = 'Unknown';
    if (preg_match('/MSIE|Trident/i', $userAgent)) {
        $browser = 'Internet Explorer';
    } elseif (preg_match('/Firefox/i', $userAgent)) {
        $browser = 'Firefox';
    } elseif (preg_match('/Chrome/i', $userAgent)) {
        if (preg_match('/Edg/i', $userAgent)) {
            $browser = 'Edge';
        } elseif (preg_match('/OPR/i', $userAgent)) {
            $browser = 'Opera';
        } else {
            $browser = 'Chrome';
        }
    } elseif (preg_match('/Safari/i', $userAgent)) {
        $browser = 'Safari';
    }

    return [
        'device_type' => $deviceType,
        'operating_system' => $os,
        'browser' => $browser,
        'user_agent' => $userAgent
    ];
}

// Функция для определения страны по IP
function getCountryFromIp($ip) {
    // Для продакшена рекомендуется использовать GeoIP или другой сервис геолокации
    // В этом примере мы будем использовать бесплатный API
    try {
        if ($ip === '127.0.0.1' || $ip === '::1' || $ip === '0.0.0.0') {
            return 'Local';
        }

        $response = @file_get_contents("http://ip-api.com/json/{$ip}?fields=country");
        if ($response) {
            $data = json_decode($response, true);
            return $data['country'] ?? 'Unknown';
        }
    } catch (Exception $e) {
        // В случае ошибки или недоступности API
    }

    return 'Unknown';
}

// Генерируем уникальный ID посетителя
function generateVisitorId() {
    $ip = getIpAddress();
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';

    // Если есть куки с ID посетителя, используем его
    if (isset($_COOKIE['visitor_id'])) {
        return $_COOKIE['visitor_id'];
    }

    // Иначе генерируем новый ID
    $uniqueId = md5($ip . $userAgent . uniqid('', true));

    // Устанавливаем куки на 2 года
    setcookie('visitor_id', $uniqueId, time() + 2 * 365 * 24 * 60 * 60, '/');

    return $uniqueId;
}

// Обработка запроса
try {
    // Проверяем метод запроса - должен быть POST для безопасности
    // или GET для упрощения внедрения
    if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'GET') {
        // Получаем данные
        $visitorId = generateVisitorId();
        $ipAddress = getIpAddress();
        $deviceInfo = getDeviceInfo();
        // Получаем URL текущей страницы (куда перешел пользователь)
$pageUrl = isset($_REQUEST['page']) ? $_REQUEST['page'] : 'Unknown';

// Получаем источник (откуда пришел пользователь)
$referrer = $_SERVER['HTTP_REFERER'] ?? $_REQUEST['referrer'] ?? '';

        // Если URL страницы неизвестен и это GET-запрос, пытаемся получить его из параметров
        if ($pageUrl === 'Unknown' && isset($_GET['page'])) {
            $pageUrl = $_GET['page'];
        }

        // Определяем страну
        $country = getCountryFromIp($ipAddress);

        // Соединяемся с базой данных
        $db = new SQLite3($dbPath);
        $db->exec('BEGIN TRANSACTION');

        // Проверяем, существует ли посетитель в базе
        $stmt = $db->prepare('SELECT first_visit_at FROM visitors WHERE visitor_id = :visitor_id');
        $stmt->bindValue(':visitor_id', $visitorId, SQLITE3_TEXT);
        $result = $stmt->execute();
        $visitor = $result->fetchArray(SQLITE3_ASSOC);

        if ($visitor) {
            // Обновляем информацию о посетителе
            $stmt = $db->prepare('
                UPDATE visitors
                SET ip_address = :ip_address,
                    user_agent = :user_agent,
                    device_type = :device_type,
                    operating_system = :operating_system,
                    browser = :browser,
                    country = :country,
                    last_visit_at = CURRENT_TIMESTAMP
                WHERE visitor_id = :visitor_id
            ');
        } else {
            // Добавляем нового посетителя
            $stmt = $db->prepare('
                INSERT INTO visitors
                (visitor_id, ip_address, user_agent, device_type, operating_system, browser, country)
                VALUES
                (:visitor_id, :ip_address, :user_agent, :device_type, :operating_system, :browser, :country)
            ');
        }

        // Привязываем параметры
        $stmt->bindValue(':visitor_id', $visitorId, SQLITE3_TEXT);
        $stmt->bindValue(':ip_address', $ipAddress, SQLITE3_TEXT);
        $stmt->bindValue(':user_agent', $deviceInfo['user_agent'], SQLITE3_TEXT);
        $stmt->bindValue(':device_type', $deviceInfo['device_type'], SQLITE3_TEXT);
        $stmt->bindValue(':operating_system', $deviceInfo['operating_system'], SQLITE3_TEXT);
        $stmt->bindValue(':browser', $deviceInfo['browser'], SQLITE3_TEXT);
        $stmt->bindValue(':country', $country, SQLITE3_TEXT);
        $stmt->execute();

        // Записываем посещение
        $stmt = $db->prepare('
            INSERT INTO visits
            (visitor_id, page_url, referrer)
            VALUES
            (:visitor_id, :page_url, :referrer)
        ');
        $stmt->bindValue(':visitor_id', $visitorId, SQLITE3_TEXT);
        $stmt->bindValue(':page_url', $pageUrl, SQLITE3_TEXT);
        $stmt->bindValue(':referrer', $referrer, SQLITE3_TEXT);
        $stmt->execute();

        $db->exec('COMMIT');

        // Возвращаем прозрачный пиксель в формате PNG
        header('Content-Type: image/png');
        echo base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
    }
} catch (Exception $e) {
    // Обработка ошибок без вывода информации пользователю
    error_log('Analytics Error: ' . $e->getMessage());

    // Всё равно возвращаем пиксель, чтобы не показывать ошибку
    header('Content-Type: image/png');
    echo base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
} finally {
    // Закрываем соединение с базой данных, если оно было открыто
    if (isset($db)) {
        $db->close();
    }
}
?>
