<?php
// admin.php - Админ-панель для просмотра статистики

// Защита паролем (в реальном проекте рекомендуется использовать более надежную авторизацию)
$username = 'admin';
$password = 'password'; // в реальном проекте используйте хешированный пароль

session_start();

// Обработка выхода
if (isset($_GET['logout'])) {
    session_unset();
    session_destroy();
    header('Location: ' . $_SERVER['PHP_SELF']);
    exit();
}

// Обработка авторизации
if (isset($_POST['login'])) {
    if ($_POST['username'] === $username && $_POST['password'] === $password) {
        $_SESSION['authenticated'] = true;
    } else {
        $loginError = "Неверное имя пользователя или пароль";
    }
}

// Проверка авторизации
$isAuthenticated = isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === true;

// Путь к файлу базы данных
$dbPath = __DIR__ . '/analytics.db';

// Текущая страница
$currentPage = $_GET['page'] ?? 'dashboard';
// Выбранный период
$selectedPeriod = $_GET['period'] ?? 'month';

// Функция для получения статистики дашборда
function getStatistics($db, $period = 'all') {
    // Определяем временной интервал для запроса
    $timeCondition = '';
    switch ($period) {
        case 'today':
            $timeCondition = "WHERE DATE(visit_time) = DATE('now', 'localtime')";
            break;
        case 'yesterday':
            $timeCondition = "WHERE DATE(visit_time) = DATE('now', '-1 day', 'localtime')";
            break;
        case 'week':
            $timeCondition = "WHERE DATE(visit_time) >= DATE('now', '-7 days', 'localtime')";
            break;
        case 'month':
            $timeCondition = "WHERE DATE(visit_time) >= DATE('now', '-30 days', 'localtime')";
            break;
        default:
            $timeCondition = '';
    }

    // Базовая статистика
    $stats = [
        'totalVisits' => 0,
        'uniqueVisitors' => 0,
        'newVisitors' => 0,
        'popularPages' => [],
        'topReferrers' => [],
        'deviceTypes' => [],
        'browsers' => [],
        'operatingSystems' => [],
        'countries' => [],
        'dailyVisits' => []
    ];

    // Общее количество посещений
    $query = "SELECT COUNT(*) as count FROM visits {$timeCondition}";
    $result = $db->query($query);
    $stats['totalVisits'] = $result->fetchArray(SQLITE3_ASSOC)['count'];

    // Количество уникальных посетителей
    $query = "SELECT COUNT(DISTINCT visitor_id) as count FROM visits {$timeCondition}";
    $result = $db->query($query);
    $stats['uniqueVisitors'] = $result->fetchArray(SQLITE3_ASSOC)['count'];

    // Количество новых посетителей
    switch ($period) {
        case 'today':
            $periodStart = "DATE('now', 'localtime')";
            break;
        case 'yesterday':
            $periodStart = "DATE('now', '-1 day', 'localtime')";
            break;
        case 'week':
            $periodStart = "DATE('now', '-7 days', 'localtime')";
            break;
        case 'month':
            $periodStart = "DATE('now', '-30 days', 'localtime')";
            break;
        default:
            $periodStart = "DATE('1970-01-01')";
    }

    $query = "
        SELECT COUNT(*) as count FROM visitors
        WHERE DATE(first_visit_at) >= {$periodStart}
    ";
    $result = $db->query($query);
    $stats['newVisitors'] = $result->fetchArray(SQLITE3_ASSOC)['count'];

    // Самые популярные страницы
    $query = "
        SELECT page_url, COUNT(*) as visits
        FROM visits {$timeCondition}
        GROUP BY page_url
        ORDER BY visits DESC
        LIMIT 10
    ";
    $result = $db->query($query);
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $stats['popularPages'][] = $row;
    }

    // Популярные источники трафика
    $query = "
        SELECT CASE
                WHEN referrer = '' THEN 'Direct'
                WHEN referrer IS NULL THEN 'Direct'
                ELSE referrer
               END as source,
               COUNT(*) as visits
        FROM visits {$timeCondition}
        GROUP BY source
        ORDER BY visits DESC
        LIMIT 10
    ";
    $result = $db->query($query);
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $stats['topReferrers'][] = $row;
    }

    // Статистика по типам устройств
    $query = "
        SELECT v.device_type, COUNT(*) as count
        FROM visits vs
        JOIN visitors v ON vs.visitor_id = v.visitor_id
        {$timeCondition}
        GROUP BY v.device_type
        ORDER BY count DESC
    ";
    $result = $db->query($query);
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $stats['deviceTypes'][] = $row;
    }

    // Статистика по браузерам
    $query = "
        SELECT v.browser, COUNT(*) as count
        FROM visits vs
        JOIN visitors v ON vs.visitor_id = v.visitor_id
        {$timeCondition}
        GROUP BY v.browser
        ORDER BY count DESC
    ";
    $result = $db->query($query);
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $stats['browsers'][] = $row;
    }

    // Статистика по операционным системам
    $query = "
        SELECT v.operating_system, COUNT(*) as count
        FROM visits vs
        JOIN visitors v ON vs.visitor_id = v.visitor_id
        {$timeCondition}
        GROUP BY v.operating_system
        ORDER BY count DESC
    ";
    $result = $db->query($query);
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $stats['operatingSystems'][] = $row;
    }

    // Статистика по странам
    $query = "
        SELECT v.country, COUNT(*) as count
        FROM visits vs
        JOIN visitors v ON vs.visitor_id = v.visitor_id
        {$timeCondition}
        GROUP BY v.country
        ORDER BY count DESC
    ";
    $result = $db->query($query);
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $stats['countries'][] = $row;
    }

    // Ежедневные посещения для графика
    $daysLimit = 30;
    if ($period == 'week') {
        $daysLimit = 7;
    } elseif ($period == 'month') {
        $daysLimit = 30;
    }

    $query = "
        SELECT
            DATE(visit_time) as date,
            COUNT(*) as visits,
            COUNT(DISTINCT visitor_id) as unique_visitors
        FROM visits
        WHERE visit_time >= DATE('now', '-{$daysLimit} days', 'localtime')
        GROUP BY DATE(visit_time)
        ORDER BY date
    ";
    $result = $db->query($query);
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $stats['dailyVisits'][] = $row;
    }

    return $stats;
}

// Функция для получения подробной информации о посетителях
function getVisitorsData($db, $period = 'all', $page = 1, $perPage = 20) {
    $timeCondition = '';
    switch ($period) {
        case 'today':
            $timeCondition = "WHERE DATE(first_visit_at) = DATE('now', 'localtime')";
            break;
        case 'yesterday':
            $timeCondition = "WHERE DATE(first_visit_at) = DATE('now', '-1 day', 'localtime')";
            break;
        case 'week':
            $timeCondition = "WHERE DATE(first_visit_at) >= DATE('now', '-7 days', 'localtime')";
            break;
        case 'month':
            $timeCondition = "WHERE DATE(first_visit_at) >= DATE('now', '-30 days', 'localtime')";
            break;
        default:
            $timeCondition = '';
    }

    // Подсчитываем общее количество записей для пагинации
    $query = "SELECT COUNT(*) as count FROM visitors {$timeCondition}";
    $result = $db->query($query);
    $totalVisitors = $result->fetchArray(SQLITE3_ASSOC)['count'];

    // Вычисляем смещение для пагинации
    $offset = ($page - 1) * $perPage;

    // Получаем данные с пагинацией
    $query = "
        SELECT
            v.*,
            (SELECT COUNT(*) FROM visits WHERE visitor_id = v.visitor_id) as total_visits,
            (SELECT MAX(visit_time) FROM visits WHERE visitor_id = v.visitor_id) as last_visit
        FROM visitors v
        {$timeCondition}
        ORDER BY last_visit DESC
        LIMIT {$perPage} OFFSET {$offset}
    ";

    $result = $db->query($query);
    $visitors = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $visitors[] = $row;
    }

    // Возвращаем данные и информацию для пагинации
    return [
        'visitors' => $visitors,
        'total' => $totalVisitors,
        'pages' => ceil($totalVisitors / $perPage),
        'current_page' => $page
    ];
}

