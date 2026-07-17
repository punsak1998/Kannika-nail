import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ระบบจองคิวร้าน Kannika Nail",
  description: "จองคิวทำเล็บ ต่อขนตา ร้าน Kannika Nail ใช้งานง่าย ตลอด 24 ชั่วโมง",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={inter.className}>
        
        {/* แถบ Navbar ด้านบนสุด */}
        <nav className="bg-white shadow-sm border-b border-[#EFE6E8] sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              
              {/* โลโก้ร้าน (ด้านซ้าย) */}
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl sm:text-2xl font-extrabold text-[#D496A7] tracking-tight">
                  💅 Kannika <span className="text-[#4A3C40]">Nail</span>
                </Link>
              </div>
              
              {/* เมนูและปุ่มติดต่อ (ด้านขวา) */}
              <div className="flex items-center space-x-1 sm:space-x-3">
                
                {/* ไอคอนติดต่อเบอร์โทร (กดแล้วโทรออกได้เลย) */}
                <a href="tel:0823758440" title="โทรสอบถาม: 0823758440" className="p-2 rounded-full hover:bg-[#FDF6F7] transition-colors group flex items-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#D496A7] group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </a>

                {/* ไอคอนติดต่อ Line (เด้งไปหน้าแชท) */}
                <a href="https://line.me/ti/p/~0823758440" target="_blank" rel="noopener noreferrer" title="ติดต่อทาง Line" className="p-2 rounded-full hover:bg-[#F2FBF2] transition-colors group flex items-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#00B900] group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 3.961 8.878 9.539 9.614.417.054.975.166 1.118.577.128.368.083.945.039 1.341l-.161.996c-.049.309-.234 1.168 1.026.637 1.258-.532 6.782-3.993 9.429-6.953C22.951 14.542 24 12.528 24 10.304z"/>
                  </svg>
                </a>
                
                {/* ไอคอนติดต่อ Facebook (เด้งเข้า Inbox) */}
                <a href="https://m.me/xeuxm.nxy" target="_blank" rel="noopener noreferrer" title="ทัก Inbox เพจ" className="p-2 rounded-full hover:bg-[#F0F5FF] transition-colors group flex items-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#1877F2] group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* เส้นคั่นบางๆ สำหรับแยกโซน (แสดงเฉพาะบนคอม) */}
                <div className="hidden sm:block w-px h-6 bg-[#EFE6E8] mx-1 sm:mx-2"></div> 

                {/* เมนูนำทาง (ซ่อนคำว่า จองคิว/ผลงาน ในจอมือถือเพื่อประหยัดพื้นที่) */}
                <Link href="/" className="hidden sm:block text-[#826C72] hover:bg-[#FDF6F7] hover:text-[#D496A7] font-bold px-3 py-2 rounded-full transition-all text-sm">
                  จองคิว
                </Link>
                <Link href="/portfolio" className="hidden sm:block text-[#826C72] hover:bg-[#FDF6F7] hover:text-[#D496A7] font-bold px-3 py-2 rounded-full transition-all text-sm">
                  ผลงาน
                </Link>
                
                {/* ===== ปุ่ม Admin (รูปกุญแจ) เพิ่มตรงนี้ ===== */}
                <Link href="/admin" title="สำหรับแอดมิน" className="text-xl opacity-40 hover:opacity-100 transition-opacity p-1 ml-1 sm:ml-2">
                  🔒
                </Link>

                {/* ปุ่มเช็คสถานะ (เน้นให้เด่น) */}
                <Link href="/status" className="bg-[#D496A7] text-white hover:bg-[#B87A8B] font-bold px-3 sm:px-4 py-2 rounded-full transition-all text-xs sm:text-sm shadow-sm ml-1">
                  เช็คสถานะ
                </Link>
              </div>
              
            </div>
          </div>
        </nav>

        {children}
        
      </body>
    </html>
  );
}