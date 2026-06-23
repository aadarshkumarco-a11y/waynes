// Shared domain types for the LMS platform.
// These mirror the Prisma models but are simplified for client-side use.

export type Role = "STUDENT" | "SUPER_ADMIN";

export type OrderStatus = "PENDING" | "APPROVED" | "REJECTED" | "REFUNDED";

export type LessonType = "VIDEO" | "PDF" | "TEXT" | "DOWNLOAD";

export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type CouponType = "PERCENT" | "FIXED";

// Admin-configured payment options (no gateway — external verification)
export interface PaymentSettings {
  upiId: string;
  payeeName: string;
  qrImage: string; // base64 data URL of QR code image
  methods: {
    upi: boolean;
    bank: boolean;
    card: boolean;
  };
  bankDetails: {
    accountName: string;
    accountNumber: string;
    ifsc: string;
    bankName: string;
  };
  instructions: string;
  greetingMessage: string; // shown after checkout
}

export type NotificationType =
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "ANNOUNCEMENT"
  | "ORDER";

export type ViewName =
  | "home"
  | "catalog"
  | "course"
  | "learn"
  | "dashboard"
  | "my-learning"
  | "blog"
  | "blog-post"
  | "certificate"
  | "checkout"
  | "pricing"
  | "admin";

export type AdminTab =
  | "overview"
  | "orders"
  | "courses"
  | "coupons"
  | "students"
  | "reviews"
  | "blog"
  | "cms"
  | "notifications"
  | "announcements"
  | "settings"
  | "activity";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: Role;
  title?: string;
  bio?: string;
  provider: "email" | "google";
  emailVerified: boolean;
}

export interface Instructor {
  id: string;
  name: string;
  title: string;
  avatar: string;
  bio: string;
  rating: number;
  students: number;
  courses: number;
  expertise: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  courseCount: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  courseId: string;
  rating: number;
  comment: string;
  date: string;
  featured: boolean;
}

export interface Lesson {
  id: string;
  sectionId: string;
  title: string;
  type: LessonType;
  videoUrl?: string;
  content?: string;
  resourceUrl?: string;
  durationMins: number;
  preview: boolean;
  order: number;
}

export interface Section {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnail: string;
  banner?: string;
  trailerUrl?: string;
  previewVideo?: string;
  price: number;
  comparePrice?: number;
  currency: string;
  level: CourseLevel;
  language: string;
  durationMins: number;
  benefits: string[];
  requirements: string[];
  faqs: Faq[];
  featured: boolean;
  published: boolean;
  rating: number;
  reviewCount: number;
  studentCount: number;
  instructorId: string;
  categoryId: string;
  tags: string[];
  downloadUrl?: string; // optional resource download link for enrolled students
  createdAt: string;
  updatedAt: string;
  sections: Section[];
}

export interface OrderNote {
  id: string;
  author: string;
  text: string;
  at: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  courseThumbnail: string;
  amount: number;
  discount: number;
  finalAmount: number;
  currency: string;
  status: OrderStatus;
  couponCode?: string;
  paymentRef?: string;
  paymentMethod?: string;
  notes: OrderNote[];
  timeline: { id: string; label: string; at: string; status: OrderStatus }[];
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  refundedAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  courseId?: string;
  startsAt: string;
  expiresAt?: string;
  usageLimit?: number;
  usedCount: number;
  perUserLimit: number;
  minAmount: number;
  active: boolean;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  completed: boolean;
  enrolledAt: string;
  lastViewedLessonId?: string;
  lastViewedAt?: string;
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  position: number;
}

export interface LessonNote {
  id: string;
  lessonId: string;
  courseId: string;
  content: string;
  timestamp: number;
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  id: string;
  lessonId: string;
  courseId: string;
  note?: string;
  timestamp: number;
  createdAt: string;
}

export interface Certificate {
  id: string;
  verifyId: string;
  userId: string;
  courseId: string;
  candidateName: string;
  courseTitle: string;
  instructorName: string;
  score: number;
  issuedAt: string;
}

export interface Notification {
  id: string;
  userId?: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: "ALL" | "STUDENTS";
  pinned: boolean;
  active: boolean;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  quote: string;
  rating: number;
  featured: boolean;
  order: number;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  authorName: string;
  authorAvatar?: string;
  category: string;
  tags: string[];
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED";
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  readingMins: number;
}

export interface ActivityLog {
  id: string;
  userId?: string;
  userName?: string;
  action: string;
  detail: string;
  ip?: string;
  createdAt: string;
}

export interface CartItem {
  courseId: string;
  addedAt: string;
}

export interface ApplyCouponResult {
  ok: boolean;
  message: string;
  discount: number;
  couponCode?: string;
}
