"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/features/i18n";

interface InvoiceDetails {
  invoiceName: string;
  invoiceType: "personal" | "other";
  taxId: string;
  addressSelection: string;
  houseNo: string;
  building: string;
  moo: string;
  soi: string;
  road: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (details: InvoiceDetails) => void;
  initialData?: Partial<InvoiceDetails>;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<InvoiceDetails>({
    invoiceName: "",
    invoiceType: "other",
    taxId: "",
    addressSelection: "",
    houseNo: "",
    building: "",
    moo: "",
    soi: "",
    road: "",
    subdistrict: "",
    district: "",
    province: "",
    postalCode: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  // Reset errors when modal opens
  useEffect(() => {
    if (isOpen) {
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (field: keyof InvoiceDetails, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: false }));
    }
  };

  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  const requiredFields: (keyof InvoiceDetails)[] = ['taxId', 'houseNo', 'building', 'moo', 'soi', 'road', 'subdistrict', 'district', 'province', 'postalCode'];

  const handleSubmit = () => {
    // Validate required fields
    const newErrors: { [key: string]: boolean } = {};
    let hasError = false;
    
    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].trim() === '') {
        newErrors[field] = true;
        hasError = true;
      }
    });
    
    if (hasError) {
      setErrors(newErrors);
      return;
    }
    
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  const getInputStyle = (field: keyof InvoiceDetails): React.CSSProperties => ({
    width: "100%",
    padding: "10px 14px",
    border: errors[field] ? "2px solid #dc3545" : "1px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#333",
    background: errors[field] ? "#fff5f5" : "#fff",
  });

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#333",
    background: "#fff",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "6px",
    fontSize: "13px",
    color: "#000000ff",
    fontWeight: "500",
  };

  const renderError = (field: keyof InvoiceDetails) => {
    if (errors[field]) {
      return (
        <span style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px', display: 'block' }}>
          {t('กรุณากรอกข้อมูล', 'Please fill in this field')}
        </span>
      );
    }
    return null;
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        className="modal-content"
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "24px",
          width: "90%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 style={{ color: "#014D40", margin: 0 }}>
            {t("ชื่อ-ที่อยู่ออกใบเสร็จรับเงิน", "Invoice Details")}
          </h5>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "20px",
              color: "#666",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Tax ID and Address Selection Row */}
        <div className="row mb-3">
          <div className="col-md-6 mb-3 mb-md-0">
            <label style={labelStyle}>
              {t("เลขประจำตัวผู้เสียภาษี", "Tax ID")}
            </label>
            <input
              type="text"
              value={formData.taxId}
              onChange={(e) => handleChange("taxId", e.target.value)}
              style={getInputStyle("taxId")}
              placeholder="0-0000-00000-00-0"
            />
            {renderError("taxId")}
          </div>
          <div className="col-md-6">
            <label style={labelStyle}>{t("ที่อยู่", "Address")}</label>
            <select
              value={formData.addressSelection}
              onChange={(e) => handleChange("addressSelection", e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="">
                {t("เลือกที่อยู่ในการออกใบเสร็จ", "Select invoice address")}
              </option>
              <option value="new">
                {t("กรอกที่อยู่ใหม่", "Enter new address")}
              </option>
            </select>
          </div>
        </div>

        {/* Address Row 1 */}
        <div className="row mb-3">
          <div className="col-md-4 mb-3 mb-md-0">
            <label style={labelStyle}>{t("เลขที่", "House No.")}</label>
            <input
              type="text"
              value={formData.houseNo}
              onChange={(e) => handleChange("houseNo", e.target.value)}
              style={getInputStyle("houseNo")}
            />
            {renderError("houseNo")}
          </div>
          <div className="col-md-4 mb-3 mb-md-0">
            <label style={labelStyle}>
              {t("หมู่บ้าน/อาคาร", "Village/Building")}
            </label>
            <input
              type="text"
              value={formData.building}
              onChange={(e) => handleChange("building", e.target.value)}
              style={getInputStyle("building")}
            />
            {renderError("building")}
          </div>
          <div className="col-md-4">
            <label style={labelStyle}>{t("หมู่ที่", "Moo")}</label>
            <input
              type="text"
              value={formData.moo}
              onChange={(e) => handleChange("moo", e.target.value)}
              style={getInputStyle("moo")}
            />
            {renderError("moo")}
          </div>
        </div>

        {/* Address Row 2 */}
        <div className="row mb-3">
          <div className="col-md-4 mb-3 mb-md-0">
            <label style={labelStyle}>{t("ตรอก/ซอย", "Soi")}</label>
            <input
              type="text"
              value={formData.soi}
              onChange={(e) => handleChange("soi", e.target.value)}
              style={getInputStyle("soi")}
            />
            {renderError("soi")}
          </div>
          <div className="col-md-4 mb-3 mb-md-0">
            <label style={labelStyle}>{t("ถนน", "Road")}</label>
            <input
              type="text"
              value={formData.road}
              onChange={(e) => handleChange("road", e.target.value)}
              style={getInputStyle("road")}
            />
            {renderError("road")}
          </div>
          <div className="col-md-4">
            <label style={labelStyle}>{t("ตำบล/แขวง", "Subdistrict")}</label>
            <input
              type="text"
              value={formData.subdistrict}
              onChange={(e) => handleChange("subdistrict", e.target.value)}
              style={getInputStyle("subdistrict")}
            />
            {renderError("subdistrict")}
          </div>
        </div>

        {/* Address Row 3 */}
        <div className="row mb-3">
          <div className="col-md-4 mb-3 mb-md-0">
            <label style={labelStyle}>{t("อำเภอ/เขต", "District")}</label>
            <input
              type="text"
              value={formData.district}
              onChange={(e) => handleChange("district", e.target.value)}
              style={getInputStyle("district")}
            />
            {renderError("district")}
          </div>
          <div className="col-md-4 mb-3 mb-md-0">
            <label style={labelStyle}>{t("จังหวัด", "Province")}</label>
            <input
              type="text"
              value={formData.province}
              onChange={(e) => handleChange("province", e.target.value)}
              style={getInputStyle("province")}
            />
            {renderError("province")}
          </div>
          <div className="col-md-4">
            <label style={labelStyle}>{t("รหัสไปรษณีย์", "Postal Code")}</label>
            <input
              type="text"
              value={formData.postalCode}
              onChange={(e) => handleChange("postalCode", e.target.value)}
              style={getInputStyle("postalCode")}
              placeholder="10xxx"
            />
            {renderError("postalCode")}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          style={{
            width: "100%",
            padding: "14px",
            background: "#014D40",
            color: "#fff",
            border: "none",
            borderRadius: "25px",
            fontSize: "15px",
            fontWeight: "500",
            cursor: "pointer",
          }}
        >
          {t("บันทึกข้อมูลใบเสร็จรับเงิน", "Save Invoice Details")}
        </button>
      </div>
    </div>
  );
};

export default InvoiceModal;
