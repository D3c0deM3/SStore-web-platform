import React from "react";

const AddProductDrawer = ({
  show,
  onClose,
  form,
  categories,
  onFieldChange,
  onSave,
  loading,
  error,
}) => {
  return (
    <div
      className={`add-product-drawer${show ? " open" : ""}`}
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        height: "100vh",
        width: 370,
        maxWidth: "95vw",
        background: "var(--color-bg-secondary, #fff)",
        boxShadow: "-2px 0 24px rgba(0,0,0,0.10)",
        zIndex: 2000,
        transform: show ? "translateX(0)" : "translateX(110%)",
        transition: "transform 0.38s cubic-bezier(.77,0,.18,1)",
        display: "flex",
        flexDirection: "column",
        padding: "32px 28px",
        borderTopLeftRadius: 18,
        borderBottomLeftRadius: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          Mahsulot qo'shish
        </h2>
        <button
          onClick={onClose}
          style={{
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
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div>
          <label
            style={{
              fontWeight: 600,
              fontSize: 15,
              marginBottom: 6,
              display: "block",
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
              background: "#fff",
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
        <div>
          <label
            style={{
              fontWeight: 600,
              fontSize: 15,
              marginBottom: 6,
              display: "block",
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
              background: "#fff",
              color: "#222",
              marginTop: 2,
            }}
          />
        </div>
        <div>
          <label
            style={{
              fontWeight: 600,
              fontSize: 15,
              marginBottom: 6,
              display: "block",
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
              background: "#fff",
              color: "#222",
              marginTop: 2,
            }}
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </div>
        <div>
          <label
            style={{
              fontWeight: 600,
              fontSize: 15,
              marginBottom: 6,
              display: "block",
            }}
          >
            Narx
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
              background: "#fff",
              color: "#222",
              marginTop: 2,
            }}
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </div>
        <div>
          <label
            style={{
              fontWeight: 600,
              fontSize: 15,
              marginBottom: 6,
              display: "block",
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
              background: "#fff",
              color: "#222",
              marginTop: 2,
            }}
          >
            <option value="available">Bor</option>
            <option value="few">Kam qolgan</option>
            <option value="ended">Mavjud emas</option>
          </select>
        </div>
        {error && (
          <div
            style={{
              color: "#e53e3e",
              fontWeight: 500,
              fontSize: 15,
            }}
          >
            {error}
          </div>
        )}
      </div>
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
  );
};

export default AddProductDrawer;
