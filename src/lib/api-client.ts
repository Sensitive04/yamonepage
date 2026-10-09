import type { CartItem, Product, ProductPayload } from "./types";
import { CATEGORIES } from "./constants";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  const data = (await response.json().catch(() => null)) as T & { error?: string };

  if (!response.ok) {
    throw new ApiError(data?.error ?? `Request failed (${response.status})`, response.status);
  }

  return data;
}

export interface ProductQuery {
  category?: string;
  q?: string;
  inStock?: boolean;
}

export async function fetchProducts(query: ProductQuery = {}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (query.category && query.category !== "All") params.set("category", query.category);
  if (query.q) params.set("q", query.q);
  if (query.inStock !== undefined) params.set("inStock", String(query.inStock));

  const search = params.toString();
  const data = await request<{ products: Product[] }>(`/api/products${search ? `?${search}` : ""}`);
  return data.products;
}

export function createProduct(payload: ProductPayload) {
  return request<{ product: Product }>("/api/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateProduct(id: string, payload: ProductPayload) {
  return request<{ product: Product }>(`/api/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function updateStock(id: string, inStock: boolean) {
  return request<{ product: Product }>(`/api/products/${id}`, {
    method: "PUT",
    body: JSON.stringify({ inStock }),
  });
}

export function deleteProduct(id: string) {
  return request<{ ok: boolean }>(`/api/products/${id}`, { method: "DELETE" });
}

export function login(password: string) {
  return request<{ ok: boolean }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export function logout() {
  return request<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
}

export async function isAdmin(): Promise<boolean> {
  try {
    const data = await request<{ authenticated: boolean }>("/api/auth/me");
    return data.authenticated;
  } catch {
    return false;
  }
}

export function seedDatabase() {
  return request<{ ok: boolean; count: number }>("/api/seed", { method: "POST" });
}

export interface CategoryEntry {
  _id: string;
  name: string;
}

export async function fetchCategoryList(): Promise<CategoryEntry[]> {
  const data = await request<{ categories: CategoryEntry[] }>("/api/categories");
  return data.categories;
}

export async function fetchCategories(): Promise<string[]> {
  try {
    return (await fetchCategoryList()).map((entry) => entry.name);
  } catch {
    return [...CATEGORIES];
  }
}

export function createCategory(name: string) {
  return request<{ category: string }>("/api/categories", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function updateCategory(id: string, name: string) {
  return request<{ category: string }>(`/api/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export function deleteCategory(id: string) {
  return request<{ ok: boolean }>(`/api/categories/${id}`, { method: "DELETE" });
}

export async function fetchTelegramBotUsername(): Promise<string> {
  try {
    const data = await request<{ telegramBotUsername: string }>("/api/config");
    return data.telegramBotUsername.replace(/^@/, "");
  } catch {
    return "";
  }
}

export interface TelegramOrderResult {
  ok: boolean;
  botLink: string;
}

export interface CreateOrderPayload {
  items: CartItem[];
  customer: { name: string; phone: string; address: string };
}

export interface CreateOrderResult {
  orderNumber: string;
  botLink: string;
}

export function createOrder(payload: CreateOrderPayload): Promise<CreateOrderResult> {
  return request<CreateOrderResult>("/api/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
