import React, { useRef } from "react";

const AddProductModal = ({
  show,
  onClose,
  form,
  categories,
  onFieldChange,
  onSave,
  loading,
  error,
  apiBaseUrl, // pass this prop from ProductsPage
}) => {
  const fileInputRef = useRef();

  // Handle image selection (browse or drop)
  const handleImageSelect = (file) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    onFieldChange("localImageFile", file);
    onFieldChange("localImage", previewUrl);
    console.log("[AddProductDrawer] Image selected:", file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) handleImageSelect(file);
  };

  const handleBrowse = (e) => {
    const file = e.target.files[0];
    if (file) handleImageSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (!show) return null;
  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.32)",
        zIndex: 1300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="modal add-modal"
        style={{
          background: "var(--color-bg-secondary)",
          borderRadius: 20,
          boxShadow: "0 12px 48px rgba(0,0,0,0.22)",
          padding: "40px 32px 32px 32px",
          minWidth: 600,
          maxWidth: "98vw",
          width: 700,
          textAlign: "center",
          fontFamily: "Inter, Segoe UI, Arial, sans-serif",
          position: "relative",
          transition: "box-shadow 0.2s",
          color: "#222",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            background: "none",
            border: "none",
            fontSize: 26,
            cursor: "pointer",
            color: "#888",
          }}
          aria-label="Yopish"
        >
          ×
        </button>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 18,
            color: "var(--modal-label-color, #fff)", // white fallback
          }}
        >
          Mahsulot qo'shish
        </h2>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 32,
            alignItems: "flex-start",
            justifyContent: "center",
            marginBottom: 10,
          }}
        >
          {/* Left: Image upload */}
          <div style={{ flex: 1, minWidth: 180, maxWidth: 240 }}>
            <label
              style={{
                fontWeight: 600,
                fontSize: 15,
                marginBottom: 6,
                display: "block",
                textAlign: "left",
                color: "var(--modal-label-color, #fff)", // white fallback
              }}
            >
              Rasm (ixtiyoriy)
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              style={{
                border: "2px dashed #bdbdbd",
                borderRadius: 10,
                padding: 14,
                textAlign: "center",
                background: "#fafbfc",
                cursor: "pointer",
                position: "relative",
                marginBottom: 8,
                minHeight: 180,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: 200,
              }}
              onClick={() => fileInputRef.current.click()}
            >
              {form.localImage ? (
                <img
                  src={form.localImage}
                  alt="Yuklangan rasm"
                  style={{
                    maxWidth: "100%",
                    maxHeight: 160,
                    borderRadius: 8,
                    marginBottom: 8,
                    objectFit: "contain",
                    background: "#fff",
                  }}
                />
              ) : (
                <>
                  <span
                    style={{
                      fontSize: 28,
                      color: "#bdbdbd",
                      marginBottom: 6,
                    }}
                  >
                    <svg width="32" height="32" fill="none" viewBox="0 0 36 36">
                      <rect
                        x="6"
                        y="6"
                        width="24"
                        height="24"
                        rx="4"
                        fill="#f5f6fa"
                        stroke="#bdbdbd"
                        strokeWidth="2"
                      />
                      <path
                        d="M12 24l4.5-6 4.5 6 6-8"
                        stroke="#bdbdbd"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <div style={{ color: "#888", fontSize: 14, marginBottom: 4 }}>
                    Mahsulot rasmini bu yerga torting yoki
                  </div>
                  <button
                    type="button"
                    style={{
                      background: "#e3e6ee",
                      color: "#222",
                      border: "none",
                      borderRadius: 6,
                      padding: "5px 14px",
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: "pointer",
                      marginTop: 4,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current.click();
                    }}
                  >
                    Faylni tanlash
                  </button>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleBrowse}
              />
            </div>
            {form.localImage && (
              <button
                type="button"
                style={{
                  background: "#f2f2f2",
                  color: "#e53e3e",
                  border: "none",
                  borderRadius: 6,
                  padding: "3px 10px",
                  fontWeight: 500,
                  fontSize: 13,
                  cursor: "pointer",
                  marginBottom: 6,
                }}
                onClick={() => {
                  onFieldChange("localImage", "");
                  onFieldChange("localImageFile", null);
                }}
              >
                Rasmni olib tashlash
              </button>
            )}
          </div>
          {/* Right: Input fields in two columns */}
          <div style={{ flex: 2 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div style={{ textAlign: "left" }}>
                <label
                  style={{
                    fontWeight: 600,
                    fontSize: 15,
                    marginBottom: 6,
                    display: "block",
                    color: "var(--modal-label-color, #fff)",
                  }}
                >
                  Kategoriya
                </label>
                <select
                  value={form.category_id}
                  onChange={(e) => onFieldChange("category_id", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1.5px solid #e0e0e0",
                    fontSize: 15,
                    background: "#f5f6fa",
                    color: "#222",
                    marginTop: 2,
                  }}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ textAlign: "left" }}>
                <label
                  style={{
                    fontWeight: 600,
                    fontSize: 15,
                    marginBottom: 6,
                    display: "block",
                    color: "var(--modal-label-color, #fff)",
                  }}
                >
                  Mahsulot nomi
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => onFieldChange("name", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1.5px solid #e0e0e0",
                    fontSize: 15,
                    background: "#f5f6fa",
                    color: "#222",
                    marginTop: 2,
                  }}
                />
              </div>
              <div style={{ textAlign: "left" }}>
                <label
                  style={{
                    fontWeight: 600,
                    fontSize: 15,
                    marginBottom: 6,
                    display: "block",
                    color: "var(--modal-label-color, #fff)",
                  }}
                >
                  Qoldiq
                </label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => onFieldChange("quantity", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1.5px solid #e0e0e0",
                    fontSize: 15,
                    background: "#f5f6fa",
                    color: "#222",
                    marginTop: 2,
                  }}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>
              <div style={{ textAlign: "left" }}>
                <label
                  style={{
                    fontWeight: 600,
                    fontSize: 15,
                    marginBottom: 6,
                    display: "block",
                    color: "var(--modal-label-color, #fff)",
                  }}
                >
                  Sotib olingan narxi
                </label>
                <input
                  type="number"
                  value={form.bought_price || ""}
                  onChange={(e) =>
                    onFieldChange("bought_price", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1.5px solid #e0e0e0",
                    fontSize: 15,
                    background: "#f5f6fa",
                    color: "#222",
                    marginTop: 2,
                  }}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>
              <div style={{ textAlign: "left" }}>
                <label
                  style={{
                    fontWeight: 600,
                    fontSize: 15,
                    marginBottom: 6,
                    display: "block",
                    color: "var(--modal-label-color, #fff)",
                  }}
                >
                  Sotuv narxi
                </label>
                <input
                  type="number"
                  value={form.price_per_quantity}
                  onChange={(e) =>
                    onFieldChange("price_per_quantity", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1.5px solid #e0e0e0",
                    fontSize: 15,
                    background: "#f5f6fa",
                    color: "#222",
                    marginTop: 2,
                  }}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>
              <div style={{ textAlign: "left" }}>
                <label
                  style={{
                    fontWeight: 600,
                    fontSize: 15,
                    marginBottom: 6,
                    display: "block",
                    color: "var(--modal-label-color, #fff)",
                  }}
                >
                  Miqdor turi
                </label>
                <select
                  value={form.quantity_type || "kg"}
                  onChange={(e) =>
                    onFieldChange("quantity_type", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1.5px solid #e0e0e0",
                    fontSize: 15,
                    background: "#f5f6fa",
                    color: "#222",
                    marginTop: 2,
                  }}
                >
                  <option value="kg">kg</option>
                  <option value="dona">dona</option>
                  <option value="metr">metr</option>
                  <option value="litr">litr</option>
                </select>
              </div>
              <div style={{ textAlign: "left", gridColumn: "1 / span 2" }}>
                <label
                  style={{
                    fontWeight: 600,
                    fontSize: 15,
                    marginBottom: 6,
                    display: "block",
                    color: "var(--modal-label-color, #fff)",
                  }}
                >
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => onFieldChange("status", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1.5px solid #e0e0e0",
                    fontSize: 15,
                    background: "#f5f6fa",
                    color: "#222",
                    marginTop: 2,
                  }}
                >
                  <option value="available">Bor</option>
                  <option value="few">Kam qolgan</option>
                  <option value="ended">Mavjud emas</option>
                </select>
              </div>
            </div>
            {error && (
              <div
                style={{
                  color: "#e53e3e",
                  fontWeight: 500,
                  fontSize: 15,
                  marginTop: 10,
                }}
              >
                {error}
              </div>
            )}
            <button
              onClick={onSave}
              disabled={loading}
              style={{
                background: "#4caf50",
                color: "#fff",
                padding: "12px 0",
                borderRadius: 10,
                border: "none",
                fontWeight: 700,
                fontSize: 16,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                marginTop: 18,
                width: "100%",
                boxShadow: "0 2px 8px rgba(76,175,80,0.08)",
                transition: "background 0.18s, opacity 0.18s",
              }}
            >
              {loading ? "Yuklanmoqda..." : "Saqlash"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
