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

// Функция для получения статистики
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

// Выбранный период
$selectedPeriod = $_GET['period'] ?? 'month';

// Получение статистики
$statistics = [];
if ($isAuthenticated) {
    try {
        $db = new SQLite3($dbPath);
        $statistics = getStatistics($db, $selectedPeriod);
    } catch (Exception $e) {
        $error = "Ошибка при загрузке данных: " . $e->getMessage();
    } finally {
        if (isset($db)) {
            $db->close();
        }
    }
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
                <a class="nav-link active" href="#">
                    <i class="bi bi-graph-up"></i>
                    <span class="nav-text">Дашборд</span>
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#">
                    <i class="bi bi-people"></i>
                    <span class="nav-text">Посетители</span>
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#">
                    <i class="bi bi-file-earmark-text"></i>
                    <span class="nav-text">Страницы</span>
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#">
                    <i class="bi bi-globe2"></i>
                    <span class="nav-text">Источники</span>
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#">
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
            <!-- Период -->
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h4 class="mb-0">Статистика сайта</h4>
            </div>

            <div class="period-selector">
                <a href="?period=today" class="<?php echo $selectedPeriod === 'today' ? 'active' : ''; ?>">
                    Сегодня
                </a>
                <a href="?period=yesterday" class="<?php echo $selectedPeriod === 'yesterday' ? 'active' : ''; ?>">
                    Вчера
                </a>
                <a href="?period=week" class="<?php echo $selectedPeriod === 'week' ? 'active' : ''; ?>">
                    Неделя
                </a>
                <a href="?period=month" class="<?php echo $selectedPeriod === 'month' ? 'active' : ''; ?>">
                    Месяц
                </a>
                <a href="?period=all" class="<?php echo $selectedPeriod === 'all' ? 'active' : ''; ?>">
                    Всё время
                </a>
            </div>

            <?php if (isset($error)): ?>
                <div class="alert alert-danger" role="alert">
                    <?php echo htmlspecialchars($error); ?>
                </div>
            <?php else: ?>

            <!-- Ключевые метрики -->
            <div class="row">
                <div class="col-md-3">
                    <div class="stat-card">
                        <div class="stat-icon bg-primary-soft text-primary">
                            <i class="bi bi-eye"></i>
                        </div>
                        <div class="stat-info">
                            <h3><?php echo number_format($statistics['totalVisits']); ?></h3>
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
                            <h3><?php echo number_format($statistics['uniqueVisitors']); ?></h3>
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
                            <h3><?php echo number_format($statistics['newVisitors']); ?></h3>
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
                                $viewsPerVisitor = $statistics['uniqueVisitors'] > 0
                                    ? round($statistics['totalVisits'] / $statistics['uniqueVisitors'], 1)
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
                                        <?php foreach ($statistics['popularPages'] as $page): ?>
                                        <tr>
                                            <td>
                                                <?php
                                                    $displayUrl = htmlspecialchars($page['page_url']);
                                                    // Укорачиваем URL если он слишком длинный
                                                    if (strlen($displayUrl) > 50) {
                                                        $displayUrl = substr($displayUrl, 0, 47) . '...';
                                                    }
                                                    echo $displayUrl;
                                                ?>
                                            </td>
                                            <td><?php echo number_format($page['visits']); ?></td>
                                        </tr>
                                        <?php endforeach; ?>
                                        <?php if (empty($statistics['popularPages'])): ?>
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
                                        <?php foreach ($statistics['topReferrers'] as $referrer): ?>
                                        <tr>
                                            <td>
                                                <?php
                                                    $displaySource = htmlspecialchars($referrer['source']);
                                                    if (strlen($displaySource) > 50) {
                                                        $displaySource = substr($displaySource, 0, 47) . '...';
                                                    }
                                                    echo $displaySource;
                                                ?>
                                            </td>
                                            <td><?php echo number_format($referrer['visits']); ?></td>
                                        </tr>
                                        <?php endforeach; ?>
                                        <?php if (empty($statistics['topReferrers'])): ?>
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
                                        <?php foreach ($statistics['countries'] as $country): ?>
                                        <tr>
                                            <td><?php echo htmlspecialchars($country['country']); ?></td>
                                            <td><?php echo number_format($country['count']); ?></td>
                                        </tr>
                                        <?php endforeach; ?>
                                        <?php if (empty($statistics['countries'])): ?>
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

            <?php endif; ?>
        </div>
    </div>

    <!-- Скрипты для отображения графиков -->
    <script>
        // Данные для графика посещений
        const visitsChartData = {
            labels: <?php echo json_encode(array_column($statistics['dailyVisits'], 'date')); ?>,
            datasets: [{
                label: 'Просмотры',
                data: <?php echo json_encode(array_column($statistics['dailyVisits'], 'visits')); ?>,
                borderColor: '#2c7be5',
                backgroundColor: 'rgba(44, 123, 229, 0.1)',
                tension: 0.3,
                fill: true
            }, {
                label: 'Уникальные посетители',
                data: <?php echo json_encode(array_column($statistics['dailyVisits'], 'unique_visitors')); ?>,
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
        const deviceData = <?php echo json_encode(array_column($statistics['deviceTypes'], 'device_type')); ?>;
        const deviceCounts = <?php echo json_encode(array_column($statistics['deviceTypes'], 'count')); ?>;

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
        const browserData = <?php echo json_encode(array_column($statistics['browsers'], 'browser')); ?>;
        const browserCounts = <?php echo json_encode(array_column($statistics['browsers'], 'count')); ?>;

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

</body>
</html>