// Функция для получения детальной информации о конкретном посетителе
function getVisitorDetails($db, $visitorId) {
    // Информация о посетителе
    $stmt = $db->prepare("SELECT * FROM visitors WHERE visitor_id = :visitor_id");
    $stmt->bindValue(':visitor_id', $visitorId, SQLITE3_TEXT);
    $result = $stmt->execute();
    $visitor = $result->fetchArray(SQLITE3_ASSOC);

    if (!$visitor) {
        return null;
    }

    // История посещений
    $stmt = $db->prepare("
        SELECT * FROM visits
        WHERE visitor_id = :visitor_id
        ORDER BY visit_time DESC
    ");
    $stmt->bindValue(':visitor_id', $visitorId, SQLITE3_TEXT);
    $result = $stmt->execute();

    $visits = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $visits[] = $row;
    }

    $visitor['visits'] = $visits;

    return $visitor;
}

// Функция для получения статистики по страницам
function getPagesData($db, $period = 'all', $page = 1, $perPage = 20) {
    $timeCondition = '';
    switch ($period) {
        case 'today':
            $timeCondition = "WHERE DATE(visit_time) = DATE('now', 'localtime')";
            break;
        case 'yesterday':
            $timeCondition = "WHERE DATE(visit_time) = DATE('now', '-1 day', 'localtime')";
            break;
        case 'week':
            $timeCondition = "WHERE DATE(visit_time) >= DATE('now', '-7 days', 'localtime')";
            break;
        case 'month':
            $timeCondition = "WHERE DATE(visit_time) >= DATE('now', '-30 days', 'localtime')";
            break;
        default:
            $timeCondition = '';
    }

    // Подсчитываем общее количество уникальных страниц
    $query = "SELECT COUNT(DISTINCT page_url) as count FROM visits {$timeCondition}";
    $result = $db->query($query);
    $totalPages = $result->fetchArray(SQLITE3_ASSOC)['count'];

    // Вычисляем смещение для пагинации
    $offset = ($page - 1) * $perPage;

    // Получаем статистику по страницам с пагинацией
    $query = "
        SELECT
            page_url,
            COUNT(*) as visits,
            COUNT(DISTINCT visitor_id) as unique_visitors,
            MIN(visit_time) as first_visit,
            MAX(visit_time) as last_visit
        FROM visits
        {$timeCondition}
        GROUP BY page_url
        ORDER BY visits DESC
        LIMIT {$perPage} OFFSET {$offset}
    ";

    $result = $db->query($query);
    $pages = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $pages[] = $row;
    }

    return [
        'pages' => $pages,
        'total' => $totalPages,
        'pages_count' => ceil($totalPages / $perPage),
        'current_page' => $page
    ];
}

// Функция для получения детальной информации о конкретной странице
function getPageDetails($db, $pageUrl, $period = 'all') {
    $timeCondition = '';
    switch ($period) {
        case 'today':
            $timeCondition = "AND DATE(visit_time) = DATE('now', 'localtime')";
            break;
        case 'yesterday':
            $timeCondition = "AND DATE(visit_time) = DATE('now', '-1 day', 'localtime')";
            break;
        case 'week':
            $timeCondition = "AND DATE(visit_time) >= DATE('now', '-7 days', 'localtime')";
            break;
        case 'month':
            $timeCondition = "AND DATE(visit_time) >= DATE('now', '-30 days', 'localtime')";
            break;
        default:
            $timeCondition = '';
    }

    // Основная информация о странице
    $stmt = $db->prepare("
        SELECT
            page_url,
            COUNT(*) as visits,
            COUNT(DISTINCT visitor_id) as unique_visitors,
            MIN(visit_time) as first_visit,
            MAX(visit_time) as last_visit
        FROM visits
        WHERE page_url = :page_url {$timeCondition}
        GROUP BY page_url
    ");
    $stmt->bindValue(':page_url', $pageUrl, SQLITE3_TEXT);
    $result = $stmt->execute();
    $pageInfo = $result->fetchArray(SQLITE3_ASSOC);

    if (!$pageInfo) {
        return null;
    }

    // Получаем данные по посещениям по дням
    $daysLimit = 30;
    $stmt = $db->prepare("
        SELECT
            DATE(visit_time) as date,
            COUNT(*) as visits,
            COUNT(DISTINCT visitor_id) as unique_visitors
        FROM visits
        WHERE page_url = :page_url AND visit_time >= DATE('now', '-{$daysLimit} days', 'localtime')
        GROUP BY DATE(visit_time)
        ORDER BY date
    ");
    $stmt->bindValue(':page_url', $pageUrl, SQLITE3_TEXT);
    $result = $stmt->execute();

    $dailyVisits = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $dailyVisits[] = $row;
    }

    $pageInfo['dailyVisits'] = $dailyVisits;

    // Получаем данные по источникам трафика для этой страницы
    $stmt = $db->prepare("
        SELECT
            CASE
                WHEN referrer = '' THEN 'Direct'
                WHEN referrer IS NULL THEN 'Direct'
                ELSE referrer
            END as source,
            COUNT(*) as visits
        FROM visits
        WHERE page_url = :page_url {$timeCondition}
        GROUP BY source
        ORDER BY visits DESC
        LIMIT 10
    ");
    $stmt->bindValue(':page_url', $pageUrl, SQLITE3_TEXT);
    $result = $stmt->execute();

    $referrers = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $referrers[] = $row;
    }

    $pageInfo['referrers'] = $referrers;

    return $pageInfo;
}

// Функция для получения статистики по источникам трафика
function getReferrersData($db, $period = 'all', $page = 1, $perPage = 20) {
    $timeCondition = '';
    switch ($period) {
        case 'today':
            $timeCondition = "WHERE DATE(visit_time) = DATE('now', 'localtime')";
            break;
        case 'yesterday':
            $timeCondition = "WHERE DATE(visit_time) = DATE('now', '-1 day', 'localtime')";
            break;
        case 'week':
            $timeCondition = "WHERE DATE(visit_time) >= DATE('now', '-7 days', 'localtime')";
            break;
        case 'month':
            $timeCondition = "WHERE DATE(visit_time) >= DATE('now', '-30 days', 'localtime')";
            break;
        default:
            $timeCondition = '';
    }

    // Подсчитываем общее количество уникальных источников
    $query = "
        SELECT COUNT(DISTINCT CASE
            WHEN referrer = '' THEN 'Direct'
            WHEN referrer IS NULL THEN 'Direct'
            ELSE referrer
        END) as count
        FROM visits {$timeCondition}
    ";
    $result = $db->query($query);
    $totalReferrers = $result->fetchArray(SQLITE3_ASSOC)['count'];

    // Вычисляем смещение для пагинации
    $offset = ($page - 1) * $perPage;

    // Получаем статистику по источникам с пагинацией
    $query = "
        SELECT
            CASE
                WHEN referrer = '' THEN 'Direct'
                WHEN referrer IS NULL THEN 'Direct'
                ELSE referrer
            END as source,
            COUNT(*) as visits,
            COUNT(DISTINCT visitor_id) as unique_visitors,
            MIN(visit_time) as first_visit,
            MAX(visit_time) as last_visit
        FROM visits
        {$timeCondition}
        GROUP BY source
        ORDER BY visits DESC
        LIMIT {$perPage} OFFSET {$offset}
    ";

    $result = $db->query($query);
    $referrers = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $referrers[] = $row;
    }

    return [
        'referrers' => $referrers,
        'total' => $totalReferrers,
        'pages_count' => ceil($totalReferrers / $perPage),
        'current_page' => $page
    ];
}

