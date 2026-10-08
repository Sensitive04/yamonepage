"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import type { Product, ProductPayload } from "@/lib/types";
import { CATEGORIES } from "@/lib/constants";
import { fetchCategories } from "@/lib/api-client";

interface ProductFormModalProps {
  open: boolean;
  product: Product | null;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: ProductPayload) => Promise<void>;
}

interface FormState {
  name: string;
  category: string;
  price: string;
  description: string;
  image: string;
  inStock: boolean;
}

function toFormState(product: Product | null): FormState {
  return product
    ? {
        name: product.name,
        category: product.category,
        price: String(product.price),
        description: product.description,
        image: product.image,
        inStock: product.inStock,
      }
    : {
        name: "",
        category: CATEGORIES[0],
        price: "",
        description: "",
        image: "",
        inStock: true,
      };
}

export function ProductFormModal({ open, product, saving, onClose, onSave }: ProductFormModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, saving, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[85] flex items-end justify-center bg-slate-900/50 backdrop-blur-sm sm:items-center sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={product ? "Edit product" : "Add product"}
      onClick={() => !saving && onClose()}
    >
      <div
        className="relative max-h-[94vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl animate-scale-in sm:rounded-3xl sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => !saving && onClose()}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-700 transition-colors hover:bg-slate-50"
          aria-label="Close form"
          disabled={saving}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Keyed by product id so the form state re-initialises whenever the target changes. */}
        <ProductFormBody
          key={product?._id ?? "new-product"}
          product={product}
          saving={saving}
          onClose={onClose}
          onSave={onSave}
        />
      </div>
    </div>
  );
}

function ProductFormBody({
  product,
  saving,
  onClose,
  onSave,
}: {
  product: Product | null;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: ProductPayload) => Promise<void>;
}) {
  const [form, setForm] = useState<FormState>(() => toFormState(product));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewFailed, setPreviewFailed] = useState(false);
  const [categories, setCategories] = useState<string[]>([...CATEGORIES]);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => firstFieldRef.current?.focus(), 120);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
    if (key === "image") setPreviewFailed(false);
  };

  const validate = (): ProductPayload | null => {
    const next: Record<string, string> = {};
    const name = form.name.trim();
    const price = Number(form.price);

    if (name.length < 2) next.name = "Name must be at least 2 characters.";
    if (!form.category.trim()) next.category = "Pick a category.";
    if (!form.price.trim() || Number.isNaN(price)) next.price = "Enter a valid price.";
    else if (price < 0) next.price = "Price cannot be negative.";
    else if (price > 1_000_000) next.price = "Price looks too high.";
    if (!form.image.trim()) next.image = "Image URL is required.";
    else if (!/^https?:\/\/\S+$/i.test(form.image.trim()))
      next.image = "Use a valid http(s) image URL.";

    setErrors(next);
    if (Object.keys(next).length > 0) return null;

    return {
      name,
      category: form.category.trim(),
      price,
      description: form.description.trim(),
      image: form.image.trim(),
      inStock: form.inStock,
    };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = validate();
    if (!payload) return;
    try {
      await onSave(payload);
    } catch {
      // Error toast is raised by the parent.
    }
  };

  const previewSrc = form.image.trim();
  const showPreview = previewSrc.length > 0 && !previewFailed;
  const categoryOptions = form.category && !categories.includes(form.category)
    ? [...categories, form.category]
    : categories;

  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-600">
        {product ? "Edit product" : "New product"}
      </p>
      <h2 className="mt-1.5 font-display text-2xl font-semibold text-slate-900">
        {product ? product.name : "Add to catalogue"}
      </h2>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div>
          <label htmlFor="product-name" className="mb-1.5 block text-sm font-medium text-slate-900">
            Product name
          </label>
          <input
            id="product-name"
            ref={firstFieldRef}
            type="text"
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="Rose Glow Vitamin C Serum"
            className="input-field"
            maxLength={160}
          />
          {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="product-category" className="mb-1.5 block text-sm font-medium text-slate-900">
              Category
            </label>
            <select
              id="product-category"
              value={form.category}
              onChange={(event) => update("category", event.target.value)}
              className="input-field appearance-none bg-white"
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-xs text-rose-600">{errors.category}</p>}
          </div>

          <div>
            <label htmlFor="product-price" className="mb-1.5 block text-sm font-medium text-slate-900">
              Price (USD)
            </label>
            <input
              id="product-price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) => update("price", event.target.value)}
              placeholder="34.00"
              className="input-field"
            />
            {errors.price && <p className="mt-1 text-xs text-rose-600">{errors.price}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="product-image" className="mb-1.5 block text-sm font-medium text-slate-900">
            Image URL
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="relative flex-1">
              <ImagePlus
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                aria-hidden="true"
              />
              <input
                id="product-image"
                type="url"
                value={form.image}
                onChange={(event) => update("image", event.target.value)}
                placeholder="https://images.unsplash.com/photo-…"
                className="input-field pl-11"
              />
            </div>

            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
              {showPreview ? (
                // Live thumbnail preview so admins can verify the link works before saving.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewSrc}
                  alt="Image URL preview"
                  className="h-full w-full object-cover"
                  onError={() => setPreviewFailed(true)}
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-[10px] text-slate-500">
                  <ImagePlus className="h-5 w-5 text-brand-600" aria-hidden="true" />
                  {previewSrc ? "Broken link" : "Preview"}
                </div>
              )}
            </div>
          </div>
          {errors.image && <p className="mt-1 text-xs text-rose-600">{errors.image}</p>}
          <p className="mt-1 text-xs text-slate-500">
            Paste a direct link (Unsplash, Pexels or any CDN). The thumbnail updates live.
          </p>
        </div>

        <div>
          <label htmlFor="product-description" className="mb-1.5 block text-sm font-medium text-slate-900">
            Description
          </label>
          <textarea
            id="product-description"
            rows={3}
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
            placeholder="What makes this product special?"
            className="input-field resize-none"
            maxLength={2000}
          />
        </div>

        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-3.5">
          <span>
            <span className="block text-sm font-medium text-slate-900">In stock</span>
            <span className="block text-xs text-slate-500">
              {form.inStock ? "Customers can add this to their bag." : "Hidden as sold out."}
            </span>
          </span>
          <span className="relative inline-flex">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={form.inStock}
              onChange={(event) => update("inStock", event.target.checked)}
            />
            <span className="block h-7 w-12 rounded-full bg-slate-100 transition-colors peer-checked:bg-slate-500" />
            <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
          </span>
        </label>

        <div className="flex flex-col gap-2.5 pt-1 sm:flex-row-reverse">
          <button type="submit" className="btn-primary flex-1" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Saving…
              </>
            ) : product ? (
              "Save changes"
            ) : (
              "Add product"
            )}
          </button>
          <button type="button" onClick={onClose} className="btn-ghost sm:w-36" disabled={saving}>
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}
