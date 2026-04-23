const DB_NAME = "prime-college-drafts";
const DB_VERSION = 1;
const STORE_NAME = "qualificationDrafts";

type DraftRecord<T> = {
  key: string;
  data: T;
  updatedAt: number;
};

const isBrowser = typeof window !== "undefined" && typeof indexedDB !== "undefined";

function openDatabase(): Promise<IDBDatabase | null> {
  if (!isBrowser) return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  handler: (store: IDBObjectStore) => IDBRequest<T>,
) {
  const db = await openDatabase();
  if (!db) return null;

  return new Promise<T | null>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const request = handler(store);

    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadQualificationDraft<T>(key: string): Promise<T | null> {
  const record = await withStore<DraftRecord<T>>("readonly", (store) => store.get(key));
  return record?.data ?? null;
}

export async function saveQualificationDraft<T>(key: string, data: T): Promise<void> {
  await withStore("readwrite", (store) =>
    store.put({
      key,
      data,
      updatedAt: Date.now(),
    } satisfies DraftRecord<T>),
  );
}

export async function clearQualificationDraft(key: string): Promise<void> {
  await withStore("readwrite", (store) => store.delete(key));
}

export const buildQualificationDraftKey = (
  section: "main" | "details" | "price" | "sessions",
  qualificationId?: string | null,
) => `${section}:${qualificationId || "new"}`;

