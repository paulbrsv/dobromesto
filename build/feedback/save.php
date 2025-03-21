<?php
header('Content-Type: application/json');

// Включаем отображение ошибок для отладки
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$file = __DIR__ . '/feedback.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    error_log("Received input: $input"); // Логируем входные данные

    $newFeedback = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['error' => 'Неверный формат JSON', 'details' => json_last_error_msg()]);
        exit;
    }

    $feedbackData = [];
    if (file_exists($file)) {
        $currentContent = file_get_contents($file);
        $feedbackData = json_decode($currentContent, true);
        if (!is_array($feedbackData)) {
            error_log("Invalid JSON in feedback.json: $currentContent");
            http_response_code(500);
            echo json_encode(['error' => 'Поврежденный JSON в feedback.json']);
            exit;
        }
    } else {
        error_log("File does not exist: $file");
    }

    $feedbackData[] = $newFeedback;

    $result = file_put_contents($file, json_encode($feedbackData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    if ($result === false) {
        error_log("Failed to write to $file");
        http_response_code(500);
        echo json_encode(['error' => 'Не удалось записать в файл', 'file' => $file]);
        exit;
    }

    http_response_code(200);
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Метод не поддерживается']);
?>
