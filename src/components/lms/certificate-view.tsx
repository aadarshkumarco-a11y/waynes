"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  BadgeCheck,
  Calendar,
  CheckCircle2,
  Download,
  FileX2,
  GraduationCap,
  Lock,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLms } from "@/lib/store";
import { courseMap } from "@/lib/data/catalog";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Certificate } from "@/lib/types";

export function CertificateView() {
  const certificateId = useLms((s) => s.certificateId);
  const certificates = useLms((s) => s.certificates);
  const user = useLms((s) => s.user);
  const openCertificate = useLms((s) => s.openCertificate);
  const navigate = useLms((s) => s.navigate);
  const setAuthOpen = useLms((s) => s.setAuthOpen);

  // In verification mode (a verifyId is set in store), look it up.
  const verifying = useMemo(
    () => (certificateId ? certificates.find((c) => c.verifyId === certificateId) : null),
    [certificateId, certificates]
  );

  const myCerts = useMemo(
    () => (user ? certificates.filter((c) => c.userId === user.id) : []),
    [user, certificates]
  );

  // ---------------- VERIFICATION MODE ----------------
  if (certificateId) {
    if (verifying) {
      return <VerificationFound cert={verifying} onBack={() => navigate("home")} />;
    }
    return <VerificationNotFound initialId={certificateId} onVerify={(id) => openCertificate(id)} />;
  }

  // ---------------- GALLERY MODE — NOT LOGGED IN ----------------
  if (!user) {
    return (
      <PublicVerifyPrompt
        onVerify={(id) => openCertificate(id)}
        onSignIn={() => setAuthOpen(true, "login")}
      />
    );
  }

  // ---------------- GALLERY MODE — LOGGED IN, EMPTY ----------------
  if (myCerts.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <GalleryHeader count={0} />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-10 flex flex-col items-center rounded-2xl border border-dashed bg-muted/20 p-12 text-center"
        >
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
            <Award className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">No certificates yet</h3>
          <p className="mt-1 max-w-sm text-muted-foreground">
            Complete a course to earn your first verifiable certificate. Your achievements
            will appear here.
          </p>
          <Button className="mt-5" size="lg" onClick={() => navigate("my-learning")}>
            Continue learning
          </Button>
        </motion.div>

        <PublicVerifyInline onVerify={(id) => openCertificate(id)} />
      </div>
    );
  }

  // ---------------- GALLERY MODE — HAS CERTS ----------------
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <GalleryHeader count={myCerts.length} />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {myCerts.map((cert, i) => (
          <CertificateCard
            key={cert.id}
            cert={cert}
            index={i}
            onView={() => openCertificate(cert.verifyId)}
          />
        ))}
      </div>

      <div className="mt-12">
        <PublicVerifyInline onVerify={(id) => openCertificate(id)} />
      </div>
    </div>
  );
}

export default CertificateView;

// ===========================================================================
// HEADER
// ===========================================================================
function GalleryHeader({ count }: { count: number }) {
  return (
    <div>
      <Badge variant="secondary" className="mb-3 gap-1">
        <Award className="size-3" /> Certificates
      </Badge>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Your certificates</h1>
      <p className="mt-1 text-muted-foreground">
        {count > 0
          ? `${count} certificate${count > 1 ? "s" : ""} earned. Share them with the world.`
          : "Earn verifiable certificates by completing courses."}
      </p>
    </div>
  );
}

