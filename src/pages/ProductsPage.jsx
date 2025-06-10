import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProductsPage.css";
import ProfileSection from "../components/ProfileSection";
import NotificationPopup from "../components/NotificationPopup";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import BulkDeleteModal from "../components/BulkDeleteModal";
import EditProductModal from "../components/EditProductModal";
import AddProductModal from "../components/AddProductDrawer";

const ProductsPage = () => {
  const navigate = useNavigate();
  const theme = "light";
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
  const [addProductButtonLoading, setAddProductButtonLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerData, setDrawerData] = useState(null);
  const [drawerError, setDrawerError] = useState("");
  const menuRef = useRef(null);
  const headerMenuRef = useRef(null);

  const apiBaseUrl =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

  // Fetch products and categories together, then map category_name
  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      setLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch(`${apiBaseUrl}/api/products/`, {
            method: "GET",
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          }),
          fetch(`${apiBaseUrl}/api/categories/`, {
            method: "GET",
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          }),
        ]);
        if (!productsRes.ok) throw new Error("Failed to fetch products");
        if (!categoriesRes.ok) throw new Error("Failed to fetch categories");
        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
        setProducts(productsData.products || []);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchProductsAndCategories();
    // eslint-disable-next-line
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

  const handleFetchCategoriesForAddProduct = async () => {
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
      setCategories(data);

      // Set default category_id to the ID of the first category
      if (data.length > 0) {
        setAddProductForm((prev) => ({
          ...prev,
          category_id: data[0].id,
        }));
      }
    } catch (err) {
      setCategories([]);
    }
  };

  const handleAddProduct = async () => {
    setAddProductButtonLoading(true);
    await handleFetchCategoriesForAddProduct();
    setShowAddProduct(true);
    setAddProductButtonLoading(false);
  };

  const handleCloseAddProduct = () => {
    const defaultCategoryId = categories.length > 0 ? categories[0].id : "";
    setShowAddProduct(false);
    setAddProductForm({
      category_id: defaultCategoryId,
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

    // Validate fields except dropdowns
    const requiredFields = ["name", "quantity", "price_per_quantity", "status"];
    const missingFields = requiredFields.filter(
      (field) => !addProductForm[field]
    );

    if (missingFields.length > 0) {
      setAddProductError("Iltimos, barcha maydonlarni to'ldiring.");
      setAddProductLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token not found");

      let response;
      if (addProductForm.localImageFile) {
        // Use FormData if image file is present
        const formData = new FormData();
        formData.append("category_id", Number(addProductForm.category_id));
        formData.append("name", addProductForm.name);
        formData.append("quantity", Number(addProductForm.quantity));
        formData.append("quantity_type", addProductForm.quantity_type);
        formData.append(
          "price_per_quantity",
          parseFloat(addProductForm.price_per_quantity).toFixed(2)
        );
        formData.append("status", addProductForm.status);
        formData.append("image", addProductForm.localImageFile);
        response = await fetch(`${apiBaseUrl}/api/products/create/`, {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
          },
          body: formData,
        });
      } else {
        // Otherwise, send JSON as before
        const payload = {
          category_id: Number(addProductForm.category_id),
          name: addProductForm.name,
          quantity: Number(addProductForm.quantity),
          quantity_type: addProductForm.quantity_type,
          price_per_quantity: parseFloat(
            addProductForm.price_per_quantity
          ).toFixed(2),
          status: addProductForm.status,
        };
        response = await fetch(`${apiBaseUrl}/api/products/create/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) throw new Error("Mahsulotni yaratib bolmadi");

      // Instead of just adding the returned product, fetch the full list again
      const fetchProducts = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        try {
          const [productsRes, categoriesRes] = await Promise.all([
            fetch(`${apiBaseUrl}/api/products/`, {
              method: "GET",
              headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
              },
            }),
            fetch(`${apiBaseUrl}/api/categories/`, {
              method: "GET",
              headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
              },
            }),
          ]);
          if (!productsRes.ok) throw new Error("Failed to fetch products");
          if (!categoriesRes.ok) throw new Error("Failed to fetch categories");
          const productsData = await productsRes.json();
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
          setProducts(productsData.products || []);
        } catch (error) {
          setError(error.message);
        }
      };
      await fetchProducts();
      // Clear the add product form fields
      setAddProductForm({
        category_id: categories.length > 0 ? categories[0].id : "",
        name: "",
        quantity: "",
        quantity_type: "numeric",
        price_per_quantity: "",
        status: "available",
      });
      setShowAddProduct(false);
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

  const filteredProducts = products.filter(
    (product) =>
      product.name &&
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
        // Refetch products and categories to keep category_name in sync
        const [productsRes, categoriesRes] = await Promise.all([
          fetch(`${apiBaseUrl}/api/products/`, {
            method: "GET",
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          }),
          fetch(`${apiBaseUrl}/api/categories/`, {
            method: "GET",
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          }),
        ]);
        if (productsRes.ok && categoriesRes.ok) {
          const productsData = await productsRes.json();
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
          setProducts(productsData.products || []);
        }
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
    // Try to get the product from local state first
    const localProduct = products.find((p) => p.id === productId);
    if (localProduct) {
      // Find the category whose name matches the product's category_name
      let matchedCategoryId = "";
      if (localProduct.category_name && categories.length > 0) {
        const matched = categories.find(
          (cat) => cat.name === localProduct.category_name
        );
        if (matched) matchedCategoryId = String(matched.id);
      }
      setEditModal({
        show: true,
        loading: false,
        initial: localProduct,
        form: {
          ...localProduct,
          category_id: matchedCategoryId || String(localProduct.category_id),
        },
        error: null,
      });
      return;
    }
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
      // Find the category whose name matches the product's category_name
      let matchedCategoryId = "";
      if (data.category_name && categories.length > 0) {
        const matched = categories.find(
          (cat) => cat.name === data.category_name
        );
        if (matched) matchedCategoryId = String(matched.id);
      }
      setEditModal({
        show: true,
        loading: false,
        initial: data,
        form: {
          ...data,
          category_id: matchedCategoryId || String(data.category_id),
          image_url: data.image_url || data.image || "", // always set image_url for edit
        },
        error: null,
      });
    } catch (err) {
      setEditModal((prev) => ({ ...prev, loading: false, error: err.message }));
    }
  };

  const handleEditFieldChange = (field, value) => {
    setEditModal((prev) => ({
      ...prev,
      form: {
        ...prev.form,
        [field]: field === "category_id" ? String(value) : value, // always string
      },
    }));
  };

  const handleSaveEdit = async () => {
    if (!editModal.form || !editModal.initial) return;
    // Only compare backend fields and normalize types
    const fieldsToCheck = [
      "category_id",
      "name",
      "quantity",
      "quantity_type",
      "price_per_quantity",
      "status",
    ];
    const changed = fieldsToCheck.some((key) => {
      let formValue = editModal.form[key];
      let initialValue = editModal.initial[key];
      // Normalize types for comparison
      if (key === "category_id" || key === "quantity") {
        formValue = Number(formValue);
        initialValue = Number(initialValue);
      } else if (key === "price_per_quantity") {
        formValue = parseFloat(formValue);
        initialValue = parseFloat(initialValue);
      } else if (
        typeof formValue === "string" &&
        typeof initialValue === "string"
      ) {
        formValue = formValue.trim();
        initialValue = initialValue.trim();
      }
      return formValue !== initialValue;
    });
    if (!changed && !editModal.form.localImageFile) {
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
    try {
      // Always use FormData for edit
      const formData = new FormData();
      formData.append("category_id", Number(editModal.form.category_id));
      formData.append("name", editModal.form.name);
      formData.append("quantity", Number(editModal.form.quantity));
      formData.append("quantity_type", editModal.form.quantity_type);
      formData.append(
        "price_per_quantity",
        parseFloat(editModal.form.price_per_quantity).toFixed(2)
      );
      formData.append("status", editModal.form.status);
      formData.append("id", editModal.form.id);
      // If a new image file is selected, send it; otherwise, send the current image url from the API (image_url)
      if (editModal.form.localImageFile) {
        formData.append("image", editModal.form.localImageFile);
      } else if (editModal.form.image_url) {
        // If the image_url is a URL string, fetch the blob and append as File
        if (
          typeof editModal.form.image_url === "string" &&
          editModal.form.image_url.startsWith("http")
        ) {
          try {
            const response = await fetch(editModal.form.image_url);
            const blob = await response.blob();
            // Try to extract filename from URL
            const urlParts = editModal.form.image_url.split("/");
            const filename = urlParts[urlParts.length - 1] || "image.jpg";
            const file = new File([blob], filename, { type: blob.type });
            formData.append("image", file);
          } catch (err) {
            formData.append("image", editModal.form.image_url);
          }
        } else {
          formData.append("image", editModal.form.image_url);
        }
      }

      // Debug: log raw FormData as an object
      const rawFormData = {};
      for (let pair of formData.entries()) {
        rawFormData[pair[0]] = pair[1];
      }
      // For files, log their name/type, not the object
      if (rawFormData.image instanceof File) {
        rawFormData.image = `[File] name: ${rawFormData.image.name}, type: ${rawFormData.image.type}`;
      }

      const res = await fetch(
        `${apiBaseUrl}/api/products/update/${editModal.form.id}/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Token ${token}`,
          },
          body: formData,
        }
      );
      if (res.status === 200) {
        // Refetch products and categories to keep category_name in sync
        const [productsRes, categoriesRes] = await Promise.all([
          fetch(`${apiBaseUrl}/api/products/`, {
            method: "GET",
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          }),
          fetch(`${apiBaseUrl}/api/categories/`, {
            method: "GET",
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          }),
        ]);
        if (productsRes.ok && categoriesRes.ok) {
          const productsData = await productsRes.json();
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
          setProducts(productsData.products || []);
        }
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
        // Refetch products and categories to keep category_name in sync
        const [productsRes, categoriesRes] = await Promise.all([
          fetch(`${apiBaseUrl}/api/products/`, {
            method: "GET",
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          }),
          fetch(`${apiBaseUrl}/api/categories/`, {
            method: "GET",
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          }),
        ]);
        if (productsRes.ok && categoriesRes.ok) {
          const productsData = await productsRes.json();
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
          setProducts(productsData.products || []);
        }
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

  // Download report handler
  const handleDownloadReport = async () => {
    setDownloadLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token not found");
      const response = await fetch(`${apiBaseUrl}/api/products/report/`, {
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "products_report.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: "Hisobotni yuklab bo'lmadi",
      });
      console.error("Download failed:", error);
    } finally {
      setDownloadLoading(false);
    }
  };

  // Fetch product details and open drawer
  const handleProductRowClick = async (productId) => {
    setDrawerOpen(true);
    setDrawerLoading(true);
    setDrawerError("");
    setDrawerData(null);
    const token = localStorage.getItem("token");
    if (!token) {
      setDrawerError("Token not found");
      setDrawerLoading(false);
      return;
    }
    try {
      const res = await fetch(`${apiBaseUrl}/api/products/${productId}/`, {
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch product details");
      const data = await res.json();
      setDrawerData(data);
    } catch (err) {
      setDrawerError(err.message);
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setDrawerData(null);
    setDrawerError("");
  };

  // Helper to format date as DD/MM/YYYY
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
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
      <AddProductModal
        show={showAddProduct}
        onClose={handleCloseAddProduct}
        form={addProductForm}
        categories={categories}
        onFieldChange={handleAddProductFieldChange}
        onSave={handleSaveAddProduct}
        loading={addProductLoading}
        error={addProductError}
        apiBaseUrl={apiBaseUrl}
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
              <button
                className="download-btn"
                onClick={handleDownloadReport}
                disabled={downloadLoading}
              >
                {downloadLoading ? (
                  <span
                    className="btn-spinner"
                    style={{
                      width: 18,
                      height: 18,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 50 50">
                      <circle
                        cx="25"
                        cy="25"
                        r="20"
                        fill="none"
                        stroke="#4A90E2"
                        strokeWidth="5"
                        strokeDasharray="31.4 31.4"
                        strokeLinecap="round"
                      >
                        <animateTransform
                          attributeName="transform"
                          type="rotate"
                          from="0 25 25"
                          to="360 25 25"
                          dur="0.8s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </svg>
                  </span>
                ) : (
                  <span className="download-icon" />
                )}
              </button>
              <button
                className="add-product-btn"
                onClick={handleAddProduct}
                disabled={addProductButtonLoading}
              >
                {addProductButtonLoading
                  ? "Yuklanmoqda..."
                  : "+ Mahsulot qo'shish"}
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
                    <tr
                      key={product.id}
                      className="product-row"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleProductRowClick(product.id)}
                    >
                      <td>
                        <input
                          type="checkbox"
                          className="custom-checkbox"
                          checked={selectedIds.includes(product.id)}
                          onChange={() => handleSelectRow(product.id)}
                        />
                      </td>
                      <td className="product-name">
                        {(product.image_url || product.image) && (
                          <img
                            src={
                              product.image_url
                                ? product.image_url
                                : product.image
                                ? `https://res.cloudinary.com/bnf404/${product.image}`
                                : undefined
                            }
                            alt={product.name}
                            className="product-table-thumb"
                          />
                        )}
                        <span
                          style={{
                            marginLeft:
                              product.image_url || product.image ? 14 : 0,
                            verticalAlign: "middle",
                          }}
                        >
                          {product.name}
                        </span>
                      </td>
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
      {/* Product Details Drawer */}
      <div
        className={`product-details-drawer${
          drawerOpen ? " open" : ""
        } ${theme}`}
        style={{
          right: drawerOpen ? 0 : "-480px",
          transition: "right 0.35s cubic-bezier(.4,0,.2,1)",
          zIndex: 1002,
        }}
        tabIndex={-1}
        aria-modal="true"
        role="dialog"
      >
        <button
          className="drawer-close-btn"
          onClick={handleCloseDrawer}
          aria-label="Yopish"
        >
          <span style={{ fontSize: 24, fontWeight: 700 }}>&times;</span>
        </button>
        {drawerLoading ? (
          <div className="drawer-loading">Yuklanmoqda...</div>
        ) : drawerError ? (
          <div className="drawer-error">{drawerError}</div>
        ) : drawerData ? (
          <div className="drawer-content">
            <div className="drawer-header">
              <div className="drawer-image-wrapper">
                {drawerData.product.image || drawerData.product.image_url ? (
                  <img
                    src={
                      drawerData.product.image_url
                        ? drawerData.product.image_url
                        : drawerData.product.image
                        ? `https://res.cloudinary.com/bnf404/${drawerData.product.image}`
                        : undefined
                    }
                    alt={drawerData.product.name}
                    className="drawer-product-image"
                  />
                ) : (
                  <div className="drawer-image-placeholder">No Image</div>
                )}
              </div>
              <div className="drawer-title-section">
                <h2 className="drawer-product-name">
                  {drawerData.product.name}
                </h2>
                <span className="drawer-category">
                  {drawerData.product.category_name || "Boshqa"}
                </span>
                <span
                  className={`drawer-status ${
                    getStatusInfo(drawerData.product.quantity).class
                  }`}
                >
                  {getStatusInfo(drawerData.product.quantity).text}
                </span>
              </div>
            </div>
            <div className="drawer-info-grid">
              <div>
                <span className="drawer-label">Qoldiq:</span>
                <span className="drawer-value">
                  {drawerData.product.quantity}
                </span>
              </div>
              <div>
                <span className="drawer-label">Narx:</span>
                <span className="drawer-value">
                  {parseFloat(
                    drawerData.product.price_per_quantity
                  ).toLocaleString()}{" "}
                  UZS
                </span>
              </div>
              <div>
                <span className="drawer-label">Status:</span>
                <span className="drawer-value">
                  {drawerData.product.status === "available"
                    ? "Bor"
                    : drawerData.product.status === "few"
                    ? "Kam qolgan"
                    : "Mavjud emas"}
                </span>
              </div>
              <div>
                <span className="drawer-label">Turi:</span>
                <span className="drawer-value">
                  {drawerData.product.quantity_type}
                </span>
              </div>
              <div>
                <span className="drawer-label">Qo'shilgan sana:</span>
                <span className="drawer-value">
                  {formatDate(drawerData.product.date)}
                </span>
              </div>
            </div>
            <div className="drawer-totals">
              <div>
                <span className="drawer-label">Jami sotilgan:</span>
                <span className="drawer-value">
                  {drawerData.total_sold
                    ? parseFloat(drawerData.total_sold).toLocaleString()
                    : 0}{" "}
                  UZS
                </span>
              </div>
              <div>
                <span className="drawer-label">Jami xarid qilingan:</span>
                <span className="drawer-value">
                  {drawerData.total_bought
                    ? parseFloat(drawerData.total_bought).toLocaleString()
                    : 0}{" "}
                  UZS
                </span>
              </div>
            </div>
            <div className="drawer-history-section">
              <h3>So'nggi sotuvlar</h3>
              {drawerData.product_sold && drawerData.product_sold.length > 0 ? (
                <ul className="drawer-history-list">
                  {drawerData.product_sold.map((sale) => (
                    <li key={sale.id} className="drawer-history-item">
                      <span className="drawer-history-date">
                        {formatDate(sale.date)}
                      </span>
                      <span className="drawer-history-qty">
                        {sale.quantity} x{" "}
                        {parseFloat(sale.price).toLocaleString()} UZS
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="drawer-history-empty">Sotuvlar yo'q</div>
              )}
              <h3>So'nggi xaridlar</h3>
              {drawerData.product_bought &&
              drawerData.product_bought.length > 0 ? (
                <ul className="drawer-history-list">
                  {drawerData.product_bought.map((buy) => (
                    <li key={buy.id} className="drawer-history-item">
                      <span className="drawer-history-date">
                        {formatDate(buy.date)}
                      </span>
                      <span className="drawer-history-qty">
                        {buy.quantity} x{" "}
                        {parseFloat(buy.price).toLocaleString()} UZS
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="drawer-history-empty">Xaridlar yo'q</div>
              )}
            </div>
          </div>
        ) : null}
      </div>
      {/* Drawer overlay */}
      {drawerOpen && (
        <div
          className="drawer-overlay"
          onClick={handleCloseDrawer}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background:
              theme === "dark" ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.18)",
            zIndex: 1001,
            transition: "background 0.2s",
          }}
        />
      )}
    </div>
  );
};

export default ProductsPage;
