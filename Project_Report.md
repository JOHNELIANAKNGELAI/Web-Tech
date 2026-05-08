# Project Report: Education Website Development (EduLearn)

**Date:** May 8, 2026  
**Project Title:** EduLearn Student Portal  
**Group Size:** 6 Members  

---

## 1. Project Overview
The **EduLearn Student Portal** is a responsive web application designed to support undergraduate students. It integrates a learning management system (course notes and quizzes) with a functional academic bookstore. The project utilizes a modern **Python Flask** backend, a **SQLite** database, and a premium **Vanilla JS/CSS** frontend.

---

## 2. Design Choices and Rationale

### 2.1 Aesthetic and Visual Design
*   **3D Visual Assets:** Instead of traditional icons, we utilized high-quality 3D renders for core features (Video Lectures, Study Materials, etc.).  
    *   *Rationale:* This creates a "premium" first impression and distinguishes the portal from generic academic websites.
*   **Minimalist Grid Layout:** The homepage uses a clean grid system.  
    *   *Rationale:* To ensure students can find resources quickly without cognitive overload.

### 2.2 User Experience (UX)
*   **Persistent Navigation:** A consistent top navigation bar is used across all pages.
*   **Unified Design System:** A strict color palette (Primary Blue: #2563EB) and typography (Inter) were used to maintain brand consistency.

---

## 3. Implementation Process

### 3.1 Backend Development (Python Flask)
The backend handles authentication, course management, and the bookstore logic.
*   **RESTful API:** Developed endpoints for `/api/login`, `/api/courses`, and `/api/forum`.
*   **Database:** Switched from cloud-hosted PostgreSQL to **SQLite** for the final deliverable to ensure portability and ease of grading for the instructors.

### 3.2 Frontend Development (HTML/CSS/JS)
*   **Dynamic Rendering:** All course and bookstore data is fetched dynamically from the API and rendered using JavaScript Template Literals.
*   **Responsive Design:** Implemented using CSS Flexbox and Media Queries to ensure compatibility with mobile and desktop devices.

### 3.3 Database Schema
The system utilizes five core tables:
1.  **Users:** Stores student credentials and names.
2.  **Courses:** Stores syllabus, instructor info, and enrollment stats.
3.  **Grades:** Tracks student performance in interactive quizzes.
4.  **Books:** Inventory for the bookstore marketplace.
5.  **Forum:** Stores peer-to-peer discussions and replies.

---

## 4. Reflection

### 4.1 Usability
The portal was tested for **discoverability**. By placing the "Popular Features" directly on the hero section, users can access their most needed tools (Forum, Bookstore) in a single click.

> [INSERT SCREENSHOT: HOMEPAGE OVERVIEW]

### 4.2 Accessibility
*   **Typography:** We used the **Inter** font family for its high legibility at small sizes.
*   **Contrast:** High contrast ratios (Dark Blue text on White/Light Gray backgrounds) were maintained to assist users with visual impairments.

> [INSERT SCREENSHOT: ACCESSIBILITY - COURSE PAGE]

### 4.3 Security
*   **Session Management:** User sessions are handled via `localStorage` for state persistence across page refreshes.
*   **Input Sanitization:** Backend routes ensure that student submissions (forum posts/replies) are handled securely to prevent basic injection attacks.

> [INSERT SCREENSHOT: LOGIN PAGE / STUDENT PROFILE]

---

## 5. Conclusion
EduLearn successfully integrates all components required by the project brief. It provides a cohesive, secure, and visually stunning environment for student learning and commerce.

---
*End of Report*