// ===========================================================================
// GALLERY CARD (compact preview)
// ===========================================================================
function CertificateCard({
  cert,
  index,
  onView,
}: {
  cert: Certificate;
  index: number;
  onView: () => void;
}) {
  const course = courseMap[cert.courseId];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.07, 0.4) }}
    >
      <Card className="group overflow-hidden p-0 shadow-premium transition-shadow hover:shadow-glow">
        <button onClick={onView} className="block w-full text-left">
          <CertificateDisplay cert={cert} compact />
        </button>
        <div className="flex items-center justify-between gap-2 border-t bg-muted/30 p-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {course?.title ?? cert.courseTitle}
            </p>
            <p className="text-xs text-muted-foreground">
              Issued {formatDate(cert.issuedAt)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button size="sm" variant="outline" onClick={onView}>
              View
            </Button>
            <Button size="sm" onClick={() => downloadCertificate(cert)}>
              <Download className="size-4" />
              PDF
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// ===========================================================================
// PUBLIC VERIFY — NOT LOGGED IN
// ===========================================================================
function PublicVerifyPrompt({
  onVerify,
  onSignIn,
}: {
  onVerify: (id: string) => void;
  onSignIn: () => void;
}) {
  const [id, setId] = useState("");
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full gradient-brand shadow-glow">
          <ShieldCheck className="size-8 text-white" />
        </div>
        <Badge variant="secondary" className="mb-3 gap-1">
          <Lock className="size-3" /> Certificate verification
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Verify a certificate
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
          Enter a certificate ID to confirm its authenticity. Every Learniverse
          certificate has a unique verification ID.
        </p>
      </motion.div>

      <Card className="glass mt-8 p-6 shadow-premium sm:p-8">
        <PublicVerifyForm id={id} setId={setId} onVerify={onVerify} />
        <Separator className="my-6" />
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">
            Are you a student? Sign in to view your earned certificates.
          </p>
          <Button variant="outline" onClick={onSignIn}>
            <User className="size-4" />
            Sign in to my account
          </Button>
          <p className="text-xs text-muted-foreground">
            Try the demo ID:{" "}
            <button
              onClick={() => setId("LMS-TK8X4A-2Q9B")}
              className="font-mono font-semibold text-primary hover:underline"
            >
              LMS-TK8X4A-2Q9B
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}

function PublicVerifyInline({
  onVerify,
}: {
  onVerify: (id: string) => void;
}) {
  const [id, setId] = useState("");
  return (
    <Card className="glass p-6 shadow-premium">
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck className="size-5 text-primary" />
        <h2 className="text-lg font-semibold">Verify a certificate</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Got a certificate ID from someone? Verify its authenticity here.
      </p>
      <PublicVerifyForm id={id} setId={setId} onVerify={onVerify} />
    </Card>
  );
}

function PublicVerifyForm({
  id,
  setId,
  onVerify,
}: {
  id: string;
  setId: (v: string) => void;
  onVerify: (id: string) => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!id.trim()) {
          toast.error("Enter a certificate ID");
          return;
        }
        onVerify(id.trim().toUpperCase());
      }}
      className="flex flex-col gap-2 sm:flex-row"
    >
      <Input
        value={id}
        onChange={(e) => setId(e.target.value.toUpperCase())}
        placeholder="LMS-XXXXXX-XXXX"
        className="font-mono tracking-wider"
      />
      <Button type="submit" className="sm:w-32">
        <Search className="size-4" />
        Verify
      </Button>
    </form>
  );
}

// ===========================================================================
// VERIFICATION MODE — FOUND
// ===========================================================================
function VerificationFound({
  cert,
  onBack,
}: {
  cert: Certificate;
  onBack: () => void;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 overflow-hidden rounded-xl border border-primary/30 bg-primary/10 p-4 shadow-glow"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/20">
            <CheckCircle2 className="size-7 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-primary">Certificate Verified ✓</p>
            <p className="text-sm text-muted-foreground">
              This certificate is authentic and was issued by Learniverse.
            </p>
          </div>
          <Button variant="outline" onClick={onBack}>
            Back to home
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="overflow-hidden p-0 shadow-premium">
          <CertificateDisplay cert={cert} />
          <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/30 p-4">
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" />
                Issued {formatDate(cert.issuedAt)}
              </span>
              <span className="flex items-center gap-1">
                <BadgeCheck className="size-3.5 text-primary" />
                Verified
              </span>
              <span className="font-mono">ID: {cert.verifyId}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => shareCertificate(cert)}>
                <Share2 className="size-4" />
                Share
              </Button>
              <Button size="sm" onClick={() => downloadCertificate(cert)}>
                <Download className="size-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

// ===========================================================================
// VERIFICATION MODE — NOT FOUND
// ===========================================================================
function VerificationNotFound({
  initialId,
  onVerify,
}: {
  initialId: string;
  onVerify: (id: string) => void;
}) {
  const [id, setId] = useState(initialId);
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="mx-auto mb-5 flex size-20 items-center justify-center rounded-full bg-destructive/10"
      >
        <FileX2 className="size-10 text-destructive" />
      </motion.div>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Certificate not found
      </h1>
      <p className="mx-auto mt-2 max-w-md text-muted-foreground">
        We couldn&apos;t find a certificate with ID{" "}
        <span className="font-mono font-semibold text-foreground">{initialId}</span>.
        Please double-check the ID and try again.
      </p>
      <Card className="glass mt-6 p-5 text-left shadow-premium">
        <PublicVerifyForm id={id} setId={setId} onVerify={onVerify} />
      </Card>
    </div>
  );
}

