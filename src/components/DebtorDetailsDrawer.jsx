import React from "react";
import "../styles/DebtorDetailsDrawer.css";

const DebtorDetailsDrawer = ({
  open,
  loading,
  error,
  data,
  onClose,
  onCompleteDebt,
  debtLoading = {},
}) => {
  return (
    <div
      className={`debtor-details-drawer${open ? " open" : ""}`}
      style={{
        right: open ? 0 : "-480px",
        transition: "right 0.35s cubic-bezier(.4,0,.2,1)",
        zIndex: 1002,
      }}
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
    >
      <button
        className="drawer-close-btn"
        onClick={onClose}
        aria-label="Yopish"
      >
        <span style={{ fontSize: 24, fontWeight: 700 }}>&times;</span>
      </button>
      {loading ? (
        <div className="drawer-loading">Yuklanmoqda...</div>
      ) : error ? (
        <div className="drawer-error">{error}</div>
      ) : data ? (
        <div className="drawer-content">
          <div className="drawer-header">
            <div className="drawer-title-section">
              <h2 className="drawer-product-name">{data.debtor.name}</h2>
              <div className="drawer-product-meta">
                <span>Telefon: {data.debtor.phone}</span>
                <span>
                  Qarz: {Number(data.debtor.price).toLocaleString()} UZS
                </span>
                <span>
                  Sana: {new Date(data.debtor.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="drawer-debts-list">
            <h3>Qarzdorliklar</h3>
            {data.debts.length === 0 ? (
              <div className="drawer-empty">Qarzdorliklar topilmadi.</div>
            ) : (
              data.debts.map((debt) => (
                <div className="drawer-debt-item" key={debt.id}>
                  <div className="drawer-debt-info">
                    <span className="drawer-debt-product">
                      {debt.product_name}
                    </span>
                    <span className="drawer-debt-qty">x{debt.quantity}</span>
                    <span className="drawer-debt-price">
                      {Number(debt.price).toLocaleString()} UZS
                    </span>
                    <span className="drawer-debt-date">
                      {new Date(debt.date).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    className="drawer-complete-btn"
                    onClick={() => onCompleteDebt(debt.id)}
                    disabled={debtLoading[debt.id]}
                  >
                    {debtLoading[debt.id] ? (
                      <span className="drawer-btn-spinner" />
                    ) : (
                      "Qarz yopildi"
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default DebtorDetailsDrawer;
