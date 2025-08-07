import { GeneratedAudio } from '../types';

const DB_NAME = 'AdvancedTtsDB';
const STORE_NAME = 'generatedAudio';
const DB_VERSION = 2; // Incremented version for schema change

let db: IDBDatabase;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject('IndexedDB error');
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      let store: IDBObjectStore;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      } else {
        store = (event.target as any).transaction.objectStore(STORE_NAME);
      }
      
      if (!store.indexNames.contains('createdAt')) {
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
      // Add index for displayName if it doesn't exist
      if (!store.indexNames.contains('displayName')) {
        store.createIndex('displayName', 'displayName', { unique: false });
      }
    };
  });
};

export const addAudioToDB = async (audio: GeneratedAudio): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(audio);

    request.onsuccess = () => resolve();
    request.onerror = () => {
      console.error('Error adding audio to DB:', request.error);
      reject(request.error);
    };
  });
};

export const getAllAudioFromDB = async (): Promise<GeneratedAudio[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const result = request.result as GeneratedAudio[];
      result.forEach(audio => {
        if (audio.blob) {
            audio.url = URL.createObjectURL(audio.blob);
        }
      });
      result.sort((a, b) => b.createdAt - a.createdAt);
      resolve(result);
    };
    request.onerror = () => {
      console.error('Error getting all audio from DB:', request.error);
      reject(request.error);
    };
  });
};

export const deleteAudioFromDB = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => {
      console.error('Error deleting audio from DB:', request.error);
      reject(request.error);
    };
  });
};

export const clearAllAudioFromDB = async (): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => {
            console.error('Error clearing audio from DB:', request.error);
            reject(request.error);
        };
    });
};

export const updateAudioInDB = async (audio: GeneratedAudio): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(audio);

        request.onsuccess = () => resolve();
        request.onerror = () => {
            console.error('Error updating audio in DB:', request.error);
            reject(request.error);
        };
    });
};