// ===========================================================================
// CERTIFICATE DISPLAY (the actual cert design)
// ===========================================================================
function CertificateDisplay({
  cert,
  compact = false,
}: {
  cert: Certificate;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-card p-[3px]",
        compact ? "" : ""
      )}
    >
      {/* Gradient border wrapper */}
      <div className="gradient-brand rounded-[10px] p-[2px]">
        <div
          className={cn(
            "relative overflow-hidden rounded-[8px] bg-card",
            compact ? "p-5" : "p-8 sm:p-10"
          )}
        >
          {/* Decorative corners */}
          <div className="pointer-events-none absolute left-0 top-0 size-24 rounded-br-full bg-primary/5" />
          <div className="pointer-events-none absolute bottom-0 right-0 size-24 rounded-tl-full bg-primary/5" />
          {/* Subtle bg pattern */}
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />

          <div className="relative">
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg gradient-brand shadow-glow">
                  <GraduationCap className="size-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-none tracking-tight">
                    Learniverse
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Premium Learning
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="border-primary/40 bg-primary/5 text-primary"
              >
                <Sparkles className="size-3" />
                Verified
              </Badge>
            </div>

            <Separator className="my-5" />

            {/* Title */}
            <div className="text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                Certificate of Completion
              </p>
              <p className="mt-3 text-xs text-muted-foreground">This certifies that</p>
              <p
                className={cn(
                  "mt-2 font-bold tracking-tight text-gradient-brand",
                  compact ? "text-2xl" : "text-3xl sm:text-4xl"
                )}
              >
                {cert.candidateName}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                has successfully completed the course
              </p>
              <p
                className={cn(
                  "mt-2 font-semibold text-foreground",
                  compact ? "text-base" : "text-lg sm:text-xl"
                )}
              >
                {cert.courseTitle}
              </p>
            </div>

            {/* Seal */}
            <div className="my-6 flex justify-center">
              <div className="relative flex size-20 items-center justify-center">
                <div className="absolute inset-0 rounded-full gradient-brand shadow-glow" />
                <div className="absolute inset-1 rounded-full bg-card" />
                <Award className="relative size-9 text-primary" />
              </div>
            </div>

            {/* Footer grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Field label="Instructor" value={cert.instructorName} />
              <Field label="Score" value={`${cert.score}%`} />
              <Field label="Issued On" value={formatDate(cert.issuedAt)} />
              <Field label="Verify ID" value={cert.verifyId} mono />
            </div>

            <Separator className="my-5" />

            {/* Signatures */}
            <div className="flex items-end justify-between gap-4">
              <div className="flex-1">
                <div className="mb-1 h-8" />
                <div className="border-t border-foreground/30 pt-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Candidate
                  </p>
                  <p className="text-xs font-semibold">{cert.candidateName}</p>
                </div>
              </div>
              <div className="flex-1 text-right">
                <div className="mb-1 flex h-8 items-end justify-end">
                  <span className="font-[cursive] text-lg italic text-primary">
                    Learniverse
                  </span>
                </div>
                <div className="border-t border-foreground/30 pt-1 text-right">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Authorized by
                  </p>
                  <p className="text-xs font-semibold">Learniverse Academy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="text-center sm:text-left">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 text-xs font-semibold text-foreground",
          mono && "font-mono"
        )}
      >
        {value}
      </p>
    </div>
  );
}

