<?php
header('Content-Type: application/json; charset=UTF-8');
header('Content-Type: application/json');

function loadEnv($path) {
    if (!file_exists($path)) {
        http_response_code(500);
        echo json_encode(['error' => 'Configuration file not found']);
        exit;
    }
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        $parts = explode('=', $line, 2);
        if (count($parts) !== 2) continue;
        $key = trim($parts[0]);
        $value = trim($parts[1]);
        $value = trim($value, "'\"");
        $_ENV[$key] = $value;
        putenv("$key=$value");
    }
}

loadEnv(__DIR__ . '/.env');

$token = getenv('GITHUB_TOKEN') ?: '';
if (empty($token)) {
    http_response_code(500);
    echo json_encode(['error' => 'GitHub token not configured']);
    exit;
}

$endpoint = $_GET['endpoint'] ?? '';
if (empty($endpoint)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing endpoint']);
    exit;
}

$owner = $_GET['owner'] ?? '';
$repo  = $_GET['repo']  ?? '';

$apiBase = "https://api.github.com/repos/$owner/$repo";
$url = '';

switch ($endpoint) {
    case 'info':
        $url = $apiBase;
        break;
    case 'languages':
        $url = "$apiBase/languages";
        break;
    case 'branches':
        $page = $_GET['page'] ?? 1;
        $perPage = $_GET['per_page'] ?? 30;
        $url = "$apiBase/branches?page=$page&per_page=$perPage";
        break;
    case 'contributors':
        $page = $_GET['page'] ?? 1;
        $perPage = $_GET['per_page'] ?? 30;
        $url = "$apiBase/contributors?page=$page&per_page=$perPage";
        break;
    case 'releases':
        $page = $_GET['page'] ?? 1;
        $perPage = $_GET['per_page'] ?? 5;
        $url = "$apiBase/releases?page=$page&per_page=$perPage";
        break;
    case 'readme':
        $url = "$apiBase/readme";
        break;
    case 'contents':
        $path = $_GET['path'] ?? '';
        $url = "$apiBase/contents/" . ltrim($path, '/');
        break;
    case 'commits':
        $page = $_GET['page'] ?? 1;
        $perPage = $_GET['per_page'] ?? 20;
        $url = "$apiBase/commits?page=$page&per_page=$perPage";
        break;
    case 'commit':
        $sha = $_GET['sha'] ?? '';
        if (empty($sha)) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing commit SHA']);
            exit;
        }
        $url = "$apiBase/commits/$sha";
        break;
    case 'community':
        $url = "$apiBase/community/profile";
        break;
    case 'search_code':
        if (!isset($_GET['query'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing search query']);
            exit;
        }
        $page = $_GET['page'] ?? 1;
        $perPage = $_GET['per_page'] ?? 30;
        $query = urlencode($_GET['query']);
        $url = "https://api.github.com/search/code?q=repo:$owner/$repo+$query&page=$page&per_page=$perPage";
        break;

    case 'search_issues':
        if (!isset($_GET['query'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing search query']);
            exit;
        }
        $page = $_GET['page'] ?? 1;
        $perPage = $_GET['per_page'] ?? 30;
        $query = urlencode($_GET['query'] . '+type:issue');
        $url = "https://api.github.com/search/issues?q=repo:$owner/$repo+$query&page=$page&per_page=$perPage";
        break;

    case 'search_commits':
        if (!isset($_GET['query'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing search query']);
            exit;
        }
        $page = $_GET['page'] ?? 1;
        $perPage = $_GET['per_page'] ?? 30;
        $query = urlencode($_GET['query']);
        $url = "https://api.github.com/search/commits?q=repo:$owner/$repo+$query&page=$page&per_page=$perPage";
        $headers[] = "Accept: application/vnd.github.cloak-preview+json";
        break;        
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Unknown endpoint']);
        exit;
}

$ch = curl_init($url);
$headers = [
    "User-Agent: GitHub-Downloader-PHP",
    "Authorization: token $token"
];
if ($endpoint === 'search_commits') {
    $headers[] = "Accept: application/vnd.github.cloak-preview+json";
}
if ($endpoint === 'commit') {
    $headers[] = "Accept: application/vnd.github.v3.diff";
}
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($endpoint === 'commit') {
    header('Content-Type: text/plain; charset=UTF-8');
    echo $response;
    exit;
}

http_response_code($httpCode);
echo $response;