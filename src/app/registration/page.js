"use client";

import { useState } from "react";
import styles from "./registration.module.css";

const initialForm = {
  firstName: "",
  middleName: "",
  lastName: "",
  phone: "",
  gender: "",
  addressLine1: "",
  addressLine2: "",
  course: "",
  agreeFees: false,
  agreeTerms: false,
};

export default function RegistrationPage() {
  const [form, setForm] = useState(initialForm);
  const [showTerms, setShowTerms] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setShowThankYou(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function closeThankYou() {
    setShowThankYou(false);
    setForm(initialForm);
  }

  return (
    <div className={styles.page}>
      <div className={`${styles.glow} ${styles.glowOne}`} />
      <div className={`${styles.glow} ${styles.glowTwo}`} />

      <form className={styles.formContainer} onSubmit={handleSubmit}>
        <div className={styles.logoWrap}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logo-white.svg"
            alt="AstroBook"
            className={styles.logo}
          />
        </div>

        <div className={styles.formTitle}>
          Computer Training Registration Form
        </div>

        {/* Name */}
        <div className={styles.formRow}>
          <label>Name</label>
          <div className={styles.inputGroup3}>
            <div>
              <input
                className={styles.input}
                type="text"
                required
                value={form.firstName}
                onChange={(e) => update("firstName", e.target.value)}
              />
              <span>First Name</span>
            </div>
            <div>
              <input
                className={styles.input}
                type="text"
                value={form.middleName}
                onChange={(e) => update("middleName", e.target.value)}
              />
              <span>Middle Name</span>
            </div>
            <div>
              <input
                className={styles.input}
                type="text"
                required
                value={form.lastName}
                onChange={(e) => update("lastName", e.target.value)}
              />
              <span>Last Name</span>
            </div>
          </div>
        </div>

        {/* Phone and Gender */}
        <div className={styles.inputRowHalf}>
          <div>
            <label>Phone Number</label>
            <input
              className={styles.input}
              type="tel"
              placeholder="(000) 000-0000"
              required
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
            <span className={styles.helperText}>
              Please enter a valid phone number.
            </span>
          </div>
          <div>
            <label>Gender</label>
            <select
              className={styles.select}
              required
              value={form.gender}
              onChange={(e) => update("gender", e.target.value)}
            >
              <option value="" disabled>
                Select Gender
              </option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
              <option>Prefer not to say</option>
            </select>
          </div>
        </div>

        {/* Address */}
        <div className={styles.formRow}>
          <label>Address</label>
          <div
            className={styles.inputGroup3}
            style={{ flexDirection: "column", gap: "10px" }}
          >
            <input
              className={styles.input}
              type="text"
              placeholder="Address Line 1"
              value={form.addressLine1}
              onChange={(e) => update("addressLine1", e.target.value)}
            />
            <input
              className={styles.input}
              type="text"
              placeholder="Address Line 2"
              value={form.addressLine2}
              onChange={(e) => update("addressLine2", e.target.value)}
            />
          </div>
        </div>

        {/* Course */}
        <div className={styles.formRow}>
          <label>Select course you want to enroll in:</label>
          <select
            className={styles.select}
            required
            value={form.course}
            onChange={(e) => update("course", e.target.value)}
          >
            <option value="" disabled>
              Please Select
            </option>
            <option>Computer Basics</option>
            <option>Web Development</option>
            <option>Graphic Design</option>
          </select>
        </div>

        {/* Checkboxes */}
        <div className={styles.checkboxSection}>
          <label className={styles.checkboxItem}>
            <input
              type="checkbox"
              required
              checked={form.agreeFees}
              onChange={(e) => update("agreeFees", e.target.checked)}
            />
            I understand that course fees are non-refundable once the batch
            has started.
          </label>
          <label className={styles.checkboxItem}>
            <input
              type="checkbox"
              required
              checked={form.agreeTerms}
              onChange={(e) => update("agreeTerms", e.target.checked)}
            />
            I agree to the Terms &amp; Conditions.
          </label>

          <button
            type="button"
            className={styles.tcButton}
            onClick={() => setShowTerms(true)}
          >
            Read our full Terms &amp; Conditions
          </button>
        </div>

        {error && <p className={styles.errorText}>{error}</p>}

        <button type="submit" className={styles.submitBtn} disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Form"}
        </button>
      </form>

      {/* Terms & Conditions Modal */}
      {showTerms && (
        <div className={styles.modalOverlay} onClick={() => setShowTerms(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.modalCloseIcon}
              onClick={() => setShowTerms(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3>Terms &amp; Conditions</h3>
            <div className={styles.modalContent}>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                do eiusmod tempor incididunt ut labore et dolore magna
                aliqua.
                <br />
                <br />
                Ut enim ad minim veniam, quis nostrud exercitation ullamco
                laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                irure dolor in reprehenderit in voluptate velit esse cillum
                dolore eu fugiat nulla pariatur.
                <br />
                <br />
                Excepteur sint occaecat cupidatat non proident, sunt in culpa
                qui officia deserunt mollit anim id est laborum.
              </p>
            </div>
            <button
              className={styles.modalCloseBtn}
              onClick={() => setShowTerms(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Thank You Modal */}
      {showThankYou && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <button
              className={styles.modalCloseIcon}
              onClick={closeThankYou}
              aria-label="Close"
            >
              &times;
            </button>
            <div className={styles.thankYouIcon}>&#10003;</div>
            <div className={styles.thankYouTitle}>Thank you!</div>
            <p className={styles.thankYouText}>
              Your registration has been received. Our team will reach out to
              you shortly to confirm your batch details.
            </p>
            <button className={styles.modalCloseBtn} onClick={closeThankYou}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