// ===========================================================================
// ACTIONS
// ===========================================================================
function shareCertificate(cert: Certificate) {
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/?cert=${cert.verifyId}`
      : cert.verifyId;
  if (typeof navigator !== "undefined" && navigator.share) {
    navigator
      .share({
        title: `${cert.candidateName} — ${cert.courseTitle}`,
        text: `Verify my Learniverse certificate`,
        url,
      })
      .catch(() => {});
  } else if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => toast.success("Share link copied"));
  }
}

function downloadCertificate(cert: Certificate) {
  // Open a print-friendly window with a self-contained certificate layout.
  if (typeof window === "undefined") return;
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) {
    toast.error("Please allow pop-ups to download the PDF");
    return;
  }
  const issued = formatDate(cert.issuedAt);
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Certificate — ${escapeHtml(cert.candidateName)}</title>
<style>
  @page { size: landscape; margin: 0; }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #f4f6f8;
    color: #0f1a14;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .cert {
    margin: 24px auto;
    max-width: 1000px;
    background: linear-gradient(135deg, #10b981 0%, #0d9488 100%);
    padding: 4px;
    border-radius: 14px;
  }
  .inner {
    background: #ffffff;
    border-radius: 11px;
    padding: 56px 64px;
    position: relative;
    overflow: hidden;
  }
  .corner { position: absolute; width: 120px; height: 120px; background: rgba(16,185,129,0.06); }
  .corner.tl { top: 0; left: 0; border-bottom-right-radius: 100%; }
  .corner.br { bottom: 0; right: 0; border-top-left-radius: 100%; }
  .head { display: flex; align-items: center; justify-content: space-between; }
  .brand { display: flex; align-items: center; gap: 10px; }
  .logo {
    width: 40px; height: 40px; border-radius: 10px;
    background: linear-gradient(135deg, #10b981 0%, #0d9488 100%);
    color: white; display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 20px;
  }
  .brand .name { font-size: 18px; font-weight: 800; letter-spacing: -0.01em; }
  .brand .tag { font-size: 10px; letter-spacing: 0.18em; color: #6b7280; text-transform: uppercase; }
  .badge {
    border: 1px solid #10b981; color: #047857; background: rgba(16,185,129,0.06);
    padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 600;
  }
  .title { text-align: center; margin-top: 36px; }
  .title .kicker { font-size: 11px; letter-spacing: 0.28em; color: #6b7280; text-transform: uppercase; font-weight: 700; }
  .title .sub { font-size: 13px; color: #6b7280; margin-top: 14px; }
  .title .name {
    font-size: 42px; font-weight: 800; margin-top: 6px;
    background: linear-gradient(120deg, #047857, #0d9488 60%, #059669);
    -webkit-background-clip: text; background-clip: text; color: transparent;
    letter-spacing: -0.02em;
  }
  .title .course { font-size: 20px; font-weight: 700; margin-top: 8px; color: #0f1a14; }
  .seal {
    margin: 28px auto; width: 84px; height: 84px; border-radius: 999px;
    background: linear-gradient(135deg, #10b981 0%, #0d9488 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 8px 30px rgba(16,185,129,0.3);
    color: white; font-size: 34px; font-weight: 800;
  }
  .fields { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 24px; }
  .field .l { font-size: 10px; letter-spacing: 0.16em; color: #6b7280; text-transform: uppercase; }
  .field .v { font-size: 13px; font-weight: 700; margin-top: 2px; }
  .field .v.mono { font-family: 'SF Mono', Menlo, monospace; }
  .sign { display: flex; justify-content: space-between; margin-top: 40px; }
  .sign .col { flex: 1; }
  .sign .col.right { text-align: right; }
  .sign .line { border-top: 1px solid #0f1a14; padding-top: 6px; margin-top: 36px; }
  .sign .k { font-size: 10px; letter-spacing: 0.16em; color: #6b7280; text-transform: uppercase; }
  .sign .n { font-size: 13px; font-weight: 700; }
  .cursive { font-style: italic; font-family: 'Brush Script MT', cursive; color: #047857; font-size: 24px; }
  .hr { height: 1px; background: #e5e7eb; margin: 24px 0; border: 0; }
</style>
</head>
<body>
  <div class="cert">
    <div class="inner">
      <div class="corner tl"></div>
      <div class="corner br"></div>
      <div class="head">
        <div class="brand">
          <div class="logo">🎓</div>
          <div>
            <div class="name">Learniverse</div>
            <div class="tag">Premium Learning</div>
          </div>
        </div>
        <div class="badge">✓ Verified</div>
      </div>
      <hr class="hr" />
      <div class="title">
        <div class="kicker">Certificate of Completion</div>
        <div class="sub">This certifies that</div>
        <div class="name">${escapeHtml(cert.candidateName)}</div>
        <div class="sub">has successfully completed the course</div>
        <div class="course">${escapeHtml(cert.courseTitle)}</div>
      </div>
      <div class="seal">🏆</div>
      <div class="fields">
        <div class="field"><div class="l">Instructor</div><div class="v">${escapeHtml(cert.instructorName)}</div></div>
        <div class="field"><div class="l">Score</div><div class="v">${cert.score}%</div></div>
        <div class="field"><div class="l">Issued On</div><div class="v">${escapeHtml(issued)}</div></div>
        <div class="field"><div class="l">Verify ID</div><div class="v mono">${escapeHtml(cert.verifyId)}</div></div>
      </div>
      <hr class="hr" />
      <div class="sign">
        <div class="col">
          <div class="line">
            <div class="k">Candidate</div>
            <div class="n">${escapeHtml(cert.candidateName)}</div>
          </div>
        </div>
        <div class="col right">
          <div class="cursive">Learniverse</div>
          <div class="line">
            <div class="k">Authorized by</div>
            <div class="n">Learniverse Academy</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <script>
    window.onload = function() { setTimeout(function() { window.print(); }, 350); };
  </script>
</body>
</html>
  `;
  win.document.open();
  win.document.write(html);
  win.document.close();
  toast.success("Opening print dialog — save as PDF");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
