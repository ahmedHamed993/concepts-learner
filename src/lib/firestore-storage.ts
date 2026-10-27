import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import {
  createInitialState,
  migrateRaw,
  SCHEMA_VERSION,
  type LoadResult,
  type StateStorage,
} from "@/lib/storage";
import type { AppState } from "@/lib/types";

/**
 * Firestore-backed storage for the full AppState.
 *
 * Data lives at:  /users/{userId}/state (document)
 *
 * The document is a plain JSON object serialized the same way as the
 * local storage backends, so import/export still works seamlessly.
 */
export class FirestoreStorage implements StateStorage {
  kind = "Firestore";
  private collection = "users";
  private docId = "state";

  /** The Firestore document path:  users/<userId>/state */
  constructor(private readonly userId: string) {}

  private ref() {
    const db = getFirestoreDb();
    return doc(db, this.collection, this.userId, "progress", this.docId);
  }

  async load(): Promise<LoadResult> {
    const snapshot = await getDoc(this.ref());
    if (!snapshot.exists()) {
      return { state: createInitialState(), storageKind: this.kind };
    }

    const raw: unknown = snapshot.data();
    const result = migrateRaw(raw);

    if (!result.ok) {
      console.error("[FirestoreStorage] Invalid remote state:", result.error);
      return {
        state: createInitialState(),
        error: `Remote data is invalid and was ignored: ${result.error}`,
        storageKind: this.kind,
      };
    }

    return {
      state: result.state,
      migratedFrom: result.migratedFrom,
      storageKind: this.kind,
    };
  }

  async save(state: AppState): Promise<void> {
    // Firestore cannot store undefined values — strip them with a
    // JSON round-trip (same strategy the local JSON serialiser uses).
    const plain = JSON.parse(
      JSON.stringify({ ...state, schemaVersion: SCHEMA_VERSION }),
    ) as Record<string, unknown>;
    await setDoc(this.ref(), plain, { merge: false });
  }

  async clear(): Promise<void> {
    await deleteDoc(this.ref());
  }
}
