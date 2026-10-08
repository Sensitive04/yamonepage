"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  Boxes,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  PackageCheck,
  PackageX,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import type { Product, ProductPayload } from "@/lib/types";
import { formatPrice } from "@/lib/constants";
import {
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  fetchCategoryList,
  fetchProducts,
  logout,
  seedDatabase,
  updateCategory,
  updateProduct,
  updateStock,
  type CategoryEntry,
} from "@/lib/api-client";
import { SmartImage } from "@/components/ui/SmartImage";
import { useToast } from "@/components/ui/Toast";
import { ProductFormModal } from "@/components/admin/ProductFormModal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [categoryList, setCategoryList] = useState<CategoryEntry[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [deletingCategory, setDeletingCategory] = useState<CategoryEntry | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProducts(await fetchProducts());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      setCategoryList(await fetchCategoryList());
    } catch {
      /* categories unavailable — defaults stay */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data: { authenticated: boolean }) => {
        if (cancelled) return;
        if (!data.authenticated) {
          router.replace("/admin/login");
        } else {
          setAuthChecked(true);
          load();
          loadCategories();
        }
      })
      .catch(() => {
        if (!cancelled) router.replace("/admin/login");
      });
    return () => {
      cancelled = true;
    };
  }, [router, load, loadCategories]);

  const categoryOptions = [
    "All",
    ...Array.from(new Set(products.map((product) => product.category))).sort((a, b) =>
      a.localeCompare(b)
    ),
  ];

  const countIn = (category: string) =>
    category === "All"
      ? products.length
      : products.filter((product) => product.category === category).length;

  const filtered = products.filter((product) => {
    if (categoryFilter !== "All" && product.category !== categoryFilter) return false;
    const needle = search.trim().toLowerCase();
    if (!needle) return true;
    return (
      product.name.toLowerCase().includes(needle) ||
      product.category.toLowerCase().includes(needle) ||
      product.description.toLowerCase().includes(needle)
    );
  });

  const stats = [
    { label: "Total products", value: products.length, Icon: Boxes },
    {
      label: "In stock",
      value: products.filter((product) => product.inStock).length,
      Icon: PackageCheck,
    },
    {
      label: "Out of stock",
      value: products.filter((product) => !product.inStock).length,
      Icon: PackageX,
    },
  ];

  const handleToggleStock = async (product: Product) => {
    setTogglingId(product._id);
    const optimistic = products.map((item) =>
      item._id === product._id ? { ...item, inStock: !item.inStock } : item
    );
    setProducts(optimistic);

    try {
      await updateStock(product._id, !product.inStock);
      toast(
        `${product.name} is now ${product.inStock ? "out of stock" : "in stock"}.`,
        "success"
      );
    } catch (err) {
      setProducts(products);
      toast(err instanceof Error ? err.message : "Stock update failed.", "error");
    } finally {
      setTogglingId(null);
    }
  };

  const handleSave = async (payload: ProductPayload) => {
    setSaving(true);
    try {
      if (editing) {
        const { product } = await updateProduct(editing._id, payload);
        setProducts((current) => current.map((item) => (item._id === product._id ? product : item)));
        toast("Product updated.", "success");
      } else {
        const { product } = await createProduct(payload);
        setProducts((current) => [product, ...current]);
        toast("Product added.", "success");
      }
      setFormOpen(false);
      setEditing(null);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Saving failed.", "error");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    try {
      await deleteProduct(deleting._id);
      setProducts((current) => current.filter((item) => item._id !== deleting._id));
      toast("Product deleted.", "success");
      setDeleting(null);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Delete failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const { count } = await seedDatabase();
      toast(`Seeded ${count} sample products.`, "success");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Seeding failed.", "error");
    } finally {
      setSeeding(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast("Signed out.", "info");
    router.replace("/admin/login");
  };

  const handleAddCategory = async () => {
    const name = newCategory.trim();
    if (!name || savingCategory) return;
    setSavingCategory(true);
    try {
      const { category } = await createCategory(name);
      setNewCategory("");
      toast(`Category “${category}” added.`, "success");
      await loadCategories();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Adding category failed.", "error");
    } finally {
      setSavingCategory(false);
    }
  };

  const startEditCategory = (category: CategoryEntry) => {
    setEditingCategoryId(category._id);
    setEditingCategoryName(category.name);
  };

  const handleRenameCategory = async () => {
    const name = editingCategoryName.trim();
    if (!name || !editingCategoryId || savingCategory) return;
    const original = categoryList.find((entry) => entry._id === editingCategoryId)?.name ?? "";
    setSavingCategory(true);
    try {
      await updateCategory(editingCategoryId, name);
      setEditingCategoryId(null);
      if (original && original !== name) {
        setProducts((current) =>
          current.map((product) =>
            product.category === original ? { ...product, category: name } : product
          )
        );
      }
      toast(`Renamed to “${name}” — products updated too.`, "success");
      await loadCategories();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Renaming category failed.", "error");
    } finally {
      setSavingCategory(false);
    }
  };

  const requestDeleteCategory = (category: CategoryEntry) => {
    const count = products.filter((product) => product.category === category.name).length;
    if (count > 0) {
      toast(
        `“${category.name}” is used by ${count} product${count === 1 ? "" : "s"} — edit or move them first.`,
        "error"
      );
      return;
    }
    setDeletingCategory(category);
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory || savingCategory) return;
    setSavingCategory(true);
    try {
      await deleteCategory(deletingCategory._id);
      toast(`Category “${deletingCategory.name}” deleted.`, "success");
      setDeletingCategory(null);
      await loadCategories();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Deleting category failed.", "error");
    } finally {
      setSavingCategory(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-slate-500 text-white">
              <Sparkles className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <span className="hidden flex-col leading-none sm:flex">
              <span className="font-display text-lg font-semibold text-slate-900">Yamone</span>
              <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-brand-600">
                Admin
              </span>
            </span>
          </Link>

          <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            Dashboard
          </span>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={handleSeed}
              disabled={seeding}
              className="btn-ghost hidden !px-4 !py-2 text-xs sm:inline-flex"
            >
              {seeding ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              Seed samples
            </button>
            <Link href="/" className="btn-ghost hidden !px-4 !py-2 text-xs sm:inline-flex">
              <Eye className="h-3.5 w-3.5" aria-hidden="true" /> View store
            </Link>
            <button type="button" onClick={handleLogout} className="btn-primary !px-4 !py-2 text-xs">
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-slate-900">Products</h1>
            <p className="mt-1 text-sm text-slate-700">
              Manage catalogue, pricing and stock in real time.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="btn-primary self-start md:self-auto"
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Add product
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {stats.map(({ label, value, Icon }) => (
            <div
              key={label}
              className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-brand-600">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-2xl font-semibold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900">Categories</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Add, rename or remove the categories used across your shop.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleAddCategory();
                }}
                placeholder="New category name"
                maxLength={60}
                className="input-field w-44 !py-2.5 text-sm"
                aria-label="New category name"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                disabled={savingCategory || !newCategory.trim()}
                className="btn-primary !px-4 !py-2.5 text-xs disabled:opacity-60"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add
              </button>
            </div>
          </div>

          {categoryList.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              {loading ? "Loading categories…" : "No categories yet — add the first one above."}
            </p>
          ) : (
            <ul className="mt-4 flex flex-wrap gap-2">
              {categoryList.map((category) => {
                const count = products.filter(
                  (product) => product.category === category.name
                ).length;

                if (editingCategoryId === category._id) {
                  return (
                    <li
                      key={category._id}
                      className="flex items-center gap-1 rounded-full border border-brand-600 bg-brand-50 py-1 pl-3 pr-1"
                    >
                      <input
                        autoFocus
                        value={editingCategoryName}
                        onChange={(event) => setEditingCategoryName(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") handleRenameCategory();
                          if (event.key === "Escape") setEditingCategoryId(null);
                        }}
                        maxLength={60}
                        aria-label={`Rename ${category.name}`}
                        className="w-32 bg-transparent text-sm font-medium text-slate-900 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleRenameCategory}
                        disabled={savingCategory || !editingCategoryName.trim()}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-brand-600 transition-colors hover:bg-brand-100 disabled:opacity-50"
                        aria-label="Save category name"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCategoryId(null)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100"
                        aria-label="Cancel rename"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  );
                }

                return (
                  <li
                    key={category._id}
                    className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 py-1 pl-3 pr-1 text-sm"
                  >
                    <span className="font-medium text-slate-700">{category.name}</span>
                    <span className="text-xs font-semibold tabular-nums text-slate-400">
                      {count}
                    </span>
                    <button
                      type="button"
                      onClick={() => startEditCategory(category)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white hover:text-slate-700"
                      aria-label={`Rename ${category.name}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => requestDeleteCategory(category)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white hover:text-rose-600"
                      aria-label={`Delete ${category.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search products</span>
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, category or description…"
              className="input-field border-0 bg-slate-100 pl-11"
            />
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:w-auto">
            Category
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="input-field w-auto text-sm font-medium normal-case tracking-normal text-slate-900"
              aria-label="Filter by category"
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "All"
                    ? `All categories (${products.length})`
                    : `${option} (${countIn(option)})`}
                </option>
              ))}
            </select>
          </label>

          <button type="button" onClick={load} className="btn-ghost !py-2.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Refresh
          </button>
          <button
            type="button"
            onClick={handleSeed}
            disabled={seeding}
            className="btn-ghost !py-2.5 text-xs sm:hidden"
          >
            {seeding ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            Seed samples
          </button>
        </div>

        {!loading && !error && (
          <p className="mt-3 text-xs text-slate-500" aria-live="polite">
            Showing {filtered.length} of {products.length} products
            {categoryFilter !== "All" ? ` in ${categoryFilter}` : ""}
            {search.trim() ? ` matching “${search.trim()}”` : ""}
          </p>
        )}

        {error && (
          <div className="mt-6 flex flex-col items-center gap-3 border border-rose-200 bg-rose-50 px-6 py-10 text-center">
            <AlertTriangle className="h-8 w-8 text-rose-500" aria-hidden="true" />
            <p className="text-sm font-medium text-slate-900">{error}</p>
            <button type="button" onClick={load} className="btn-primary mt-1">
              Retry
            </button>
          </div>
        )}

        {loading && !error && (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-slate-100 bg-white py-16 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" aria-hidden="true" />
            <p className="text-sm">Loading products…</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
            <Boxes className="h-10 w-10 text-brand-600" aria-hidden="true" />
            <h3 className="font-display text-xl font-semibold text-slate-900">
              {search || categoryFilter !== "All"
                ? "No products match your filters"
                : "No products yet"}
            </h3>
            <p className="max-w-sm text-sm text-slate-700">
              {search || categoryFilter !== "All"
                ? "Try a different keyword, switch the category, or clear the filters."
                : "Add your first product or seed the sample catalogue to get started."}
            </p>
            {search || categoryFilter !== "All" ? (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("All");
                }}
                className="btn-primary mt-1"
              >
                Clear filters
              </button>
            ) : (
              <div className="mt-1 flex flex-wrap justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setFormOpen(true);
                  }}
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" /> Add product
                </button>
                <button type="button" onClick={handleSeed} disabled={seeding} className="btn-ghost">
                  {seeding ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  )}
                  Load sample catalogue
                </button>
              </div>
            )}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            {/* Desktop table */}
            <table className="hidden w-full text-left text-sm md:table">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5 font-semibold">Product</th>
                  <th className="px-5 py-3.5 font-semibold">Category</th>
                  <th className="px-5 py-3.5 font-semibold">Price</th>
                  <th className="px-5 py-3.5 font-semibold">Stock</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((product) => (
                  <tr key={product._id} className="transition-colors hover:bg-slate-50/30">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-50">
                          <SmartImage
                            src={product.image}
                            alt={product.name}
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-64 truncate font-medium text-slate-900">
                            {product.name}
                          </p>
                          <p className="max-w-64 truncate text-xs text-slate-500">
                            {product.description || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StockToggle
                        product={product}
                        busy={togglingId === product._id}
                        onToggle={() => handleToggleStock(product)}
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(product);
                            setFormOpen(true);
                          }}
                          className="rounded-full p-2 text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-600"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(product)}
                          className="p-2 text-slate-700 transition-colors hover:text-brand-600"
                          aria-label={`Delete ${product.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <ul className="divide-y divide-slate-50 md:hidden">
              {filtered.map((product) => (
                <li key={product._id} className="p-4">
                  <div className="flex gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-50">
                      <SmartImage src={product.image} alt={product.name} className="object-cover" sizes="64px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.category}</p>
                      <p className="mt-0.5 font-semibold text-slate-900">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <StockToggle
                      product={product}
                      busy={togglingId === product._id}
                      onToggle={() => handleToggleStock(product)}
                    />
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(product);
                          setFormOpen(true);
                        }}
                        className="rounded-full p-2 text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-600"
                        aria-label={`Edit ${product.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(product)}
                        className="p-2 text-slate-700 transition-colors hover:text-brand-600"
                        aria-label={`Delete ${product.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      <ProductFormModal
        open={formOpen}
        product={editing}
        saving={saving}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this product?"
        description={
          deleting
            ? `“${deleting.name}” will be permanently removed from the catalogue. This can't be undone.`
            : ""
        }
        confirmLabel="Delete"
        busy={saving}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />

      <ConfirmDialog
        open={Boolean(deletingCategory)}
        title="Delete this category?"
        description={
          deletingCategory
            ? `“${deletingCategory.name}” will be removed. Products are unaffected — only the category list changes. This can't be undone.`
            : ""
        }
        confirmLabel="Delete"
        busy={savingCategory}
        onConfirm={handleDeleteCategory}
        onCancel={() => setDeletingCategory(null)}
      />
    </div>
  );
}

function StockToggle({
  product,
  busy,
  onToggle,
}: {
  product: Product;
  busy: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={busy}
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors disabled:opacity-60 ${
        product.inStock
          ? "bg-slate-900 text-white hover:bg-brand-600"
          : "border border-slate-300 bg-white text-slate-500 hover:border-slate-900 hover:text-slate-900"
      }`}
      aria-label={`${product.name}: mark as ${product.inStock ? "out of stock" : "in stock"}`}
      aria-pressed={product.inStock}
    >
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
      ) : product.inStock ? (
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {product.inStock ? "In stock" : "Out of stock"}
    </button>
  );
}