// Функция для получения детальной информации о конкретном источнике
function getReferrerDetails($db, $referrer, $period = 'all') {
    $timeCondition = '';
    switch ($period) {
        case 'today':
            $timeCondition = "AND DATE(visit_time) = DATE('now', 'localtime')";
            break;
        case 'yesterday':
            $timeCondition = "AND DATE(visit_time) = DATE('now', '-1 day', 'localtime')";
            break;
        case 'week':
            $timeCondition = "AND DATE(visit_time) >= DATE('now', '-7 days', 'localtime')";
            break;
        case 'month':
            $timeCondition = "AND DATE(visit_time) >= DATE('now', '-30 days', 'localtime')";
            break;
        default:
            $timeCondition = '';
    }

    // Обработка прямого трафика
    $referrerCondition = '';
    if ($referrer === 'Direct') {
        $referrerCondition = "(referrer = '' OR referrer IS NULL)";
    } else {
        $referrerCondition = "referrer = :referrer";
    }

    // Основная информация о источнике
    $query = "
        SELECT
            CASE
                WHEN referrer = '' THEN 'Direct'
                WHEN referrer IS NULL THEN 'Direct'
                ELSE referrer
            END as source,
            COUNT(*) as visits,
            COUNT(DISTINCT visitor_id) as unique_visitors,
            MIN(visit_time) as first_visit,
            MAX(visit_time) as last_visit
        FROM visits
        WHERE {$referrerCondition} {$timeCondition}
        GROUP BY source
    ";

    $stmt = $db->prepare($query);
    if ($referrer !== 'Direct') {
        $stmt->bindValue(':referrer', $referrer, SQLITE3_TEXT);
    }
    $result = $stmt->execute();
    $referrerInfo = $result->fetchArray(SQLITE3_ASSOC);

    if (!$referrerInfo) {
        return null;
    }

    // Получаем данные по посещениям по дням
    $daysLimit = 30;
    $query = "
        SELECT
            DATE(visit_time) as date,
            COUNT(*) as visits,
            COUNT(DISTINCT visitor_id) as unique_visitors
        FROM visits
        WHERE {$referrerCondition} AND visit_time >= DATE('now', '-{$daysLimit} days', 'localtime')
        GROUP BY DATE(visit_time)
        ORDER BY date
    ";

    $stmt = $db->prepare($query);
    if ($referrer !== 'Direct') {
        $stmt->bindValue(':referrer', $referrer, SQLITE3_TEXT);
    }
    $result = $stmt->execute();

    $dailyVisits = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $dailyVisits[] = $row;
    }

    $referrerInfo['dailyVisits'] = $dailyVisits;

    // Получаем данные по целевым страницам для этого источника
    $query = "
        SELECT
            page_url,
            COUNT(*) as visits,
            COUNT(DISTINCT visitor_id) as unique_visitors
        FROM visits
        WHERE {$referrerCondition} {$timeCondition}
        GROUP BY page_url
        ORDER BY visits DESC
        LIMIT 10
    ";

    $stmt = $db->prepare($query);
    if ($referrer !== 'Direct') {
        $stmt->bindValue(':referrer', $referrer, SQLITE3_TEXT);
    }
    $result = $stmt->execute();

    $pages = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $pages[] = $row;
    }

    $referrerInfo['pages'] = $pages;

    return $referrerInfo;
}

// Получение данных в зависимости от текущей страницы
$data = [];
$db = null;
$error = null;

if ($isAuthenticated) {
    try {
        $db = new SQLite3($dbPath);

        // Получаем данные в зависимости от текущей страницы
        $currentPageId = isset($_GET['id']) ? $_GET['id'] : null;
        $pageNum = isset($_GET['pageNum']) ? (int)$_GET['pageNum'] : 1;

        switch ($currentPage) {
            case 'dashboard':
                $data = getStatistics($db, $selectedPeriod);
                break;
            case 'visitors':
                if ($currentPageId) {
                    $data = getVisitorDetails($db, $currentPageId);
                    if (!$data) {
                        $error = "Посетитель не найден";
                    }
                } else {
                    $data = getVisitorsData($db, $selectedPeriod, $pageNum);
                }
                break;
            case 'pages':
                if ($currentPageId) {
                    $data = getPageDetails($db, urldecode($currentPageId), $selectedPeriod);
                    if (!$data) {
                        $error = "Страница не найдена";
                    }
                } else {
                    $data = getPagesData($db, $selectedPeriod, $pageNum);
                }
                break;
            case 'referrers':
                if ($currentPageId) {
                    $data = getReferrerDetails($db, urldecode($currentPageId), $selectedPeriod);
                    if (!$data) {
                        $error = "Источник не найден";
                    }
                } else {
                    $data = getReferrersData($db, $selectedPeriod, $pageNum);
                }
                break;
        }
    } catch (Exception $e) {
        $error = "Ошибка при загрузке данных: " . $e->getMessage();
    } finally {
        if (isset($db)) {
            $db->close();
        }
    }
}

// Функция для форматирования URL-адресов
function formatUrl($url, $maxLength = 50) {
    $displayUrl = htmlspecialchars($url);
    if (strlen($displayUrl) > $maxLength) {
        $displayUrl = substr($displayUrl, 0, $maxLength - 3) . '...';
    }
    return $displayUrl;
}

// Функция для форматирования даты/времени
function formatDateTime($dateTime) {
    return date('d.m.Y H:i', strtotime($dateTime));
}

// Формирование URL с учетом текущих параметров
function buildUrl($params = []) {
    $query = $_GET;
    foreach ($params as $key => $value) {
        $query[$key] = $value;
    }
    return '?' . http_build_query($query);
}

