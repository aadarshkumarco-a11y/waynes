"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ActivityLog,
  AdminTab,
  Announcement,
  ApplyCouponResult,
  Bookmark,
  CartItem,
  Certificate,
  Coupon,
  Enrollment,
  LessonNote,
  Notification,
  Order,
  OrderStatus,
  User,
  ViewName,
} from "@/lib/types";
import { couponMap, coupons as seedCoupons, courseMap } from "@/lib/data/catalog";
import {
  generateOrderNumber,
  generateVerifyId,
  timeAgo,
} from "@/lib/format";

// ---------------------------------------------------------------------------
// DEMO SEED DATA (so dashboards look alive on first load)
// ---------------------------------------------------------------------------
const DEMO_USER: User = {
  id: "user-demo",
  email: "alex@waynes.io",
  name: "Alex Sharma",
  avatar: "https://i.pravatar.cc/120?img=68",
  role: "STUDENT",
  title: "Lifelong Learner",
  provider: "email",
  emailVerified: true,
};

const DEMO_ADMIN: User = {
  id: "user-admin",
  email: "admin@waynes.io",
  name: "Admin",
  avatar: "https://i.pravatar.cc/120?img=60",
  role: "SUPER_ADMIN",
  title: "Platform Administrator",
  provider: "email",
  emailVerified: true,
};

function iso(offsetMin = 0): string {
  return new Date(Date.now() + offsetMin * 60000).toISOString();
}

function seedOrders(): Order[] {
  const now = Date.now();
  const mk = (
    daysAgo: number,
    status: OrderStatus,
    courseId: string,
    userName: string,
    userEmail: string,
    couponCode?: string,
    discount = 0
  ): Order => {
    const course = courseMap[courseId];
    const created = new Date(now - daysAgo * 86400000).toISOString();
    const timeline: Order["timeline"] = [
      { id: "t1", label: "Order created", at: created, status: "PENDING" },
    ];
    if (status !== "PENDING") {
      timeline.push({
        id: "t2",
        label: `Order ${status.toLowerCase()}`,
        at: new Date(new Date(created).getTime() + 3600000).toISOString(),
        status,
      });
    }
    return {
      id: `seed-ord-${courseId}-${userName}`,
      orderNumber: generateOrderNumber(),
      userId: `seed-user-${userName}`,
      userEmail,
      userName,
      courseId,
      courseTitle: course.title,
      courseThumbnail: course.thumbnail,
      amount: course.price,
      discount,
      finalAmount: course.price - discount,
      currency: course.currency,
      status,
      couponCode,
      paymentRef: `TXN${Math.floor(Math.random() * 1e9)}`,
      paymentMethod: ["UPI", "BANK", "CARD"][Math.floor(Math.random() * 3)],
      notes: [],
      timeline,
      createdAt: created,
      approvedAt: status === "APPROVED" ? new Date(new Date(created).getTime() + 3600000).toISOString() : undefined,
      rejectedAt: status === "REJECTED" ? new Date(new Date(created).getTime() + 7200000).toISOString() : undefined,
    };
  };
  return [
    mk(0, "PENDING", "course-1", "Riya Bose", "riya@gmail.com"),
    mk(0, "PENDING", "course-4", "Sam Das", "sam@gmail.com", "LAUNCH25", 2000),
    mk(1, "APPROVED", "course-2", "Karan Shah", "karan@gmail.com"),
    mk(1, "APPROVED", "course-1", "Neha Rao", "neha@gmail.com", "WELCOME50", 2500),
    mk(2, "APPROVED", "course-3", "Farhan Q", "farhan@gmail.com"),
    mk(3, "REJECTED", "course-6", "Pooja N", "pooja@gmail.com"),
    mk(4, "APPROVED", "course-4", "Vivek T", "vivek@gmail.com"),
    mk(5, "APPROVED", "course-5", "Anita G", "anita@gmail.com"),
    mk(6, "REFUNDED", "course-7", "Manish K", "manish@gmail.com"),
    mk(8, "APPROVED", "course-8", "Sara M", "sara@gmail.com"),
  ];
}

