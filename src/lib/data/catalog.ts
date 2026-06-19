import type {
  BlogPost,
  Category,
  Course,
  Coupon,
  Instructor,
  Testimonial,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// CATEGORIES — Ethical Hacking domains
// ---------------------------------------------------------------------------
export const categories: Category[] = [
  { id: "cat-web", name: "Web Hacking", slug: "web-hacking", icon: "Globe", courseCount: 2 },
  { id: "cat-net", name: "Network Security", slug: "network-security", icon: "Network", courseCount: 2 },
  { id: "cat-bounty", name: "Bug Bounty", slug: "bug-bounty", icon: "Bug", courseCount: 2 },
  { id: "cat-exploit", name: "Exploit Dev", slug: "exploit-dev", icon: "Cpu", courseCount: 1 },
  { id: "cat-redteam", name: "Red Teaming", slug: "red-teaming", icon: "Swords", courseCount: 1 },
  { id: "cat-forensic", name: "Forensics", slug: "forensics", icon: "Search", courseCount: 1 },
];

// ---------------------------------------------------------------------------
// INSTRUCTORS — Elite hackers & security researchers
// ---------------------------------------------------------------------------
export const instructors: Instructor[] = [
  {
    id: "ins-1",
    name: "Ghost404",
    title: "OSCP, OSCE3 — ex-Tesla Security",
    avatar: "https://i.pravatar.cc/200?img=68",
    bio: "10+ years breaking into Fortune 500 systems legally. Reported 300+ critical CVEs. Top 1% on HackerOne.",
    rating: 4.9,
    students: 38400,
    courses: 5,
    expertise: ["Web Exploitation", "Burp Suite", "OWASP Top 10"],
  },
  {
    id: "ins-2",
    name: "Nyx Cipher",
    title: "Red Team Lead, ex-NSA TAO",
    avatar: "https://i.pravatar.cc/200?img=45",
    bio: "Former offensive security operator. Led red team engagements against banks, govts & critical infrastructure.",
    rating: 4.9,
    students: 22100,
    courses: 4,
    expertise: ["Red Teaming", "AD Exploitation", "C2 Frameworks"],
  },
  {
    id: "ins-3",
    name: "Binary Reaper",
    title: "Exploit Developer, Pwn2Own Winner",
    avatar: "https://i.pravatar.cc/200?img=33",
    bio: "Pwn2Own champion 2023. Discoverer of 40+ kernel-level zero-days. Writes shellcode in his sleep.",
    rating: 5.0,
    students: 14600,
    courses: 3,
    expertise: ["Binary Exploitation", "Reverse Engineering", "Shellcode"],
  },
  {
    id: "ins-4",
    name: "ShadowByte",
    title: "Bug Bounty Hunter — $2M+ earned",
    avatar: "https://i.pravatar.cc/200?img=12",
    bio: "Top 10 HackerOne all-time. Earned $2M+ in bounties from Google, Meta, Apple & Microsoft.",
    rating: 4.8,
    students: 31900,
    courses: 4,
    expertise: ["Bug Bounty", "Recon", "Logic Flaws"],
  },
  {
    id: "ins-5",
    name: "NullRoute",
    title: "Network Pentester, CISSP, CEH",
    avatar: "https://i.pravatar.cc/200?img=15",
    bio: "20 years in network security. Penetrated 500+ enterprise networks. Author of 3 O'Reilly books.",
    rating: 4.7,
    students: 25700,
    courses: 3,
    expertise: ["Network Pentesting", "Nmap", "Metasploit"],
  },
  {
    id: "ins-6",
    name: "V3nom",
    title: "Mobile Security Researcher",
    avatar: "https://i.pravatar.cc/200?img=44",
    bio: "Found 60+ critical bugs in Android/iOS apps of top fintechs. Speaker at DEF CON & Black Hat.",
    rating: 4.8,
    students: 12800,
    courses: 2,
    expertise: ["Android Hacking", "iOS Pentesting", "Frida"],
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
    slug: "ethical-hacking-bootcamp",
    title: "Ethical Hacking Bootcamp: Zero to Hero",
    subtitle: "Go from complete beginner to job-ready ethical hacker in 12 weeks",
    description:
      "The most complete ethical hacking bootcamp on the internet. Master reconnaissance, scanning, exploitation, post-exploitation, and reporting. Built for absolute beginners — by the end you'll be ready for the OSCP exam and real-world pentest jobs.",
    thumbnail: "https://picsum.photos/seed/hack-bootcamp/800/450",
    banner: "https://picsum.photos/seed/hack-bootcamp-b/1600/500",
    trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    previewVideo: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    price: 4999,
    comparePrice: 14999,
    currency: "INR",
    level: "BEGINNER",
    language: "English",
    durationMins: 2400,
    benefits: [
      "Master the full pentest methodology (PTES)",
      "Set up a pro hacking lab with Kali Linux",
      "Exploit real systems with Metasploit",
      "Crack passwords & escalate privileges",
      "Get OSCP-exam ready with mock tests",
      "Build a portfolio of 5 pentest reports",
    ],
    requirements: [
      "A PC with 8GB+ RAM (16GB recommended)",
      "Basic computer literacy — no coding needed",
      "Willingness to learn fast & break things (legally)",
    ],
    faqs: [
      { q: "Do I need programming experience?", a: "No — we teach the bash & Python you need from scratch." },
      { q: "Is this legal?", a: "100%. Everything is done in isolated labs you control. We cover ethics & law in depth." },
      { q: "Will this prep me for OSCP?", a: "Yes — the curriculum maps directly to OSCP exam objectives." },
    ],
    featured: true,
    published: true,
    rating: 4.9,
    reviewCount: 1842,
    studentCount: 14200,
    instructorId: "ins-1",
    categoryId: "cat-web",
    tags: ["Ethical Hacking", "Kali Linux", "Metasploit", "OSCP"],
    createdAt: "2024-08-12T10:00:00Z",
    updatedAt: "2025-03-20T10:00:00Z",
    sections: [],
  },
  {
    id: "course-2",
    slug: "web-application-pentesting",
    title: "Web Application Penetration Testing",
    subtitle: "Master OWASP Top 10 & hack real web apps like a pro",
    description:
      "The definitive web app pentesting course. Learn to find and exploit SQL injection, XSS, CSRF, SSRF, IDOR, auth bypass, and business logic flaws. Includes 20+ vulnerable labs and a real bug-bounty-style capstone.",
    thumbnail: "https://picsum.photos/seed/hack-web/800/450",
    banner: "https://picsum.photos/seed/hack-web-b/1600/500",
    trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    previewVideo: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    price: 5999,
    comparePrice: 18999,
    currency: "INR",
    level: "INTERMEDIATE",
    language: "English",
    durationMins: 1980,
    benefits: [
      "Master Burp Suite like a professional",
      "Exploit all OWASP Top 10 vulnerabilities",
      "Bypass WAFs & authentication systems",
      "Chain bugs into critical-severity finds",
      "Write reports clients actually pay for",
      "Hack 20+ real vulnerable labs",
    ],
    requirements: [
      "Basic HTTP & web fundamentals",
      "Familiarity with browser dev tools",
      "A laptop that can run a VM",
    ],
    faqs: [
      { q: "Do I need to know Python?", a: "Helpful but not required — we provide scripts you can use." },
      { q: "Are labs included?", a: "Yes — 20+ dedicated labs plus DVWA, WebGoat & custom targets." },
    ],
    featured: true,
    published: true,
    rating: 4.9,
    reviewCount: 1203,
    studentCount: 9800,
    instructorId: "ins-1",
    categoryId: "cat-web",
    tags: ["Web Pentesting", "Burp Suite", "OWASP", "SQLi", "XSS"],
    createdAt: "2024-06-01T10:00:00Z",
    updatedAt: "2025-03-05T10:00:00Z",
    sections: [],
  },
  {
    id: "course-3",
    slug: "bug-bounty-mastery",
    title: "Bug Bounty Mastery: $10K/Month Blueprint",
    subtitle: "The exact recon & exploitation system top hunters use",
    description:
      "Learn the automation-first approach that top bug bounty hunters use to earn 5-figure months. Master recon, vulnerability discovery, report writing, and program selection. Includes 50+ private recon scripts.",
    thumbnail: "https://picsum.photos/seed/hack-bounty/800/450",
    banner: "https://picsum.photos/seed/hack-bounty-b/1600/500",
    trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    previewVideo: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    price: 3999,
    comparePrice: 11999,
    currency: "INR",
    level: "INTERMEDIATE",
    language: "English",
    durationMins: 1560,
    benefits: [
      "Build a fully automated recon pipeline",
      "Find bugs others miss on public programs",
      "Write reports that get triaged fast",
      "Pick the most profitable programs",
      "Get 50+ custom recon scripts",
      "Learn from 30+ real disclosed reports",
    ],
    requirements: [
      "Basic web hacking knowledge",
      "A VPS (we show free options)",
      "Hunger to earn real bounties",
    ],
    faqs: [
      { q: "How fast can I earn my first bounty?", a: "Most students land their first valid report within 30-60 days." },
      { q: "Which platforms do you cover?", a: "HackerOne, Bugcrowd, Intigriti, and private programs." },
    ],
    featured: true,
    published: true,
    rating: 4.8,
    reviewCount: 876,
    studentCount: 7300,
    instructorId: "ins-4",
    categoryId: "cat-bounty",
    tags: ["Bug Bounty", "Recon", "HackerOne", "Automation"],
    createdAt: "2024-09-15T10:00:00Z",
    updatedAt: "2025-03-30T10:00:00Z",
    sections: [],
  },
  {
    id: "course-4",
    slug: "network-pentesting-metasploit",
    title: "Network Pentesting & Metasploit Mastery",
    subtitle: "Break into enterprise networks & own the domain",
    description:
      "Master network-level exploitation from nmap scanning to full domain compromise. Learn Metasploit, password attacks, lateral movement, and Active Directory exploitation. Includes a full enterprise AD lab.",
    thumbnail: "https://picsum.photos/seed/hack-network/800/450",
    banner: "https://picsum.photos/seed/hack-network-b/1600/500",
    trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    previewVideo: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    price: 6999,
    comparePrice: 21999,
    currency: "INR",
    level: "INTERMEDIATE",
    language: "English",
    durationMins: 2160,
    benefits: [
      "Master nmap & advanced scanning",
      "Exploit services with Metasploit",
      "Crack hashes with hashcat & John",
      "Move laterally across networks",
      "Compromise full Active Directory",
      "Build an enterprise AD attack lab",
    ],
    requirements: [
      "Basic Linux command line",
      "Networking fundamentals (TCP/IP)",
      "A PC with 16GB RAM for labs",
    ],
    faqs: [
      { q: "Do I need a powerful PC?", a: "16GB RAM recommended — we provide cloud lab alternatives too." },
    ],
    featured: true,
    published: true,
    rating: 4.9,
    reviewCount: 542,
    studentCount: 4100,
    instructorId: "ins-5",
    categoryId: "cat-net",
    tags: ["Network Pentesting", "Metasploit", "Active Directory", "Nmap"],
    createdAt: "2024-11-01T10:00:00Z",
    updatedAt: "2025-03-10T10:00:00Z",
    sections: [],
  },
  {
    id: "course-5",
    slug: "active-directory-exploitation",
    title: "Active Directory Exploitation: Zero to Domain Admin",
    subtitle: "Own any Windows domain with BloodHound, Kerberoasting & more",
    description:
      "The most comprehensive AD exploitation course. Master BloodHound, Kerberoasting, AS-REP roasting, NTLM relay, DCSync, golden/silver tickets, and constrained delegation. Become the red teamer every blue team fears.",
    thumbnail: "https://picsum.photos/seed/hack-ad/800/450",
    banner: "https://picsum.photos/seed/hack-ad-b/1600/500",
    trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    previewVideo: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    price: 7999,
    comparePrice: 24999,
    currency: "INR",
    level: "ADVANCED",
    language: "English",
    durationMins: 1740,
    benefits: [
      "Map attack paths with BloodHound",
      "Kerberoast & AS-REP roast service accounts",
      "Forge golden & silver tickets",
      "Perform NTLM relay & DCSync attacks",
      "Abuse AD delegation & trust relationships",
      "Build a 5-machine AD lab",
    ],
    requirements: [
      "Solid Windows & networking basics",
      "Completed a network pentesting course",
      "16GB+ RAM for the AD lab",
    ],
    faqs: [
      { q: "Is this useful for OSEP?", a: "Absolutely — maps directly to OSEP AD exploitation objectives." },
    ],
    featured: false,
    published: true,
    rating: 4.9,
    reviewCount: 412,
    studentCount: 3200,
    instructorId: "ins-2",
    categoryId: "cat-net",
    tags: ["Active Directory", "BloodHound", "Kerberoasting", "Red Team"],
    createdAt: "2024-10-05T10:00:00Z",
    updatedAt: "2025-02-25T10:00:00Z",
    sections: [],
  },
  {
    id: "course-6",
    slug: "binary-exploitation-exploit-dev",
    title: "Binary Exploitation & Exploit Development",
    subtitle: "Write your own exploits for memory corruption bugs",
    description:
      "Go from buffer overflows to advanced exploit development. Master stack/heap exploitation, ROP chains, format string bugs, and modern mitigations bypass (ASLR, DEP, CFG). Includes a Pwn2Own-style capstone.",
    thumbnail: "https://picsum.photos/seed/hack-binary/800/450",
    banner: "https://picsum.photos/seed/hack-binary-b/1600/500",
    trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    previewVideo: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    price: 8999,
    comparePrice: 29999,
    currency: "INR",
    level: "ADVANCED",
    language: "English",
    durationMins: 2100,
    benefits: [
      "Master stack & heap exploitation",
      "Bypass ASLR, DEP & modern mitigations",
      "Write ROP chains by hand",
      "Exploit format string vulnerabilities",
      "Develop a working browser exploit",
      "Get Pwn2Own-ready with capstones",
    ],
    requirements: [
      "Comfortable with C & assembly basics",
      "Completed a basic hacking course",
      "Patience — this is hard, but worth it",
    ],
    faqs: [
      { q: "Do I need to know assembly?", a: "We teach x86/x64 assembly from scratch in module 2." },
    ],
    featured: false,
    published: true,
    rating: 5.0,
    reviewCount: 318,
    studentCount: 2400,
    instructorId: "ins-3",
    categoryId: "cat-exploit",
    tags: ["Binary Exploitation", "ROP", "Shellcode", "Pwn"],
    createdAt: "2024-12-01T10:00:00Z",
    updatedAt: "2025-03-15T10:00:00Z",
    sections: [],
  },
  {
    id: "course-7",
    slug: "red-team-operations",
    title: "Red Team Operations: Advanced Adversary Simulation",
    subtitle: "Execute full-scale red team engagements like APT groups",
    description:
      "Go beyond pentesting — learn how real red teams operate. Master initial access, C2 infrastructure, evasion, persistence, living-off-the-land, and exfiltration. Built for aspiring red team operators.",
    thumbnail: "https://picsum.photos/seed/hack-redteam/800/450",
    banner: "https://picsum.photos/seed/hack-redteam-b/1600/500",
    trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    previewVideo: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    price: 9999,
    comparePrice: 34999,
    currency: "INR",
    level: "ADVANCED",
    language: "English",
    durationMins: 1860,
    benefits: [
      "Build stealthy C2 infrastructure",
      "Bypass EDR & AV with custom loaders",
      "Perform phishing & initial access",
      "Use living-off-the-land techniques",
      "Establish persistence & move unseen",
      "Run a full red team engagement end-to-end",
    ],
    requirements: [
      "Completed AD exploitation course or equivalent",
      "Solid PowerShell & Python skills",
      "Understanding of Windows internals",
    ],
    faqs: [
      { q: "Is this legal to learn?", a: "Yes — all techniques are taught in controlled lab environments." },
    ],
    featured: false,
    published: true,
    rating: 4.9,
    reviewCount: 224,
    studentCount: 1800,
    instructorId: "ins-2",
    categoryId: "cat-redteam",
    tags: ["Red Team", "C2", "EDR Bypass", "Adversary Simulation"],
    createdAt: "2025-01-10T10:00:00Z",
    updatedAt: "2025-03-25T10:00:00Z",
    sections: [],
  },
  {
    id: "course-8",
    slug: "mobile-app-hacking",
    title: "Mobile App Hacking: Android & iOS",
    subtitle: "Hack & secure mobile apps like a top researcher",
    description:
      "Master mobile application pentesting for both Android & iOS. Learn static & dynamic analysis with Frida & objection, SSL pinning bypass, root/jailbreak detection bypass, and deep-dive into popular app vulnerabilities.",
    thumbnail: "https://picsum.photos/seed/hack-mobile/800/450",
    banner: "https://picsum.photos/seed/hack-mobile-b/1600/500",
    trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    previewVideo: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    price: 5499,
    comparePrice: 16999,
    currency: "INR",
    level: "INTERMEDIATE",
    language: "English",
    durationMins: 1320,
    benefits: [
      "Set up Android & iOS pentest labs",
      "Reverse-engineer APKs & IPAs",
      "Hook apps at runtime with Frida",
      "Bypass SSL pinning & root detection",
      "Find insecure storage & auth flaws",
      "Hack 10+ real vulnerable apps",
    ],
    requirements: [
      "Basic web pentesting knowledge",
      "An Android device (or emulator)",
      "Familiarity with command line",
    ],
    faqs: [
      { q: "Do I need an iPhone?", a: "No — we use cloud iOS labs, but a jailbroken device helps." },
    ],
    featured: false,
    published: true,
    rating: 4.8,
    reviewCount: 521,
    studentCount: 4600,
    instructorId: "ins-6",
    categoryId: "cat-web",
    tags: ["Mobile Hacking", "Android", "iOS", "Frida"],
    createdAt: "2024-09-28T10:00:00Z",
    updatedAt: "2025-01-18T10:00:00Z",
    sections: [],
  },
];

// ---------------------------------------------------------------------------
// ATTACH SECTIONS + LESSONS TO EACH COURSE
// ---------------------------------------------------------------------------
function buildSections(course: (typeof COURSES_DATA)[number]) {
  const cid = course.id;
  switch (cid) {
    case "course-1":
      return [
        section(cid, "Foundations of Ethical Hacking", "Set up your lab & learn the mindset.", [
          lesson(cid, "Welcome to the Underground", "VIDEO", 8, { preview: true }),
          lesson(cid, "Ethics, Law & Scope of Engagement", "VIDEO", 22),
          lesson(cid, "Installing Kali Linux in a VM", "VIDEO", 28),
          lesson(cid, "Linux Command Line Crash Course", "VIDEO", 34),
          lesson(cid, "Networking Fundamentals for Hackers", "VIDEO", 40),
        ]),
        section(cid, "Reconnaissance & Scanning", "Find your target's weaknesses.", [
          lesson(cid, "OSINT: Gathering Intel Like a Pro", "VIDEO", 36),
          lesson(cid, "DNS Recon & Subdomain Enumeration", "VIDEO", 32),
          lesson(cid, "Nmap: The Hacker's Scanner", "VIDEO", 44),
          lesson(cid, "Service & Version Detection", "VIDEO", 28),
          lesson(cid, "Vulnerability Scanning with Nessus", "VIDEO", 30),
        ]),
        section(cid, "Exploitation Basics", "Break in with Metasploit.", [
          lesson(cid, "Intro to Metasploit Framework", "VIDEO", 38),
          lesson(cid, "Exploiting Your First Machine", "VIDEO", 42),
          lesson(cid, "Payloads & Encoders Explained", "VIDEO", 30),
          lesson(cid, "Privilege Escalation on Linux", "VIDEO", 46),
          lesson(cid, "Capstone: Hack the VulnHub Target", "VIDEO", 55),
        ]),
        section(cid, "Reporting & Career", "Get paid to hack.", [
          lesson(cid, "Writing a Pentest Report", "VIDEO", 32),
          lesson(cid, "CVSS Scoring & Risk Rating", "VIDEO", 24),
          lesson(cid, "Landing Your First Pentest Job", "VIDEO", 28),
          lesson(cid, "OSCP Exam Strategy", "DOWNLOAD", 4, { resourceUrl: "#" }),
        ]),
      ];
    case "course-2":
      return [
        section(cid, "Web Hacking Fundamentals", "Set up Burp & understand the web.", [
          lesson(cid, "How the Web Works (for Hackers)", "VIDEO", 14, { preview: true }),
          lesson(cid, "Burp Suite: The Pro's Toolkit", "VIDEO", 38),
          lesson(cid, "Recon with Burp & gobuster", "VIDEO", 30),
        ]),
        section(cid, "Injection Attacks", "SQLi, command injection & more.", [
          lesson(cid, "SQL Injection Deep Dive", "VIDEO", 48),
          lesson(cid, "Blind SQLi & Automation", "VIDEO", 36),
          lesson(cid, "Command Injection", "VIDEO", 28),
          lesson(cid, "Lab: Hack DVWA", "VIDEO", 40),
        ]),
        section(cid, "Cross-Site Attacks", "XSS, CSRF & SSRF.", [
          lesson(cid, "Reflected & Stored XSS", "VIDEO", 40),
          lesson(cid, "DOM XSS & Filter Bypasses", "VIDEO", 34),
          lesson(cid, "CSRF & Same-Origin Policy", "VIDEO", 28),
          lesson(cid, "SSRF: The Cloud Killer", "VIDEO", 42),
        ]),
        section(cid, "Auth & Logic Flaws", "Bypass logins & business logic.", [
          lesson(cid, "Authentication Bypass", "VIDEO", 36),
          lesson(cid, "IDOR & Access Control", "VIDEO", 32),
          lesson(cid, "Business Logic Flaws", "VIDEO", 30),
          lesson(cid, "Capstone: Bug Bounty Report", "VIDEO", 50),
        ]),
      ];
    case "course-3":
      return [
        section(cid, "The Bounty Mindset", "Think like a top hunter.", [
          lesson(cid, "Why Most Hunters Fail", "VIDEO", 16, { preview: true }),
          lesson(cid, "Choosing the Right Programs", "VIDEO", 24),
          lesson(cid, "Reading Scope Like a Lawyer", "VIDEO", 20),
        ]),
        section(cid, "Recon Automation", "Build a recon pipeline.", [
          lesson(cid, "Subdomain Enumeration at Scale", "VIDEO", 38),
          lesson(cid, "Port & Service Scanning Automation", "VIDEO", 32),
          lesson(cid, "Content Discovery with ffuf", "VIDEO", 30),
          lesson(cid, "Setting up a VPS Recon Box", "VIDEO", 26),
        ]),
        section(cid, "Finding Bugs Others Miss", "Where the money is.", [
          lesson(cid, "Hunting HTTP Request Smuggling", "VIDEO", 44),
          lesson(cid, "OAuth Misconfigurations", "VIDEO", 36),
          lesson(cid, "Race Conditions & TOCTOU", "VIDEO", 32),
          lesson(cid, "Chaining Low Bugs to Critical", "VIDEO", 40),
        ]),
        section(cid, "Reports & Payouts", "Get paid.", [
          lesson(cid, "Writing Reports That Get Triaged", "VIDEO", 28),
          lesson(cid, "Negotiating Higher Bounties", "VIDEO", 22),
          lesson(cid, "Building a Hunter Reputation", "VIDEO", 24),
        ]),
      ];
    case "course-4":
      return [
        section(cid, "Network Reconnaissance", "Map the target network.", [
          lesson(cid, "Nmap Mastery", "VIDEO", 22, { preview: true }),
          lesson(cid, "Firewall & IDS Evasion", "VIDEO", 30),
          lesson(cid, "SNMP & Service Enumeration", "VIDEO", 34),
        ]),
        section(cid, "Exploitation with Metasploit", "Own the box.", [
          lesson(cid, "Metasploit Modules Deep Dive", "VIDEO", 40),
          lesson(cid, "Exploiting SMB & NetBIOS", "VIDEO", 36),
          lesson(cid, "Post-Exploitation & Meterpreter", "VIDEO", 44),
        ]),
        section(cid, "Password Attacks", "Crack everything.", [
          lesson(cid, "Hashing & Salt Fundamentals", "VIDEO", 28),
          lesson(cid, "hashcat: GPU Cracking Beast", "VIDEO", 38),
          lesson(cid, "John the Ripper in Practice", "VIDEO", 30),
          lesson(cid, "Pass-the-Hash & Pass-the-Ticket", "VIDEO", 34),
        ]),
        section(cid, "Lateral Movement", "Spread across the network.", [
          lesson(cid, "Pivoting with Proxychains", "VIDEO", 28),
          lesson(cid, "Lateral Movement Techniques", "VIDEO", 36),
          lesson(cid, "Capstone: Full Network Compromise", "VIDEO", 60),
        ]),
      ];
    case "course-5":
      return [
        section(cid, "AD Fundamentals", "Understand the domain.", [
          lesson(cid, "What is Active Directory?", "VIDEO", 18, { preview: true }),
          lesson(cid, "Kerberos & NTLM Authentication", "VIDEO", 36),
          lesson(cid, "Setting Up the AD Lab", "VIDEO", 30),
        ]),
        section(cid, "Enumeration with BloodHound", "See the attack paths.", [
          lesson(cid, "BloodHound Installation & Usage", "VIDEO", 34),
          lesson(cid, "Writing Custom Cypher Queries", "VIDEO", 38),
          lesson(cid, "Finding Attack Paths", "VIDEO", 32),
        ]),
        section(cid, "Credential Attacks", "Steal & abuse creds.", [
          lesson(cid, "AS-REP Roasting", "VIDEO", 30),
          lesson(cid, "Kerberoasting", "VIDEO", 34),
          lesson(cid, "DCSync Attack", "VIDEO", 28),
          lesson(cid, "NTLM Relay with responder", "VIDEO", 40),
        ]),
        section(cid, "Ticket Forging & Domain Admin", "Game over.", [
          lesson(cid, "Golden Tickets", "VIDEO", 36),
          lesson(cid, "Silver Tickets", "VIDEO", 30),
          lesson(cid, "Diamond & Sapphire Tickets", "VIDEO", 34),
          lesson(cid, "Capstone: Domain Admin", "VIDEO", 55),
        ]),
      ];
    case "course-6":
      return [
        section(cid, "Binary Fundamentals", "Understand memory.", [
          lesson(cid, "x86/x64 Assembly Primer", "VIDEO", 22, { preview: true }),
          lesson(cid, "The Stack & Calling Conventions", "VIDEO", 30),
          lesson(cid, "GDB & pwntools Setup", "VIDEO", 28),
        ]),
        section(cid, "Stack Exploitation", "Smash the stack.", [
          lesson(cid, "Classic Buffer Overflow", "VIDEO", 42),
          lesson(cid, "Shellcode Writing 101", "VIDEO", 38),
          lesson(cid, "Bypassing DEP with ROP", "VIDEO", 46),
          lesson(cid, "Bypassing ASLR", "VIDEO", 40),
        ]),
        section(cid, "Heap Exploitation", "Modern heap attacks.", [
          lesson(cid, "Heap Fundamentals & ptmalloc", "VIDEO", 36),
          lesson(cid, "Use-After-Free Exploitation", "VIDEO", 44),
          lesson(cid, "tcache & fastbin Attacks", "VIDEO", 42),
        ]),
        section(cid, "Advanced Techniques", "Real-world exploits.", [
          lesson(cid, "Format String Exploitation", "VIDEO", 38),
          lesson(cid, "Writing a Browser Exploit", "VIDEO", 52),
          lesson(cid, "Capstone: Pwn the Binary", "VIDEO", 50),
        ]),
      ];
    case "course-7":
      return [
        section(cid, "Red Team Mindset", "Think like an APT.", [
          lesson(cid, "Pentest vs Red Team vs Purple Team", "VIDEO", 14, { preview: true }),
          lesson(cid, "The Cyber Kill Chain & MITRE ATT&CK", "VIDEO", 28),
        ]),
        section(cid, "C2 Infrastructure", "Build stealthy comms.", [
          lesson(cid, "Setting up Cobalt Strike", "VIDEO", 40),
          lesson(cid, "Custom C2 with Mythic & Sliver", "VIDEO", 38),
          lesson(cid, "Domain Fronting & Redirectors", "VIDEO", 32),
        ]),
        section(cid, "Initial Access & Evasion", "Get in & stay hidden.", [
          lesson(cid, "Phishing Infrastructure", "VIDEO", 36),
          lesson(cid, "AV/EDR Bypass Techniques", "VIDEO", 44),
          lesson(cid, "Living-off-the-Land (LotL)", "VIDEO", 30),
        ]),
        section(cid, "Execution & Exfiltration", "Finish the op.", [
          lesson(cid, "Persistence Mechanisms", "VIDEO", 34),
          lesson(cid, "Data Exfiltration Techniques", "VIDEO", 30),
          lesson(cid, "Capstone: Full Red Team Op", "VIDEO", 55),
        ]),
      ];
    case "course-8":
      return [
        section(cid, "Mobile Lab Setup", "Get your hacking environment ready.", [
          lesson(cid, "Android Architecture for Hackers", "VIDEO", 16, { preview: true }),
          lesson(cid, "Rooting Android & Genymotion Setup", "VIDEO", 28),
          lesson(cid, "iOS Lab with checkra1n", "VIDEO", 30),
        ]),
        section(cid, "Static & Dynamic Analysis", "Reverse the app.", [
          lesson(cid, "Decompiling APKs with jadx", "VIDEO", 34),
          lesson(cid, "Frida & Objection Crash Course", "VIDEO", 42),
          lesson(cid, "Hooking App Logic at Runtime", "VIDEO", 36),
        ]),
        section(cid, "Attacking Mobile Apps", "Find the bugs.", [
          lesson(cid, "Bypassing SSL Pinning", "VIDEO", 30),
          lesson(cid, "Bypassing Root & Jailbreak Detection", "VIDEO", 28),
          lesson(cid, "Insecure Storage & Hardcoded Secrets", "VIDEO", 32),
          lesson(cid, "Deep Links & Intent Exploitation", "VIDEO", 34),
        ]),
        section(cid, "Capstone", "Hack a real app.", [
          lesson(cid, "Capstone: Full Mobile Pentest", "VIDEO", 50),
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
// TESTIMONIALS — Real hacker success stories
// ---------------------------------------------------------------------------
export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "R0otK1t",
    role: "Pentester @ Deloitte",
    avatar: "https://i.pravatar.cc/120?img=8",
    quote:
      "Went from zero IT background to landing a pentest role at Deloitte in 5 months. The bootcamp's labs are identical to real engagements.",
    rating: 5,
    featured: true,
    order: 1,
  },
  {
    id: "t2",
    name: "xSS_Sniper",
    role: "Bug Bounty Hunter (full-time)",
    avatar: "https://i.pravatar.cc/120?img=41",
    quote:
      "Cleared $18K in my first 3 months of bug bounty after taking the mastery course. The recon pipeline alone is worth 10x the price.",
    rating: 5,
    featured: true,
    order: 2,
  },
  {
    id: "t3",
    name: "D0mainAdmin",
    role: "Red Team Operator @ Mandiant",
    avatar: "https://i.pravatar.cc/120?img=14",
    quote:
      "The AD exploitation course is the best I've seen — including paid SANS courses. Got promoted to red team lead using these exact techniques.",
    rating: 5,
    featured: true,
    order: 3,
  },
  {
    id: "t4",
    name: "Sh3llCode",
    role: "Exploit Dev @ Zerodium",
    avatar: "https://i.pravatar.cc/120?img=49",
    quote:
      "Binary exploitation finally clicked. The ROP chain module is pure gold — I sold my first 0-day 2 months after finishing.",
    rating: 5,
    featured: true,
    order: 4,
  },
  {
    id: "t5",
    name: "Ph4nt0m",
    role: "Security Engineer @ Google",
    avatar: "https://i.pravatar.cc/120?img=11",
    quote:
      "Passed OSCP on first attempt. The mock tests here are harder than the real exam. Genuinely career-changing content.",
    rating: 5,
    featured: true,
    order: 5,
  },
  {
    id: "t6",
    name: "kr4ken",
    role: "Mobile Security Lead @ Paytm",
    avatar: "https://i.pravatar.cc/120?img=32",
    quote:
      "The mobile hacking course is unmatched. Found 3 critical bugs in my own company's app within a week of finishing.",
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
    code: "HACK50",
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
    code: "BOUNTY25",
    type: "PERCENT",
    value: 25,
    courseId: "course-3",
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
    slug: "sql-injection-2025-guide",
    title: "SQL Injection in 2025: Still the #1 Web Vulnerability",
    excerpt:
      "SQLi has been known for 25 years yet still ranks in OWASP Top 10. Here's how modern apps still get owned — and how to find it like a pro.",
    content:
      "## Why SQLi Still Works\n\nDespite being the oldest web vuln, SQL injection remains everywhere. WAFs help but don't fix the root cause: string-concatenated queries.\n\n### The Modern Attack Surface\n\n- REST & GraphQL APIs\n- NoSQL databases (yes, they're injectable too)\n- ORM raw-query escape hatches\n\n### Finding It\n\n1. Test every input parameter\n2. Use SQLMap for automation\n3. Manual verification for WAF-protected targets\n\n> A single SQLi can dump the entire database. Severity: Critical.\n\n## Conclusion\n\nLearn SQLi. It pays bounties. Always.",
    coverImage: "https://picsum.photos/seed/blog-sqli/1200/600",
    authorName: "Ghost404",
    authorAvatar: "https://i.pravatar.cc/120?img=68",
    category: "Web Hacking",
    tags: ["SQLi", "OWASP", "Bug Bounty"],
    status: "PUBLISHED",
    publishedAt: "2025-03-22T10:00:00Z",
    createdAt: "2025-03-22T10:00:00Z",
    updatedAt: "2025-03-22T10:00:00Z",
    views: 8420,
    readingMins: 6,
  },
  {
    id: "bp-2",
    slug: "recon-pipeline-bug-bounty",
    title: "Building a Recon Pipeline That Prints Money",
    excerpt:
      "The exact recon automation stack top bug bounty hunters use to find bugs before anyone else. Includes free scripts.",
    content:
      "## The Stack\n\n1. **Subfinder** + **amass** — subdomain enumeration\n2. **httpx** — live host detection\n3. **nuclei** — vulnerability templates\n4. **ffuf** — content discovery\n\n## Automation\n\nRun it all on a $5 VPS, get results in Slack.\n\n> Recon is 80% of bug bounty success. Automate ruthlessly.",
    coverImage: "https://picsum.photos/seed/blog-recon/1200/600",
    authorName: "ShadowByte",
    authorAvatar: "https://i.pravatar.cc/120?img=12",
    category: "Bug Bounty",
    tags: ["Recon", "Automation", "Bug Bounty"],
    status: "PUBLISHED",
    publishedAt: "2025-03-08T10:00:00Z",
    createdAt: "2025-03-08T10:00:00Z",
    updatedAt: "2025-03-08T10:00:00Z",
    views: 6230,
    readingMins: 5,
  },
  {
    id: "bp-3",
    slug: "active-directory-attack-paths",
    title: "Active Directory Attack Paths Every Pentester Must Know",
    excerpt:
      "From Domain User to Domain Admin in 5 attack paths. BloodHound makes it visual.",
    content:
      "## Why AD?\n\n90% of enterprises run Active Directory. Compromise it, you own the company.\n\n### The 5 Paths\n\n1. Kerberoasting → crack → service account\n2. AS-REP Roasting → offline crack\n3. DCSync → dump all hashes\n4. NTLM Relay → pivot to DC\n5. BloodHound shortest path\n\n> BloodHound shows you the way. Always run it first.",
    coverImage: "https://picsum.photos/seed/blog-ad/1200/600",
    authorName: "Nyx Cipher",
    authorAvatar: "https://i.pravatar.cc/120?img=45",
    category: "Network Security",
    tags: ["Active Directory", "BloodHound", "Red Team"],
    status: "PUBLISHED",
    publishedAt: "2025-03-30T10:00:00Z",
    createdAt: "2025-03-30T10:00:00Z",
    updatedAt: "2025-03-30T10:00:00Z",
    views: 4510,
    readingMins: 4,
  },
  {
    id: "bp-4",
    slug: "oscp-preparation-guide",
    title: "OSCP Preparation: The Complete 2025 Guide",
    excerpt:
      "How to pass the OSCP exam on your first attempt — labs, methodology, time management & mindset.",
    content:
      "## The Exam\n\n24 hours to hack 5 machines + 24 hours for the report. It's brutal.\n\n## My Method\n\n1. PWL labs (all of them)\n2. HackTheBox Proving Grounds\n3. Take meticulous notes\n4. Practice report writing\n\n> Time management kills more candidates than the machines do.",
    coverImage: "https://picsum.photos/seed/blog-oscp/1200/600",
    authorName: "Ghost404",
    authorAvatar: "https://i.pravatar.cc/120?img=68",
    category: "Certifications",
    tags: ["OSCP", "Certification", "Career"],
    status: "PUBLISHED",
    publishedAt: "2025-03-01T10:00:00Z",
    createdAt: "2025-03-01T10:00:00Z",
    updatedAt: "2025-03-01T10:00:00Z",
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
    q: "Is learning ethical hacking legal?",
    a: "Absolutely. Everything we teach is done in controlled lab environments you control. We cover ethics, law (IT Act, CFAA), and scope-of-engagement in depth. You'll only hack systems you have explicit permission to test.",
  },
  {
    q: "Do I need a programming background?",
    a: "No. Our bootcamp starts from zero. We teach the bash & Python you need as you go. By the end you'll be writing your own recon scripts.",
  },
  {
    q: "Will these courses help me get a job?",
    a: "Yes. Our students have landed roles at Deloitte, Mandiant, Google, and as full-time bug bounty hunters. The curriculum maps to OSCP and real job requirements.",
  },
  {
    q: "Do I get a certificate?",
    a: "Yes — every completed course earns a verifiable certificate with a unique verification ID, downloadable as PDF. Great for your resume & LinkedIn.",
  },
  {
    q: "What hardware do I need?",
    a: "A PC/laptop with 8GB RAM minimum (16GB recommended for AD & exploit dev labs). We provide cloud alternatives for lower-spec machines.",
  },
  {
    q: "How does payment work?",
    a: "Pay via UPI/bank transfer, submit your transaction reference, and our team verifies & grants access within minutes. No card details stored — fully secure.",
  },
];

// ---------------------------------------------------------------------------
// PLATFORM STATS
// ---------------------------------------------------------------------------
export const platformStats = {
  students: 68000,
  courses: courses.length,
  instructors: instructors.length,
  countries: 42,
  rating: 4.9,
  completionRate: 84,
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
    comment: "Best hacking course on the internet. The labs are identical to real pentest engagements. Landed a job at a MNC within 4 months.",
    date: "2025-03-01",
    featured: true,
  },
  {
    id: "r2",
    userName: "Fatima A.",
    userAvatar: "https://i.pravatar.cc/80?img=25",
    courseId: "course-3",
    rating: 5,
    comment: "Cleared $18K in bug bounties in my first 3 months. The recon pipeline is pure gold.",
    date: "2025-02-28",
    featured: true,
  },
  {
    id: "r3",
    userName: "Nikhil T.",
    userAvatar: "https://i.pravatar.cc/80?img=18",
    courseId: "course-6",
    rating: 5,
    comment: "Binary exploitation finally clicked. Sold my first 0-day 2 months after finishing. Mind = blown.",
    date: "2025-03-03",
    featured: true,
  },
];
