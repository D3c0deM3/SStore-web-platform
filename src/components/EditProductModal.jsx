import React from "react";

const EditProductModal = ({
  show,
  loading,
  error,
  form,
  categories,
  onFieldChange,
  onSave,
  onCancel,
}) => {
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
        className="modal edit-modal"
        style={{
          background: "var(--color-bg-secondary)",
          borderRadius: 20,
          boxShadow: "0 12px 48px rgba(0,0,0,0.22)",
          padding: "48px 40px 36px 40px",
          minWidth: 420,
          maxWidth: "98vw",
          width: 480,
          textAlign: "center",
          fontFamily: "Inter, Segoe UI, Arial, sans-serif",
          position: "relative",
          transition: "box-shadow 0.2s",
          color: "#fff",
        }}
      >
        <h2
          style={{
            fontSize: 26,
            fontWeight: 700,
            marginBottom: 32,
            color: "var(--modal-label-color, #fff)",
          }}
        >
          Mahsulotni tahrirlash
        </h2>
        {loading && (
          <div
            className="loading-spinner"
            style={{ marginBottom: 18, fontSize: 18, color: "#fff" }}
          >
            Loading...
          </div>
        )}
        {error && (
          <div
            className="error-message"
            style={{
              marginBottom: 18,
              color: "#ffb3b3",
              fontWeight: 500,
              fontSize: 16,
            }}
          >
            {error}
          </div>
        )}
        <div
          className="edit-form"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
            marginBottom: 18,
          }}
        >
          <div className="form-group" style={{ textAlign: "left" }}>
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
              value={form?.name || ""}
              onChange={(e) => onFieldChange("name", e.target.value)}
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1.5px solid #e0e0e0",
                fontSize: 16,
                background: "var(--modal-input-bg, #fff)",
                color: "#222",
                outline: "none",
                transition: "border 0.18s",
                marginTop: 2,
              }}
            />
          </div>
          <div className="form-group" style={{ textAlign: "left" }}>
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
              value={form?.category_id || ""}
              onChange={(e) => {
                const selectedId = e.target.value;
                const selectedCategory = categories.find(
                  (c) => String(c.id) === selectedId
                );
                onFieldChange("category_id", selectedId);
                if (selectedCategory) {
                  onFieldChange("category_name", selectedCategory.name);
                }
              }}
              disabled={loading || categories.length === 0}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1.5px solid #e0e0e0",
                fontSize: 16,
                background: "var(--modal-input-bg, #fff)",
                color: "#222",
                outline: "none",
                transition: "border 0.18s",
                marginTop: 2,
                appearance: "none",
              }}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ textAlign: "left" }}>
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
              value={form?.quantity || ""}
              onChange={(e) => onFieldChange("quantity", e.target.value)}
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1.5px solid #e0e0e0",
                fontSize: 16,
                background: "var(--modal-input-bg, #fff)",
                color: "#222",
                outline: "none",
                transition: "border 0.18s",
                marginTop: 2,
                MozAppearance: "textfield",
              }}
              inputMode="numeric"
              pattern="[0-9]*"
              onWheel={(e) => e.target.blur()}
              onKeyDown={(e) =>
                (e.key === "ArrowUp" || e.key === "ArrowDown") &&
                e.preventDefault()
              }
            />
          </div>
          <div className="form-group" style={{ textAlign: "left" }}>
            <label
              style={{
                fontWeight: 600,
                fontSize: 15,
                marginBottom: 6,
                display: "block",
                color: "var(--modal-label-color, #fff)",
              }}
            >
              Narx
            </label>
            <input
              type="number"
              value={form?.price_per_quantity || ""}
              onChange={(e) =>
                onFieldChange("price_per_quantity", e.target.value)
              }
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1.5px solid #e0e0e0",
                fontSize: 16,
                background: "var(--modal-input-bg, #fff)",
                color: "#222",
                outline: "none",
                transition: "border 0.18s",
                marginTop: 2,
                MozAppearance: "textfield",
              }}
              inputMode="numeric"
              pattern="[0-9]*"
              onWheel={(e) => e.target.blur()}
              onKeyDown={(e) =>
                (e.key === "ArrowUp" || e.key === "ArrowDown") &&
                e.preventDefault()
              }
            />
          </div>
        </div>
        <div
          className="modal-actions"
          style={{
            display: "flex",
            gap: 18,
            justifyContent: "center",
            marginTop: 18,
          }}
        >
          <button
            className="save-btn"
            style={{
              background: "#4caf50",
              color: "#fff",
              padding: "12px 32px",
              borderRadius: 10,
              border: "none",
              fontWeight: 700,
              fontSize: 16,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              position: "relative",
              transition: "background 0.18s, opacity 0.18s",
              boxShadow: "0 2px 8px rgba(76,175,80,0.08)",
            }}
            onClick={onSave}
            disabled={loading}
          >
            {loading ? (
              <span
                className="btn-spinner"
                style={{
                  display: "inline-block",
                  verticalAlign: "middle",
                  width: 20,
                  height: 20,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 50 50">
                  <circle
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    stroke="#fff"
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
              "Saqlash"
            )}
          </button>
          <button
            className="cancel-btn"
            style={{
              background: "#f2f2f2",
              color: "#222",
              padding: "12px 32px",
              borderRadius: 10,
              border: "none",
              fontWeight: 600,
              fontSize: 16,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "background 0.18s, opacity 0.18s",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
            onClick={onCancel}
            disabled={loading}
          >
            Bekor qilish
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