function seedNotifications(): Notification[] {
  return [
    {
      id: "n1",
      type: "ANNOUNCEMENT",
      title: "New course launched: LLM Engineering",
      body: "Master RAG, agents & fine-tuning. Early-bird 50% off this week.",
      link: "course-4",
      read: false,
      createdAt: iso(-30),
    },
    {
      id: "n2",
      type: "SUCCESS",
      title: "Welcome to Waynes 🎉",
      body: "Your learning journey starts now. Explore 8 world-class courses.",
      read: false,
      createdAt: iso(-120),
    },
    {
      id: "n3",
      type: "INFO",
      title: "Weekly study reminder",
      body: "Consistency beats intensity. Log in and finish a lesson today!",
      read: true,
      createdAt: iso(-1440),
    },
  ];
}

function seedAnnouncements(): Announcement[] {
  return [
    {
      id: "an1",
      title: "Live workshop: Building RAG apps with Next.js",
      body: "Join us this Saturday for a 2-hour live workshop. Free for all enrolled students.",
      audience: "STUDENTS",
      pinned: true,
      active: true,
      createdAt: iso(-240),
    },
    {
      id: "an2",
      title: "Holiday sale — 50% off all courses",
      body: "Use code WELCOME50 at checkout. Valid until Dec 31.",
      audience: "ALL",
      pinned: false,
      active: true,
      createdAt: iso(-2880),
    },
  ];
}

function seedActivities(): ActivityLog[] {
  return [
    { id: "a1", userName: "Admin", action: "ORDER_APPROVED", detail: "Approved order for Data Science Bootcamp", createdAt: iso(-60), ip: "103.21.x.x" },
    { id: "a2", userName: "Riya Bose", action: "ORDER_CREATED", detail: "Created pending order for Next.js Mastery", createdAt: iso(-90), ip: "49.36.x.x" },
    { id: "a3", userName: "Admin", action: "COUPON_CREATED", detail: "Created coupon WELCOME50 (50% off)", createdAt: iso(-300), ip: "103.21.x.x" },
    { id: "a4", userName: "Admin", action: "ORDER_REJECTED", detail: "Rejected order for System Design Interview", createdAt: iso(-600), ip: "103.21.x.x" },
    { id: "a5", userName: "Karan Shah", action: "LESSON_COMPLETED", detail: "Completed lesson 'Python Crash Course'", createdAt: iso(-720), ip: "49.36.x.x" },
  ];
}

// Demo enrollments + progress for the demo student so My Learning has content
function seedEnrollments(): Enrollment[] {
  return [
    {
      id: "enr-1",
      userId: "user-demo",
      courseId: "course-1",
      progress: 62,
      completed: false,
      enrolledAt: iso(-4320),
      lastViewedLessonId: "lsn-6",
      lastViewedAt: iso(-180),
    },
    {
      id: "enr-2",
      userId: "user-demo",
      courseId: "course-8",
      progress: 100,
      completed: true,
      enrolledAt: iso(-10080),
      lastViewedLessonId: "lsn-30",
      lastViewedAt: iso(-2880),
    },
  ];
}

function seedCertificates(): Certificate[] {
  const course = courseMap["course-8"];
  return [
    {
      id: "cert-1",
      verifyId: "LMS-TK8X4A-2Q9B",
      userId: "user-demo",
      courseId: "course-8",
      candidateName: "Alex Sharma",
      courseTitle: course.title,
      instructorName: "Rohan Kapoor",
      score: 98,
      issuedAt: iso(-2880),
    },
  ];
}

// ---------------------------------------------------------------------------
// STORE TYPES
// ---------------------------------------------------------------------------
interface NavState {
  view: ViewName;
  courseSlug: string | null;
  lessonId: string | null;
  blogSlug: string | null;
  certificateId: string | null;
  adminTab: AdminTab;
  checkoutCourseId: string | null;
  searchQuery: string;
  mobileMenuOpen: boolean;
}

interface AuthState {
  user: User | null;
  authOpen: boolean;
  authMode: "login" | "signup" | "forgot";
}

interface CartState {
  items: CartItem[];
  appliedCouponCode: string | null;
}

interface LmsState extends NavState, AuthState, CartState {
  orders: Order[];
  enrollments: Enrollment[];
  notes: LessonNote[];
  bookmarks: Bookmark[];
  certificates: Certificate[];
  notifications: Notification[];
  announcements: Announcement[];
  activities: ActivityLog[];
  couponList: Coupon[]; // admin-managed copy
  courseOverrides: Record<
    string,
    { price?: number; comparePrice?: number; featured?: boolean; published?: boolean }
  >;
  customCourses: Course[]; // admin-added courses (full CRUD)
  paymentSettings: PaymentSettings; // admin-configured payment options

