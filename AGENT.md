# AGENT.md - คู่มือสำหรับ AI Agent

## ภาพรวมโปรเจค

**Share Circle** เป็นแอปพลิเคชันจัดการวงแชร์ (Thai Savings Group) สร้างด้วย SvelteKit และ Svelte 5

### ฟีเจอร์หลัก
- จัดการวงแชร์หลายวง (groups)
- ติดตามการจ่ายเงินที่ใกล้ถึงกำหนด (upcoming payments)
- ติดตามการรับเงินที่ใกล้ถึงกำหนด (upcoming payouts)
- คำนวณและแสดงความคืบหน้าของวงแชร์
- จัดการกระเป๋าเงิน (wallet) และ transactions
- แสดงปฏิทินและตารางการจ่าย

---

## Tech Stack

### Core Framework
- **SvelteKit** v2.57.0
- **Svelte** v5.55.2 (ใช้ Svelte 5 syntax)
- **TypeScript** v6.0.2
- **Vite** v8.0.7

### UI & Styling
- **Tailwind CSS** v4.2.2 (ใช้ Tailwind v4)
- **shadcn-svelte** v1.2.7 (UI component library)
- **bits-ui** v2.18.0 (components)
- **Lucide Svelte** v1.8.0 (icons)
- **tailwindcss/forms** v0.5.11
- **tailwindcss/typography** v0.5.19
- **tw-animate-css** v1.4.0
- **svelte-sonner** v1.1.0 (toast notifications)
- **vaul-svelte** v1.0.0-next.7 (drawer/sheet)

### Internationalization
- **@inlang/paraglide-js** v2.15.2
- รองรับภาษา: `en`, `th`
- ใช้รูปแบบวันที่และสกุลเงินไทย (THB)

### Development Tools
- **Package Manager**: pnpm
- **ESLint** v10.2.0
- **Prettier** v3.8.1
- **Storybook** v10.3.5 (สำหรับ component development)
- **Vitest** v4.1.4 (testing)
- **Playwright** v1.59.1 (e2e testing)

### Svelte MCP Server
โปรเจคนี้มี Svelte MCP server ที่ให้เข้าถึง Svelte 5 และ SvelteKit documentation:

**เครื่องมือที่มี:**
1. `list-sections` - ค้นหาส่วนของ documentation ที่มี
2. `get-documentation` - ดึงเนื้อหา documentation
3. `svelte-autofixer` - วิเคราะห์และแก้ไขโค้ด Svelte (ต้องใช้ก่อนส่งโค้ดให้ user)
4. `playground-link` - สร้าง Svelte Playground link

---

## โครงสร้างโปรเจค

```
share-circle/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   └── ui/          # shadcn-svelte components
│   │   ├── stores/          # Svelte 5 stores
│   │   │   ├── groups.svelte.ts
│   │   │   ├── wallet.svelte.ts
│   │   │   └── persisted.svelte.ts
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   │   ├── calculator.ts    # คำนวณเงิน, format currency/date
│   │   │   └── cashflow.ts      # คำนวณ upcoming payments/payouts
│   │   └── paraglide/       # i18n
│   ├── routes/              # SvelteKit routes
│   │   ├── +page.svelte     # หน้าแรก
│   │   ├── groups/          # จัดการวงแชร์
│   │   ├── calendar/        # ปฏิทิน
│   │   └── demo/            # demo pages
│   ├── stories/             # Storybook stories
│   ├── hooks.ts             # SvelteKit hooks
│   ├── hooks.server.ts      # Server hooks
│   └── app.html             # HTML template
├── frontend/                # Monorepo workspace
├── messages/                # i18n messages
└── static/                  # Static assets
```

---

## Data Models

### Group (วงแชร์)
```typescript
interface Group {
  id: string;
  name: string;
  rounds: Round[];
  createdAt: string;
  isActive: boolean;
}
```

### Round (มือแชร์)
```typescript
interface Round {
  roundNumber: number;
  date: string;           // ISO date
  amount: number;         // เงินที่ผู้รับมือนี้จะได้
  status: 'pending' | 'paid';
  isMyRound: boolean;     // true ถ้าเป็นมือของเรา
}
```

### Wallet (กระเป๋าเงิน)
```typescript
interface Wallet {
  initialBalance: number;
  manualTransactions: Transaction[];
}
```

### Transaction (ธุรกรรม)
```typescript
interface Transaction {
  id: string;
  groupId: string | null;
  roundNumber: number | null;
  date: string;
  type: 'payment' | 'payout' | 'deposit' | 'withdrawal';
  amount: number;
  isEstimate: boolean;
  note: string;
}
```

