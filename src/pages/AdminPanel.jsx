import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { backendApi } from '../api/backend';
import { useAdminAuth } from '../hooks/useAdminAuth';

const emptyForm = {
  id: '',
  name: '',
  category: '',
  description: '',
  image: '',
  features: '',
  variations: [{ weight: '1kg', price: 0, originalPrice: 0 }],
};

function toProductPayload(formState) {
  const features = formState.features
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const variations = (formState.variations || [])
    .map((variation) => ({
      weight: String(variation.weight ?? '').trim(),
      price: Number(variation.price ?? 0),
      originalPrice: Number(variation.originalPrice ?? 0),
    }))
    .filter((variation) => variation.weight);

  return {
    id: formState.id.trim() || undefined,
    name: formState.name.trim(),
    category: formState.category.trim(),
    description: formState.description.trim(),
    image: formState.image.trim(),
    features,
    variations,
  };
}

function orderSlipMarkup(order) {
  const rows = order.items
    .map(
      (item) =>
        `<tr><td>${item.name}</td><td>${item.weight}</td><td>${item.quantity}</td><td>Rs. ${item.lineTotal}</td></tr>`,
    )
    .join('');

  return `
    <section style="font-family: Arial, sans-serif; padding: 16px; margin-bottom: 24px; border: 1px solid #ddd; page-break-inside: avoid;">
      <h2 style="margin: 0 0 8px;">Tabruk Order Slip</h2>
      <p style="margin: 0 0 4px;"><strong>Order:</strong> ${order.orderNumber}</p>
      <p style="margin: 0 0 4px;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
      <p style="margin: 0 0 4px;"><strong>Customer:</strong> ${order.customer.name}</p>
      <p style="margin: 0 0 4px;"><strong>Phone:</strong> ${order.customer.phone}</p>
      <p style="margin: 0 0 12px;"><strong>Address:</strong> ${order.customer.address}</p>
      <table style="width:100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="text-align:left; border-bottom:1px solid #ccc; padding:6px 4px;">Item</th>
            <th style="text-align:left; border-bottom:1px solid #ccc; padding:6px 4px;">Weight</th>
            <th style="text-align:left; border-bottom:1px solid #ccc; padding:6px 4px;">Qty</th>
            <th style="text-align:left; border-bottom:1px solid #ccc; padding:6px 4px;">Amount</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin-top: 12px;"><strong>Total:</strong> Rs. ${order.totalAmount}</p>
    </section>
  `;
}

