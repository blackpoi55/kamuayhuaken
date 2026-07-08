import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ScreenshotProvider } from "@blackpoi55/screenshotreport";
import "@blackpoi55/screenshotreport/styles.css";

// ตั้งค่า capture + dashboard ที่เดียว
const screenshotConfig = {
  // ========== ต้องมี (required) 4 ตัว ==========
  projectCode: "kamuayhuaken",                              // รหัสโปรเจค (เดิม = bucode) → ใช้ยิง/ดึงข้อมูล
  apiBaseUrl: "https://api-h-series.telecorp.co.th/api",    // ฐาน API (ไม่ต้องมี / ท้าย)
  caseReportPath: "/casereport",                            // path หน้า dashboard (ปุ่ม 💬 เปิดหน้านี้)
  members: [                                                // รายชื่อผู้ดูแล dev/IT (เดิม = devOptions)
    // label/value ต้องมี ; color/textcolor/image (SVG string) ใส่หรือไม่ก็ได้
    { label: "โบ๊ท",   value: "โบ๊ท",   color: "#3b82f6", textcolor: "#ffffff" },
    { label: "เอส",    value: "เอส",    color: "#ef4444", textcolor: "#ffffff" },
    { label: "ออย",    value: "ออย",    color: "#f97316", textcolor: "#ffffff" },
    // ใส่ไอคอน SVG ได้ (จะโชว์เป็น avatar):
    // { label: "แคมป์", value: "แคมป์", color: "#06b6d4", textcolor: "#ffffff", image: "<svg ...>...</svg>" },
  ],

  // ========== ไม่บังคับ (optional — มี default ให้) ==========
  projectName: "แผนที่รัศมีจรวดกัมพูชา",  // ชื่อโชว์บนรายงาน/หัว dashboard (default = projectCode)
  attachmentUrl: "https://drive.google.com/drive/folders/xxxxx",  // ลิงก์แนบในโมดัลเคส (ไม่ใส่ = ไม่โชว์ปุ่ม)

  // ---- ตัวเลือก dropdown ต่างๆ (ค่าด้านล่างคือ default อยู่แล้ว ใส่เพื่อ override เท่านั้น) ----
  statusOptions: [
    { label: "ทั้งหมด", value: "" },
    { label: "🟡 pending", value: "pending" },
    { label: "💻 Dev Done", value: "devdone" },
    { label: "🔧รออัพ Production", value: "waitproduction" },
    { label: "💻 Test Done", value: "testdone" },
    { label: "✅ resolved", value: "resolved" },
    { label: "❌ rejected", value: "rejected" },
    { label: "🔄 Converted to CR", value: "convertedtocr" },
  ],
  priorityOptions: [
    { label: "ทุกความสำคัญ", value: "" },
    { label: "🔴 1 วิกฤติ", value: "1 วิกฤติ" },
    { label: "🟠 2 สูง", value: "2 สูง" },
    { label: "🟡 3 ปานกลาง", value: "3 ปานกลาง" },
    { label: "🟢 4 ต่ำ", value: "4 ต่ำ" },
  ],
  sortOptions: [
    { label: "ล่าสุด ⬇️", value: "createdat-desc" },
    { label: "เก่าสุด ⬆️", value: "createdat-asc" },
  ],
  titleOptions: [   // dropdown "หัวข้อปัญหา" ตอนกดส่งเคส
    { label: "-- เลือกหัวข้อปัญหา --", value: "" },
    { label: "🌐 หน้าเว็บโหลดไม่ขึ้น", value: "หน้าเว็บโหลดไม่ขึ้น" },
    { label: "🌀 หน้าเว็บค้าง / ไม่ตอบสนอง", value: "หน้าเว็บค้างหรือไม่ตอบสนอง" },
    { label: "🚨 Error / แจ้งเตือนผิดปกติ", value: "เกิด Error หรือแจ้งเตือนผิดปกติ" },
    { label: "🔘 ปุ่มหรือฟังก์ชันกดไม่ได้", value: "ปุ่มหรือฟังก์ชันใช้งานไม่ได้" },
    { label: "📥 กรอกข้อมูลแล้วไม่บันทึก", value: "กรอกข้อมูลแล้วไม่บันทึก" },
    { label: "📊 ข้อมูลแสดงผลผิด", value: "แสดงผลไม่ถูกต้อง" },
    { label: "🔐 เข้าสู่ระบบไม่ได้", value: "ปัญหาการเข้าสู่ระบบ" },
    { label: "🐢 โหลดข้อมูลช้า / Time out", value: "โหลดข้อมูลช้า / Time out" },
    { label: "💥 ระบบล่ม", value: "ระบบล่มทั้งหมด" },
    { label: "✏️ อื่น ๆ (ระบุในรายละเอียด)", value: "อื่น ๆ" },
  ],
  moduleOptions: [   // dropdown "modules" ในโมดัลเคส
    { label: "🟢 Inventory", value: "Inventory" },
    { label: "🟠 QA", value: "QA" },
    { label: "🔴 LAB/Admin", value: "LAB/Admin" },
    { label: "🚨 Equipment", value: "Equipment" },
    { label: "🚨 Variance", value: "Variance" },
    { label: "🚨 Setting", value: "Setting" },
  ],
  typeOptions: [   // dropdown "ประเภทที่แจ้ง" ในโมดัลเคส
    { label: "🟢 Issue", value: "Issue" },
    { label: "🟠 ขอเพิ่มเงื่อนไข/ปรับการแสดงผล", value: "ขอเพิ่มเงื่อนไข/ปรับการแสดงผล" },
    { label: "🔴 คำถาม/ปรึกษา", value: "คำถาม/ปรึกษา" },
    { label: "🚨 Change Request", value: "Change Request" },
    { label: "🚨 User Error", value: "User Error" },
    { label: "🚨 Bug", value: "Bug" },
  ],
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "แผนที่รัศมีจรวดกัมพูชา",
  description:
    "เว็บจำลองรัศมีการยิงจรวดจากกัมพูชา เพื่อช่วยคนไทยมองภาพรวมโซนอันตรายและวางแผนอพยพอย่างระมัดระวัง",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ScreenshotProvider config={screenshotConfig}>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1">{children}</main>

            <footer className="w-full border-t border-slate-800 bg-slate-950/90 text-[11px] text-slate-500">
              <div className="max-w-6xl mx-auto px-4 py-2 text-center">
                BoatMousay
              </div>
            </footer>
          </div>
        </ScreenshotProvider>
      </body>
    </html>
  );
}