---

## State Management

ใช้ Svelte 5 runes และ stores:

### groupsStore
จัดการข้อมูลวงแชร์ทั้งหมด:
- `groups` - ดึงวงแชร์ทั้งหมด
- `getById(id)` - ดึงวงแชร์ตาม ID
- `add(group)` - เพิ่มวงแชร์
- `update(id, updater)` - อัปเดตวงแชร์
- `remove(id)` - ลบวงแชร์
- `updateRound(groupId, roundNumber, partial)` - อัปเดตมือแชร์
- `markRoundPaid(groupId, roundNumber)` - ทำเครื่องหมายจ่ายแล้ว
- `markRoundPending(groupId, roundNumber)` - ทำเครื่องหมายรอจ่าย
- `toggleActive(id)` - เปิด/ปิดวงแชร์

### persistedState
Store ที่บันทึกลง localStorage อัตโนมัติ

### walletStore
จัดการกระเป๋าเงินและ transactions

---

## Utilities

### calculator.ts
ฟังก์ชันคำนวณเงินและ format:
- `formatCurrency(amount)` - format เป็น THB
- `formatDate(isoDate)` - format วันที่แบบไทย
- `formatDateShort(isoDate)` - format วันที่แบบสั้น
- `myTotalOwe(group)` - ผลรวมเงินที่เราได้รับ
- `iOweForRound(group)` - เงินที่เราต้องจ่ายต่อมือ
- `iReceiveForRound(round)` - เงินที่เราได้รับในมือนั้น
- `totalIReceive(group)` - ผลรวมเงินที่เราได้รับทั้งหมด
- `totalIOwe(group)` - ผลรวมเงินที่เราต้องจ่ายทั้งหมด

### cashflow.ts
ฟังก์ชันคำนวณ cashflow:
- `getUpcomingPayments(groups)` - รายการจ่ายที่ใกล้ถึง
- `getUpcomingPayouts(groups)` - รายการรับที่ใกล้ถึง

---

## Scripts

```bash
# Development
pnpm dev              # เริ่ม dev server
pnpm dev -- --open    # เริ่ม dev server และเปิด browser

# Building
pnpm build            # build production
pnpm preview          # preview production build

# Quality
pnpm check            # type checking ด้วย svelte-check
pnpm check:watch      # type checking แบบ watch
pnpm lint             # lint ด้วย prettier + eslint
pnpm format           - format ด้วย prettier

# Storybook
pnpm storybook        # เริ่ม Storybook
pnpm build-storybook  # build Storybook
```

---

## กฎการพัฒนา

### 1. ใช้ Svelte 5 Syntax
- ใช้ runes (`$state`, `$derived`, `$effect`) แทน Svelte 4 syntax
- ใช้ `<script lang="ts">` สำหรับ TypeScript
- ใช้ event modifiers แบบใหม่

### 2. ใช้ Svelte MCP Server
- เมื่อเขียน Svelte code ต้องใช้ `svelte-autofixer` ก่อนส่งให้ user
- ถ้าต้องการดู documentation Svelte ให้ใช้ `list-sections` และ `get-documentation`

### 3. UI Components
- ใช้ components จาก `shadcn-svelte` และ `bits-ui`
- import จาก `$lib/components/ui/...`
- ใช้ Lucide icons จาก `@lucide/svelte`

### 4. Internationalization
- ใช้ Paraglide สำหรับ i18n
- format วันที่และเงินให้รองรับภาษาไทย (THB)
- ใช้ `Intl.DateTimeFormat('th-TH', ...)` สำหรับวันที่

### 5. State Management
- ใช้ Svelte 5 stores จาก `src/lib/stores/`
- ใช้ `persistedState` สำหรับข้อมูลที่ต้องบันทึกลง localStorage
- ใช้ `$derived` สำหรับ computed values

### 6. Code Style
- ใช้ Prettier และ ESLint
- ใช้ Tailwind CSS v4
- ใช้ `clsx` และ `tailwind-merge` สำหรับ merge classes

---

## ข้อควรระวัง

- เป็น monorepo ที่มี `frontend/` folder แยก
- ใช้ Tailwind CSS v4 (ไม่ใช่ v3)
- ใช้ Svelte 5 (มี syntax ใหม่)
- รองรับภาษาไทยเป็นหลัก
- ข้อมูลถูกบันทึกใน localStorage