function printOrders(orders) {
  if (!orders.length) return;
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head><title>Order Slips</title></head>
      <body>${orders.map((order) => orderSlipMarkup(order)).join('')}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

export default function AdminPanel() {
  const { logout } = useAdminAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [pendingDeleteProduct, setPendingDeleteProduct] = useState(null);
  const [formState, setFormState] = useState(emptyForm);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);

  const selectedOrders = useMemo(
    () => orders.filter((order) => selectedOrderIds.includes(order.id)),
    [orders, selectedOrderIds],
  );

  const revenueMetrics = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return orders.reduce(
      (totals, order) => {
        const orderDate = new Date(order.createdAt);
        const amount = Number(order.totalAmount || 0);

        if (Number.isNaN(orderDate.getTime())) {
          return totals;
        }

        if (
          orderDate.getDate() === currentDay &&
          orderDate.getMonth() === currentMonth &&
          orderDate.getFullYear() === currentYear
        ) {
          totals.daily += amount;
        }

        if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
          totals.monthly += amount;
        }

        if (orderDate.getFullYear() === currentYear) {
          totals.yearly += amount;
        }

        return totals;
      },
      { daily: 0, monthly: 0, yearly: 0 },
    );
  }, [orders]);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const [productData, orderData] = await Promise.all([backendApi.getAdminProducts(), backendApi.getOrders()]);
      setProducts(productData);
      setOrders(orderData);
    } catch (err) {
      setError(err.message || 'Failed to fetch admin data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage('');
    }, 2800);

    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    const shouldLockScroll = isEditorOpen || Boolean(pendingDeleteProduct);

    if (!shouldLockScroll) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isEditorOpen, pendingDeleteProduct]);

  useEffect(() => {
    const shouldListen = isEditorOpen || Boolean(pendingDeleteProduct);
    if (!shouldListen) return undefined;

    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;

      if (pendingDeleteProduct) {
        if (!isDeleting) {
          setPendingDeleteProduct(null);
        }
        return;
      }

      if (isEditorOpen && !isSaving) {
        resetForm();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isEditorOpen, pendingDeleteProduct, isDeleting, isSaving]);

  const resetForm = () => {
    setEditingId('');
    setFormState(emptyForm);
    setIsEditorOpen(false);
  };

  const handleOpenCreate = () => {
    setEditingId('');
    setFormState(emptyForm);
    setIsEditorOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsSaving(true);
      setError('');
      const payload = toProductPayload(formState);

      if (editingId) {
        const updated = await backendApi.updateProduct(editingId, payload);
        setProducts((prev) => prev.map((product) => (product.id === editingId ? updated : product)));
        setSuccessMessage('Product updated successfully.');
      } else {
        const created = await backendApi.createProduct(payload);
        setProducts((prev) => [created, ...prev]);
        setSuccessMessage('Product added successfully.');
      }

      resetForm();
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setIsEditorOpen(true);
    setFormState({
      id: product.id,
      name: product.name,
      category: product.category,
      description: product.description,
      image: product.image,
      features: (product.features || []).join(', '),
      variations: (product.variations || []).length
        ? (product.variations || []).map((variation) => ({
            weight: variation.weight ?? '',
            price: variation.price ?? 0,
            originalPrice: variation.originalPrice ?? 0,
          }))
        : [{ weight: '1kg', price: 0, originalPrice: 0 }],
    });
  };

  const handleVariationChange = (index, key, value) => {
    setFormState((prev) => ({
      ...prev,
      variations: prev.variations.map((variation, variationIndex) =>
        variationIndex === index ? { ...variation, [key]: value } : variation,
      ),
    }));
  };

  const handleAddVariation = () => {
    setFormState((prev) => ({
      ...prev,
      variations: [...prev.variations, { weight: '', price: 0, originalPrice: 0 }],
    }));
  };

  const handleRemoveVariation = (index) => {
    setFormState((prev) => {
      const nextVariations = prev.variations.filter((_, variationIndex) => variationIndex !== index);
      return {
        ...prev,
        variations: nextVariations.length ? nextVariations : [{ weight: '1kg', price: 0, originalPrice: 0 }],
      };
    });
  };

  const handleDeleteRequest = (product) => {
    setPendingDeleteProduct(product);
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteProduct) return;

    try {
      setIsDeleting(true);
      setError('');
      await backendApi.deleteProduct(pendingDeleteProduct.id);
      setProducts((prev) => prev.filter((product) => product.id !== pendingDeleteProduct.id));
      if (editingId === pendingDeleteProduct.id) resetForm();
      setPendingDeleteProduct(null);
      setSuccessMessage('Product deleted successfully.');
    } catch (err) {
      setError(err.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleOrderSelect = (orderId) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId],
    );
  };

  const toggleAllOrders = () => {
    if (selectedOrderIds.length === orders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(orders.map((order) => order.id));
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="bg-[#111111] text-white min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-display text-gold">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 border border-white/20 text-white/80 text-sm uppercase tracking-wider hover:text-gold hover:border-gold/60 transition-colors"
            >
              Logout
            </button>
            <button
              type="button"
              onClick={fetchAdminData}
              className="px-4 py-2 border border-gold text-gold text-sm uppercase tracking-wider hover:bg-gold/10 transition-colors"
            >
              Refresh
            </button>
            <Link to="/" className="text-sm text-white/70 hover:text-gold transition-colors">
              Back to Store
            </Link>
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {successMessage && (
          <p className="text-sm text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 inline-block">
            {successMessage}
          </p>
        )}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-white/10 bg-[#1a1a1a] p-5">
            <p className="text-xs uppercase tracking-wider text-white/50">Daily Revenue</p>
            <p className="text-2xl font-display text-gold mt-2">Rs. {revenueMetrics.daily}</p>
          </div>
          <div className="border border-white/10 bg-[#1a1a1a] p-5">
            <p className="text-xs uppercase tracking-wider text-white/50">Monthly Revenue</p>
            <p className="text-2xl font-display text-gold mt-2">Rs. {revenueMetrics.monthly}</p>
          </div>
          <div className="border border-white/10 bg-[#1a1a1a] p-5">
            <p className="text-xs uppercase tracking-wider text-white/50">Yearly Revenue</p>
            <p className="text-2xl font-display text-gold mt-2">Rs. {revenueMetrics.yearly}</p>
          </div>
        </section>

        <section className="border border-white/10 bg-[#1a1a1a] p-6 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-display text-gold">Orders ({orders.length})</h2>
            <button
              type="button"
              onClick={() => printOrders(selectedOrders)}
              disabled={!selectedOrders.length}
              className="px-4 py-2 bg-gold text-[#111111] text-sm uppercase tracking-wider disabled:opacity-50"
            >
              Print Selected ({selectedOrders.length})
            </button>
          </div>

          {isLoading ? (
            <p className="text-white/60 text-sm">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-white/60 text-sm">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead className="text-left text-white/50 border-b border-white/10">
                  <tr>
                    <th className="py-3 pr-3">
                      <input
                        type="checkbox"
                        checked={orders.length > 0 && selectedOrderIds.length === orders.length}
                        onChange={toggleAllOrders}
                      />
                    </th>
                    <th className="py-3 pr-3">Order</th>
                    <th className="py-3 pr-3">Customer</th>
                    <th className="py-3 pr-3">Phone</th>
                    <th className="py-3 pr-3">Items</th>
                    <th className="py-3 pr-3">Amount</th>
                    <th className="py-3 pr-3">Date</th>
                    <th className="py-3 pr-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-white/5">
                      <td className="py-3 pr-3">
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.includes(order.id)}
                          onChange={() => toggleOrderSelect(order.id)}
                        />
                      </td>
                      <td className="py-3 pr-3 text-gold">{order.orderNumber}</td>
                      <td className="py-3 pr-3">{order.customer.name}</td>
                      <td className="py-3 pr-3">{order.customer.phone}</td>
                      <td className="py-3 pr-3">{order.items.length}</td>
                      <td className="py-3 pr-3">Rs. {order.totalAmount}</td>
                      <td className="py-3 pr-3">{new Date(order.createdAt).toLocaleString()}</td>
                      <td className="py-3 pr-3">
                        <button
                          type="button"
                          onClick={() => printOrders([order])}
                          className="px-3 py-1 border border-gold text-gold hover:bg-gold/10 transition-colors"
                        >
                          Print Slip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="border border-white/10 bg-[#1a1a1a] p-6 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-display text-gold">Product Listing Manager</h2>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-gold text-[#111111] text-sm uppercase tracking-wider font-semibold"
            >
              Add Product
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="text-left text-white/50 border-b border-white/10">
                <tr>
                  <th className="py-3 pr-3">ID</th>
                  <th className="py-3 pr-3">Name</th>
                  <th className="py-3 pr-3">Category</th>
                  <th className="py-3 pr-3">Base Price</th>
                  <th className="py-3 pr-3">Updated</th>
                  <th className="py-3 pr-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-white/5">
                    <td className="py-3 pr-3 text-white/70">{product.id}</td>
                    <td className="py-3 pr-3">{product.name}</td>
                    <td className="py-3 pr-3">{product.category}</td>
                    <td className="py-3 pr-3">Rs. {product.variations?.[0]?.price ?? 0}</td>
                    <td className="py-3 pr-3">{product.updatedAt ? new Date(product.updatedAt).toLocaleString() : '-'}</td>
                    <td className="py-3 pr-3 space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(product)}
                        className="px-3 py-1 border border-gold text-gold hover:bg-gold/10 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRequest(product)}
                        className="px-3 py-1 border border-red-400 text-red-300 hover:bg-red-400/10 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {isEditorOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] px-4"
          onClick={() => {
            if (!isSaving) {
              resetForm();
            }
          }}
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gold/30 bg-[#1a1a1a] p-6 space-y-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-display text-gold">{editingId ? 'Edit Product' : 'Add Product'}</h3>
              <button
                type="button"
                onClick={resetForm}
                disabled={isSaving}
                className="px-3 py-1 border border-white/20 text-white/80 text-xs uppercase tracking-wider"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                value={formState.id}
                onChange={(event) => setFormState((prev) => ({ ...prev, id: event.target.value }))}
                placeholder="Product ID (optional while adding)"
                className="bg-[#111111] border border-white/20 px-3 py-2 outline-none"
              />
              <input
                value={formState.name}
                onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Product Name"
                required
                className="bg-[#111111] border border-white/20 px-3 py-2 outline-none"
              />
              <input
                value={formState.category}
                onChange={(event) => setFormState((prev) => ({ ...prev, category: event.target.value }))}
                placeholder="Category"
                className="bg-[#111111] border border-white/20 px-3 py-2 outline-none"
              />
              <input
                value={formState.image}
                onChange={(event) => setFormState((prev) => ({ ...prev, image: event.target.value }))}
                placeholder="Image URL"
                className="bg-[#111111] border border-white/20 px-3 py-2 outline-none"
              />
              <textarea
                value={formState.description}
                onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Description"
                rows={3}
                className="md:col-span-2 bg-[#111111] border border-white/20 px-3 py-2 outline-none"
              />
              <textarea
                value={formState.features}
                onChange={(event) => setFormState((prev) => ({ ...prev, features: event.target.value }))}
                placeholder="Features (comma separated)"
                rows={2}
                className="md:col-span-2 bg-[#111111] border border-white/20 px-3 py-2 outline-none"
              />
              <div className="md:col-span-2 space-y-3 border border-white/10 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wider text-white/60">Variations</p>
                  <button
                    type="button"
                    onClick={handleAddVariation}
                    className="px-3 py-1 border border-gold text-gold text-xs uppercase tracking-wider hover:bg-gold/10"
                  >
                    Add +
                  </button>
                </div>

                {(formState.variations || []).map((variation, index) => (
                  <div key={`${index}-${variation.weight}`} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input
                      value={variation.weight}
                      onChange={(event) => handleVariationChange(index, 'weight', event.target.value)}
                      placeholder="Weight (e.g. 1kg)"
                      className="bg-[#111111] border border-white/20 px-3 py-2 outline-none"
                    />
                    <input
                      type="number"
                      min="0"
                      value={variation.price}
                      onChange={(event) => handleVariationChange(index, 'price', event.target.value)}
                      placeholder="Price"
                      className="bg-[#111111] border border-white/20 px-3 py-2 outline-none"
                    />
                    <input
                      type="number"
                      min="0"
                      value={variation.originalPrice}
                      onChange={(event) => handleVariationChange(index, 'originalPrice', event.target.value)}
                      placeholder="Original Price"
                      className="bg-[#111111] border border-white/20 px-3 py-2 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveVariation(index)}
                      className="border border-red-400 text-red-300 px-3 py-2 text-xs uppercase tracking-wider hover:bg-red-400/10"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="md:col-span-2 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSaving}
                  className="px-4 py-2 border border-white/20 text-white/80 text-sm uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-gold text-[#111111] text-sm uppercase tracking-wider disabled:opacity-50"
                >
                  {editingId ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pendingDeleteProduct && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] px-4"
          onClick={() => {
            if (!isDeleting) {
              setPendingDeleteProduct(null);
            }
          }}
        >
          <div
            className="w-full max-w-md border border-red-500/50 bg-[#1a1a1a] p-6 space-y-4"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-xl font-display text-red-300">Confirm Delete</h3>
            <p className="text-sm text-white/80">
              Are you sure you want to delete <span className="text-gold">{pendingDeleteProduct.name}</span>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setPendingDeleteProduct(null)}
                className="px-4 py-2 border border-white/20 text-white/80 text-sm uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 text-white text-sm uppercase tracking-wider disabled:opacity-60"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
