# 🏗 Pharmacy Academy - Front-Office Architecture Guide

## 📁 โครงสร้าง Folder (Feature-based Architecture)

```txt
src/
├── app/                      # 🚀 Routing Layer (Next.js App Router)
│   ├── (public)/            # Public routes
│   │   ├── page.tsx         # Home
│   │   ├── courses-grid/
│   │   ├── courses-details/
│   │   └── about_us/
│   ├── (auth)/              # Auth routes
│   │   ├── sign-in/
│   │   ├── register/
│   │   └── register-pharmacist/
│   └── (user)/              # Protected routes
│       ├── my-courses/
│       ├── course-learning/
│       ├── profile/
│       ├── checkout/
│       └── payment-*/
│
├── features/                 # 🧠 Business Layer (Core)
│   ├── auth/                # Authentication
│   │   ├── components/      # Login, Register forms
│   │   ├── services/        # authApi.ts
│   │   ├── hooks.ts         # useAuth, useLogin, useRegister
│   │   ├── types.ts
│   │   └── AuthProvider.tsx
│   ├── courses/             # Course catalog
│   │   ├── components/      # CourseCard, CourseGrid
│   │   ├── services/        # coursesApi.ts
│   │   ├── hooks.ts         # useCourses, useCourseDetail
│   │   └── types.ts
│   ├── cart/                # Shopping cart
│   │   ├── hooks.ts         # useCart, useAddToCart
│   │   ├── types.ts
│   │   └── CartProvider.tsx
│   ├── payment/             # Payment processing
│   │   ├── hooks.ts         # usePayment, usePromptPay
│   │   └── types.ts
│   ├── learning/            # Course learning
│   │   ├── components/      # CourseLearningArea, VimeoLessonPlayer, InteractivePromptModal
│   │   ├── services/        # learningApi.ts
│   │   ├── interactive-runtime.ts
│   │   └── types.ts
│   └── profile/             # User profile
│       ├── hooks.ts         # useProfile, useCPESummary
│       └── types.ts
│
├── components/               # 🎨 Shared UI Components
│   ├── layout/              # Header, Footer, Wrapper
│   └── ui/                  # Button, Input, Modal
│
├── layouts/                  # 📐 Layout Components
│   ├── headers/
│   └── footers/
│
├── lib/                      # 🔌 Utilities
│   └── utils.ts
│
├── styles/                   # 💅 Global Styles
│   └── globals.css
│
└── types/                    # 📝 Shared Types
```

---

## 🎯 Layer Responsibilities

### 1️⃣ app/ (Routing Layer)
- กำหนด URL routes
- Compose UI จาก features
- **ห้าม** มี business logic
- **ห้าม** fetch data โดยตรง

```tsx
// ✅ Good - Page เป็น Orchestrator
export default function CoursesPage() {
  return (
    <Wrapper>
      <CoursesGridArea />
    </Wrapper>
  );
}
```

### 2️⃣ features/ (Business Layer) - หัวใจของระบบ

แต่ละ feature มีโครงสร้าง:
```txt
features/courses/
├── components/      # UI เฉพาะ feature
├── services/        # API calls
├── hooks.ts         # Business logic
├── types.ts         # Type definitions
└── index.ts         # Exports
```

**หลักการสำคัญ:**
- ใช้ feature entrypoint ที่เป็น source of truth ของ runtime นั้นจริง
- แยก API calls ไว้ใน services
- UI components ต้อง stateless หรือถือ state เฉพาะที่จำเป็นต่อ runtime นั้น
- อย่าเดาว่า feature ไหนใช้ `hooks.ts` เป็นแกนหลักเสมอไป

```tsx
// ✅ Good - ใช้ hook จาก feature
import { useCourses } from '@/features/courses';

function CourseGrid() {
  const { courses, isLoading, filters, setFilters } = useCourses();
  // ...
}
```

### 3️⃣ components/ (Shared UI Layer)
- Reusable UI components
- **Stateless** - รับ props, render UI
- ไม่มี fetch หรือ business logic

