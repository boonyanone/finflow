# Product Roadmap & Architecture Blueprint

## 🎯 Vision & Positioning
**AI-Native Local-First Business Intelligence & Accounting Hub for Thai SMEs & Enterprises**
ระบบวิเคราะห์ธุรกิจ บัญชี และภาษีแบบ Local-First (Zero-Data-Leakage) รองรับทั้งการรันแบบ Browser Standalone, On-Premise Internal Server และ Hybrid SaaS พร้อมระบบความปลอดภัยและการจัดการสิทธิ์การใช้งาน

---

## 📌 Phase Overview & Status

### ✅ Phase 1: Core Engine & SME Foundation (Completed)
- [x] **Universal SME Business Sectors**: รองรับ 6 กลุ่มธุรกิจหลักของไทย (ค้าส่ง/ปลีก, บริการวิชาชีพ, รับเหมาก่อสร้าง, โรงงานผลิต, ขนส่ง, อาหาร/F&B)
- [x] **Tax & Accounting Integrations**: ระบบนำเข้าข้อมูล Excel จากโปรแกรมบัญชียอดนิยม (Express, FlowAccount, PEAK, myAccount, Sage 50)
- [x] **DBD Auto-Fill & Financial Benchmark**: เชื่อมโยงรหัส TSIC Code, วิเคราะห์อัตราส่วนทางการเงิน และเปรียบเทียบข้อมูลงบการเงิน DBD
- [x] **Local Storage Engine**: บันทึกและประมวลผลข้อมูลในเบราว์เซอร์ของผู้ใช้ 100%
- [x] **Role-Based Cost Masking**: ระบบซ่อนข้อมูลต้นทุนและกำไรขั้นต้นสำหรับ Role พนักงานขาย (Sales)

---

### ⏳ Phase 2: System Optimization & Lean Architecture (In Progress)
- [x] **AGENTS.md Directives**: บันทึกมาตรฐานวิศวกรรมสากลและ AI-Native Patterns
- [ ] **Codebase Audit & Dead Code Removal**: ตรวจสอบและกำจัดโค้ดที่ไม่ได้ใช้งาน ลดขนาด Bundle ให้เบาและโหลดเร็วที่สุด
- [ ] **Data Contract Normalization**: ปรับ `types.ts` ให้รัดกุม รองรับทั้ง IndexedDB และ SQLite ในอนาคต
- [ ] **Component Size Optimization**: ย่อย Component ที่มีขนาดเกิน 250 บรรทัด เพื่อเพิ่มความยืดหยุ่นในการ Refactor

---

### 🚀 Phase 3: SaaS Licensing & On-Premise Deployment (Next Milestone)
- [ ] **License Key & Entitlement Engine**: ระบบตรวจสอบ License Key แบบ Offline/Online (JWT Signing)
- [ ] **Multi-Role & User Access Matrix (RBAC)**: ระบบกำหนดสิทธิ์ผู้ใช้งาน (Owner, Manager, Accountant, Sales, Auditor)
- [ ] **Database Persistence Abstraction**: ตัวเชื่อมต่อ Data Layer ให้เลือกระหว่าง:
  - Client-Side: IndexedDB / LocalStorage
  - On-Premise Server: SQLite / PostgreSQL
- [ ] **Backup, Restore & Data Migration Engine**: ส่งออกและนำเข้าข้อมูลแบบเข้ารหัส (Encrypted JSON / SQLite Backup)
- [ ] **Audit Trail & Activity Log**: บันทึกประวัติการแก้ไขและนำเข้าข้อมูลภายในองค์กร
