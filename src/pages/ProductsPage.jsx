import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProductsPage.css";
import ProfileSection from "../components/ProfileSection";
import NotificationPopup from "../components/NotificationPopup";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import BulkDeleteModal from "../components/BulkDeleteModal";
import EditProductModal from "../components/EditProductModal";
import AddProductDrawer from "../components/AddProductDrawer";

const ProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState({});
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [selectedIds, setSelectedIds] = useState([]);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [headerDropdownPosition, setHeaderDropdownPosition] = useState({
    top: 0,
    left: 0,
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editModal, setEditModal] = useState({
    show: false,
    loading: false,
    initial: null, // initial product data
    form: null, // editable form data
    error: null,
  });
  const [categories, setCategories] = useState([]);
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [addProductForm, setAddProductForm] = useState({
    category_id: categories.length > 0 ? categories[0].id : "",
    name: "",
    quantity: "",
    quantity_type: "numeric",
    price_per_quantity: "",
    status: "available",
  });
  const [addProductLoading, setAddProductLoading] = useState(false);
  const [addProductError, setAddProductError] = useState("");
  const menuRef = useRef(null);
  const headerMenuRef = useRef(null);

  const apiBaseUrl =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}/api/products/`, {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setProducts(data.products || []);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [navigate, apiBaseUrl]);

  useEffect(() => {
    // Load user from localStorage
    const market = JSON.parse(localStorage.getItem("market"));
    if (market) {
      setUser({
        name: market.market_name,
        phone: market.phone_number,
        plan: market.plan,
        profileImage: market.profile_picture,
      });
    }
  }, [navigate, apiBaseUrl]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && menuRef.current.contains(event.target)) return;
      if (headerMenuRef.current && headerMenuRef.current.contains(event.target))
        return;
      setMenuOpenId(null);
      setHeaderMenuOpen(false);
    }
    if (menuOpenId !== null || headerMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside, true);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, [menuOpenId, headerMenuOpen]);

  const handleAddProduct = () => setShowAddProduct(true);

  const handleCloseAddProduct = () => {
    setShowAddProduct(false);
    setAddProductForm({
      category_id: categories.length > 0 ? categories[0].id : "",
      name: "",
      quantity: "",
      quantity_type: "numeric",
      price_per_quantity: "",
      status: "available",
    });
    setAddProductError("");
  };

  const handleAddProductFieldChange = (field, value) => {
    setAddProductForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAddProduct = async () => {
    setAddProductLoading(true);
    setAddProductError("");
    try {
      // Replace with your API call
      const response = await fetch("/api/products/create/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...addProductForm,
          quantity: Number(addProductForm.quantity),
          price_per_quantity: addProductForm.price_per_quantity,
        }),
      });
      if (!response.ok) throw new Error("Mahsulotni yaratib bolmadi");
      setShowAddProduct(false);
      // Optionally refresh products list here
    } catch (e) {
      setAddProductError(e.message || "Xatolik yuz berdi");
    } finally {
      setAddProductLoading(false);
    }
  };

  const getStatusInfo = (quantity) => {
    if (quantity <= 0) return { text: "Mavjud emas", class: "red" };
    if (quantity <= 50) return { text: "Kam qolgan", class: "yellow" };
    return { text: "Bor", class: "green" };
  };

  // Calculate mutually exclusive product status counts for progress bar and legend
  const availableCount = products.filter((p) => p.quantity > 50).length;
  const fewCount = products.filter(
    (p) => p.quantity > 0 && p.quantity <= 50
  ).length;
  const endedCount = products.filter((p) => p.quantity <= 0).length;
  const totalProducts = availableCount + fewCount + endedCount;
  const availablePercent = totalProducts
    ? (availableCount / totalProducts) * 100
    : 0;
  const fewPercent = totalProducts ? (fewCount / totalProducts) * 100 : 0;
  const endedPercent = totalProducts ? (endedCount / totalProducts) * 100 : 0;

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOptionsClick = (event, productId) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    let top = rect.bottom + window.scrollY;
    let left = rect.right + window.scrollX - 140;
    const dropdownHeight = 90;
    if (window.innerHeight - rect.bottom < dropdownHeight) {
      top = rect.top + window.scrollY - dropdownHeight;
    }
    setDropdownPosition({ top, left });
    setMenuOpenId((prev) => (prev === productId ? null : productId));
  };

  const handleHeaderOptionsClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    let top = rect.bottom + window.scrollY;
    let left = rect.right + window.scrollX - 140;
    const dropdownHeight = 90;
    if (window.innerHeight - rect.bottom < dropdownHeight) {
      top = rect.top + window.scrollY - dropdownHeight;
    }
    setHeaderDropdownPosition({ top, left });
    setHeaderMenuOpen((prev) => !prev);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredProducts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleDeleteProduct = async (productId) => {
    if (deleteLoading) return;
    setDeleteLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setNotification({ show: true, type: "error" });
      setDeleteLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/products/delete/${productId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        setNotification({ show: true, type: "success" });
      } else {
        setNotification({ show: true, type: "error" });
      }
    } catch (err) {
      setNotification({ show: true, type: "error" });
    }
    setConfirmDeleteId(null);
    setDeleteLoading(false);
  };

  // Auto-hide notification after 1.2 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification((n) => ({ ...n, show: false }));
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  // Edit modal handlers
  const handleEditProduct = async (productId) => {
    setEditModal((prev) => ({
      ...prev,
      show: true,
      loading: true,
      error: null,
    }));
    const token = localStorage.getItem("token");
    if (!token) {
      setEditModal((prev) => ({ ...prev, loading: false, error: "No token" }));
      return;
    }
    try {
      const res = await fetch(`${apiBaseUrl}/api/products/edit/${productId}/`, {
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch product");
      const data = await res.json();
      setEditModal({
        show: true,
        loading: false,
        initial: data,
        form: { ...data },
        error: null,
      });
    } catch (err) {
      setEditModal((prev) => ({ ...prev, loading: false, error: err.message }));
    }
  };

  const handleEditFieldChange = (field, value) => {
    // Ensure category_id is always a number
    setEditModal((prev) => ({
      ...prev,
      form: {
        ...prev.form,
        [field]: field === "category_id" ? Number(value) : value,
      },
    }));
  };

  const handleSaveEdit = async () => {
    if (!editModal.form || !editModal.initial) return;
    // Compare changes
    const changed = Object.keys(editModal.form).some(
      (key) => editModal.form[key] !== editModal.initial[key]
    );
    if (!changed) {
      setEditModal({
        show: false,
        loading: false,
        initial: null,
        form: null,
        error: null,
      });
      return;
    }
    setEditModal((prev) => ({ ...prev, loading: true, error: null }));
    const token = localStorage.getItem("token");
    if (!token) {
      setEditModal((prev) => ({ ...prev, loading: false, error: "No token" }));
      return;
    }
    // Prepare payload (category_id required, not category_name)
    const payload = { ...editModal.form };
    // Ensure category_id is a number
    if (payload.category_id) payload.category_id = Number(payload.category_id);
    if (
      payload.category_id === undefined &&
      payload.category_name &&
      products.length > 0
    ) {
      // Try to find category_id from products list
      const found = products.find(
        (p) => p.category_name === payload.category_name
      );
      if (found) payload.category_id = found.category_id;
    }
    // Remove category_name from payload if present
    delete payload.category_name;
    try {
      const res = await fetch(
        `${apiBaseUrl}/api/products/update/${payload.id}/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      if (res.status === 200) {
        // Update product in UI
        setProducts((prev) =>
          prev.map((p) =>
            p.id === payload.id
              ? { ...p, ...editModal.form, category_id: payload.category_id }
              : p
          )
        );
        setNotification({ show: true, type: "success" });
        setEditModal({
          show: false,
          loading: false,
          initial: null,
          form: null,
          error: null,
        });
      } else {
        setEditModal((prev) => ({
          ...prev,
          loading: false,
          error: "Update failed",
        }));
        setNotification({ show: true, type: "error" });
      }
    } catch (err) {
      setEditModal((prev) => ({ ...prev, loading: false, error: err.message }));
      setNotification({ show: true, type: "error" });
    }
  };

  const handleCancelEdit = () => {
    setEditModal({
      show: false,
      loading: false,
      initial: null,
      form: null,
      error: null,
    });
  };

  // Fetch categories when edit modal is shown
  useEffect(() => {
    if (!editModal.show) return;
    let ignore = false;
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${apiBaseUrl}/api/categories/`, {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        if (!ignore) setCategories(data);
      } catch (err) {
        if (!ignore) setCategories([]);
      }
    };
    fetchCategories();
    return () => {
      ignore = true;
    };
  }, [editModal.show, apiBaseUrl]);

  const handleBulkDelete = () => {
    setBulkDeleteModal(true);
    setHeaderMenuOpen(false);
  };

  const confirmBulkDelete = async () => {
    if (deleteLoading || selectedIds.length === 0) return;
    setDeleteLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setNotification({ show: true, type: "error" });
      setDeleteLoading(false);
      return;
    }
    try {
      const res = await fetch(`${apiBaseUrl}/api/products/delete/several/`, {
        method: "DELETE",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (res.status === 200) {
        setProducts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
        setSelectedIds([]);
        setNotification({ show: true, type: "success" });
        setBulkDeleteModal(false);
      } else {
        setNotification({ show: true, type: "error" });
      }
    } catch (err) {
      setNotification({ show: true, type: "error" });
    }
    setDeleteLoading(false);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  return (
    <div className="products-page">
      {/* Notification */}
      <NotificationPopup show={notification.show} type={notification.type}>
        {/* No children, just icon */}
      </NotificationPopup>
      {/* Confirmation Modal */}
      <ConfirmDeleteModal
        show={confirmDeleteId !== null}
        product={products.find((p) => p.id === confirmDeleteId)}
        onConfirm={() => handleDeleteProduct(confirmDeleteId)}
        onCancel={() => !deleteLoading && setConfirmDeleteId(null)}
        loading={deleteLoading}
      />
      {/* Edit Product Modal */}
      <EditProductModal
        show={editModal.show}
        loading={editModal.loading}
        error={editModal.error}
        form={editModal.form}
        categories={categories}
        onFieldChange={handleEditFieldChange}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
      />
      {bulkDeleteModal && (
        <BulkDeleteModal
          show={bulkDeleteModal}
          selectedProducts={products.filter((p) => selectedIds.includes(p.id))}
          onConfirm={confirmBulkDelete}
          onCancel={() => setBulkDeleteModal(false)}
          loading={deleteLoading}
        />
      )}
      {/* Add Product Side Card */}
      <AddProductDrawer
        show={showAddProduct}
        onClose={handleCloseAddProduct}
        form={addProductForm}
        categories={categories}
        onFieldChange={handleAddProductFieldChange}
        onSave={handleSaveAddProduct}
        loading={addProductLoading}
        error={addProductError}
      />
      <div className="content-wrapper no-right-column">
        <div className="main-content">
          <div className="header-section">
            <h1>Mahsulotlar</h1>
            <ProfileSection user={user} />
          </div>

          <div className="stats-bar">
            <div className="stats-header">
              <span className="total-count">{totalProducts}</span>
              <span className="stats-label">mahsulot</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-segment green"
                style={{ width: `${availablePercent}%` }}
              />
              <div
                className="progress-segment yellow"
                style={{ width: `${fewPercent}%` }}
              />
              <div
                className="progress-segment red"
                style={{ width: `${endedPercent}%` }}
              />
            </div>
            <div className="stats-legend">
              <div className="legend-item">
                <span className="legend-dot green"></span>
                <span>Bor: {availableCount}</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot yellow"></span>
                <span>Kam qolgan: {fewCount}</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot red"></span>
                <span>Mavjud emas: {endedCount}</span>
              </div>
            </div>
          </div>

          <div className="controls-section">
            <div className="search-container">
              <span className="search-icon" />
              <input
                type="text"
                placeholder="Coca Cola..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="action-buttons">
              <button className="filter-btn">
                <span className="filter-icon" />
              </button>
              <button className="download-btn">
                <span className="download-icon" />
              </button>
              <button className="add-product-btn" onClick={handleAddProduct}>
                + Mahsulot qo'shish
              </button>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      className="custom-checkbox select-all"
                      checked={
                        filteredProducts.length > 0 &&
                        selectedIds.length === filteredProducts.length
                      }
                      onChange={handleSelectAll}
                      indeterminate={
                        selectedIds.length > 0 &&
                        selectedIds.length < filteredProducts.length
                          ? "true"
                          : undefined
                      }
                    />
                  </th>
                  <th>Mahsulot nomi</th>
                  <th>Kategoriya</th>
                  <th>Qoldiq</th>
                  <th>
                    Status <span className="sort-icon"></span>
                  </th>
                  <th>Narx</th>
                  <th>
                    <button
                      className={`options-btn${headerMenuOpen ? " open" : ""}`}
                      onClick={handleHeaderOptionsClick}
                      aria-label="Table Options"
                      style={{
                        background: headerMenuOpen
                          ? "var(--color-hover, #f2f2f2)"
                          : "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        borderRadius: 6,
                        transition: "background 0.2s",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 22,
                          lineHeight: 1,
                          color: "var(--color-text-primary)",
                        }}
                      >
                        ⋯
                      </span>
                    </button>
                    {headerMenuOpen && (
                      <div
                        className="profile-dropdown product-dropdown"
                        ref={headerMenuRef}
                        style={{
                          position: "fixed",
                          top: headerDropdownPosition.top,
                          left: headerDropdownPosition.left,
                          minWidth: 140,
                        }}
                      >
                        <button
                          onClick={handleBulkDelete}
                          className="dropdown-action-btn"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 20 20"
                            fill="none"
                            style={{ display: "inline" }}
                          >
                            <rect
                              x="5"
                              y="7"
                              width="10"
                              height="8"
                              rx="1"
                              stroke="#E53E3E"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M8 9v4M12 9v4"
                              stroke="#E53E3E"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                            <path
                              d="M3 7h14"
                              stroke="#E53E3E"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                            <path
                              d="M8 7V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2"
                              stroke="#E53E3E"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                          Tanlanganlarni o'chirish
                        </button>
                      </div>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const statusInfo = getStatusInfo(product.quantity);
                  return (
                    <tr key={product.id}>
                      <td>
                        <input
                          type="checkbox"
                          className="custom-checkbox"
                          checked={selectedIds.includes(product.id)}
                          onChange={() => handleSelectRow(product.id)}
                        />
                      </td>
                      <td className="product-name">{product.name}</td>
                      <td className="category">
                        {product.category_name || "Boshqa"}
                      </td>
                      <td className="quantity">{product.quantity}</td>
                      <td>
                        <span className={`status ${statusInfo.class}`}>
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className="price">
                        {parseFloat(
                          product.price_per_quantity
                        ).toLocaleString()}{" "}
                        UZS
                      </td>
                      <td style={{ position: "relative" }}>
                        <button
                          className={`options-btn${
                            menuOpenId === product.id ? " open" : ""
                          }`}
                          onClick={(e) => handleOptionsClick(e, product.id)}
                          aria-label="Options"
                          style={{
                            background:
                              menuOpenId === product.id
                                ? "var(--color-hover, #f2f2f2)"
                                : "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            borderRadius: 6,
                            transition: "background 0.2s",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 22,
                              lineHeight: 1,
                              color: "var(--color-text-primary)",
                            }}
                          >
                            ⋯
                          </span>
                        </button>
                        {menuOpenId === product.id && (
                          <div
                            className="profile-dropdown product-dropdown"
                            ref={menuRef}
                            style={{
                              position: "fixed",
                              top: dropdownPosition.top,
                              left: dropdownPosition.left,
                              minWidth: 140,
                            }}
                          >
                            <button
                              onClick={() => {
                                handleEditProduct(product.id);
                                setMenuOpenId(null);
                              }}
                              className="dropdown-action-btn"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 20 20"
                                fill="none"
                                style={{ display: "inline" }}
                              >
                                <path
                                  d="M14.69 3.86a2.1 2.1 0 0 1 2.97 2.97l-8.5 8.5a2 2 0 0 1-.71.44l-3.13 1.04a.5.5 0 0 1-.63-.63l1.04-3.13a2 2 0 0 1 .44-.71l8.5-8.5Zm2.12-2.12a3.6 3.6 0 0 0-5.09 0l-8.5 8.5a4.5 4.5 0 0 0-.99 1.6l-1.04 3.13A2 2 0 0 0 2.6 18.1l3.13-1.04a4.5 4.5 0 0 0 1.6-.99l8.5-8.5a3.6 3.6 0 0 0 0-5.09Z"
                                  stroke="#4A90E2"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              Tahrirlash
                            </button>
                            <button
                              onClick={() => {
                                setConfirmDeleteId(product.id);
                                setMenuOpenId(null);
                              }}
                              className="dropdown-action-btn"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 20 20"
                                fill="none"
                                style={{ display: "inline" }}
                              >
                                <rect
                                  x="5"
                                  y="7"
                                  width="10"
                                  height="8"
                                  rx="1"
                                  stroke="#E53E3E"
                                  strokeWidth="1.5"
                                />
                                <path
                                  d="M8 9v4M12 9v4"
                                  stroke="#E53E3E"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M3 7h14"
                                  stroke="#E53E3E"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M8 7V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2"
                                  stroke="#E53E3E"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                />
                              </svg>
                              O'chirish
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
