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
                placeholder="First Name"
                value={form.firstName}
                onChange={(e) => update("firstName", e.target.value)}
              />
              <span>First Name</span>
            </div>
            <div>
              <input
                className={styles.input}
                type="text"
                placeholder="Middle Name"
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
                placeholder="Last Name"
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
            <option>Angel Therapy Basic | Online</option>
            <option>Angel Therapy Advance | Online</option>
            <option>Angel Therapy Basic | Offline</option>
            <option>Angel Therapy Advance | Offline</option>
            <option>Crystal Healing</option>
            <option>Holy Fire Reiki Level 1</option>
            <option>Holy Fire Reiki Level 2</option>
            <option>Tarot Card Reading</option>
            <option>Lama Fera Healing</option>
            <option>Black Magic Removal Course</option>
            <option>Pendulum Dowsing</option>
            <option>Numerology</option>
            <option>Akashic Records</option>
            <option>Vastu</option>
            <option>Astrology Basic</option>
            <option>Astrology Advanced</option>
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
              <p className={styles.tcIntro}>
                ASTROBOOK – Course Registration Terms &amp; Conditions
              </p>
              <ol className={styles.tcList}>
                <li>
                  <strong>Seat Booking:</strong> Students may reserve their
                  seat in a course by paying a minimum ₹499/- seat-booking
                  amount. The seat will be considered confirmed only after
                  successful receipt of the booking payment.
                </li>
                <li>
                  <strong>Non-Refundable Booking Amount:</strong> The ₹499/-
                  seat-booking amount is strictly non-refundable under any
                  circumstances once the seat has been confirmed.
                </li>
                <li>
                  <strong>Balance Course Fee:</strong> The remaining course
                  fee must be paid on or before the course commencement date.
                  A student will not be permitted to attend the course until
                  the applicable balance fee has been paid.
                </li>
                <li>
                  <strong>Cancellation by Student:</strong> If a student
                  cancels their admission after booking the seat, the ₹499/-
                  booking amount will not be refunded.
                </li>
                <li>
                  <strong>Absence from Course:</strong> If a student fails to
                  attend the course after confirming their admission, the
                  paid amount will not be refundable.
                </li>
                <li>
                  <strong>Course Commencement:</strong> Once the
                  course/batch has commenced, the course fee, including any
                  amount already paid, will be non-refundable.
                </li>
                <li>
                  <strong>Batch Change:</strong> Any request to change the
                  batch or course date will be subject to ASTROBOOK&apos;s
                  availability and approval. ASTROBOOK may charge an
                  applicable administrative or rescheduling fee where
                  required.
                </li>
                <li>
                  <strong>Non-Payment of Balance:</strong> If the remaining
                  course fee is not paid by the course commencement date,
                  ASTROBOOK reserves the right to cancel or withhold the
                  student&apos;s admission/participation in the course. The
                  ₹499/- booking amount will remain non-refundable.
                </li>
                <li>
                  <strong>Course Materials &amp; Certification:</strong>{" "}
                  Course materials, recordings (if applicable), certificates
                  and other benefits will be provided according to the
                  specific course structure and eligibility requirements.
                </li>
                <li>
                  <strong>Course Content:</strong> Course content, schedule,
                  trainer, duration and delivery format may be modified by
                  ASTROBOOK when reasonably necessary. Students will be
                  informed of any significant changes.
                </li>
                <li>
                  <strong>No Guarantee of Personal Results:</strong>{" "}
                  ASTROBOOK&apos;s courses are intended for educational,
                  spiritual and personal-development purposes. ASTROBOOK
                  does not guarantee any specific financial, professional,
                  relationship, healing or other personal outcome from
                  completing a course.
                </li>
                <li>
                  <strong>Student Information:</strong> Students are
                  responsible for providing accurate name, contact details
                  and other registration information. Incorrect information
                  may affect communication, certification or course records.
                </li>
                <li>
                  <strong>Terms Acceptance:</strong> By submitting the
                  registration form and/or making the seat-booking payment,
                  the student confirms that they have read, understood and
                  agreed to these Terms &amp; Conditions.
                </li>
              </ol>
              <p className={styles.tcImportant}>
                <strong>Important:</strong> Please make sure you are able to
                attend the selected batch before booking your seat, as the
                ₹499/- seat-booking amount is non-refundable.
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