---

## 🔄 Data Flow

```
Page → Feature Hook → Service (API) → Server
         ↓
    Component (UI)
```

1. **Page** เรียกใช้ **Feature Hook**
2. **Hook** จัดการ state และเรียก **Service**
3. **Service** ติดต่อ API
4. **Hook** คืน data ให้ **Component** render

---

## 📋 Coding Rules

### ❌ ห้าม
- fetch data ใน page.tsx หรือ component โดยตรง
- เขียน business logic ใน component
- import ข้าม feature (เช่น courses ไม่ควร import จาก payment)
- สร้าง type ซ้ำซ้อน

### ✅ ต้อง
- ใช้ hooks จาก features/ เป็นหลัก
- แยก types ไว้ใน feature/types.ts
- Page ต้อง "บาง" - เป็น orchestrator เท่านั้น
- ใช้ services สำหรับ API calls ทั้งหมด

---

## 🛠 การใช้งาน Hooks

### Auth
```tsx
import { useAuth, useLogin, useIsPharmacist } from '@/features/auth';

// เช็คสถานะ login
const { isAuthenticated, user } = useAuth();

// Login
const { login, isLoading, error } = useLogin();
await login({ email, password });

// เช็คว่าเป็นเภสัชกร
const isPharmacist = useIsPharmacist();
```

### Courses
```tsx
import { useCourses, useCourseDetail } from '@/features/courses';

// รายการคอร์ส
const { courses, filters, setFilters, isLoading } = useCourses();

// รายละเอียดคอร์ส
const { course, isLoading, error } = useCourseDetail(courseId);
```

### Cart
```tsx
import { useCart, useAddToCart, useCartCount } from '@/features/cart';

// จำนวนใน cart (สำหรับ badge)
const count = useCartCount();

// เพิ่มลง cart
const { addToCart, isInCart } = useAddToCart();
```

### Learning
```tsx
import { CourseLearningArea } from '@/features/learning';

export default function CourseLearningPage() {
  return <CourseLearningArea />;
}
```

Current learning runtime source of truth:
- `CourseLearningArea`
- `VimeoLessonPlayer`
- `InteractivePromptModal`
- `learningApi`
- `interactive-runtime`

Learning contract baseline:
- locked lesson ต้องมาแบบ sanitized payload
- learner write actions ต้องรองรับ `LESSON_LOCKED`
- progress ฝั่ง server ต้อง monotonic
- interactive questions แบบ import ใช้ bulk route เดียวที่ atomic

---

## 🔄 Migration Notes

### Context ที่เปลี่ยนไป

| เดิม | ใหม่ |
|------|------|
| `context/AuthContext.tsx` | `features/auth/AuthProvider.tsx` |
| `context/CartContext.tsx` | `features/cart/CartProvider.tsx` |
| `useAuth()` จาก context | `useAuth()` จาก `@/features/auth` |
| `useCart()` จาก context | `useCart()` จาก `@/features/cart` |

### การ Update Imports

```tsx
// ❌ เดิม
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

// ✅ ใหม่
import { useAuth } from '@/features/auth';
import { useCart } from '@/features/cart';
```

---

## 📝 TODO - Next Steps

1. [ ] ย้าย components จาก `components/courses-*` ไป `features/courses/components/`
2. [ ] ย้าย components จาก `components/auth/` ไป `features/auth/components/`
3. [ ] ย้าย components จาก `components/payment/` ไป `features/payment/components/`
4. [ ] Update imports ใน app/ pages
5. [ ] รวม `common/`, `ui/` เข้า `components/`
6. [ ] ลบ `context/` folder หลังจาก migrate เสร็จ
7. [ ] จัดกลุ่ม routes ด้วย (public), (auth), (user)
8. [x] ลบ legacy `features/learning/hooks.ts` ออกจาก repo และคง source of truth ไว้ที่ learning runtime ปัจจุบัน
