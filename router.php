<?php
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$file = __DIR__ . $path;

if ($path === '/blog' || $path === '/blog/') {
  include __DIR__ . '/blog/index.html';
  return true;
}

if ($path !== '/' && is_file($file)) {
  return false;
}

if ($path !== '/' && is_file($file . '.html')) {
  include $file . '.html';
  return true;
}

if ($path === '/' || $path === '') {
  include __DIR__ . '/index.html';
  return true;
}

return false;
?>
