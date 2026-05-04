import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === "admin" || user.role === "school") navigate("/admin");
      else navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
        background: "var(--bg)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: "var(--primary)",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontFamily: "Noto Serif, serif",
              fontSize: 26,
              fontWeight: 700,
              color: "var(--accent)",
            }}
          >
            
          </div>
          <h1 style={{ fontSize: 26, marginBottom: 6 }}>Sign In</h1>
          {/* <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Access your Dhaham EMS account
          </p> */}
        </div>

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label className="form-label">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: "Invalid email",
                    },
                  })}
                  type="email"
                  className={`form-control ${errors.email ? "error" : ""}`}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="form-error">{errors.email.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Password <span className="required">*</span>
                </label>
                <input
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Min 6 characters" },
                  })}
                  type="password"
                  className={`form-control ${errors.password ? "error" : ""}`}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="form-error">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  marginTop: 8,
                }}
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div
              style={{
                textAlign: "center",
                marginTop: 20,
                paddingTop: 20,
                borderTop: "1px solid var(--border)",
              }}
            >
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
