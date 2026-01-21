const fs = require('fs');
const path = require('path');

const lockPath = path.join(process.cwd(), '.next', 'dev', 'lock');
const devDir = path.join(process.cwd(), '.next', 'dev');

try {
  // Удаляем файл блокировки если он существует
  if (fs.existsSync(lockPath)) {
    fs.unlinkSync(lockPath);
    console.log('✓ Lock file removed');
  }
  
  // Удаляем папку dev целиком если она существует (Next.js пересоздаст её)
  if (fs.existsSync(devDir)) {
    fs.rmSync(devDir, { recursive: true, force: true });
    console.log('✓ .next/dev directory cleaned');
  }
  
  console.log('✓ Ready to start Next.js dev server');
} catch (error) {
  // Игнорируем ошибки, если файлы не существуют
  if (error.code !== 'ENOENT') {
    console.error('Error cleaning dev directory:', error.message);
  }
}
