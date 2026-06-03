import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  addDoc, 
  updateDoc, 
  deleteDoc
} from 'firebase/firestore';
import { db, auth, verifyCollectionExistence } from '../firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function useFirestore(colName: string, orderField: string = 'name', docId?: string, limitDocs?: number) {
  const [data, setData] = useState<any[] | any>(docId ? null : []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};

    // Prevent executing query on undefined or unrecognized collections
    if (!verifyCollectionExistence(colName)) {
      console.warn(`[useFirestore Security Guard] Bypassing query on collection '${colName}' as it is unrecognized in the local schema.`);
      setLoading(false);
      return;
    }

    try {
      if (docId) {
        // Listening to a single document
        const docRef = doc(db, colName, docId);
        unsubscribe = onSnapshot(
          docRef,
          (snapshot) => {
            if (snapshot.exists()) {
              setData({ id: snapshot.id, ...snapshot.data() });
            } else {
              setData(null);
            }
            setLoading(false);
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, `${colName}/${docId}`);
            setLoading(false);
          }
        );
      } else {
        // Listening to a collection
        const colRef = collection(db, colName);
        let q;

        // Skip ordering on config and schemas that don't have typical order fields
        if (colName === 'config' || colName === 'page_content' || colName === 'callbacks' || !orderField) {
          q = query(colRef);
        } else {
          const isDescField = ['timestamp', 'createdAt', 'date', 'created_at', 'updatedAt'].includes(orderField);
          const direction = isDescField ? 'desc' : 'asc';
          q = query(colRef, orderBy(orderField, direction));
        }

        if (limitDocs) {
          q = query(q, limit(limitDocs));
        }

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const items: any[] = [];
            snapshot.forEach((docSnap) => {
              items.push({ id: docSnap.id, ...docSnap.data() });
            });
            setData(items);
            setLoading(false);
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, colName);
            setLoading(false);
          }
        );
      }
    } catch (err) {
      console.error(`Error configuring onSnapshot for ${colName}:`, err);
      setLoading(false);
    }

    return () => {
      unsubscribe();
    };
  }, [colName, orderField, docId, limitDocs]);

  const add = async (item: any) => {
    if (!verifyCollectionExistence(colName)) {
      console.warn(`[useFirestore Guard] Blocked creation on unrecognized collection '${colName}'`);
      return;
    }
    try {
      const colRef = collection(db, colName);
      const docRef = await addDoc(colRef, {
        ...item,
        createdAt: item.createdAt || new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, colName);
    }
  };

  const update = async (id: string, item: any) => {
    if (!verifyCollectionExistence(colName)) {
      console.warn(`[useFirestore Guard] Blocked update on unrecognized collection '${colName}'`);
      return;
    }
    try {
      const docRef = doc(db, colName, id);
      await updateDoc(docRef, {
        ...item,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${colName}/${id}`);
    }
  };

  const remove = async (id: string) => {
    if (!verifyCollectionExistence(colName)) {
      console.warn(`[useFirestore Guard] Blocked deletion on unrecognized collection '${colName}'`);
      return;
    }
    try {
      const docRef = doc(db, colName, id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${colName}/${id}`);
    }
  };

  return { data, loading, add, update, remove };
}

