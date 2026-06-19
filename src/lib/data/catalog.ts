import type {
  BlogPost,
  Category,
  Course,
  Coupon,
  Instructor,
  Testimonial,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// CATEGORIES
// ---------------------------------------------------------------------------
export const categories: Category[] = [
  { id: "cat-dev", name: "Web Development", slug: "web-development", icon: "Code2", courseCount: 3 },
  { id: "cat-data", name: "Data Science", slug: "data-science", icon: "BarChart3", courseCount: 2 },
  { id: "cat-design", name: "Design", slug: "design", icon: "Palette", courseCount: 2 },
  { id: "cat-ai", name: "AI & Machine Learning", slug: "ai-ml", icon: "BrainCircuit", courseCount: 2 },
  { id: "cat-mkt", name: "Marketing", slug: "marketing", icon: "Megaphone", courseCount: 2 },
  { id: "cat-biz", name: "Business", slug: "business", icon: "Briefcase", courseCount: 2 },
];

// ---------------------------------------------------------------------------
// INSTRUCTORS
// ---------------------------------------------------------------------------
export const instructors: Instructor[] = [
  {
    id: "ins-1",
    name: "Aarav Mehta",
    title: "Principal Engineer, ex-Google",
    avatar: "https://i.pravatar.cc/200?img=12",
    bio: "15+ years building distributed systems at scale. Taught 40,000+ engineers across the globe.",
    rating: 4.9,
    students: 41200,
    courses: 6,
    expertise: ["System Design", "TypeScript", "Cloud Architecture"],
  },
  {
    id: "ins-2",
    name: "Priya Nair",
    title: "Senior Data Scientist, ex-Netflix",
    avatar: "https://i.pravatar.cc/200?img=47",
    bio: "Built recommendation engines serving 200M users. PhD in Statistics from IIT Bombay.",
    rating: 4.8,
    students: 28900,
    courses: 4,
    expertise: ["Python", "ML", "Statistics", "MLOps"],
  },
  {
    id: "ins-3",
    name: "Rohan Kapoor",
    title: "Design Lead, ex-Figma",
    avatar: "https://i.pravatar.cc/200?img=33",
    bio: "Product designer who shipped interfaces used by millions. Speaker at Config & Awwwards.",
    rating: 4.9,
    students: 19500,
    courses: 3,
    expertise: ["UI/UX", "Figma", "Design Systems"],
  },
  {
    id: "ins-4",
    name: "Sneha Reddy",
    title: "Growth Marketer, ex-Notion",
    avatar: "https://i.pravatar.cc/200?img=45",
    bio: "Scaled 0→1M users for 3 SaaS startups. Obsessed with conversion funnels and content engines.",
    rating: 4.7,
    students: 22300,
    courses: 4,
    expertise: ["Growth", "SEO", "Content", "Paid Ads"],
  },
  {
    id: "ins-5",
    name: "Vikram Joshi",
    title: "ML Researcher, ex-OpenAI",
    avatar: "https://i.pravatar.cc/200?img=15",
    bio: "Published 20+ papers on LLMs. Built production AI serving 50M requests/day.",
    rating: 4.9,
    students: 33800,
    courses: 5,
    expertise: ["LLMs", "PyTorch", "RAG", "Fine-tuning"],
  },
  {
    id: "ins-6",
    name: "Ananya Iyer",
    title: "Product Leader, ex-Stripe",
    avatar: "https://i.pravatar.cc/200?img=44",
    bio: "Launched 3 products to $10M+ ARR. Advisor to 12 YC startups on GTM strategy.",
    rating: 4.8,
    students: 16700,
    courses: 3,
    expertise: ["Product", "Strategy", "GTM"],
  },
];

export const instructorMap = Object.fromEntries(instructors.map((i) => [i.id, i]));

// ---------------------------------------------------------------------------
// COURSE BUILDER HELPERS
// ---------------------------------------------------------------------------
let _lessonSeq = 0;
function lesson(
  sectionId: string,
  title: string,
  type: "VIDEO" | "PDF" | "TEXT" | "DOWNLOAD",
  durationMins: number,
  opts: Partial<Course["sections"][number]["lessons"][number]> = {}
): Course["sections"][number]["lessons"][number] {
  _lessonSeq += 1;
  return {
    id: `lsn-${_lessonSeq}`,
    sectionId,
    title,
    type,
    durationMins,
    preview: opts.preview ?? false,
    order: _lessonSeq,
    videoUrl: type === "VIDEO" ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" : undefined,
    content: opts.content,
    resourceUrl: opts.resourceUrl,
  };
}

function section(
  courseId: string,
  title: string,
  description: string,
  lessons: Course["sections"][number]["lessons"][]
): Course["sections"][number] {
  return {
    id: `sec-${courseId}-${title.slice(0, 12).replace(/\s/g, "-").toLowerCase()}`,
    courseId,
    title,
    description,
    order: 0,
    lessons: lessons.map((l, i) => ({ ...l, order: i })),
  };
}

const COURSES_DATA: Array<
  Omit<Course, "sections"> & { sections: ReturnType<typeof section>[] }
> = [
  {
    id: "course-1",
    slug: "fullstack-nextjs-mastery",
    title: "Full-Stack Mastery with Next.js 16",
    subtitle: "Build, ship & scale production-grade web apps from zero to deploy",
    description:
      "The most comprehensive Next.js 16 course on the planet. Master the App Router, Server Components, Server Actions, streaming, caching, and deployment. By the end you will architect, build, and ship a full SaaS application to production — with authentication, payments, and a real database.",
    thumbnail: "https://picsum.photos/seed/nextjs-course/800/450",
    banner: "https://picsum.photos/seed/nextjs-banner/1600/500",
    trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    previewVideo: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    price: 4999,
    comparePrice: 12999,
    currency: "INR",
    level: "INTERMEDIATE",
    language: "English",
    durationMins: 1840,
    benefits: [
      "Architect production Next.js 16 apps with the App Router",
      "Master React Server Components & streaming UI",
      "Build a real SaaS with auth, DB, and payments",
      "Deploy to Vercel with edge runtime & ISR",
      "Write bulletproof TypeScript at scale",
      "Optimize Core Web Vitals to 95+ Lighthouse",
    ],
    requirements: [
      "Basic HTML, CSS & JavaScript",
      "A laptop with Node 20+ installed",
      "Willingness to build real projects",
    ],
    faqs: [
      { q: "How long do I have access?", a: "Lifetime access, including all future updates to the course." },
      { q: "Is there a certificate?", a: "Yes — a verifiable certificate is issued on 100% completion." },
      { q: "Do I need prior React experience?", a: "Basic React helps, but we cover everything from the ground up." },
    ],
    featured: true,
    published: true,
    rating: 4.9,
    reviewCount: 1284,
    studentCount: 9420,
    instructorId: "ins-1",
    categoryId: "cat-dev",
    tags: ["Next.js", "React", "TypeScript", "Full-Stack"],
    createdAt: "2024-08-12T10:00:00Z",
    updatedAt: "2025-01-20T10:00:00Z",
    sections: [],
  },
  {
    id: "course-2",
    slug: "data-science-bootcamp",
    title: "Data Science & Machine Learning Bootcamp",
    subtitle: "From Python basics to deploying ML models in production",
    description:
      "A career-defining bootcamp that takes you from Python fundamentals to deploying real machine learning models. Master pandas, scikit-learn, deep learning, and MLOps. Includes 5 capstone projects and a job-ready portfolio.",
    thumbnail: "https://picsum.photos/seed/datascience-course/800/450",
    banner: "https://picsum.photos/seed/datascience-banner/1600/500",
    trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    previewVideo: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    price: 6999,
    comparePrice: 19999,
    currency: "INR",
    level: "BEGINNER",
    language: "English",
    durationMins: 2640,
    benefits: [
      "Master Python, NumPy, pandas & visualization",
      "Build & train ML models with scikit-learn",
      "Deep learning with PyTorch",
      "Deploy models with FastAPI + Docker",
      "Complete 5 portfolio-ready projects",
      "Crack data science interviews with confidence",
    ],
    requirements: [
      "No prior coding experience required",
      "Basic math (high school level)",
      "A computer with 8GB+ RAM",
    ],
    faqs: [
      { q: "Is this beginner friendly?", a: "Absolutely — we start from Python basics and build up." },
      { q: "Will I get job help?", a: "Yes — resume reviews, mock interviews, and a portfolio review." },
    ],
    featured: true,
    published: true,
    rating: 4.8,
    reviewCount: 2103,
    studentCount: 15600,
    instructorId: "ins-2",
    categoryId: "cat-data",
    tags: ["Python", "Machine Learning", "Pandas", "PyTorch"],
    createdAt: "2024-06-01T10:00:00Z",
    updatedAt: "2025-02-05T10:00:00Z",
    sections: [],
  },
  {
    id: "course-3",
    slug: "ui-ux-design-masterclass",
    title: "UI/UX Design Masterclass 2025",
    subtitle: "Design beautiful, conversion-focused products in Figma",
    description:
      "Learn the exact design process used by teams at Figma, Linear, and Stripe. From research to wireframes to polished, animated prototypes — build a design portfolio that gets you hired.",
    thumbnail: "https://picsum.photos/seed/design-course/800/450",
    banner: "https://picsum.photos/seed/design-banner/1600/500",
    trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    previewVideo: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    price: 3499,
    comparePrice: 8999,
    currency: "INR",
    level: "BEGINNER",
    language: "English",
    durationMins: 1480,
    benefits: [
      "Master Figma from beginner to pro",
      "Build a design system from scratch",
      "Design conversion-focused landing pages",
      "Create animated, interactive prototypes",
      "Assemble a standout design portfolio",
      "Learn the UX research process end-to-end",
    ],
    requirements: ["A computer that runs Figma (free)", "No design experience needed"],
    faqs: [
      { q: "Do I need a paid Figma account?", a: "No — the free plan covers everything in the course." },
    ],
    featured: true,
    published: true,
    rating: 4.9,
    reviewCount: 876,
    studentCount: 7300,
    instructorId: "ins-3",
    categoryId: "cat-design",
    tags: ["Figma", "UI/UX", "Design Systems", "Prototyping"],
    createdAt: "2024-09-15T10:00:00Z",
    updatedAt: "2025-01-30T10:00:00Z",
    sections: [],
  },
  {
    id: "course-4",
    slug: "llm-engineering-rag",
    title: "LLM Engineering: RAG, Agents & Fine-Tuning",
    subtitle: "Ship production AI apps with retrieval, tools & fine-tuned models",
    description:
      "Go beyond the OpenAI playground. Build production-grade LLM applications with retrieval-augmented generation, tool-using agents, and fine-tuning. Includes vector databases, evals, and cost optimization.",
    thumbnail: "https://picsum.photos/seed/llm-course/800/450",
    banner: "https://picsum.photos/seed/llm-banner/1600/500",
    trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    previewVideo: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    price: 7999,
    comparePrice: 24999,
    currency: "INR",
    level: "ADVANCED",
    language: "English",
    durationMins: 2160,
    benefits: [
      "Build RAG pipelines with vector databases",
      "Create tool-using autonomous agents",
      "Fine-tune open-source LLMs",
      "Set up evals & guardrails",
      "Optimize for latency & cost",
      "Deploy AI apps to production",
    ],
    requirements: [
      "Comfortable with Python",
      "Basic understanding of ML concepts",
      "Familiarity with APIs",
    ],
    faqs: [
      { q: "Do I need an OpenAI API key?", a: "We show you how to use both OpenAI and open-source models." },
    ],
    featured: true,
    published: true,
    rating: 4.9,
    reviewCount: 542,
    studentCount: 4100,
    instructorId: "ins-5",
    categoryId: "cat-ai",
    tags: ["LLM", "RAG", "AI", "PyTorch", "OpenAI"],
    createdAt: "2024-11-01T10:00:00Z",
    updatedAt: "2025-02-10T10:00:00Z",
    sections: [],
  },
  {
    id: "course-5",
    slug: "growth-marketing-pro",
    title: "Growth Marketing Pro: 0 to 1M Users",
    subtitle: "The complete playbook to acquire, activate & retain users",
    description:
      "The exact frameworks used to scale startups from zero to a million users. Master SEO, content engines, paid acquisition, lifecycle email, and analytics. Includes 30+ templates and swipe files.",
    thumbnail: "https://picsum.photos/seed/marketing-course/800/450",
    banner: "https://picsum.photos/seed/marketing-banner/1600/500",
    trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    previewVideo: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    price: 2999,
    comparePrice: 7999,
    currency: "INR",
    level: "INTERMEDIATE",
    language: "English",
    durationMins: 1320,
    benefits: [
      "Build a content engine that compounds",
      "Master SEO from keyword to ranking",
      "Run profitable paid ad campaigns",
      "Design lifecycle email flows",
      "Set up analytics & attribution",
      "Get 30+ proven templates & swipe files",
    ],
    requirements: ["Basic marketing knowledge", "A product or idea to market"],
    faqs: [{ q: "Is this for B2B or B2C?", a: "Both — we cover frameworks applicable to each." }],
    featured: false,
    published: true,
    rating: 4.7,
    reviewCount: 634,
    studentCount: 5200,
    instructorId: "ins-4",
    categoryId: "cat-mkt",
    tags: ["Marketing", "SEO", "Growth", "Content"],
    createdAt: "2024-07-20T10:00:00Z",
    updatedAt: "2025-01-10T10:00:00Z",
    sections: [],
  },
  {
    id: "course-6",
    slug: "system-design-interview",
    title: "System Design Interview: Crack FAANG",
    subtitle: "Master distributed systems & ace your next senior interview",
    description:
      "The definitive system design course. Learn to design scalable systems like YouTube, Uber, and WhatsApp. Includes 20+ real interview questions with detailed solutions and a mock interview playbook.",
    thumbnail: "https://picsum.photos/seed/systemdesign-course/800/450",
    banner: "https://picsum.photos/seed/systemdesign-banner/1600/500",
    trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    previewVideo: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    price: 5999,
    comparePrice: 14999,
    currency: "INR",
    level: "ADVANCED",
    language: "English",
    durationMins: 1980,
    benefits: [
      "Design scalable systems end-to-end",
      "Master caching, sharding & queues",
      "Solve 20+ real interview problems",
      "Build a repeatable interview framework",
      "Negotiate senior offers with confidence",
    ],
    requirements: ["2+ years software experience", "Basic backend knowledge"],
    faqs: [{ q: "Will this help with L5/L6 interviews?", a: "Yes — calibrated for senior/staff level loops." }],
    featured: false,
    published: true,
    rating: 4.8,
    reviewCount: 412,
    studentCount: 3800,
    instructorId: "ins-1",
    categoryId: "cat-dev",
    tags: ["System Design", "Interview", "Distributed Systems"],
    createdAt: "2024-10-05T10:00:00Z",
    updatedAt: "2025-01-25T10:00:00Z",
    sections: [],
  },
  {
    id: "course-7",
    slug: "product-management-essentials",
    title: "Product Management Essentials",
    subtitle: "From discovery to launch — ship products users love",
    description:
      "A practical PM course covering discovery, roadmapping, prioritization, metrics, and stakeholder management. Built with frameworks from Stripe, Notion, and Linear. Includes a capstone product strategy.",
    thumbnail: "https://picsum.photos/seed/product-course/800/450",
    banner: "https://picsum.photos/seed/product-banner/1600/500",
    trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    previewVideo: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    price: 3999,
    comparePrice: 9999,
    currency: "INR",
    level: "INTERMEDIATE",
    language: "English",
    durationMins: 1180,
    benefits: [
      "Run product discovery the right way",
      "Build roadmaps stakeholders trust",
      "Prioritize with proven frameworks",
      "Define & track north-star metrics",
      "Manage up, down & across",
    ],
    requirements: ["Some product or business exposure"],
    faqs: [{ q: "Is this for aspiring PMs?", a: "Yes — also great for PMs in their first 2 years." }],
    featured: false,
    published: true,
    rating: 4.7,
    reviewCount: 318,
    studentCount: 2900,
    instructorId: "ins-6",
    categoryId: "cat-biz",
    tags: ["Product Management", "Strategy", "Metrics"],
    createdAt: "2024-12-01T10:00:00Z",
    updatedAt: "2025-02-01T10:00:00Z",
    sections: [],
  },
  {
    id: "course-8",
    slug: "advanced-tailwind-design",
    title: "Advanced Tailwind CSS & Modern UI Design",
    subtitle: "Craft stunning, accessible interfaces with Tailwind v4",
    description:
      "Level up your frontend craft. Master Tailwind v4, design tokens, glassmorphism, animations, and accessible component patterns. Build a premium SaaS dashboard from scratch.",
    thumbnail: "https://picsum.photos/seed/tailwind-course/800/450",
    banner: "https://picsum.photos/seed/tailwind-banner/1600/500",
    trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    previewVideo: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    price: 2499,
    comparePrice: 5999,
    currency: "INR",
    level: "INTERMEDIATE",
    language: "English",
    durationMins: 940,
    benefits: [
      "Master Tailwind v4 & the new engine",
      "Build a design token system",
      "Craft glassmorphism & modern effects",
      "Animate with Framer Motion",
      "Ship an accessible SaaS dashboard",
    ],
    requirements: ["HTML & CSS basics", "Some React experience"],
    faqs: [{ q: "Do you cover dark mode?", a: "Yes — full dark mode with system detection." }],
    featured: false,
    published: true,
    rating: 4.8,
    reviewCount: 521,
    studentCount: 4600,
    instructorId: "ins-3",
    categoryId: "cat-design",
    tags: ["Tailwind", "CSS", "UI", "Animation"],
    createdAt: "2024-09-28T10:00:00Z",
    updatedAt: "2025-01-18T10:00:00Z",
    sections: [],
  },
];

function buildSections(course: (typeof COURSES_DATA)[number]) {
  const cid = course.id;
  switch (cid) {
    case "course-1":
      return [
        section(cid, "Foundations of Next.js 16", "Get productive with the App Router fast.", [
          lesson(cid, "Welcome & Course Roadmap", "VIDEO", 8, { preview: true }),
          lesson(cid, "Project Setup & Tooling", "VIDEO", 22),
          lesson(cid, "The App Router Mental Model", "VIDEO", 28),
          lesson(cid, "Routing, Layouts & Templates", "VIDEO", 34),
          lesson(cid, "Lab: Build a Marketing Site", "VIDEO", 45),
        ]),
        section(cid, "Data & Server Components", "Fetch data the right way.", [
          lesson(cid, "Server vs Client Components", "VIDEO", 30),
          lesson(cid, "Fetching & Caching Data", "VIDEO", 36),
          lesson(cid, "Streaming & Suspense", "VIDEO", 24),
          lesson(cid, "Cheat Sheet: Data Fetching", "PDF", 5, { resourceUrl: "#" }),
        ]),
        section(cid, "Auth, DB & Server Actions", "Build a real backend.", [
          lesson(cid, "Database with Prisma", "VIDEO", 40),
          lesson(cid, "Authentication Patterns", "VIDEO", 38),
          lesson(cid, "Server Actions Deep Dive", "VIDEO", 32),
          lesson(cid, "Lab: Build a SaaS App", "VIDEO", 60),
        ]),
        section(cid, "Deploy & Optimize", "Ship to production.", [
          lesson(cid, "Deploying to Vercel", "VIDEO", 18),
          lesson(cid, "Edge Runtime & ISR", "VIDEO", 26),
          lesson(cid, "Core Web Vitals 95+", "VIDEO", 30),
          lesson(cid, "Capstone Project Brief", "DOWNLOAD", 4, { resourceUrl: "#" }),
        ]),
      ];
    case "course-2":
      return [
        section(cid, "Python for Data Science", "From zero to confident.", [
          lesson(cid, "Why Data Science in 2025", "VIDEO", 10, { preview: true }),
          lesson(cid, "Python Crash Course", "VIDEO", 45),
          lesson(cid, "NumPy Essentials", "VIDEO", 38),
          lesson(cid, "pandas Deep Dive", "VIDEO", 52),
        ]),
        section(cid, "Statistics & Visualization", "Make sense of data.", [
          lesson(cid, "Descriptive Statistics", "VIDEO", 34),
          lesson(cid, "Probability Distributions", "VIDEO", 40),
          lesson(cid, "Matplotlib & Seaborn", "VIDEO", 36),
          lesson(cid, "EDA Project", "VIDEO", 50),
        ]),
        section(cid, "Machine Learning", "Train your first models.", [
          lesson(cid, "Regression & Classification", "VIDEO", 48),
          lesson(cid, "scikit-learn in Practice", "VIDEO", 42),
          lesson(cid, "Model Evaluation", "VIDEO", 30),
          lesson(cid, "Capstone: Predict House Prices", "VIDEO", 55),
        ]),
        section(cid, "Deep Learning & Deployment", "Go pro.", [
          lesson(cid, "Neural Networks with PyTorch", "VIDEO", 60),
          lesson(cid, "Deploying Models with FastAPI", "VIDEO", 45),
          lesson(cid, "MLOps Basics", "VIDEO", 38),
        ]),
      ];
    case "course-3":
      return [
        section(cid, "Design Fundamentals", "Think like a designer.", [
          lesson(cid, "The Design Process", "VIDEO", 12, { preview: true }),
          lesson(cid, "Color, Type & Spacing", "VIDEO", 28),
          lesson(cid, "Visual Hierarchy", "VIDEO", 22),
        ]),
        section(cid, "Figma Mastery", "Become fast & fluent.", [
          lesson(cid, "Figma Interface Tour", "VIDEO", 18),
          lesson(cid, "Auto Layout & Components", "VIDEO", 40),
          lesson(cid, "Variants & Design Tokens", "VIDEO", 32),
          lesson(cid, "Prototyping & Animation", "VIDEO", 36),
        ]),
        section(cid, "Building a Design System", "Scale your craft.", [
          lesson(cid, "Tokens & Themes", "VIDEO", 30),
          lesson(cid, "Component Library", "VIDEO", 44),
          lesson(cid, "Documentation", "VIDEO", 20),
        ]),
        section(cid, "Portfolio & Career", "Get hired.", [
          lesson(cid, "Portfolio Case Studies", "VIDEO", 34),
          lesson(cid, "Interview Prep", "VIDEO", 28),
        ]),
      ];
    case "course-4":
      return [
        section(cid, "LLM Foundations", "Understand the stack.", [
          lesson(cid, "How LLMs Work", "VIDEO", 22, { preview: true }),
          lesson(cid, "Tokens, Embeddings & Context", "VIDEO", 30),
          lesson(cid, "Prompt Engineering Patterns", "VIDEO", 28),
        ]),
        section(cid, "Retrieval-Augmented Generation", "Ground your models.", [
          lesson(cid, "Vector Databases", "VIDEO", 34),
          lesson(cid, "Building a RAG Pipeline", "VIDEO", 46),
          lesson(cid, "Chunking & Retrieval Strategies", "VIDEO", 38),
          lesson(cid, "Lab: Docs Q&A Bot", "VIDEO", 50),
        ]),
        section(cid, "Agents & Tools", "Build autonomous systems.", [
          lesson(cid, "Tool-Using Agents", "VIDEO", 40),
          lesson(cid, "Multi-Agent Orchestration", "VIDEO", 44),
          lesson(cid, "Memory & Planning", "VIDEO", 32),
        ]),
        section(cid, "Fine-Tuning & Production", "Ship it.", [
          lesson(cid, "Fine-Tuning Open Models", "VIDEO", 52),
          lesson(cid, "Evals & Guardrails", "VIDEO", 36),
          lesson(cid, "Cost & Latency Optimization", "VIDEO", 30),
        ]),
      ];
    case "course-5":
      return [
        section(cid, "Growth Foundations", "The GTM mindset.", [
          lesson(cid, "The Growth Funnel", "VIDEO", 14, { preview: true }),
          lesson(cid, "Setting North-Star Metrics", "VIDEO", 22),
        ]),
        section(cid, "SEO & Content", "Build a compounding engine.", [
          lesson(cid, "Keyword Research", "VIDEO", 30),
          lesson(cid, "Content That Ranks", "VIDEO", 34),
          lesson(cid, "Technical SEO", "VIDEO", 28),
        ]),
        section(cid, "Paid Acquisition", "Buy growth profitably.", [
          lesson(cid, "Google & Meta Ads", "VIDEO", 40),
          lesson(cid, "Creative Testing", "VIDEO", 26),
          lesson(cid, "Attribution", "VIDEO", 24),
        ]),
        section(cid, "Lifecycle & Retention", "Keep users coming back.", [
          lesson(cid, "Email & Lifecycle Flows", "VIDEO", 32),
          lesson(cid, "Retention Frameworks", "VIDEO", 28),
        ]),
      ];
    case "course-6":
      return [
        section(cid, "System Design Primer", "The fundamentals.", [
          lesson(cid, "What Interviewers Evaluate", "VIDEO", 16, { preview: true }),
          lesson(cid, "A Repeatable Framework", "VIDEO", 24),
        ]),
        section(cid, "Core Concepts", "Building blocks.", [
          lesson(cid, "Scaling & Load Balancing", "VIDEO", 34),
          lesson(cid, "Caching Strategies", "VIDEO", 30),
          lesson(cid, "Databases & Sharding", "VIDEO", 38),
          lesson(cid, "Queues & Async Processing", "VIDEO", 28),
        ]),
        section(cid, "Real Interview Problems", "Practice makes perfect.", [
          lesson(cid, "Design YouTube", "VIDEO", 48),
          lesson(cid, "Design Uber", "VIDEO", 44),
          lesson(cid, "Design WhatsApp", "VIDEO", 42),
          lesson(cid, "Design a Rate Limiter", "VIDEO", 30),
        ]),
      ];
    case "course-7":
      return [
        section(cid, "Product Discovery", "Find problems worth solving.", [
          lesson(cid, "The PM Role", "VIDEO", 12, { preview: true }),
          lesson(cid, "Customer Interviews", "VIDEO", 26),
          lesson(cid, "Opportunity Solution Tree", "VIDEO", 24),
        ]),
        section(cid, "Roadmapping & Prioritization", "Plan with confidence.", [
          lesson(cid, "Roadmaps That Work", "VIDEO", 28),
          lesson(cid, "Prioritization Frameworks", "VIDEO", 24),
        ]),
        section(cid, "Metrics & Launch", "Ship & measure.", [
          lesson(cid, "North-Star & Input Metrics", "VIDEO", 22),
          lesson(cid, "Go-To-Market", "VIDEO", 26),
          lesson(cid, "Stakeholder Management", "VIDEO", 24),
        ]),
      ];
    case "course-8":
      return [
        section(cid, "Tailwind v4 Engine", "The new way.", [
          lesson(cid, "Why Tailwind v4", "VIDEO", 14, { preview: true }),
          lesson(cid, "Config-Less Setup", "VIDEO", 20),
          lesson(cid, "Design Tokens in CSS", "VIDEO", 26),
        ]),
        section(cid, "Modern UI Patterns", "Craft premium interfaces.", [
          lesson(cid, "Glassmorphism & Gradients", "VIDEO", 28),
          lesson(cid, "Dark Mode Done Right", "VIDEO", 22),
          lesson(cid, "Responsive by Default", "VIDEO", 24),
        ]),
        section(cid, "Animation & Components", "Bring it to life.", [
          lesson(cid, "Framer Motion Essentials", "VIDEO", 32),
          lesson(cid, "Accessible Components", "VIDEO", 30),
          lesson(cid, "Lab: SaaS Dashboard", "VIDEO", 50),
        ]),
      ];
    default:
      return [
        section(cid, "Getting Started", "Begin here.", [
          lesson(cid, "Welcome", "VIDEO", 8, { preview: true }),
          lesson(cid, "Course Overview", "VIDEO", 12),
        ]),
      ];
  }
}

export const courses: Course[] = COURSES_DATA.map((c) => ({
  ...c,
  sections: buildSections(c),
}));

export const courseMap = Object.fromEntries(courses.map((c) => [c.id, c]));
export const courseBySlug = Object.fromEntries(courses.map((c) => [c.slug, c]));

export function courseStats(course: Course) {
  const lessonCount = course.sections.reduce((n, s) => n + s.lessons.length, 0);
  const duration = course.sections.reduce(
    (n, s) => n + s.lessons.reduce((m, l) => m + l.durationMins, 0),
    0
  );
  return { lessonCount, duration };
}

// ---------------------------------------------------------------------------
// TESTIMONIALS
// ---------------------------------------------------------------------------
export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Karthik R.",
    role: "Senior Engineer @ Atlassian",
    avatar: "https://i.pravatar.cc/120?img=8",
    quote:
      "I went from a junior dev to a senior engineer at Atlassian in 14 months. The Next.js course alone was worth 10x the price.",
    rating: 5,
    featured: true,
    order: 1,
  },
  {
    id: "t2",
    name: "Divya S.",
    role: "Data Scientist @ Swiggy",
    avatar: "https://i.pravatar.cc/120?img=41",
    quote:
      "The data science bootcamp got me my dream job. The capstone projects became my entire interview portfolio.",
    rating: 5,
    featured: true,
    order: 2,
  },
  {
    id: "t3",
    name: "Arjun P.",
    role: "Founder @ LumenAI",
    avatar: "https://i.pravatar.cc/120?img=14",
    quote:
      "The LLM engineering course let me ship our RAG product in 3 weeks. The production patterns are gold.",
    rating: 5,
    featured: true,
    order: 3,
  },
  {
    id: "t4",
    name: "Meera K.",
    role: "Product Designer @ Razorpay",
    avatar: "https://i.pravatar.cc/120?img=49",
    quote:
      "Best design course I've taken. The Figma mastery section completely transformed my workflow.",
    rating: 5,
    featured: true,
    order: 4,
  },
  {
    id: "t5",
    name: "Rahul V.",
    role: "Growth Lead @ Cred",
    avatar: "https://i.pravatar.cc/120?img=11",
    quote:
      "We 3x'd our signups in 60 days using the SEO framework from this course. Undeniable ROI.",
    rating: 5,
    featured: true,
    order: 5,
  },
  {
    id: "t6",
    name: "Ishita G.",
    role: "PM @ PhonePe",
    avatar: "https://i.pravatar.cc/120?img=32",
    quote:
      "The PM course gave me the frameworks I use every single day. Promoted to Sr PM within a year.",
    rating: 5,
    featured: true,
    order: 6,
  },
];