  // Navigation
  navigate: (view: ViewName, params?: Partial<NavState>) => void;
  openCourse: (slug: string) => void;
  openLesson: (courseSlug: string, lessonId: string) => void;
  openBlog: (slug: string) => void;
  openCertificate: (verifyId: string) => void;
  openCheckout: (courseId: string) => void;
  setAdminTab: (tab: AdminTab) => void;
  setSearchQuery: (q: string) => void;
  setMobileMenuOpen: (open: boolean) => void;
  scrollTop: () => void;

  // Auth
  setAuthOpen: (open: boolean, mode?: "login" | "signup" | "forgot") => void;
  login: (email: string, password: string) => Promise<{ ok: boolean; message: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ ok: boolean; message: string }>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  enterAdminDemo: () => void;
  enterStudentDemo: () => void;
  resetPassword: (email: string) => { ok: boolean; message: string };

  // Cart
  addToCart: (courseId: string) => void;
  removeFromCart: (courseId: string) => void;
  clearCart: () => void;
  isInCart: (courseId: string) => boolean;

  // Coupons
  applyCoupon: (code: string, amount: number, courseId?: string) => ApplyCouponResult;
  removeCoupon: () => void;
  validateCoupon: (code: string, amount: number, courseId?: string) => ApplyCouponResult;
  toggleCouponActive: (id: string) => void;
  addCoupon: (c: Omit<Coupon, "id" | "usedCount">) => void;
  deleteCoupon: (id: string) => void;

  // Course overrides (edited from admin.html)
  setCourseOverride: (
    id: string,
    patch: { price?: number; comparePrice?: number; featured?: boolean; published?: boolean }
  ) => void;
  removeCourseOverride: (id: string) => void;

  // Custom courses (full CRUD from admin)
  addCustomCourse: (course: Course) => void;
  updateCustomCourse: (id: string, patch: Partial<Course>) => void;
  deleteCustomCourse: (id: string) => void;

  // Payment settings
  setPaymentSettings: (patch: Partial<PaymentSettings>) => void;

  // Orders
  checkout: (courseId: string, paymentRef: string, paymentMethod: string) => Order;
  approveOrder: (orderId: string) => void;
  rejectOrder: (orderId: string) => void;
  refundOrder: (orderId: string) => void;
  addOrderNote: (orderId: string, text: string) => void;

  // Enrollment & progress
  isEnrolled: (courseId: string) => boolean;
  getEnrollment: (courseId: string) => Enrollment | undefined;
  markLessonComplete: (courseId: string, lessonId: string) => void;
  setLessonPosition: (courseId: string, lessonId: string, position: number) => void;
  setLastViewed: (courseId: string, lessonId: string) => void;
  recomputeProgress: (courseId: string) => void;

  // Notes
  addNote: (lessonId: string, courseId: string, content: string, timestamp: number) => void;
  updateNote: (noteId: string, content: string) => void;
  deleteNote: (noteId: string) => void;

  // Bookmarks
  toggleBookmark: (lessonId: string, courseId: string, timestamp: number) => void;
  isBookmarked: (lessonId: string) => boolean;

  // Certificates
  issueCertificate: (courseId: string) => Certificate | undefined;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (n: Omit<Notification, "id" | "createdAt" | "read">) => void;
  broadcastNotification: (n: Omit<Notification, "id" | "createdAt" | "read" | "userId">) => void;

  // Activities
  addActivity: (action: string, detail: string) => void;
}

