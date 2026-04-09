import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { Product, Order, User, Address, Service, ServiceRequest } from '@/types';

// Products
export const getProducts = async (): Promise<Product[]> => {
  const productsRef = collection(db, 'products');
  const snapshot = await getDocs(productsRef);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as Product[];
};

export const getProduct = async (id: string): Promise<Product | null> => {
  const productRef = doc(db, 'products', id);
  const productDoc = await getDoc(productRef);
  if (!productDoc.exists()) return null;

  return {
    id: productDoc.id,
    ...productDoc.data(),
    createdAt: productDoc.data().createdAt?.toDate(),
    updatedAt: productDoc.data().updatedAt?.toDate(),
  } as Product;
};

export const createProduct = async (
  productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const productsRef = collection(db, 'products');
  const docRef = await addDoc(productsRef, {
    ...productData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const updateProduct = async (
  id: string,
  productData: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  const productRef = doc(db, 'products', id);
  await updateDoc(productRef, {
    ...productData,
    updatedAt: Timestamp.now(),
  });
};

export const deleteProduct = async (id: string): Promise<void> => {
  const productRef = doc(db, 'products', id);
  await deleteDoc(productRef);
};

// Orders
export const createOrder = async (
  userId: string,
  orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const ordersRef = collection(db, 'orders');
  const docRef = await addDoc(ordersRef, {
    ...orderData,
    userId,
    status: 'payment_pending',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getOrders = async (userId?: string): Promise<Order[]> => {
  const ordersRef = collection(db, 'orders');
  let q = query(ordersRef, orderBy('createdAt', 'desc'));

  if (userId) {
    q = query(ordersRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as Order[];
};

export const getOrder = async (orderId: string): Promise<Order | null> => {
  const orderRef = doc(db, 'orders', orderId);
  const orderDoc = await getDoc(orderRef);
  if (!orderDoc.exists()) return null;

  return {
    id: orderDoc.id,
    ...orderDoc.data(),
    createdAt: orderDoc.data().createdAt?.toDate(),
    updatedAt: orderDoc.data().updatedAt?.toDate(),
  } as Order;
};

export const updateOrderStatus = async (
  orderId: string,
  status: Order['status']
): Promise<void> => {
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, {
    status,
    updatedAt: Timestamp.now(),
  });
};

// User profile
export const updateUserProfile = async (
  userId: string,
  data: Partial<User>
): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, data);
};

export const updateUserAddress = async (
  userId: string,
  address: Address
): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { address });
};

// Services
export const getServices = async (visibleOnly: boolean = false): Promise<Service[]> => {
  const servicesRef = collection(db, 'services');
  const snapshot = await getDocs(servicesRef);

  let services = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as Service[];

  // Filter visible services if needed
  if (visibleOnly) {
    services = services.filter(service => service.visible);
  }

  // Sort by order
  services.sort((a, b) => a.order - b.order);

  return services;
};

export const getService = async (id: string): Promise<Service | null> => {
  const serviceRef = doc(db, 'services', id);
  const serviceDoc = await getDoc(serviceRef);
  if (!serviceDoc.exists()) return null;

  return {
    id: serviceDoc.id,
    ...serviceDoc.data(),
    createdAt: serviceDoc.data().createdAt?.toDate(),
    updatedAt: serviceDoc.data().updatedAt?.toDate(),
  } as Service;
};

export const createService = async (
  serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const servicesRef = collection(db, 'services');
  const docRef = await addDoc(servicesRef, {
    ...serviceData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const updateService = async (
  id: string,
  serviceData: Partial<Omit<Service, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  const serviceRef = doc(db, 'services', id);
  await updateDoc(serviceRef, {
    ...serviceData,
    updatedAt: Timestamp.now(),
  });
};

export const deleteService = async (id: string): Promise<void> => {
  const serviceRef = doc(db, 'services', id);
  await deleteDoc(serviceRef);
};

// Service Requests
export const createServiceRequest = async (
  requestData: Omit<ServiceRequest, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const requestsRef = collection(db, 'serviceRequests');
  const docRef = await addDoc(requestsRef, {
    ...requestData,
    status: 'pending',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getServiceRequests = async (): Promise<ServiceRequest[]> => {
  const requestsRef = collection(db, 'serviceRequests');
  const snapshot = await getDocs(requestsRef);

  let requests = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as ServiceRequest[];

  // Sort by createdAt descending
  requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return requests;
};

export const getServiceRequest = async (id: string): Promise<ServiceRequest | null> => {
  const requestRef = doc(db, 'serviceRequests', id);
  const requestDoc = await getDoc(requestRef);
  if (!requestDoc.exists()) return null;

  return {
    id: requestDoc.id,
    ...requestDoc.data(),
    createdAt: requestDoc.data().createdAt?.toDate(),
    updatedAt: requestDoc.data().updatedAt?.toDate(),
  } as ServiceRequest;
};

export const updateServiceRequestStatus = async (
  id: string,
  status: ServiceRequest['status']
): Promise<void> => {
  const requestRef = doc(db, 'serviceRequests', id);
  await updateDoc(requestRef, {
    status,
    updatedAt: Timestamp.now(),
  });
};