// ---------------------------------------------------------------------------
// COUPONS
// ---------------------------------------------------------------------------
export const coupons: Coupon[] = [
  {
    id: "cp-1",
    code: "WELCOME50",
    type: "PERCENT",
    value: 50,
    startsAt: "2025-01-01T00:00:00Z",
    expiresAt: "2026-12-31T23:59:59Z",
    usageLimit: 1000,
    usedCount: 142,
    perUserLimit: 1,
    minAmount: 0,
    active: true,
  },
  {
    id: "cp-2",
    code: "SAVE1000",
    type: "FIXED",
    value: 1000,
    startsAt: "2025-01-01T00:00:00Z",
    expiresAt: "2026-12-31T23:59:59Z",
    usageLimit: 500,
    usedCount: 88,
    perUserLimit: 1,
    minAmount: 2999,
    active: true,
  },
  {
    id: "cp-3",
    code: "LAUNCH25",
    type: "PERCENT",
    value: 25,
    courseId: "course-4",
    startsAt: "2025-01-01T00:00:00Z",
    expiresAt: "2026-12-31T23:59:59Z",
    usageLimit: 200,
    usedCount: 33,
    perUserLimit: 1,
    minAmount: 0,
    active: true,
  },
  {
    id: "cp-4",
    code: "EXPIRED10",
    type: "PERCENT",
    value: 10,
    startsAt: "2024-01-01T00:00:00Z",
    expiresAt: "2024-06-30T23:59:59Z",
    usedCount: 50,
    perUserLimit: 1,
    minAmount: 0,
    active: false,
  },
];

