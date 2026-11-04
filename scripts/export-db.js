import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// Read .env.local if MONGODB_URI is not already in process.env
if (!process.env.MONGODB_URI) {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        process.env[key] = value.trim();
      }
    }
  }
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ ERREUR: Variable MONGODB_URI introuvable dans .env.local");
  process.exit(1);
}

async function exportDatabase() {
  console.log("⏳ Connexion à MongoDB Atlas...");
  const conn = await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  console.log("✅ Connecté avec succès !");

  const db = conn.connection.db;
  const dbName = db.databaseName;
  console.log(`📦 Base de données ciblée : ${dbName}`);

  const backupDir = path.join(process.cwd(), 'backups', dbName);
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const collections = await db.listCollections().toArray();
  const summary = {};
  const fullBackup = {};

  for (const col of collections) {
    const colName = col.name;
    const documents = await db.collection(colName).find({}).toArray();
    summary[colName] = documents.length;
    fullBackup[colName] = documents;

    const colFilePath = path.join(backupDir, `${colName}.json`);
    fs.writeFileSync(colFilePath, JSON.stringify(documents, null, 2), 'utf8');
    console.log(`  📄 Collection '${colName}' exportée : ${documents.length} document(s) -> ${colFilePath}`);
  }

  const fullBackupPath = path.join(backupDir, `${dbName}_complete_backup.json`);
  fs.writeFileSync(fullBackupPath, JSON.stringify(fullBackup, null, 2), 'utf8');

  console.log("\n🎉 Export terminé avec succès !");
  console.log(`📁 Dossier de sauvegarde : ${backupDir}`);
  console.log(`📦 Fichier complet : ${fullBackupPath}`);
  console.table(summary);

  await mongoose.disconnect();
  process.exit(0);
}

exportDatabase().catch(err => {
  console.error("❌ Erreur pendant l'export :", err);
  process.exit(1);
});