// ---------------------------------------------------------------------------
// STORE
// ---------------------------------------------------------------------------
export const useLms = create<LmsState>()(
  persist(
    (set, get) => ({
      // --- Nav ---
      view: "home",
      courseSlug: null,
      lessonId: null,
      blogSlug: null,
      certificateId: null,
      adminTab: "overview",
      checkoutCourseId: null,
      searchQuery: "",
      mobileMenuOpen: false,

      // --- Auth ---
      user: null,
      authOpen: false,
      authMode: "login",

      // --- Cart ---
      items: [],
      appliedCouponCode: null,

      // --- Data (seeded) ---
      orders: seedOrders(),
      enrollments: seedEnrollments(),
      notes: [],
      bookmarks: [],
      certificates: seedCertificates(),
      notifications: seedNotifications(),
      announcements: seedAnnouncements(),
      activities: seedActivities(),
      couponList: seedCoupons,
      courseOverrides: {},
      customCourses: [],
      paymentSettings: {
        upiId: "waynes@upi",
        payeeName: "Waynes",
        qrImage: "",
        methods: { upi: true, bank: true, card: false },
        bankDetails: {
          accountName: "Waynes",
          accountNumber: "00000000000000000",
          ifsc: "XXXX0000000",
          bankName: "Your Bank",
        },
        instructions: "Make payment via UPI/Bank Transfer, then enter your transaction reference below. We verify and grant access within minutes.",
        greetingMessage: "Thank you for enrolling! Your payment is being verified. You'll get access within minutes. Check your notifications. — Team Waynes",
      },

      // ---------------- Navigation ----------------
      navigate: (view, params) => {
        set({ view, mobileMenuOpen: false, ...params });
        get().scrollTop();
      },
      openCourse: (slug) => {
        set({ view: "course", courseSlug: slug, mobileMenuOpen: false });
        get().scrollTop();
      },
      openLesson: (courseSlug, lessonId) => {
        set({ view: "learn", courseSlug, lessonId, mobileMenuOpen: false });
        get().scrollTop();
      },
      openBlog: (slug) => {
        set({ view: "blog-post", blogSlug: slug, mobileMenuOpen: false });
        get().scrollTop();
      },
      openCertificate: (verifyId) => {
        set({ view: "certificate", certificateId: verifyId, mobileMenuOpen: false });
        get().scrollTop();
      },
      openCheckout: (courseId) => {
        set({ view: "checkout", checkoutCourseId: courseId, appliedCouponCode: null, mobileMenuOpen: false });
        get().scrollTop();
      },
      setAdminTab: (tab) => {
        set({ adminTab: tab });
        get().scrollTop();
      },
      setSearchQuery: (q) => set({ searchQuery: q }),
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
      scrollTop: () => {
        if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      },

      // ---------------- Auth (Firebase-backed) ----------------
      setAuthOpen: (open, mode = "login") => set({ authOpen: open, authMode: mode }),
      login: async (email, password) => {
        if (!email || !email.includes("@")) return { ok: false, message: "Enter a valid email." };
        const { firebaseLogin } = await import("@/lib/firebase");
        const res = await firebaseLogin(email, password);
        if (res.ok && res.user) {
          set({
            user: {
              id: res.user.id,
              email: res.user.email,
              name: res.user.name,
              avatar: res.user.avatar,
              role: "STUDENT",
              title: "Learner",
              provider: "email",
              emailVerified: true,
            },
            authOpen: false,
          });
          get().addActivity("LOGIN", `${res.user.name} signed in`);
        }
        return { ok: res.ok, message: res.message };
      },
      signup: async (name, email, password) => {
        if (!name || !email.includes("@")) return { ok: false, message: "Please fill all fields correctly." };
        if (!password || password.length < 6) return { ok: false, message: "Password must be at least 6 characters." };
        const { firebaseSignup } = await import("@/lib/firebase");
        const res = await firebaseSignup(name, email, password);
        if (res.ok && res.user) {
          set({
            user: {
              id: res.user.id,
              email: res.user.email,
              name: res.user.name,
              avatar: res.user.avatar,
              role: "STUDENT",
              title: "Learner",
              provider: "email",
              emailVerified: true,
            },
            authOpen: false,
          });
          get().addNotification({
            type: "SUCCESS",
            title: "Welcome to Waynes 🎉",
            body: `Hi ${name}, your account is ready. Start exploring courses!`,
          });
          get().addActivity("SIGNUP", `${name} created an account`);
        }
        return { ok: res.ok, message: res.message };
      },
      loginWithGoogle: async () => {
        const { firebaseLoginWithGoogle } = await import("@/lib/firebase");
        const res = await firebaseLoginWithGoogle();
        if (res.ok && res.user) {
          set({
            user: {
              id: res.user.id,
              email: res.user.email,
              name: res.user.name,
              avatar: res.user.avatar,
              role: "STUDENT",
              title: "Learner",
              provider: "google",
              emailVerified: true,
            },
            authOpen: false,
          });
          get().addActivity("LOGIN", `${res.user.name} signed in with Google`);
        } else if (!res.ok) {
          // surface error via a notification so the user sees why
          get().addNotification({
            type: "WARNING",
            title: "Google sign-in failed",
            body: res.message,
          });
        }
      },
      logout: () => {
        const wasAdmin = get().user?.role === "SUPER_ADMIN";
        get().addActivity("LOGOUT", "User signed out");
        // Sign out of Firebase (async, but don't block UI)
        import("@/lib/firebase").then(({ firebaseLogout }) => firebaseLogout());
        // Demo admin is local-only — clearing the store is enough.
        set({ user: null, view: wasAdmin ? "home" : "home" });
        get().scrollTop();
      },
      enterAdminDemo: () => {
        set({ user: DEMO_ADMIN, view: "admin", adminTab: "overview", authOpen: false });
        get().addActivity("LOGIN", "Admin signed in (demo)");
        get().scrollTop();
      },
      enterStudentDemo: () => {
        set({ user: DEMO_USER, view: "my-learning", authOpen: false });
        get().addActivity("LOGIN", "Demo student signed in");
        get().scrollTop();
      },
      resetPassword: (email) => {
        if (!email.includes("@")) return { ok: false, message: "Enter a valid email." };
        set({ authOpen: false });
        return { ok: true, message: "Reset link sent (demo)." };
      },

      // ---------------- Cart ----------------
      addToCart: (courseId) =>
        set((s) =>
          s.items.some((i) => i.courseId === courseId)
            ? s
            : { items: [...s.items, { courseId, addedAt: new Date().toISOString() }] }
        ),
      removeFromCart: (courseId) =>
        set((s) => ({ items: s.items.filter((i) => i.courseId !== courseId) })),
      clearCart: () => set({ items: [], appliedCouponCode: null }),
      isInCart: (courseId) => get().items.some((i) => i.courseId === courseId),

      // ---------------- Coupons ----------------
      validateCoupon: (code, amount, courseId) => {
        const c = couponMap[code.toUpperCase()] || get().couponList.find((x) => x.code === code.toUpperCase());
        if (!c) return { ok: false, message: "Invalid coupon code.", discount: 0 };
        if (!c.active) return { ok: false, message: "This coupon is no longer active.", discount: 0 };
        const now = Date.now();
        if (new Date(c.startsAt).getTime() > now)
          return { ok: false, message: "This coupon is not yet active.", discount: 0 };
        if (c.expiresAt && new Date(c.expiresAt).getTime() < now)
          return { ok: false, message: "This coupon has expired.", discount: 0 };
        if (c.usageLimit && c.usedCount >= c.usageLimit)
          return { ok: false, message: "This coupon has reached its usage limit.", discount: 0 };
        if (amount < c.minAmount)
          return {
            ok: false,
            message: `Minimum order amount of ₹${c.minAmount.toLocaleString("en-IN")} required.`,
            discount: 0,
          };
        if (c.courseId && courseId && c.courseId !== courseId)
          return { ok: false, message: "This coupon is not valid for this course.", discount: 0 };
        const discount = c.type === "PERCENT" ? Math.round((amount * c.value) / 100) : Math.min(c.value, amount);
        if (discount <= 0) return { ok: false, message: "Coupon discount is zero.", discount: 0 };
        return { ok: true, message: `Coupon applied! You saved ₹${discount.toLocaleString("en-IN")}.`, discount, couponCode: c.code };
      },
      applyCoupon: (code, amount, courseId) => {
        const res = get().validateCoupon(code, amount, courseId);
        if (res.ok) set({ appliedCouponCode: res.couponCode! });
        return res;
      },
      removeCoupon: () => set({ appliedCouponCode: null }),
      toggleCouponActive: (id) =>
        set((s) => ({
          couponList: s.couponList.map((c) => (c.id === id ? { ...c, active: !c.active } : c)),
        })),
      addCoupon: (c) =>
        set((s) => ({
          couponList: [...s.couponList, { ...c, id: `cp-${Date.now()}`, usedCount: 0 }],
        })),
      deleteCoupon: (id) =>
        set((s) => ({ couponList: s.couponList.filter((c) => c.id !== id) })),

      // ---------------- Course Overrides ----------------
      setCourseOverride: (id, patch) =>
        set((s) => ({
          courseOverrides: {
            ...s.courseOverrides,
            [id]: { ...(s.courseOverrides[id] || {}), ...patch },
          },
        })),
      removeCourseOverride: (id) =>
        set((s) => {
          const next = { ...s.courseOverrides };
          delete next[id];
          return { courseOverrides: next };
        }),

      // ---------------- Custom Courses (full CRUD from admin) ----------------
      addCustomCourse: (course) =>
        set((s) => ({ customCourses: [course, ...s.customCourses] })),
      updateCustomCourse: (id, patch) =>
        set((s) => ({
          customCourses: s.customCourses.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      deleteCustomCourse: (id) =>
        set((s) => ({ customCourses: s.customCourses.filter((c) => c.id !== id) })),

      // ---------------- Payment Settings ----------------
      setPaymentSettings: (patch) =>
        set((s) => ({ paymentSettings: { ...s.paymentSettings, ...patch } })),

      // ---------------- Orders ----------------
      checkout: (courseId, paymentRef, paymentMethod) => {
        const course = courseMap[courseId] || get().customCourses.find((c) => c.id === courseId);
        if (!course) throw new Error("Course not found");
        const user = get().user || DEMO_USER;
        const appliedCode = get().appliedCouponCode;
        const res = appliedCode ? get().validateCoupon(appliedCode, course.price, courseId) : null;
        const discount = res?.ok ? res.discount : 0;
        const finalAmount = course.price - discount;
        const created = new Date().toISOString();
        const order: Order = {
          id: `ord-${Date.now()}`,
          orderNumber: generateOrderNumber(),
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          courseId,
          courseTitle: course.title,
          courseThumbnail: course.thumbnail,
          amount: course.price,
          discount,
          finalAmount,
          currency: course.currency,
          status: "PENDING",
          couponCode: appliedCode,
          paymentRef,
          paymentMethod,
          notes: [],
          timeline: [{ id: "t1", label: "Order created — pending verification", at: created, status: "PENDING" }],
          createdAt: created,
        };
        set((s) => ({
          orders: [order, ...s.orders],
          appliedCouponCode: null,
          items: s.items.filter((i) => i.courseId !== courseId),
          notifications: [
            {
              id: `n-${Date.now()}`,
              type: "ORDER",
              title: "Order submitted for verification",
              body: `Your order for "${course.title}" is pending verification. We'll notify you once approved.`,
              link: courseId,
              read: false,
              createdAt: created,
            },
            ...s.notifications,
          ],
        }));
        if (appliedCode) {
          set((s) => ({
            couponList: s.couponList.map((c) =>
              c.code === appliedCode ? { ...c, usedCount: c.usedCount + 1 } : c
            ),
          }));
        }
        get().addActivity("ORDER_CREATED", `${user.name} created order for ${course.title}`);
        return order;
      },
      approveOrder: (orderId) => {
        const at = new Date().toISOString();
        set((s) => {
          const order = s.orders.find((o) => o.id === orderId);
          if (!order) return s;
          const course = courseMap[order.courseId];
          // create enrollment if not exists for this user+course
          const already = s.enrollments.some(
            (e) => e.userId === order.userId && e.courseId === order.courseId
          );
          const enrollments = already
            ? s.enrollments
            : [
                {
                  id: `enr-${Date.now()}`,
                  userId: order.userId,
                  courseId: order.courseId,
                  progress: 0,
                  completed: false,
                  enrolledAt: at,
                },
                ...s.enrollments,
              ];
          return {
            orders: s.orders.map((o) =>
              o.id === orderId
                ? {
                    ...o,
                    status: "APPROVED",
                    approvedAt: at,
                    timeline: [...o.timeline, { id: `t${Date.now()}`, label: "Order approved — access granted", at, status: "APPROVED" }],
                  }
                : o
            ),
            enrollments,
            notifications: [
              {
                id: `n-${Date.now()}`,
                userId: order.userId,
                type: "SUCCESS",
                title: "🎉 Access granted!",
                body: `Your enrollment in "${course.title}" is now active. Start learning!`,
                link: order.courseId,
                read: false,
                createdAt: at,
              },
              ...s.notifications,
            ],
          };
        });
        get().addActivity("ORDER_APPROVED", `Approved order ${get().orders.find((o) => o.id === orderId)?.orderNumber}`);
      },
      rejectOrder: (orderId) => {
        const at = new Date().toISOString();
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: "REJECTED",
                  rejectedAt: at,
                  timeline: [...o.timeline, { id: `t${Date.now()}`, label: "Order rejected", at, status: "REJECTED" }],
                }
              : o
          ),
          notifications: [
            {
              id: `n-${Date.now()}`,
              userId: s.orders.find((o) => o.id === orderId)?.userId,
              type: "WARNING",
              title: "Order could not be verified",
              body: "We couldn't verify your payment. Please check your reference and try again, or contact support.",
              read: false,
              createdAt: at,
            },
            ...s.notifications,
          ],
        }));
        get().addActivity("ORDER_REJECTED", `Rejected order ${orderId}`);
      },
      refundOrder: (orderId) => {
        const at = new Date().toISOString();
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: "REFUNDED",
                  refundedAt: at,
                  timeline: [...o.timeline, { id: `t${Date.now()}`, label: "Order refunded", at, status: "REFUNDED" }],
                }
              : o
          ),
        }));
        get().addActivity("ORDER_REFUNDED", `Refunded order ${orderId}`);
      },
      addOrderNote: (orderId, text) => {
        const user = get().user;
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  notes: [
                    ...o.notes,
                    { id: `note-${Date.now()}`, author: user?.name || "Admin", text, at: new Date().toISOString() },
                  ],
                }
              : o
          ),
        }));
      },

      // ---------------- Enrollment & Progress ----------------
      isEnrolled: (courseId) => {
        const user = get().user;
        if (!user) return false;
        return get().enrollments.some((e) => e.userId === user.id && e.courseId === courseId);
      },
      getEnrollment: (courseId) => {
        const user = get().user;
        if (!user) return undefined;
        return get().enrollments.find((e) => e.userId === user.id && e.courseId === courseId);
      },
      markLessonComplete: (courseId, lessonId) => {
        const user = get().user;
        if (!user) return;
        set((s) => {
          const enrollments = s.enrollments.map((e) => {
            if (e.userId !== user.id || e.courseId !== courseId) return e;
            const course = courseMap[courseId];
            const completedKey = `progress-${user.id}-${courseId}`;
            const existing: string[] = JSON.parse(
              (typeof window !== "undefined" && localStorage.getItem(completedKey)) || "[]"
            );
            if (!existing.includes(lessonId)) existing.push(lessonId);
            if (typeof window !== "undefined")
              localStorage.setItem(completedKey, JSON.stringify(existing));
            const total = course.sections.reduce((n, sec) => n + sec.lessons.length, 0);
            const pct = total ? Math.round((existing.length / total) * 100) : 0;
            return { ...e, progress: pct, completed: pct >= 100, lastViewedLessonId: lessonId, lastViewedAt: new Date().toISOString() };
          });
          return { enrollments };
        });
        get().recomputeProgress(courseId);
        // auto-issue certificate
        const e = get().getEnrollment(courseId);
        if (e?.completed) get().issueCertificate(courseId);
      },
      setLessonPosition: (courseId, _lessonId, _position) => {
        // positions are stored in localStorage per lesson; no-op on store
      },
      setLastViewed: (courseId, lessonId) => {
        const user = get().user;
        if (!user) return;
        set((s) => ({
          enrollments: s.enrollments.map((e) =>
            e.userId === user.id && e.courseId === courseId
              ? { ...e, lastViewedLessonId: lessonId, lastViewedAt: new Date().toISOString() }
              : e
          ),
        }));
      },
      recomputeProgress: (courseId) => {
        const user = get().user;
        if (!user) return;
        const course = courseMap[courseId];
        const completedKey = `progress-${user.id}-${courseId}`;
        const existing: string[] = JSON.parse(
          (typeof window !== "undefined" && localStorage.getItem(completedKey)) || "[]"
        );
        const total = course.sections.reduce((n, sec) => n + sec.lessons.length, 0);
        const pct = total ? Math.round((existing.length / total) * 100) : 0;
        set((s) => ({
          enrollments: s.enrollments.map((e) =>
            e.userId === user.id && e.courseId === courseId
              ? { ...e, progress: pct, completed: pct >= 100 }
              : e
          ),
        }));
      },

      // ---------------- Notes ----------------
      addNote: (lessonId, courseId, content, timestamp) => {
        const user = get().user;
        const at = new Date().toISOString();
        set((s) => ({
          notes: [
            { id: `note-${Date.now()}`, lessonId, courseId, content, timestamp, createdAt: at, updatedAt: at },
            ...s.notes,
          ],
        }));
        void user;
      },
      updateNote: (noteId, content) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === noteId ? { ...n, content, updatedAt: new Date().toISOString() } : n
          ),
        })),
      deleteNote: (noteId) =>
        set((s) => ({ notes: s.notes.filter((n) => n.id !== noteId) })),

      // ---------------- Bookmarks ----------------
      toggleBookmark: (lessonId, courseId, timestamp) =>
        set((s) => {
          const exists = s.bookmarks.some((b) => b.lessonId === lessonId);
          return {
            bookmarks: exists
              ? s.bookmarks.filter((b) => b.lessonId !== lessonId)
              : [...s.bookmarks, { id: `bm-${Date.now()}`, lessonId, courseId, timestamp, createdAt: new Date().toISOString() }],
          };
        }),
      isBookmarked: (lessonId) => get().bookmarks.some((b) => b.lessonId === lessonId),

      // ---------------- Certificates ----------------
      issueCertificate: (courseId) => {
        const user = get().user;
        if (!user) return undefined;
        const course = courseMap[courseId];
        const exists = get().certificates.some((c) => c.userId === user.id && c.courseId === courseId);
        if (exists) return get().certificates.find((c) => c.userId === user.id && c.courseId === courseId);
        const cert: Certificate = {
          id: `cert-${Date.now()}`,
          verifyId: generateVerifyId(),
          userId: user.id,
          courseId,
          candidateName: user.name,
          courseTitle: course.title,
          instructorName: "Rohan Kapoor",
          score: 95 + Math.floor(Math.random() * 5),
          issuedAt: new Date().toISOString(),
        };
        set((s) => ({
          certificates: [cert, ...s.certificates],
          notifications: [
            {
              id: `n-${Date.now()}`,
              userId: user.id,
              type: "SUCCESS",
              title: "🎓 Certificate earned!",
              body: `Congratulations! You completed "${course.title}". Your certificate is ready.`,
              link: cert.verifyId,
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...s.notifications,
          ],
        }));
        get().addActivity("CERTIFICATE_ISSUED", `${user.name} earned certificate for ${course.title}`);
        return cert;
      },

      // ---------------- Notifications ----------------
      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      markAllNotificationsRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      addNotification: (n) =>
        set((s) => ({
          notifications: [
            { ...n, id: `n-${Date.now()}`, createdAt: new Date().toISOString(), read: false },
            ...s.notifications,
          ],
        })),
      broadcastNotification: (n) => {
        set((s) => ({
          notifications: [
            { ...n, id: `n-${Date.now()}`, createdAt: new Date().toISOString(), read: false },
            ...s.notifications,
          ],
        }));
        get().addActivity("NOTIFICATION_BROADCAST", `Broadcast: ${n.title}`);
      },

      // ---------------- Activities ----------------
      addActivity: (action, detail) =>
        set((s) => ({
          activities: [
            {
              id: `a-${Date.now()}`,
              userName: get().user?.name,
              action,
              detail,
              ip: "103.21.x.x",
              createdAt: new Date().toISOString(),
            },
            ...s.activities,
          ].slice(0, 200),
        })),
    }),
    {
      name: "waynes-lms",
      storage: createJSONStorage(() => localStorage),
      // Don't persist the seed catalog of orders/notifications/etc.? We DO want
      // orders to persist so the demo state survives reloads. Keep everything.
      partialize: (s) => ({
        user: s.user,
        orders: s.orders,
        enrollments: s.enrollments,
        notes: s.notes,
        bookmarks: s.bookmarks,
        certificates: s.certificates,
        notifications: s.notifications,
        announcements: s.announcements,
        activities: s.activities,
        couponList: s.couponList,
        courseOverrides: s.courseOverrides,
        customCourses: s.customCourses,
        paymentSettings: s.paymentSettings,
        items: s.items,
        appliedCouponCode: s.appliedCouponCode,
      }),
    }
  )
);

// Selector helpers (re-exported for convenience)
export { timeAgo };
