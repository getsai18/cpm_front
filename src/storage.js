import { db } from './db';

export async function getDoc(key, defaultVal = null) {
  try {
    const doc = await db.get(key);
    return doc.data;
  } catch (e) {
    if (e.status === 404) return defaultVal;
    throw e;
  }
}

export async function setDoc(key, data) {
  for (let attempt = 0; attempt < 3; attempt++) {
    let rev;
    try {
      const existing = await db.get(key);
      rev = existing._rev;
    } catch (e) {
      if (e.status !== 404) throw e;
    }
    try {
      await db.put(rev ? { _id: key, _rev: rev, data } : { _id: key, data });
      return;
    } catch (e) {
      if (e.status === 409 && attempt < 2) continue; // Concurrent write conflict — retry with fresh _rev
      throw e;
    }
  }
}

export async function deleteDoc(key) {
  try {
    const doc = await db.get(key);
    await db.remove(doc);
  } catch (e) {
    if (e.status !== 404) throw e;
  }
}

export async function migrateFromLocalStorage() {
  const keys = [
    'cpmanager_clientes', 'cpmanager_counters', 'cp_v5_pedidos',
    'cp_v5_incidencias', 'cp_areas', 'cp_prendas', 'cp_admin_clientes', 'cp_clientes',
  ];
  for (const key of keys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      await db.get(key);
      // Already in DB — safe to remove from localStorage
      localStorage.removeItem(key);
    } catch (e) {
      if (e.status === 404) {
        try {
          await db.put({ _id: key, data: JSON.parse(raw) });
          localStorage.removeItem(key); // Only remove after confirmed write
        } catch { /* DB write failed — leave localStorage intact */ }
      }
    }
  }
}