export const couponMap = Object.fromEntries(coupons.map((c) => [c.code, c]));

// ---------------------------------------------------------------------------
// BLOG POSTS
// ---------------------------------------------------------------------------
export const blogPosts: BlogPost[] = [
  {
    id: "bp-1",
    slug: "why-server-components-change-everything",
    title: "Why React Server Components Change Everything",
    excerpt:
      "RSCs are the biggest shift in React's history. Here's a practical mental model for thinking about server and client components.",
    content:
      "## The Mental Shift\n\nReact Server Components (RSC) blur the line between server and client. Instead of choosing 'frontend' or 'backend,' you choose per-component where code runs.\n\n### The Rule of Thumb\n\n- **Server Components** fetch data, render static markup, and never ship JS to the client.\n- **Client Components** handle interactivity, state, and browser APIs.\n\n### When to Use Which\n\nDefault to Server Components. Reach for `'use client'` only when you need state, effects, or event handlers.\n\n> Ship less JavaScript. Render faster. Rank higher.\n\n## Conclusion\n\nRSCs let you build rich apps that stay fast. Master the boundary and you master modern React.",
    coverImage: "https://picsum.photos/seed/blog-rsc/1200/600",
    authorName: "Aarav Mehta",
    authorAvatar: "https://i.pravatar.cc/120?img=12",
    category: "Web Development",
    tags: ["React", "Next.js", "RSC"],
    status: "PUBLISHED",
    publishedAt: "2025-01-22T10:00:00Z",
    createdAt: "2025-01-22T10:00:00Z",
    updatedAt: "2025-01-22T10:00:00Z",
    views: 8420,
    readingMins: 6,
  },
  {
    id: "bp-2",
    slug: "rag-vs-finetuning-when-to-use-what",
    title: "RAG vs Fine-Tuning: When to Use What",
    excerpt:
      "The two most powerful techniques for customizing LLMs are often confused. Here's a decision framework.",
    content:
      "## The Short Answer\n\nUse **RAG** when your data changes often or you need citations. Use **fine-tuning** when you need to change the model's style, tone, or format.\n\n### RAG Strengths\n\n- Always up-to-date\n- Source attribution\n- No GPU training needed\n\n### Fine-Tuning Strengths\n\n- Style & format control\n- Lower latency at inference\n- Cheaper per-token after training\n\n## A Practical Framework\n\n1. Start with prompt engineering\n2. Add RAG for knowledge\n3. Fine-tune for behavior\n\n> Don't fine-tune what RAG can solve.",
    coverImage: "https://picsum.photos/seed/blog-llm/1200/600",
    authorName: "Vikram Joshi",
    authorAvatar: "https://i.pravatar.cc/120?img=15",
    category: "AI & Machine Learning",
    tags: ["LLM", "RAG", "Fine-tuning"],
    status: "PUBLISHED",
    publishedAt: "2025-02-08T10:00:00Z",
    createdAt: "2025-02-08T10:00:00Z",
    updatedAt: "2025-02-08T10:00:00Z",
    views: 6230,
    readingMins: 5,
  },
  {
    id: "bp-3",
    slug: "design-tokens-that-scale",
    title: "Design Tokens That Actually Scale",
    excerpt:
      "Most token systems break at scale. Here's how to structure yours so it survives a 50-person team.",
    content:
      "## The Three Layers\n\n1. **Primitive** — raw values (`emerald-500`)\n2. **Semantic** — meaning (`color-success`)\n3. **Component** — usage (`button-bg-success`)\n\n### Why This Matters\n\nSemantic tokens let you retheme without touching components. Component tokens let you rebrand without touching primitives.\n\n## Conclusion\n\nThe secret to scaling design systems is indirection.",
    coverImage: "https://picsum.photos/seed/blog-design/1200/600",
    authorName: "Rohan Kapoor",
    authorAvatar: "https://i.pravatar.cc/120?img=33",
    category: "Design",
    tags: ["Design Systems", "Tokens", "Figma"],
    status: "PUBLISHED",
    publishedAt: "2025-01-30T10:00:00Z",
    createdAt: "2025-01-30T10:00:00Z",
    updatedAt: "2025-01-30T10:00:00Z",
    views: 4510,
    readingMins: 4,
  },
  {
    id: "bp-4",
    slug: "seo-content-engine-playbook",
    title: "The SEO Content Engine Playbook",
    excerpt:
      "How we built a content engine that drove 1M organic visits in 12 months — and how you can too.",
    content:
      "## The Engine\n\nGreat SEO content is a system, not an accident. It has four parts:\n\n1. **Keyword research** — find demand\n2. **Content production** — meet demand\n3. **Technical SEO** — be crawlable\n4. **Link building** — earn authority\n\n## The 80/20\n\n80% of results come from topic clusters. Build a pillar page, then 10 supporting articles that all link back.\n\n> Compound content beats viral content every time.",
    coverImage: "https://picsum.photos/seed/blog-seo/1200/600",
    authorName: "Sneha Reddy",
    authorAvatar: "https://i.pravatar.cc/120?img=45",
    category: "Marketing",
    tags: ["SEO", "Content", "Growth"],
    status: "PUBLISHED",
    publishedAt: "2025-02-01T10:00:00Z",
    createdAt: "2025-02-01T10:00:00Z",
    updatedAt: "2025-02-01T10:00:00Z",
    views: 5180,
    readingMins: 7,
  },
];

