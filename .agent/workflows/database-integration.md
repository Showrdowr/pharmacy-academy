---
description: คู่มือการเพิ่ม Database สำหรับระบบคอร์สเรียน Pharmacy Academy
---

# 📚 Database Integration Guide

คู่มือนี้อธิบายขั้นตอนการเปลี่ยนจาก mock data เป็น database จริง สำหรับระบบ Pharmacy Academy

---

## 📋 สารบัญ

1. [ภาพรวมระบบปัจจุบัน](#1-ภาพรวมระบบปัจจุบัน)
2. [เตรียมความพร้อม](#2-เตรียมความพร้อม)
3. [ติดตั้ง Prisma](#3-ติดตั้ง-prisma)
4. [สร้าง Database Schema](#4-สร้าง-database-schema)
5. [สร้าง API Routes](#5-สร้าง-api-routes)
6. [สร้าง Custom Hooks](#6-สร้าง-custom-hooks)
7. [แก้ไข Components](#7-แก้ไข-components)
8. [Testing & Deployment](#8-testing--deployment)

---

## 1. ภาพรวมระบบปัจจุบัน

### ไฟล์ที่ใช้ Mock Data

| ไฟล์                                                    | ตัวแปร         | หน้าที่                      |
| ------------------------------------------------------- | -------------- | ---------------------------- |
| `src/context/SearchContext.tsx`                         | `ALL_COURSES`  | Search suggestions ใน Header |
| `src/components/courses-grid/CoursesGridArea.tsx`       | `COURSES_DATA` | แสดงรายการคอร์สทั้งหมด       |
| `src/components/courses-details/CoursesDetailsArea.tsx` | `COURSE_DATA`  | รายละเอียดคอร์สเดี่ยว        |

### สถาปัตยกรรมใหม่ที่แนะนำ

```
┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
│   Components    │  ──────▶ │   API Routes    │  ──────▶ │    Database     │
│   (React/Next)  │          │  /api/courses   │          │   (Supabase/    │
│                 │  ◀────── │  /api/courses/  │  ◀────── │   PostgreSQL)   │
└─────────────────┘          └─────────────────┘          └─────────────────┘
```

---

## 2. เตรียมความพร้อม

### เลือก Database Provider

| Provider          | ประเภท     | ข้อดี                               | ราคาเริ่มต้น |
| ----------------- | ---------- | ----------------------------------- | ------------ |
| **Supabase**      | PostgreSQL | Auth ในตัว, Realtime, Dashboard สวย | ฟรี 500MB    |
| **PlanetScale**   | MySQL      | Serverless, Branch workflow         | ฟรี 5GB      |
| **Neon**          | PostgreSQL | Serverless, Auto-scaling            | ฟรี 512MB    |
| **MongoDB Atlas** | NoSQL      | Flexible schema                     | ฟรี 512MB    |

### แนะนำ: **Supabase**

- เหมาะกับ Next.js
- มี Auth system ในตัว
- Dashboard จัดการง่าย

---

## 3. ติดตั้ง Prisma

// turbo

```bash
npm install prisma @prisma/client
```

// turbo

```bash
npx prisma init
```

### ตั้งค่า .env

```env
# สำหรับ Supabase
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# สำหรับ PlanetScale
# DATABASE_URL="mysql://[USER]:[PASSWORD]@[HOST]/[DATABASE]?sslaccept=strict"
```

---

## 4. สร้าง Database Schema

### แก้ไขไฟล์ `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Course {
  id          Int       @id @default(autoincrement())
  title       String    // ชื่อคอร์สภาษาไทย
  titleEn     String    // ชื่อคอร์สภาษาอังกฤษ
  slug        String    @unique // URL-friendly name
  category    String    // หมวดหมู่
  instructor  String    // ชื่อผู้สอน
  price       Float     // ราคา (บาท)
  image       String    // URL รูปภาพ
  cpe         Float     @default(0) // หน่วยกิต CPE
  level       String    @default("All Level") // ระดับ
  rating      Float     @default(0)
  students    Int       @default(0) // จำนวนผู้เรียน
  duration    String    // ระยะเวลา
  description String?   @db.Text // รายละเอียด
  syllabus    Json?     // หลักสูตร (JSON)
  isPublished Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  enrollments Enrollment[]
  reviews     Review[]
}

model User {
  id           Int       @id @default(autoincrement())
  email        String    @unique
  name         String?
  avatar       String?
  role         String    @default("student") // student, instructor, admin
  createdAt    DateTime  @default(now())

  enrollments  Enrollment[]
  reviews      Review[]
  cart         CartItem[]
}

model Enrollment {
  id         Int      @id @default(autoincrement())
  userId     Int
  courseId   Int
  progress   Float    @default(0) // 0-100%
  completedAt DateTime?
  enrolledAt DateTime @default(now())

  user       User     @relation(fields: [userId], references: [id])
  course     Course   @relation(fields: [courseId], references: [id])

  @@unique([userId, courseId])
}

model CartItem {
  id        Int      @id @default(autoincrement())
  userId    Int
  courseId  Int
  addedAt   DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])

  @@unique([userId, courseId])
}

model Review {
  id        Int      @id @default(autoincrement())
  userId    Int
  courseId  Int
  rating    Int      // 1-5
  comment   String?  @db.Text
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])
  course    Course   @relation(fields: [courseId], references: [id])

  @@unique([userId, courseId])
}

model Order {
  id          Int       @id @default(autoincrement())
  userId      Int
  totalAmount Float
  status      String    @default("pending") // pending, paid, cancelled
  paymentMethod String  // card, promptpay
  items       Json      // Array of {courseId, price}
  createdAt   DateTime  @default(now())
  paidAt      DateTime?
}
```

### Migrate Database

// turbo

```bash
npx prisma migrate dev --name init
```

// turbo

```bash
npx prisma generate
```

---

## 5. สร้าง API Routes

### 5.1 สร้าง Prisma Client

สร้างไฟล์ `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

### 5.2 API: รายการคอร์สทั้งหมด

สร้างไฟล์ `src/app/api/courses/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const level = searchParams.get("level") || "";
    const priceMin = Number(searchParams.get("priceMin")) || 0;
    const priceMax = Number(searchParams.get("priceMax")) || 999999;
    const limit = Number(searchParams.get("limit")) || 100;

    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        AND: [
          // Search filter
          search
            ? {
                OR: [
                  { title: { contains: search, mode: "insensitive" } },
                  { titleEn: { contains: search, mode: "insensitive" } },
                  { instructor: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
          // Category filter
          category && category !== "ทั้งหมด" ? { category } : {},
          // Level filter
          level && level !== "All Level" ? { level } : {},
          // Price range filter
          { price: { gte: priceMin, lte: priceMax } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        titleEn: true,
        slug: true,
        category: true,
        instructor: true,
        price: true,
        image: true,
        cpe: true,
        level: true,
        rating: true,
        students: true,
        duration: true,
        description: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: courses,
      total: courses.length,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
```

### 5.3 API: รายละเอียดคอร์ส

สร้างไฟล์ `src/app/api/courses/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid course ID" },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: {
              select: { name: true, avatar: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}
```

### 5.4 API: Search Suggestions

สร้างไฟล์ `src/app/api/courses/suggestions/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (query.length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    const suggestions = await prisma.course.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { titleEn: { contains: query, mode: "insensitive" } },
          { instructor: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        instructor: true,
        price: true,
        image: true,
      },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}
```

---

## 6. สร้าง Custom Hooks

สร้างไฟล์ `src/hooks/useCourses.ts`:

```typescript
"use client";
import { useState, useEffect, useCallback } from "react";

export interface Course {
  id: number;
  title: string;
  titleEn: string;
  slug: string;
  category: string;
  instructor: string;
  price: number;
  image: string;
  cpe: number;
  level: string;
  rating: number;
  students: number;
  duration: string;
  description?: string;
}

interface UseCoursesParams {
  search?: string;
  category?: string;
  level?: string;
  priceMin?: number;
  priceMax?: number;
}

interface UseCoursesResult {
  courses: Course[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCourses(params: UseCoursesParams = {}): UseCoursesResult {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.set("search", params.search);
      if (params.category) queryParams.set("category", params.category);
      if (params.level) queryParams.set("level", params.level);
      if (params.priceMin) queryParams.set("priceMin", String(params.priceMin));
      if (params.priceMax) queryParams.set("priceMax", String(params.priceMax));

      const response = await fetch(`/api/courses?${queryParams}`);
      const json = await response.json();

      if (!json.success) {
        throw new Error(json.error || "Failed to fetch courses");
      }

      setCourses(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [
    params.search,
    params.category,
    params.level,
    params.priceMin,
    params.priceMax,
  ]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, loading, error, refetch: fetchCourses };
}

// Hook สำหรับดึงคอร์สเดียว
export function useCourse(id: number | null) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchCourse = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/courses/${id}`);
        const json = await response.json();

        if (!json.success) {
          throw new Error(json.error || "Course not found");
        }

        setCourse(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  return { course, loading, error };
}

// Hook สำหรับ search suggestions
export function useSearchSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    fetch(`/api/courses/suggestions?q=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setSuggestions(json.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [query]);

  return { suggestions, loading };
}
```

---

## 7. แก้ไข Components

### 7.1 แก้ไข `SearchContext.tsx`

```typescript
"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { useSearchSuggestions } from "@/hooks/useCourses";

// ลบ ALL_COURSES mock data ออก

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  suggestions: any[];
  suggestionsLoading: boolean;
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  selectedPriceRange: string;
  setSelectedPriceRange: (range: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");

  // ใช้ hook แทน mock data
  const { suggestions, loading: suggestionsLoading } =
    useSearchSuggestions(searchQuery);

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        suggestions,
        suggestionsLoading,
        showSuggestions,
        setShowSuggestions,
        selectedPriceRange,
        setSelectedPriceRange,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};
```

### 7.2 แก้ไข `CoursesGridArea.tsx`

```typescript
"use client"
import { useCourses } from '@/hooks/useCourses';
import { useSearch } from '@/context/SearchContext';

const CoursesGridArea = () => {
  const searchParams = useSearchParams();
  const { selectedPriceRange, setSelectedPriceRange } = useSearch();

  const [localSearch, setLocalSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [selectedLevel, setSelectedLevel] = useState('All Level');

  // หา price range
  const priceRange = PRICE_RANGES.find(p => p.value === selectedPriceRange) || PRICE_RANGES[0];

  // ใช้ hook แทน mock data
  const { courses, loading, error } = useCourses({
    search: localSearch,
    category: selectedCategory !== 'ทั้งหมด' ? selectedCategory : undefined,
    level: selectedLevel !== 'All Level' ? selectedLevel : undefined,
    priceMin: priceRange.min,
    priceMax: priceRange.max === Infinity ? undefined : priceRange.max,
  });

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">กำลังโหลดคอร์ส...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        เกิดข้อผิดพลาด: {error}
      </div>
    );
  }

  // ใช้ courses จาก API แทน filteredCourses
  return (
    // ... render courses
  );
};
```

### 7.3 แก้ไข `CoursesDetailsArea.tsx`

```typescript
"use client"
import { useSearchParams } from 'next/navigation';
import { useCourse } from '@/hooks/useCourses';

const CoursesDetailsArea = () => {
  const searchParams = useSearchParams();
  const courseId = Number(searchParams.get('id'));

  // ใช้ hook แทน mock data
  const { course, loading, error } = useCourse(courseId);

  if (loading) {
    return <div>กำลังโหลด...</div>;
  }

  if (error || !course) {
    return <div>ไม่พบคอร์สที่ต้องการ</div>;
  }

  return (
    // ... render course details
  );
};
```

---

## 8. Testing & Deployment

### ทดสอบ Local

// turbo

```bash
npm run dev
```

### ทดสอบ API

```bash
# ดึงคอร์สทั้งหมด
curl http://localhost:3000/api/courses

# ค้นหาคอร์ส
curl "http://localhost:3000/api/courses?search=เภสัช"

# ดึงคอร์สเดียว
curl http://localhost:3000/api/courses/1

# Search suggestions
curl "http://localhost:3000/api/courses/suggestions?q=เภสัช"
```

### Seed Data (เพิ่มข้อมูลเริ่มต้น)

สร้างไฟล์ `prisma/seed.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const courses = [
    {
      title: "เภสัชวิทยาคลินิกเบื้องต้น",
      titleEn: "Clinical Pharmacology Basics",
      slug: "clinical-pharmacology-basics",
      category: "วิทยาลัยเภสัชบำบัด",
      instructor: "ภก.สมชาย ใจดี",
      price: 1500,
      image: "/assets/img/courses/01.jpg",
      cpe: 2.5,
      level: "Beginner",
      duration: "6 ชั่วโมง",
      description: "เรียนรู้พื้นฐานเภสัชวิทยาคลินิก",
      isPublished: true,
    },
    // เพิ่มคอร์สอื่นๆ...
  ];

  for (const course of courses) {
    await prisma.course.upsert({
      where: { slug: course.slug },
      update: course,
      create: course,
    });
  }

  console.log("✅ Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

// turbo

```bash
npx prisma db seed
```

---

## ✅ Checklist

- [ ] ติดตั้ง Prisma และ database client
- [ ] สร้าง `.env` กับ DATABASE_URL
- [ ] สร้าง schema.prisma
- [ ] Run migration
- [ ] สร้าง `src/lib/prisma.ts`
- [ ] สร้าง API routes
- [ ] สร้าง custom hooks
- [ ] แก้ไข SearchContext.tsx
- [ ] แก้ไข CoursesGridArea.tsx
- [ ] แก้ไข CoursesDetailsArea.tsx
- [ ] ลบ mock data (ALL_COURSES, COURSES_DATA)
- [ ] ทดสอบ local
- [ ] Seed data
- [ ] Deploy to production

---

## 📞 หมายเหตุ

หากต้องการความช่วยเหลือในการ implement ขั้นตอนใดขั้นตอนหนึ่ง สามารถขอให้ Claude ช่วยได้โดยพิมพ์:

```
/database-integration
```

แล้วระบุขั้นตอนที่ต้องการ เช่น "ช่วยสร้าง API routes" หรือ "ช่วยแก้ไข CoursesGridArea"