?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Админ-панель аналитики</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.3/font/bootstrap-icons.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        :root {
            --sidebar-width: 260px;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f7fb;
            color: #333;
        }
        .login-container {
            max-width: 400px;
            margin: 100px auto;
            padding: 30px;
            border-radius: 8px;
            background-color: white;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        .sidebar {
            width: var(--sidebar-width);
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            background-color: #fff;
            border-right: 1px solid #e5e9f2;
            padding: 20px 0;
            overflow-y: auto;
            z-index: 1000;
        }
        .main-content {
            margin-left: var(--sidebar-width);
            padding: 20px 30px;
        }
        .logo {
            padding: 20px;
            margin-bottom: 20px;
            text-align: center;
        }
        .logo-text {
            font-size: 24px;
            font-weight: 600;
            color: #2c7be5;
        }
        .nav-link {
            color: #6c757d;
            padding: 10px 20px;
            display: flex;
            align-items: center;
            transition: all 0.3s;
        }
        .nav-link:hover {
            color: #2c7be5;
        }
        .nav-link.active {
            background-color: rgba(44, 123, 229, 0.1);
            color: #2c7be5;
            border-left: 3px solid #2c7be5;
            font-weight: 500;
        }
        .nav-link i {
            margin-right: 10px;
            font-size: 18px;
        }
        .card {
            border: none;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
            margin-bottom: 24px;
        }
        .card-header {
            background-color: #fff;
            border-bottom: 1px solid #e5e9f2;
            padding: 16px 20px;
        }
        .card-title {
            font-weight: 600;
            margin-bottom: 0;
            color: #1a2c55;
        }
        .stat-card {
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
            padding: 20px;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
        }
        .stat-icon {
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            margin-right: 15px;
            font-size: 24px;
        }
        .stat-info h3 {
            font-size: 28px;
            margin-bottom: 5px;
            font-weight: 600;
        }
        .stat-info p {
            margin: 0;
            color: #6c757d;
            font-size: 14px;
        }
        .progress {
            height: 8px;
            margin-top: 10px;
        }
        .text-primary { color: #2c7be5 !important; }
        .bg-primary-soft { background-color: rgba(44, 123, 229, 0.1); }
        .text-success { color: #00d97e !important; }
        .bg-success-soft { background-color: rgba(0, 217, 126, 0.1); }
        .text-info { color: #39afd1 !important; }
        .bg-info-soft { background-color: rgba(57, 175, 209, 0.1); }
        .text-warning { color: #f6c343 !important; }
        .bg-warning-soft { background-color: rgba(246, 195, 67, 0.1); }
        .navbar {
            background-color: #fff;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
            padding: 0.5rem 1.5rem;
        }
        .table {
            color: #12263f;
        }
        .table th {
            font-weight: 500;
            color: #95aac9;
            border-top: none;
        }
        .table td {
            vertical-align: middle;
            padding: 12px 16px;
        }
        .table-hover tbody tr:hover {
            background-color: rgba(245, 247, 251, 0.5);
        }
        .period-selector {
            display: flex;
            align-items: center;
            background-color: #fff;
            border-radius: 8px;
            padding: 8px;
            margin-bottom: 24px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
        .period-selector a {
            padding: 8px 16px;
            border-radius: 4px;
            color: #6c757d;
            text-decoration: none;
            font-weight: 500;
            margin-right: 4px;
        }
        .period-selector a.active {
            background-color: #2c7be5;
            color: white;
        }
        .period-selector a:hover:not(.active) {
            background-color: #f5f7fb;
        }
        .chart-container {
            position: relative;
            margin: auto;
            height: 300px;
        }
        .brand-section {
            display: flex;
            align-items: center;
            justify-content: center;
            padding-top: 20px;
            color: #95aac9;
            font-size: 14px;
        }
        .brand-section i {
            margin-right: 8px;
            color: #2c7be5;
        }
        .badge {
            padding: 5px 10px;
            border-radius: 50px;
            font-weight: 500;
        }
        .badge-soft-primary {
            background-color: rgba(44, 123, 229, 0.1);
            color: #2c7be5;
        }
        .badge-soft-success {
            background-color: rgba(0, 217, 126, 0.1);
            color: #00d97e;
        }
        .badge-soft-info {
            background-color: rgba(57, 175, 209, 0.1);
            color: #39afd1;
        }
        .visitor-details-table {
            margin-bottom: 0;
        }
        .visitor-details-table td {
            padding: 12px 16px;
            border-top: none;
            border-bottom: 1px solid #e5e9f2;
        }
        .visitor-details-table td:first-child {
            width: 200px;
            color: #95aac9;
            font-weight: 500;
        }
        .pagination {
            margin-bottom: 0;
        }
        .pagination .page-link {
            color: #2c7be5;
            border: none;
            padding: 8px 16px;
            font-weight: 500;
        }
        .pagination .page-item.active .page-link {
            background-color: #2c7be5;
            color: white;
        }
        .pagination .page-item.disabled .page-link {
            color: #95aac9;
        }
        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }
        .page-header .breadcrumb {
            background-color: transparent;
            padding: 0;
            margin-bottom: 0;
        }
        .page-header .breadcrumb-item + .breadcrumb-item::before {
            content: ">";
        }
        @media (max-width: 768px) {
            .sidebar {
                width: 70px;
            }
            .main-content {
                margin-left: 70px;
            }
            .logo-text, .nav-text {
                display: none;
            }
            .nav-link {
                justify-content: center;
                padding: 10px;
            }
            .nav-link i {
                margin-right: 0;
            }
        }
    </style>
</head>
<body>

<?php if (!$isAuthenticated): ?>
    <!-- Форма авторизации -->
    <div class="login-container">
        <h4 class="mb-4 text-center">Авторизация в системе аналитики</h4>
        <?php if (isset($loginError)): ?>
            <div class="alert alert-danger" role="alert">
                <?php echo htmlspecialchars($loginError); ?>
            </div>
        <?php endif; ?>
        <form method="post">
            <div class="mb-3">
                <label for="username" class="form-label">Имя пользователя</label>
                <input type="text" class="form-control" id="username" name="username" required>
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">Пароль</label>
                <input type="password" class="form-control" id="password" name="password" required>
            </div>
            <button type="submit" name="login" class="btn btn-primary w-100">Войти</button>
        </form>
    </div>
<?php else: ?>
    <!-- Админ-панель -->
    <div class="sidebar">
        <div class="logo">
            <div class="logo-text">Аналитика</div>
        </div>
        <ul class="nav flex-column">
            <li class="nav-item">
                <a class="nav-link <?php echo $currentPage === 'dashboard' ? 'active' : ''; ?>" href="?page=dashboard">
                    <i class="bi bi-graph-up"></i>
                    <span class="nav-text">Дашборд</span>
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link <?php echo $currentPage === 'visitors' ? 'active' : ''; ?>" href="?page=visitors">
                    <i class="bi bi-people"></i>
                    <span class="nav-text">Посетители</span>
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link <?php echo $currentPage === 'pages' ? 'active' : ''; ?>" href="?page=pages">
                    <i class="bi bi-file-earmark-text"></i>
                    <span class="nav-text">Страницы</span>
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link <?php echo $currentPage === 'referrers' ? 'active' : ''; ?>" href="?page=referrers">
                    <i class="bi bi-globe2"></i>
                    <span class="nav-text">Источники</span>
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link <?php echo $currentPage === 'settings' ? 'active' : ''; ?>" href="?page=settings">
                    <i class="bi bi-gear"></i>
                    <span class="nav-text">Настройки</span>
                </a>
            </li>
            <li class="nav-item mt-auto">
                <a class="nav-link" href="?logout=1">
                    <i class="bi bi-box-arrow-right"></i>
                    <span class="nav-text">Выход</span>
                </a>
            </li>
        </ul>
        <div class="brand-section mt-auto">
            <i class="bi bi-bar-chart-line-fill"></i>
            <span>SimpleAnalytics</span>
        </div>
    </div>

    <div class="main-content">
        <div class="container-fluid px-0">
            <?php if (isset($error)): ?>
                <div class="alert alert-danger" role="alert">
                    <?php echo htmlspecialchars($error); ?>
                </div>
            <?php else: ?>

                <!-- Период (для всех страниц кроме детализации) -->
                <?php if (!isset($_GET['id'])): ?>
                <div class="period-selector">
                    <a href="<?php echo buildUrl(['period' => 'today']); ?>" class="<?php echo $selectedPeriod === 'today' ? 'active' : ''; ?>">
                        Сегодня
                    </a>
                    <a href="<?php echo buildUrl(['period' => 'yesterday']); ?>" class="<?php echo $selectedPeriod === 'yesterday' ? 'active' : ''; ?>">
                        Вчера
                    </a>
                    <a href="<?php echo buildUrl(['period' => 'week']); ?>" class="<?php echo $selectedPeriod === 'week' ? 'active' : ''; ?>">
                        Неделя
                    </a>
                    <a href="<?php echo buildUrl(['period' => 'month']); ?>" class="<?php echo $selectedPeriod === 'month' ? 'active' : ''; ?>">
                        Месяц
                    </a>
                    <a href="<?php echo buildUrl(['period' => 'all']); ?>" class="<?php echo $selectedPeriod === 'all' ? 'active' : ''; ?>">
                        Всё время
                    </a>
                </div>
                <?php endif; ?>
                <?php if ($currentPage === 'dashboard'): ?>
                            <!-- ДАШБОРД -->
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <h4 class="mb-0">Статистика сайта</h4>
                            </div>

                            <!-- Ключевые метрики -->
                            <div class="row">
                                <div class="col-md-3">
                                    <div class="stat-card">
                                        <div class="stat-icon bg-primary-soft text-primary">
                                            <i class="bi bi-eye"></i>
                                        </div>
                                        <div class="stat-info">
                                            <h3><?php echo number_format($data['totalVisits']); ?></h3>
                                            <p>Всего просмотров</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="stat-card">
                                        <div class="stat-icon bg-success-soft text-success">
                                            <i class="bi bi-person"></i>
                                        </div>
                                        <div class="stat-info">
                                            <h3><?php echo number_format($data['uniqueVisitors']); ?></h3>
                                            <p>Уникальных посетителей</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="stat-card">
                                        <div class="stat-icon bg-info-soft text-info">
                                            <i class="bi bi-person-plus"></i>
                                        </div>
                                        <div class="stat-info">
                                            <h3><?php echo number_format($data['newVisitors']); ?></h3>
                                            <p>Новых посетителей</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="stat-card">
                                        <div class="stat-icon bg-warning-soft text-warning">
                                            <i class="bi bi-graph-up-arrow"></i>
                                        </div>
                                        <div class="stat-info">
                                            <?php
                                                $viewsPerVisitor = $data['uniqueVisitors'] > 0
                                                    ? round($data['totalVisits'] / $data['uniqueVisitors'], 1)
                                                    : 0;
                                            ?>
                                            <h3><?php echo $viewsPerVisitor; ?></h3>
                                            <p>Просмотров на посетителя</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- График посещений -->
                            <div class="row">
                                <div class="col-12">
                                    <div class="card">
                                        <div class="card-header">
                                            <h5 class="card-title">Посещения по дням</h5>
                                        </div>
                                        <div class="card-body">
                                            <div class="chart-container">
                                                <canvas id="visitsChart"></canvas>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <!-- Популярные страницы -->
                                <div class="col-md-6">
                                    <div class="card">
                                        <div class="card-header">
                                            <h5 class="card-title">Популярные страницы</h5>
                                        </div>
                                        <div class="card-body">
                                            <div class="table-responsive">
                                                <table class="table table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th>Страница</th>
                                                            <th>Просмотры</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <?php foreach ($data['popularPages'] as $page): ?>
                                                        <tr>
                                                            <td>
                                                                <a href="?page=pages&id=<?php echo urlencode($page['page_url']); ?>">
                                                                    <?php echo formatUrl($page['page_url']); ?>
                                                                </a>
                                                            </td>
                                                            <td><?php echo number_format($page['visits']); ?></td>
                                                        </tr>
                                                        <?php endforeach; ?>
                                                        <?php if (empty($data['popularPages'])): ?>
                                                        <tr>
                                                            <td colspan="2" class="text-center">Нет данных</td>
                                                        </tr>
                                                        <?php endif; ?>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Источники трафика -->
                                <div class="col-md-6">
                                    <div class="card">
                                        <div class="card-header">
                                            <h5 class="card-title">Источники трафика</h5>
                                        </div>
                                        <div class="card-body">
                                            <div class="table-responsive">
                                                <table class="table table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th>Источник</th>
                                                            <th>Посещения</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <?php foreach ($data['topReferrers'] as $referrer): ?>
                                                        <tr>
                                                            <td>
                                                                <a href="?page=referrers&id=<?php echo urlencode($referrer['source']); ?>">
                                                                    <?php echo formatUrl($referrer['source']); ?>
                                                                </a>
                                                            </td>
                                                            <td><?php echo number_format($referrer['visits']); ?></td>
                                                        </tr>
                                                        <?php endforeach; ?>
                                                        <?php if (empty($data['topReferrers'])): ?>
                                                        <tr>
                                                            <td colspan="2" class="text-center">Нет данных</td>
                                                        </tr>
                                                        <?php endif; ?>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <!-- Устройства -->
                                <div class="col-md-4">
                                    <div class="card">
                                        <div class="card-header">
                                            <h5 class="card-title">Устройства</h5>
                                        </div>
                                        <div class="card-body">
                                            <div class="chart-container" style="height: 250px;">
                                                <canvas id="devicesChart"></canvas>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Браузеры -->
                                <div class="col-md-4">
                                    <div class="card">
                                        <div class="card-header">
                                            <h5 class="card-title">Браузеры</h5>
                                        </div>
                                        <div class="card-body">
                                            <div class="chart-container" style="height: 250px;">
                                                <canvas id="browsersChart"></canvas>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Страны -->
                                <div class="col-md-4">
                                    <div class="card">
                                        <div class="card-header">
                                            <h5 class="card-title">Страны</h5>
                                        </div>
                                        <div class="card-body">
                                            <div class="table-responsive" style="height: 250px; overflow-y: auto;">
                                                <table class="table table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th>Страна</th>
                                                            <th>Посещения</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <?php foreach ($data['countries'] as $country): ?>
                                                        <tr>
                                                            <td><?php echo htmlspecialchars($country['country']); ?></td>
                                                            <td><?php echo number_format($country['count']); ?></td>
                                                        </tr>
                                                        <?php endforeach; ?>
                                                        <?php if (empty($data['countries'])): ?>
                                                        <tr>
                                                            <td colspan="2" class="text-center">Нет данных</td>
                                                        </tr>
                                                        <?php endif; ?>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- СТРАНИЦА ПОСЕТИТЕЛЕЙ -->
                            <?php elseif ($currentPage === 'visitors' && !isset($_GET['id'])): ?>
                            <div class="page-header">
                                <h4 class="mb-0">Посетители сайта</h4>
                            </div>

                            <div class="card">
                                <div class="card-header">
                                    <h5 class="card-title">Список посетителей</h5>
                                </div>
                                <div class="card-body p-0">
                                    <div class="table-responsive">
                                        <table class="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>IP-адрес</th>
                                                    <th>Страна</th>
                                                    <th>Устройство</th>
                                                    <th>Браузер</th>
                                                    <th>ОС</th>
                                                    <th>Первый визит</th>
                                                    <th>Последний визит</th>
                                                    <th>Всего визитов</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <?php foreach ($data['visitors'] as $visitor): ?>
                                                <tr>
                                                    <td>
                                                        <a href="?page=visitors&id=<?php echo urlencode($visitor['visitor_id']); ?>">
                                                            <?php echo htmlspecialchars($visitor['ip_address']); ?>
                                                        </a>
                                                    </td>
                                                    <td><?php echo htmlspecialchars($visitor['country']); ?></td>
                                                    <td><?php echo htmlspecialchars($visitor['device_type']); ?></td>
                                                    <td><?php echo htmlspecialchars($visitor['browser']); ?></td>
                                                    <td><?php echo htmlspecialchars($visitor['operating_system']); ?></td>
                                                    <td><?php echo formatDateTime($visitor['first_visit_at']); ?></td>
                                                    <td><?php echo formatDateTime($visitor['last_visit']); ?></td>
                                                    <td>
                                                        <span class="badge badge-soft-primary">
                                                            <?php echo number_format($visitor['total_visits']); ?>
                                                        </span>
                                                    </td>
                                                </tr>
                                                <?php endforeach; ?>
                                                <?php if (empty($data['visitors'])): ?>
                                                <tr>
                                                    <td colspan="8" class="text-center">Нет данных</td>
                                                </tr>
                                                <?php endif; ?>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <?php if ($data['pages'] > 1): ?>
                                <div class="card-footer d-flex justify-content-center">
                                    <nav aria-label="Навигация по страницам">
                                        <ul class="pagination">
                                            <?php if ($data['current_page'] > 1): ?>
                                            <li class="page-item">
                                                <a class="page-link" href="<?php echo buildUrl(['pageNum' => $data['current_page'] - 1]); ?>" aria-label="Предыдущая">
                                                    <span aria-hidden="true">&laquo;</span>
                                                </a>
                                            </li>
                                            <?php else: ?>
                                            <li class="page-item disabled">
                                                <a class="page-link" href="#" aria-label="Предыдущая">
                                                    <span aria-hidden="true">&laquo;</span>
                                                </a>
                                            </li>
                                            <?php endif; ?>

                                            <?php
                                            $startPage = max(1, $data['current_page'] - 2);
                                            $endPage = min($data['pages'], $data['current_page'] + 2);
                                            for ($i = $startPage; $i <= $endPage; $i++):
                                            ?>
                                            <li class="page-item <?php echo $i === $data['current_page'] ? 'active' : ''; ?>">
                                                <a class="page-link" href="<?php echo buildUrl(['pageNum' => $i]); ?>"><?php echo $i; ?></a>
                                            </li>
                                            <?php endfor; ?>

                                            <?php if ($data['current_page'] < $data['pages']): ?>
                                            <li class="page-item">
                                                <a class="page-link" href="<?php echo buildUrl(['pageNum' => $data['current_page'] + 1]); ?>" aria-label="Следующая">
                                                    <span aria-hidden="true">&raquo;</span>
                                                </a>
                                            </li>
                                            <?php else: ?>
                                            <li class="page-item disabled">
                                                <a class="page-link" href="#" aria-label="Следующая">
                                                    <span aria-hidden="true">&raquo;</span>
                                                </a>
                                            </li>
                                            <?php endif; ?>
                                        </ul>
                                    </nav>
                                </div>
                                <?php endif; ?>
                            </div>

                            <!-- ДЕТАЛЬНАЯ ИНФОРМАЦИЯ О ПОСЕТИТЕЛЕ -->
                            <?php elseif ($currentPage === 'visitors' && isset($_GET['id'])): ?>
                            <div class="page-header">
                                <nav aria-label="breadcrumb">
                                    <ol class="breadcrumb">
                                        <li class="breadcrumb-item"><a href="?page=visitors">Посетители</a></li>
                                        <li class="breadcrumb-item active">Информация о посетителе</li>
                                    </ol>
                                </nav>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="card">
                                        <div class="card-header">
                                            <h5 class="card-title">Информация о посетителе</h5>
                                        </div>
                                        <div class="card-body p-0">
                                            <table class="table visitor-details-table">
                                                <tbody>
                                                    <tr>
                                                        <td>IP-адрес</td>
                                                        <td><?php echo htmlspecialchars($data['ip_address']); ?></td>
                                                    </tr>
                                                    <tr>
                                                        <td>Страна</td>
                                                        <td><?php echo htmlspecialchars($data['country']); ?></td>
                                                    </tr>
                                                    <tr>
                                                        <td>Устройство</td>
                                                        <td><?php echo htmlspecialchars($data['device_type']); ?></td>
                                                    </tr>
                                                    <tr>
                                                        <td>Браузер</td>
                                                        <td><?php echo htmlspecialchars($data['browser']); ?></td>
                                                    </tr>
                                                    <tr>
                                                        <td>Операционная система</td>
                                                        <td><?php echo htmlspecialchars($data['operating_system']); ?></td>
                                                    </tr>
                                                    <tr>
                                                        <td>Первый визит</td>
                                                        <td><?php echo formatDateTime($data['first_visit_at']); ?></td>
                                                    </tr>
                                                    <tr>
                                                        <td>Последний визит</td>
                                                        <td><?php echo formatDateTime($data['last_visit_at']); ?></td>
                                                    </tr>
                                                    <tr>
                                                        <td>User Agent</td>
                                                        <td style="word-break: break-all;"><?php echo htmlspecialchars($data['user_agent']); ?></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="stat-card">
                                        <div class="stat-icon bg-primary-soft text-primary">
                                            <i class="bi bi-eye"></i>
                                        </div>
                                        <div class="stat-info">
                                            <h3><?php echo count($data['visits']); ?></h3>
                                            <p>Всего визитов</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="card mt-4">
                                <div class="card-header">
                                    <h5 class="card-title">История посещений</h5>
                                </div>
                                <div class="card-body p-0">
                                    <div class="table-responsive">
                                        <table class="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Дата и время</th>
                                                    <th>Страница</th>
                                                    <th>Источник</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <?php foreach ($data['visits'] as $visit): ?>
                                                <tr>
                                                    <td><?php echo formatDateTime($visit['visit_time']); ?></td>
                                                    <td>
                                                        <a href="?page=pages&id=<?php echo urlencode($visit['page_url']); ?>">
                                                            <?php echo formatUrl($visit['page_url']); ?>
                                                        </a>
                                                    </td>
                                                    <td>
                                                        <?php if (!empty($visit['referrer'])): ?>
                                                        <a href="?page=referrers&id=<?php echo urlencode($visit['referrer']); ?>">
                                                            <?php echo formatUrl($visit['referrer']); ?>
                                                        </a>
                                                        <?php else: ?>
                                                        <span class="text-muted">Прямой переход</span>
                                                        <?php endif; ?>
                                                    </td>
                                                </tr>
                                                <?php endforeach; ?>
                                                <?php if (empty($data['visits'])): ?>
                                                <tr>
                                                    <td colspan="3" class="text-center">Нет данных</td>
                                                </tr>
                                                <?php endif; ?>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <!-- СТРАНИЦА СТРАНИЦ -->
                <?php elseif ($currentPage === 'pages' && !isset($_GET['id'])): ?>
                <div class="page-header">
                    <h4 class="mb-0">Статистика по страницам</h4>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Список страниц</h5>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>URL</th>
                                        <th>Просмотры</th>
                                        <th>Уникальные посетители</th>
                                        <th>Первый просмотр</th>
                                        <th>Последний просмотр</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($data['pages'] as $page): ?>
                                    <tr>
                                        <td>
                                            <a href="?page=pages&id=<?php echo urlencode($page['page_url']); ?>">
                                                <?php echo formatUrl($page['page_url']); ?>
                                            </a>
                                        </td>
                                        <td><?php echo number_format($page['visits']); ?></td>
                                        <td><?php echo number_format($page['unique_visitors']); ?></td>
                                        <td><?php echo formatDateTime($page['first_visit']); ?></td>
                                        <td><?php echo formatDateTime($page['last_visit']); ?></td>
                                    </tr>
                                    <?php endforeach; ?>
                                    <?php if (empty($data['pages'])): ?>
                                    <tr>
                                        <td colspan="5" class="text-center">Нет данных</td>
                                    </tr>
                                    <?php endif; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <?php if ($data['pages_count'] > 1): ?>
                    <div class="card-footer d-flex justify-content-center">
                        <nav aria-label="Навигация по страницам">
                            <ul class="pagination">
                                <?php if ($data['current_page'] > 1): ?>
                                <li class="page-item">
                                    <a class="page-link" href="<?php echo buildUrl(['pageNum' => $data['current_page'] - 1]); ?>" aria-label="Предыдущая">
                                        <span aria-hidden="true">&laquo;</span>
                                    </a>
                                </li>
                                <?php else: ?>
                                <li class="page-item disabled">
                                    <a class="page-link" href="#" aria-label="Предыдущая">
                                        <span aria-hidden="true">&laquo;</span>
                                    </a>
                                </li>
                                <?php endif; ?>

                                <?php
                                $startPage = max(1, $data['current_page'] - 2);
                                $endPage = min($data['pages_count'], $data['current_page'] + 2);
                                for ($i = $startPage; $i <= $endPage; $i++):
                                ?>
                                <li class="page-item <?php echo $i === $data['current_page'] ? 'active' : ''; ?>">
                                    <a class="page-link" href="<?php echo buildUrl(['pageNum' => $i]); ?>"><?php echo $i; ?></a>
                                </li>
                                <?php endfor; ?>

                                <?php if ($data['current_page'] < $data['pages_count']): ?>
                                <li class="page-item">
                                    <a class="page-link" href="<?php echo buildUrl(['pageNum' => $data['current_page'] + 1]); ?>" aria-label="Следующая">
                                        <span aria-hidden="true">&raquo;</span>
                                    </a>
                                </li>
                                <?php else: ?>
                                <li class="page-item disabled">
                                    <a class="page-link" href="#" aria-label="Следующая">
                                        <span aria-hidden="true">&raquo;</span>
                                    </a>
                                </li>
                                <?php endif; ?>
                            </ul>
                        </nav>
                    </div>
                    <?php endif; ?>
                </div>

                <!-- ДЕТАЛЬНАЯ ИНФОРМАЦИЯ О СТРАНИЦЕ -->
                <?php elseif ($currentPage === 'pages' && isset($_GET['id'])): ?>
                <div class="page-header">
                    <nav aria-label="breadcrumb">
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item"><a href="?page=pages">Страницы</a></li>
                            <li class="breadcrumb-item active">Детальная информация</li>
                        </ol>
                    </nav>
                </div>

                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="card-title">URL страницы</h5>
                    </div>
                    <div class="card-body">
                        <p class="mb-0" style="word-break: break-all;"><?php echo htmlspecialchars($data['page_url']); ?></p>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-3">
                        <div class="stat-card">
                            <div class="stat-icon bg-primary-soft text-primary">
                                <i class="bi bi-eye"></i>
                            </div>
                            <div class="stat-info">
                                <h3><?php echo number_format($data['visits']); ?></h3>
                                <p>Всего просмотров</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card">
                            <div class="stat-icon bg-success-soft text-success">
                                <i class="bi bi-person"></i>
                            </div>
                            <div class="stat-info">
                                <h3><?php echo number_format($data['unique_visitors']); ?></h3>
                                <p>Уникальных посетителей</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card">
                            <div class="stat-icon bg-info-soft text-info">
                                <i class="bi bi-calendar"></i>
                            </div>
                            <div class="stat-info">
                                <h3><?php echo formatDateTime($data['first_visit']); ?></h3>
                                <p>Первый просмотр</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card">
                            <div class="stat-icon bg-warning-soft text-warning">
                                <i class="bi bi-calendar-check"></i>
                            </div>
                            <div class="stat-info">
                                <h3><?php echo formatDateTime($data['last_visit']); ?></h3>
                                <p>Последний просмотр</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-8">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title">Динамика просмотров</h5>
                            </div>
                            <div class="card-body">
                                <div class="chart-container">
                                    <canvas id="pageVisitsChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title">Источники трафика</h5>
                            </div>
                            <div class="card-body">
                                <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
                                    <table class="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Источник</th>
                                                <th>Посещения</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <?php foreach ($data['referrers'] as $referrer): ?>
                                            <tr>
                                                <td>
                                                    <a href="?page=referrers&id=<?php echo urlencode($referrer['source']); ?>">
                                                        <?php echo formatUrl($referrer['source']); ?>
                                                    </a>
                                                </td>
                                                <td><?php echo number_format($referrer['visits']); ?></td>
                                            </tr>
                                            <?php endforeach; ?>
                                            <?php if (empty($data['referrers'])): ?>
                                            <tr>
                                                <td colspan="2" class="text-center">Нет данных</td>
                                            </tr>
                                            <?php endif; ?>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- СТРАНИЦА ИСТОЧНИКОВ -->
                <?php elseif ($currentPage === 'referrers' && !isset($_GET['id'])): ?>
                <div class="page-header">
                    <h4 class="mb-0">Источники трафика</h4>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Список источников</h5>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Источник</th>
                                        <th>Посещения</th>
                                        <th>Уникальные посетители</th>
                                        <th>Первый переход</th>
                                        <th>Последний переход</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($data['referrers'] as $referrer): ?>
                                    <tr>
                                        <td>
                                            <a href="?page=referrers&id=<?php echo urlencode($referrer['source']); ?>">
                                                <?php echo formatUrl($referrer['source']); ?>
                                            </a>
                                        </td>
                                        <td><?php echo number_format($referrer['visits']); ?></td>
                                        <td><?php echo number_format($referrer['unique_visitors']); ?></td>
                                        <td><?php echo formatDateTime($referrer['first_visit']); ?></td>
                                        <td><?php echo formatDateTime($referrer['last_visit']); ?></td>
                                    </tr>
                                    <?php endforeach; ?>
                                    <?php if (empty($data['referrers'])): ?>
                                    <tr>
                                        <td colspan="5" class="text-center">Нет данных</td>
                                    </tr>
                                    <?php endif; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <?php if ($data['pages_count'] > 1): ?>
                    <div class="card-footer d-flex justify-content-center">
                        <nav aria-label="Навигация по страницам">
                            <ul class="pagination">
                                <?php if ($data['current_page'] > 1): ?>
                                <li class="page-item">
                                    <a class="page-link" href="<?php echo buildUrl(['pageNum' => $data['current_page'] - 1]); ?>" aria-label="Предыдущая">
                                        <span aria-hidden="true">&laquo;</span>
                                    </a>
                                </li>
                                <?php else: ?>
                                <li class="page-item disabled">
                                    <a class="page-link" href="#" aria-label="Предыдущая">
                                        <span aria-hidden="true">&laquo;</span>
                                    </a>
                                </li>
                                <?php endif; ?>

                                <?php
                                $startPage = max(1, $data['current_page'] - 2);
                                $endPage = min($data['pages_count'], $data['current_page'] + 2);
                                for ($i = $startPage; $i <= $endPage; $i++):
                                ?>
                                <li class="page-item <?php echo $i === $data['current_page'] ? 'active' : ''; ?>">
                                    <a class="page-link" href="<?php echo buildUrl(['pageNum' => $i]); ?>"><?php echo $i; ?></a>
                                </li>
                                <?php endfor; ?>

                                <?php if ($data['current_page'] < $data['pages_count']): ?>
                                <li class="page-item">
                                    <a class="page-link" href="<?php echo buildUrl(['pageNum' => $data['current_page'] + 1]); ?>" aria-label="Следующая">
                                        <span aria-hidden="true">&raquo;</span>
                                    </a>
                                </li>
                                <?php else: ?>
                                <li class="page-item disabled">
                                    <a class="page-link" href="#" aria-label="Следующая">
                                        <span aria-hidden="true">&raquo;</span>
                                    </a>
                                </li>
                                <?php endif; ?>
                            </ul>
                        </nav>
                    </div>
                    <?php endif; ?>
                </div>
                <!-- ДЕТАЛЬНАЯ ИНФОРМАЦИЯ ОБ ИСТОЧНИКЕ -->
                <?php elseif ($currentPage === 'referrers' && isset($_GET['id'])): ?>
                <div class="page-header">
                    <nav aria-label="breadcrumb">
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item"><a href="?page=referrers">Источники</a></li>
                            <li class="breadcrumb-item active">Детальная информация</li>
                        </ol>
                    </nav>
                </div>

                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="card-title">Источник трафика</h5>
                    </div>
                    <div class="card-body">
                        <p class="mb-0" style="word-break: break-all;"><?php echo htmlspecialchars($data['source']); ?></p>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-4">
                        <div class="stat-card">
                            <div class="stat-icon bg-primary-soft text-primary">
                                <i class="bi bi-eye"></i>
                            </div>
                            <div class="stat-info">
                                <h3><?php echo number_format($data['visits']); ?></h3>
                                <p>Всего переходов</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="stat-card">
                            <div class="stat-icon bg-success-soft text-success">
                                <i class="bi bi-person"></i>
                            </div>
                            <div class="stat-info">
                                <h3><?php echo number_format($data['unique_visitors']); ?></h3>
                                <p>Уникальных посетителей</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="stat-card">
                            <div class="stat-icon bg-info-soft text-info">
                                <i class="bi bi-calendar"></i>
                            </div>
                            <div class="stat-info">
                                <h3><?php echo formatDateTime($data['first_visit']); ?></h3>
                                <p>Первый переход</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-8">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title">Динамика переходов</h5>
                            </div>
                            <div class="card-body">
                                <div class="chart-container">
                                    <canvas id="referrerVisitsChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title">Целевые страницы</h5>
                            </div>
                            <div class="card-body">
                                <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
                                    <table class="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Страница</th>
                                                <th>Переходы</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <?php foreach ($data['pages'] as $page): ?>
                                            <tr>
                                                <td>
                                                    <a href="?page=pages&id=<?php echo urlencode($page['page_url']); ?>">
                                                        <?php echo formatUrl($page['page_url']); ?>
                                                    </a>
                                                </td>
                                                <td><?php echo number_format($page['visits']); ?></td>
                                            </tr>
                                            <?php endforeach; ?>
                                            <?php if (empty($data['pages'])): ?>
                                            <tr>
                                                <td colspan="2" class="text-center">Нет данных</td>
                                            </tr>
                                            <?php endif; ?>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- СТРАНИЦА НАСТРОЕК -->
                <?php elseif ($currentPage === 'settings'): ?>
                <div class="page-header">
                    <h4 class="mb-0">Настройки системы</h4>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title">Информация о базе данных</h5>
                            </div>
                            <div class="card-body">
                                <table class="table visitor-details-table">
                                    <tbody>
                                        <tr>
                                            <td>Путь к базе данных</td>
                                            <td><?php echo htmlspecialchars($dbPath); ?></td>
                                        </tr>
                                        <tr>
                                            <td>Размер файла</td>
                                            <td>
                                                <?php
                                                if (file_exists($dbPath)) {
                                                    $size = filesize($dbPath);
                                                    echo round($size / 1024, 2) . ' КБ';
                                                } else {
                                                    echo 'Файл не найден';
                                                }
                                                ?>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div class="card mt-4">
                            <div class="card-header">
                                <h5 class="card-title">Учетные данные</h5>
                            </div>
                            <div class="card-body">
                                <form>
                                    <div class="mb-3">
                                        <label for="username" class="form-label">Имя пользователя</label>
                                        <input type="text" class="form-control" id="username" value="<?php echo htmlspecialchars($username); ?>" disabled>
                                        <div class="form-text">Для изменения учетных данных отредактируйте файл admin.php</div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="password" class="form-label">Пароль</label>
                                        <input type="password" class="form-control" id="password" value="********" disabled>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title">Код для вставки на сайт</h5>
                            </div>
                            <div class="card-body">
                                <p>Добавьте следующий код в секцию &lt;head&gt; или перед закрывающим тегом &lt;/body&gt; вашего сайта:</p>
                                <div class="mb-3">
                                    <textarea class="form-control" rows="8" readonly><script>
(function() {
    var img = new Image();
    img.src = '<?php echo htmlspecialchars(dirname($_SERVER['REQUEST_URI']) . '/analytics.php'); ?>?page=' + encodeURIComponent(window.location.href) + '&referrer=' + encodeURIComponent(document.referrer) + '&t=' + new Date().getTime();
    img.style.display = 'none';
    document.body.appendChild(img);
})();
</script></textarea>
                                </div>
                                <p>Или добавьте невидимый пиксель в любое место страницы:</p>
                                <div class="mb-3">
                                    <textarea class="form-control" rows="3" readonly><img src="<?php echo htmlspecialchars(dirname($_SERVER['REQUEST_URI']) . '/analytics.php'); ?>?page=<?php echo urlencode('$_SERVER[\'REQUEST_URI\']'); ?>" style="position:absolute; visibility:hidden" alt="" /></textarea>
                                </div>
                            </div>
                        </div>

                        <div class="card mt-4">
                            <div class="card-header">
                                <h5 class="card-title">О системе</h5>
                            </div>
                            <div class="card-body">
                                <p>Simple Analytics v1.0</p>
                                <p>Простая система аналитики на PHP + SQLite</p>
                                <p>Используемые технологии:</p>
                                <ul>
                                    <li>PHP <?php echo PHP_VERSION; ?></li>
                                    <li>SQLite3</li>
                                    <li>Bootstrap 5</li>
                                    <li>Chart.js</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <?php endif; ?>
            <?php endif; // Закрывает проверку на наличие ошибки (!isset($error)) ?>

<?php endif; // Закрывает проверку авторизации ($isAuthenticated) ?>

<!-- Скрипты для отображения графиков -->
    <?php if ($isAuthenticated): ?>
        <?php if ($currentPage === 'dashboard'): ?>
        <script>
            // Данные для графика посещений
            const visitsChartData = {
                labels: <?php echo json_encode(array_column($data['dailyVisits'], 'date')); ?>,
                datasets: [{
                    label: 'Просмотры',
                    data: <?php echo json_encode(array_column($data['dailyVisits'], 'visits')); ?>,
                    borderColor: '#2c7be5',
                    backgroundColor: 'rgba(44, 123, 229, 0.1)',
                    tension: 0.3,
                    fill: true
                }, {
                    label: 'Уникальные посетители',
                    data: <?php echo json_encode(array_column($data['dailyVisits'], 'unique_visitors')); ?>,
                    borderColor: '#00d97e',
                    backgroundColor: 'rgba(0, 217, 126, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            };

            const visitsChart = new Chart(
                document.getElementById('visitsChart'),
                {
                    type: 'line',
                    data: visitsChartData,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'top',
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                }
            );

            // Данные для графика устройств
            const deviceData = <?php echo json_encode(array_column($data['deviceTypes'], 'device_type')); ?>;
            const deviceCounts = <?php echo json_encode(array_column($data['deviceTypes'], 'count')); ?>;

            const devicesChart = new Chart(
                document.getElementById('devicesChart'),
                {
                    type: 'doughnut',
                    data: {
                        labels: deviceData,
                        datasets: [{
                            data: deviceCounts,
                            backgroundColor: [
                                '#2c7be5',
                                '#00d97e',
                                '#f6c343',
                                '#e63757',
                                '#39afd1'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                            }
                        }
                    }
                }
            );

            // Данные для графика браузеров
            const browserData = <?php echo json_encode(array_column($data['browsers'], 'browser')); ?>;
            const browserCounts = <?php echo json_encode(array_column($data['browsers'], 'count')); ?>;

            const browsersChart = new Chart(
                document.getElementById('browsersChart'),
                {
                    type: 'doughnut',
                    data: {
                        labels: browserData,
                        datasets: [{
                            data: browserCounts,
                            backgroundColor: [
                                '#2c7be5',
                                '#00d97e',
                                '#f6c343',
                                '#e63757',
                                '#39afd1',
                                '#fd7e14'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                            }
                        }
                    }
                }
            );
        </script>
        <?php endif; ?>

        <?php if ($currentPage === 'pages' && isset($_GET['id'])): ?>
        <script>
            // Данные для графика посещений страницы
            const pageVisitsChartData = {
                labels: <?php echo json_encode(array_column($data['dailyVisits'], 'date')); ?>,
                datasets: [{
                    label: 'Просмотры',
                    data: <?php echo json_encode(array_column($data['dailyVisits'], 'visits')); ?>,
                    borderColor: '#2c7be5',
                    backgroundColor: 'rgba(44, 123, 229, 0.1)',
                    tension: 0.3,
                    fill: true
                }, {
                    label: 'Уникальные посетители',
                    data: <?php echo json_encode(array_column($data['dailyVisits'], 'unique_visitors')); ?>,
                    borderColor: '#00d97e',
                    backgroundColor: 'rgba(0, 217, 126, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            };

            const pageVisitsChart = new Chart(
                document.getElementById('pageVisitsChart'),
                {
                    type: 'line',
                    data: pageVisitsChartData,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'top',
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                }
            );
        </script>
        <?php endif; ?>

        <?php if ($currentPage === 'referrers' && isset($_GET['id'])): ?>
        <script>
            // Данные для графика переходов с источника
            const referrerVisitsChartData = {
                labels: <?php echo json_encode(array_column($data['dailyVisits'], 'date')); ?>,
                datasets: [{
                    label: 'Переходы',
                    data: <?php echo json_encode(array_column($data['dailyVisits'], 'visits')); ?>,
                    borderColor: '#2c7be5',
                    backgroundColor: 'rgba(44, 123, 229, 0.1)',
                    tension: 0.3,
                    fill: true
                }, {
                    label: 'Уникальные посетители',
                    data: <?php echo json_encode(array_column($data['dailyVisits'], 'unique_visitors')); ?>,
                    borderColor: '#00d97e',
                    backgroundColor: 'rgba(0, 217, 126, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            };

            const referrerVisitsChart = new Chart(
                document.getElementById('referrerVisitsChart'),
                {
                    type: 'line',
                    data: referrerVisitsChartData,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'top',
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                }
            );
        </script>
        <?php endif; ?>
    <?php endif; ?>

</body>
</html>
