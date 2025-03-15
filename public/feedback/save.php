<?php
header('Content-Type: application/json');

$file = __DIR__ . '/feedback/feedback.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $newFeedback = json_decode($input, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['error' => 'Неверный формат JSON']);
        exit;
    }

    $feedbackData = [];
    if (file_exists($file)) {
        $currentContent = file_get_contents($file);
        $feedbackData = json_decode($currentContent, true);
        if (!is_array($feedbackData)) {
            $feedbackData = [];
        }
    }

    $feedbackData[] = $newFeedback;

    $result = file_put_contents($file, json_encode($feedbackData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    if ($result === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Не удалось сохранить отзыв']);
        exit;
    }

    http_response_code(200);
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Метод не поддерживается']);
?>
