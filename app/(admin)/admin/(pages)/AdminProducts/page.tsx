"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  AlertTriangle,
  Package,
  X,
} from "lucide-react";
import { supabase } from "@/utils/supabase/supabase_client";
import { useToast } from "@/app/context/ToastContext";
import { useAdminAuth } from "@/app/context/AdminAuthContext";

interface AdminProduct {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  discount_price: number | null;
  sku: string | null;
  stock_quantity: number;
  images: string[];
  tags: string[];
  status: string;
  rating: number | null;
  created_at: string;
}

const emptyProduct = {
  name: "",
  description: "",
  category: "Electronics",
  price: 0,
  discount_price: null as number | null,
  sku: "",
  stock_quantity: 0,
  images: [] as string[],
  tags: [] as string[],
  status: "active",
};

const categories = [
  "Electronics",
  "Clothing",
  "Home & Kitchen",
  "Beauty",
  "Sports",
  "Books",
  "Other",
];

const AdminProducts = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(
    null,
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [imageInput, setImageInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);

  const { user } = useAdminAuth();
  const { showToast: toast } = useToast();

  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase
      .from("admin_products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast("Error", "error", error.message);
      console.error("Fetch error:", error);
    } else {
      setProducts((data || []) as unknown as AdminProduct[]);
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openCreate = () => {
    setEditingProduct(null);
    setForm(emptyProduct);
    setImageInput("");
    setTagInput("");
    setIsFormOpen(true);
  };

  const openEdit = (product: AdminProduct) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description || "",
      category: product.category,
      price: product.price,
      discount_price: product.discount_price,
      sku: product.sku || "",
      stock_quantity: product.stock_quantity,
      images: product.images || [],
      tags: product.tags || [],
      status: product.status,
    });
    setImageInput("");
    setTagInput("");
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || form.price <= 0) {
      toast(
        "Validation error",
        "error",
        "Name and a valid price are required.",
      );
      return;
    }

    setLoading(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      category: form.category,
      price: form.price,
      discount_price: form.discount_price || null,
      sku: form.sku.trim() || null,
      stock_quantity: form.stock_quantity,
      images: form.images,
      tags: form.tags,
      status: form.status,
    };

    if (editingProduct) {
      const { error } = await supabase
        .from("admin_products")
        .update({ ...payload, updated_at: new Date().toISOString() } as any)
        .eq("id", editingProduct.id);

      if (error) toast("Error", "error", error.message);
      else toast("Product updated", "success");
    } else {
      const { error } = await supabase
        .from("admin_products")
        .insert({ ...payload, created_by: user?.id } as any);

      if (error) {
        console.error("Insert error:", error);
        toast("Error", "error", error.message);
      } else toast("Product created", "success");
    }

    setLoading(false);
    setIsFormOpen(false);
    fetchProducts();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase
      .from("admin_products")
      .delete()
      .eq("id", deleteId);
    if (error) toast("Error", "error", error.message);
    else toast("Product deleted", "success");
    setDeleteId(null);
    fetchProducts();
  };

  const addImage = () => {
    if (imageInput.trim()) {
      setForm((f) => ({ ...f, images: [...f.images, imageInput.trim()] }));
      setImageInput("");
    }
  };

  const addTag = () => {
    if (tagInput.trim()) {
      setForm((f) => ({ ...f, tags: [...f.tags, tagInput.trim()] }));
      setTagInput("");
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())),
  );

  const lowStockProducts = products.filter(
    (p) => p.stock_quantity <= 5 && p.status === "active",
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Products Management</h1>
          <div className="text-sm opacity-70 mt-1">
            {products.length} total · {lowStockProducts.length} low stock
          </div>
        </div>
        <button onClick={openCreate} className="btn btn-primary gap-2">
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Low stock alert */}
      {lowStockProducts.length > 0 && (
        <div className="alert alert-warning shadow-sm">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div>
            <h3 className="font-semibold">Low Stock Warning</h3>
            <div className="text-sm">
              {lowStockProducts.length} product(s) have ≤ 5 items left:{" "}
              <span className="font-medium">
                {lowStockProducts.map((p) => p.name).join(", ")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Search + stats */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <label className="input input-bordered flex items-center gap-2 w-full sm:w-80">
          <Search size={18} className="opacity-60" />
          <input
            type="text"
            placeholder="Search by name, category, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="grow"
          />
        </label>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-base-100 rounded-xl shadow">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 opacity-70">
                  <Package className="mx-auto h-12 w-12 mb-3 opacity-50" />
                  <div className="text-lg font-medium">No products found</div>
                  <div className="text-sm mt-1">
                    {search
                      ? "Try adjusting your search"
                      : "Add your first product"}
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((product) => (
                <tr key={product.id} className="hover">
                  <td>
                    <div className="flex items-center gap-3">
                      {product.images?.[0] ? (
                        <div className="avatar">
                          <div className="w-10 rounded">
                            <img src={product.images[0]} alt={product.name} />
                          </div>
                        </div>
                      ) : (
                        <div className="avatar placeholder">
                          <div className="bg-neutral text-neutral-content rounded w-10">
                            <span className="text-xs">No img</span>
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{product.name}</div>
                        {product.sku && (
                          <div className="text-xs opacity-60">
                            SKU: {product.sku}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td>
                    <div className="font-medium">
                      ${product.price.toFixed(2)}
                    </div>
                    {product.discount_price && (
                      <div className="text-xs line-through opacity-60">
                        ${product.discount_price.toFixed(2)}
                      </div>
                    )}
                  </td>
                  <td>
                    <div
                      className={`badge ${
                        product.stock_quantity <= 5
                          ? "badge-error"
                          : "badge-outline"
                      } gap-1`}
                    >
                      {product.stock_quantity}
                    </div>
                  </td>
                  <td>
                    <div
                      className={`badge ${
                        product.status === "active"
                          ? "badge-success"
                          : "badge-neutral"
                      }`}
                    >
                      {product.status}
                    </div>
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(product)}
                        className="btn btn-ghost btn-sm btn-circle"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteId(product.id)}
                        className="btn btn-ghost btn-sm btn-circle text-error"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Product Form Modal ──────────────────────────────────────── */}
      <input
        type="checkbox"
        id="product-modal"
        className="modal-toggle"
        checked={isFormOpen}
        readOnly
      />
      <div className="modal modal-bottom sm:modal-middle">
        <div className="modal-box max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6 sticky top-0 bg-base-100 z-10 pb-4 border-b">
            <h3 className="font-bold text-xl">
              {editingProduct ? "Edit Product" : "Create New Product"}
            </h3>
            <button
              className="btn btn-ghost btn-circle"
              onClick={() => setIsFormOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6 py-2">
            {/* Name + SKU */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">
                    Product Name <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">SKU</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={form.sku}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sku: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Description */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>

            {/* Category + Price + Discount */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Category</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">
                    Price <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input input-bordered w-full"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      price: Number(e.target.value) || 0,
                    }))
                  }
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Discount Price</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input input-bordered w-full"
                  value={form.discount_price ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      discount_price: e.target.value
                        ? Number(e.target.value)
                        : null,
                    }))
                  }
                />
              </div>
            </div>

            {/* Stock + Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Stock Quantity</span>
                </label>
                <input
                  type="number"
                  min="0"
                  className="input input-bordered w-full"
                  value={form.stock_quantity}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      stock_quantity: Number(e.target.value) || 0,
                    }))
                  }
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Status</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value }))
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Images */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Product Images (URLs)</span>
              </label>
              <div className="join w-full">
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  className="input input-bordered join-item flex-1"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                />
                <button className="btn join-item" onClick={addImage}>
                  Add
                </button>
              </div>

              {form.images.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {form.images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt="preview"
                        className="w-20 h-20 object-cover rounded border"
                        onError={(e) =>
                          (e.currentTarget.src = "/placeholder-image.png")
                        }
                      />
                      <button
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            images: f.images.filter((_, i) => i !== index),
                          }))
                        }
                        className="btn btn-error btn-xs btn-circle absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Tags</span>
              </label>
              <div className="join w-full">
                <input
                  type="text"
                  placeholder="e.g. bestseller, new, summer"
                  className="input input-bordered join-item flex-1"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                />
                <button className="btn join-item" onClick={addTag}>
                  Add
                </button>
              </div>

              {form.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {form.tags.map((tag, index) => (
                    <div
                      key={index}
                      className="badge badge-outline gap-2 cursor-pointer hover:badge-error"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          tags: f.tags.filter((_, i) => i !== index),
                        }))
                      }
                    >
                      {tag}
                      <X size={14} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="modal-action mt-8">
            <button
              className="btn"
              onClick={() => setIsFormOpen(false)}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner"></span>
                  {editingProduct ? "Updating..." : "Creating..."}
                </>
              ) : editingProduct ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <input
        type="checkbox"
        id="delete-modal"
        className="modal-toggle"
        checked={!!deleteId}
        readOnly
      />
      <div className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-error">Delete Product</h3>
          <p className="py-4">
            Are you sure you want to permanently delete this product?
            <br />
            This action cannot be undone.
          </p>
          <div className="modal-action">
            <button className="btn" onClick={() => setDeleteId(null)}>
              Cancel
            </button>
            <button className="btn btn-error" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
