import React, { useState, useEffect, useRef, useCallback } from "react";
import { slidesAPI } from "../../services/api";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

export default function AdminHeroSlides() {
  const { can, isMasterAdmin } = useAuth();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [draggingId, setDraggingId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    order: "",
    link: "",
  });
  const fileRef = useRef(null);

  const loadSlides = useCallback(() => {
    setLoading(true);
    slidesAPI
      .getAll()
      .then((r) => {
        setSlides(r.data.slides || []);
      })
      .catch((err) => {
        console.error("Failed to load slides:", err);
        toast.error("Failed to load slides");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadSlides();
  }, [loadSlides]);

  const validateForm = () => {
    const file = fileRef.current?.files[0];
    if (!file) {
      toast.error("Please select an image");
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return false;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPG, PNG, WebP allowed");
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    if (!validateForm()) return;

    const file = fileRef.current.files[0];
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("title", form.title || "");
      fd.append("subtitle", form.subtitle || "");
      fd.append("order", form.order || "999");
      fd.append("link", form.link || "");

      await slidesAPI.upload(fd);
      toast.success("Slide uploaded successfully! 🎉");

      setForm({ title: "", subtitle: "", order: "", link: "" });
      if (fileRef.current) fileRef.current.value = "";

      loadSlides();
    } catch (err) {
      const message = err.response?.data?.message || "Upload failed";
      toast.error(message);
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await slidesAPI.toggle(id);
      toast.success("Slide visibility updated");
      loadSlides();
    } catch (err) {
      toast.error("Failed to update visibility");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this slide? This cannot be undone.")) return;

    try {
      await slidesAPI.delete(id);
      toast.success("Slide deleted");
      loadSlides();
    } catch (err) {
      toast.error("Failed to delete slide");
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      await slidesAPI.update(id, updates);
      toast.success("Slide updated");
      loadSlides();
    } catch (err) {
      toast.error("Failed to update slide");
    }
  };

  const handleDragStart = (e, id) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, targetId) => {
    e.preventDefault();
    if (draggingId === targetId) return;

    try {
      const dragSlide = slides.find((s) => s.id === draggingId);
      const targetSlide = slides.find((s) => s.id === targetId);

      if (dragSlide && targetSlide) {
        await Promise.all([
          handleUpdate(draggingId, { order: targetSlide.order }),
          handleUpdate(targetId, { order: dragSlide.order }),
        ]);
        toast.success("Order updated");
      }
    } catch (err) {
      toast.error("Failed to reorder");
    } finally {
      setDraggingId(null);
    }
  };

  const previewImage = fileRef.current?.files[0];
  const canUpload = !uploading && previewImage;

  if (loading) {
    return (
      <div className="page">
        <div
          className="container"
          style={{ padding: "100px 0", textAlign: "center" }}
        >
          <div
            className="spinner"
            style={{ width: 48, height: 48, margin: "0 auto 20px" }}
          />
          <p>Loading slides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div>
            <h1 style={{ fontSize: 28, margin: 0, fontWeight: 700 }}>
              Hero Slider
            </h1>
            <p style={{ color: "var(--text-muted)", margin: 4, fontSize: 15 }}>
              Manage rotating banner images for homepage hero section
              <span
                style={{
                  marginLeft: 20,
                  background: "#e8f5e8",
                  color: "#2d5a2d",
                  padding: "2px 8px",
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                {slides.filter((s) => s.isActive).length} active
              </span>
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={loadSlides}
            style={{ padding: "8px 20px" }}
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>

        <div className="card" style={{ marginBottom: 32 }}>
          <div className="card-header">
            <h2 style={{ fontSize: 20, margin: 0 }}>📤 Upload New Slide</h2>
          </div>
          <div className="card-body">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 20,
                marginBottom: 20,
              }}
            >
              <div className="form-group">
                <label className="form-label">
                  Image <span className="required">*</span>
                </label>
                <div
                  style={{
                    border: "2px dashed var(--border)",
                    borderRadius: 12,
                    padding: 24,
                    textAlign: "center",
                    background: previewImage ? "var(--bg-hover)" : "#f8f9fa",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => fileRef.current?.click()}
                >
                  {previewImage ? (
                    <>
                      <img
                        src={URL.createObjectURL(previewImage)}
                        alt="Preview"
                        style={{
                          width: "100%",
                          height: 140,
                          objectFit: "cover",
                          borderRadius: 8,
                          marginBottom: 8,
                        }}
                      />
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {previewImage.name} (
                        {(previewImage.size / 1024 / 1024).toFixed(1)}MB)
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        style={{
                          fontSize: 48,
                          color: "var(--text-muted)",
                          marginBottom: 8,
                        }}
                      >
                        🖼️
                      </div>
                      <div style={{ fontSize: 14, color: "var(--text-muted)" }}>
                        Click to select image
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text-muted)",
                          marginTop: 4,
                        }}
                      >
                        JPG/PNG/WebP • Max 10MB • 1920×700 recommended
                      </div>
                    </>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  className="form-control"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setForm((prev) => ({
                        ...prev,
                        order: slides
                          .filter((s) => s.isActive)
                          .length.toString(),
                      }));
                    }
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Title (overlay text)</label>
                <input
                  className="form-control"
                  placeholder="e.g. Dhaham Arts Festival 2026"
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Subtitle</label>
                <input
                  className="form-control"
                  placeholder="e.g. Applications open now"
                  value={form.subtitle}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, subtitle: e.target.value }))
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Display Order</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Lower = first"
                  value={form.order}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, order: e.target.value }))
                  }
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Link URL (optional)</label>
                <input
                  className="form-control"
                  placeholder="https://example.com"
                  value={form.link}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, link: e.target.value }))
                  }
                />
              </div>
            </div>

            {(isMasterAdmin || can('slides', 'create')) && (
              <button
                className="btn btn-primary"
                onClick={handleUpload}
                disabled={!canUpload}
                style={{ padding: "12px 32px", fontSize: 16, fontWeight: 600 }}
              >
                {uploading ? (
                  <>
                    <span
                      className="spinner"
                      style={{
                        width: 16,
                        height: 16,
                        marginRight: 8,
                        display: "inline-block",
                      }}
                    />
                    Uploading...
                  </>
                ) : (
                  "+ Add New Slide"
                )}
              </button>
            )}
          </div>
        </div>

        {slides.length === 0 ? (
          <div className="card" style={{ padding: 60, textAlign: "center" }}>
            <div
              style={{
                fontSize: 48,
                color: "var(--text-muted)",
                marginBottom: 16,
              }}
            >
              🖼️
            </div>
            <h3 style={{ color: "var(--text-muted)", marginBottom: 8 }}>
              No slides yet
            </h3>
            <p style={{ color: "var(--text-muted)" }}>
              Upload your first hero image above to get started
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: 24,
            }}
          >
            {slides.map((slide) => (
              <div
                key={slide.id}
                className="card"
                style={{
                  opacity: slide.isActive ? 1 : 0.6,
                  transform: slide.isActive ? "scale(1)" : "scale(0.98)",
                  transition: "all 0.2s ease",
                  cursor: "grab",
                  overflow: "hidden",
                }}
                draggable
                onDragStart={(e) => handleDragStart(e, slide.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, slide.id)}
              >
                <div
                  style={{
                    position: "relative",
                    height: 180,
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.2s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.transform = "scale(1.02)")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.transform = "scale(1)")
                    }
                  />

                  {!slide.isActive && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.7)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          background: "#dc3545",
                          color: "white",
                          padding: "8px 16px",
                          borderRadius: 20,
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        HIDDEN
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      background: "rgba(0,0,0,0.7)",
                      color: "white",
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      cursor: "grab",
                    }}
                  >
                    ⋮⋮
                  </div>
                </div>

                <div className="card-body" style={{ padding: "20px" }}>
                  {slide.title && (
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 16,
                        marginBottom: 6,
                        color: "var(--text)",
                      }}
                    >
                      {slide.title}
                    </div>
                  )}

                  {slide.subtitle && (
                    <div
                      style={{
                        fontSize: 14,
                        color: "var(--text-muted)",
                        marginBottom: 16,
                        lineHeight: 1.4,
                      }}
                    >
                      {slide.subtitle}
                    </div>
                  )}

                  {slide.link && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "#0d6efd",
                        wordBreak: "break-all",
                        marginBottom: 16,
                        fontFamily: "monospace",
                      }}
                    >
                      🔗 {slide.link}
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <label
                      style={{
                        fontSize: 13,
                        color: "var(--text-muted)",
                        minWidth: 50,
                      }}
                    >
                      Order:
                    </label>
                    <input
                      type="number"
                      style={{
                        flex: 1,
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid var(--border)",
                        fontSize: 14,
                      }}
                      value={slide.order}
                      onBlur={(e) => {
                        if (parseInt(e.target.value) !== slide.order) {
                          handleUpdate(slide.id, {
                            order: parseInt(e.target.value),
                          });
                        }
                      }}
                      min="0"
                    />
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    {(isMasterAdmin || can('slides', 'edit')) && (
                      <button
                        className={`btn btn-sm ${slide.isActive ? "btn-outline-danger" : "btn-success"}`}
                        style={{ flex: 1 }}
                        onClick={() => handleToggle(slide.id)}
                      >
                        {slide.isActive ? "👁️ Hide" : "👁️ Show"}
                      </button>
                    )}
                    {(isMasterAdmin || can('slides', 'delete')) && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(slide.id)}
                        style={{ whiteSpace: "nowrap" }}
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