export const blogBySlug = Object.fromEntries(blogPosts.map((b) => [b.slug, b]));

// ---------------------------------------------------------------------------
// PUBLIC FAQ (landing page)
// ---------------------------------------------------------------------------
export const siteFaqs = [
  {
    q: "How does course access work?",
    a: "Once your enrollment is approved, you get instant, lifetime access to all lessons, resources, and future updates — on web and mobile.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Payments are verified securely through our external verification system. After payment, submit your transaction reference and our team verifies and grants access — typically within minutes.",
  },
  {
    q: "Do I get a certificate?",
    a: "Yes! Complete any course to earn a verifiable digital certificate with a unique verification ID, downloadable as PDF.",
  },
  {
    q: "Can I get a refund?",
    a: "We offer a 7-day no-questions-asked refund window. If a course isn't right for you, request a refund from your dashboard.",
  },
  {
    q: "Are there EMI options?",
    a: "Yes — most courses above ₹2,999 support 3 and 6-month no-cost EMI through our payment partner.",
  },
  {
    q: "Do courses work on mobile?",
    a: "Absolutely. The entire learning experience is mobile-optimized with offline-friendly lesson formats.",
  },
];

// ---------------------------------------------------------------------------
// PLATFORM STATS
// ---------------------------------------------------------------------------
export const platformStats = {
  students: 95000,
  courses: courses.length,
  instructors: instructors.length,
  countries: 42,
  rating: 4.8,
  completionRate: 87,
  hoursOfContent: Math.round(
    courses.reduce((n, c) => n + c.durationMins, 0) / 60
  ),
};

export const featuredReviews = [
  {
    id: "r1",
    userName: "Sanjay M.",
    userAvatar: "https://i.pravatar.cc/80?img=5",
    courseId: "course-1",
    rating: 5,
    comment: "Genuinely the best course I've taken. The production quality and depth are unmatched.",
    date: "2025-02-01",
    featured: true,
  },
  {
    id: "r2",
    userName: "Fatima A.",
    userAvatar: "https://i.pravatar.cc/80?img=25",
    courseId: "course-2",
    rating: 5,
    comment: "Landed a data scientist role at a unicorn. The capstones were exactly what recruiters wanted to see.",
    date: "2025-01-28",
    featured: true,
  },
  {
    id: "r3",
    userName: "Nikhil T.",
    userAvatar: "https://i.pravatar.cc/80?img=18",
    courseId: "course-6",
    rating: 5,
    comment: "Cleared my staff engineer loop at Meta. The system design framework is gold.",
    date: "2025-02-03",
    featured: true,
  },
];
