import fs from 'fs';
import path from 'path';

// تحديد مسار مجلد البيانات
const dataDir = path.join(process.cwd(), 'data');

export const dbOptions = {
  khutab: path.join(dataDir, 'khutab.json'),
  users: path.join(dataDir, 'users.json'),
  categories: path.join(dataDir, 'categories.json')
};

// قراءة البيانات من الملف
export function readData(collection) {
  try {
    const filePath = dbOptions[collection];
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error(`Error reading ${collection}:`, error);
    return [];
  }
}

// كتابة البيانات إلى الملف
export function writeData(collection, data) {
  try {
    const filePath = dbOptions[collection];
    // التأكد من وجود مجلد البيانات
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing to ${collection}:`, error);
    return false;
  }
}

// أدوات وتوابع للخطب
export function getPublishedKhutab() {
  const khutab = readData('khutab');
  return khutab.filter(k => k.status === 'published');
}

export function getKhutbaById(id) {
  const khutab = readData('khutab');
  return khutab.find(k => k.id === id);
}

// أدوات للتصنيفات
export function getCategories() {
  return readData('categories');
}

export function addCategory(category) {
  const categories = getCategories();
  if (!categories.includes(category)) {
    categories.push(category);
    return writeData('categories', categories);
  }
  return false;
}
