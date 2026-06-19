import { db } from "@/lib/db";
import { categories, courses, instructors, coupons as seedCoupons, testimonials, blogPosts } from "@/lib/data/catalog";

// Upserts the in-memory catalog into the SQLite database so the API layer
// has real data to serve. Safe to call repeatedly (idempotent upserts).
export async function seedDatabase() {
  // categories
  for (const c of categories) {
    await db.category.upsert({
      where: { id: c.id },
      create: { id: c.id, name: c.name, slug: c.slug, icon: c.icon },
      update: { name: c.name, slug: c.slug, icon: c.icon },
    });
  }

  // instructors as users with SUPER_ADMIN-ish profile (role STUDENT, but used as instructor ref)
  for (const ins of instructors) {
    await db.user.upsert({
      where: { email: `${ins.id}@waynes.io` },
      create: {
        id: ins.id,
        email: `${ins.id}@waynes.io`,
        name: ins.name,
        avatar: ins.avatar,
        title: ins.title,
        bio: ins.bio,
        role: "STUDENT",
        provider: "email",
        emailVerified: true,
      },
      update: {
        name: ins.name,
        avatar: ins.avatar,
        title: ins.title,
        bio: ins.bio,
      },
    });
  }

  // courses + sections + lessons
  for (const c of courses) {
    await db.course.upsert({
      where: { id: c.id },
      create: {
        id: c.id,
        slug: c.slug,
        title: c.title,
        subtitle: c.subtitle,
        description: c.description,
        thumbnail: c.thumbnail,
        banner: c.banner,
        trailerUrl: c.trailerUrl,
        previewVideo: c.previewVideo,
        price: c.price,
        comparePrice: c.comparePrice,
        currency: c.currency,
        level: c.level,
        language: c.language,
        durationMins: c.durationMins,
        benefits: JSON.stringify(c.benefits),
        requirements: JSON.stringify(c.requirements),
        faqs: JSON.stringify(c.faqs),
        featured: c.featured,
        published: c.published,
        rating: c.rating,
        reviewCount: c.reviewCount,
        studentCount: c.studentCount,
        instructorId: c.instructorId,
        categoryId: c.categoryId,
      },
      update: {
        slug: c.slug,
        title: c.title,
        subtitle: c.subtitle,
        description: c.description,
        thumbnail: c.thumbnail,
        price: c.price,
        featured: c.featured,
        rating: c.rating,
        studentCount: c.studentCount,
      },
    });
    for (const sec of c.sections) {
      await db.section.upsert({
        where: { id: sec.id },
        create: {
          id: sec.id,
          courseId: c.id,
          title: sec.title,
          description: sec.description ?? "",
          order: sec.order,
        },
        update: { title: sec.title, description: sec.description ?? "", order: sec.order },
      });
      for (const lsn of sec.lessons) {
        await db.lesson.upsert({
          where: { id: lsn.id },
          create: {
            id: lsn.id,
            sectionId: sec.id,
            title: lsn.title,
            type: lsn.type,
            videoUrl: lsn.videoUrl,
            content: lsn.content,
            resourceUrl: lsn.resourceUrl,
            durationMins: lsn.durationMins,
            preview: lsn.preview,
            order: lsn.order,
          },
          update: {
            title: lsn.title,
            type: lsn.type,
            durationMins: lsn.durationMins,
            preview: lsn.preview,
          },
        });
      }
    }
  }

  // coupons
  for (const cp of seedCoupons) {
    await db.coupon.upsert({
      where: { code: cp.code },
      create: {
        id: cp.id,
        code: cp.code,
        type: cp.type,
        value: cp.value,
        courseId: cp.courseId,
        startsAt: new Date(cp.startsAt),
        expiresAt: cp.expiresAt ? new Date(cp.expiresAt) : null,
        usageLimit: cp.usageLimit,
        usedCount: cp.usedCount,
        perUserLimit: cp.perUserLimit,
        minAmount: cp.minAmount,
        active: cp.active,
      },
      update: { active: cp.active, usedCount: cp.usedCount },
    });
  }

  // testimonials
  for (const t of testimonials) {
    await db.testimonial.upsert({
      where: { id: t.id },
      create: {
        id: t.id,
        name: t.name,
        role: t.role,
        avatar: t.avatar,
        quote: t.quote,
        rating: t.rating,
        featured: t.featured,
        order: t.order,
      },
      update: { quote: t.quote, rating: t.rating },
    });
  }

  // blog
  for (const b of blogPosts) {
    await db.blogPost.upsert({
      where: { slug: b.slug },
      create: {
        id: b.id,
        slug: b.slug,
        title: b.title,
        excerpt: b.excerpt,
        content: b.content,
        coverImage: b.coverImage,
        authorName: b.authorName,
        authorAvatar: b.authorAvatar,
        category: b.category,
        tags: JSON.stringify(b.tags),
        status: b.status,
        publishedAt: b.publishedAt ? new Date(b.publishedAt) : null,
        views: b.views,
      },
      update: { title: b.title, excerpt: b.excerpt, content: b.content },
    });
  }

  return { ok: true, counts: { categories: categories.length, courses: courses.length, coupons: seedCoupons.length, testimonials: testimonials.length, blog: blogPosts.length } };
}
