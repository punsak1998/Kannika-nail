'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { auth } from '../../lib/firebase'; // ดึงระบบยืนยันตัวตนมาใช้
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // เพิ่มสถานะโหลดตรวจสอบสิทธิ์
  const [email, setEmail] = useState(''); // เพิ่มช่องใส่อีเมล
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const pathname = usePathname();

  // ตรวจสอบสถานะการล็อกอินกับ Firebase ตลอดเวลา
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false); // ตรวจสอบเสร็จแล้วปิดโหมดโหลด
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      // ใช้ Firebase ตรวจสอบอีเมลและรหัสผ่าน
      await signInWithEmailAndPassword(auth, email, password);
      // ถ้าสำเร็จ onAuthStateChanged จะเปลี่ยนหน้าให้อัตโนมัติ
    } catch (err) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); // สั่ง Firebase ให้ Log out
    } catch (err) {
      console.error('Logout Error:', err);
    }
  };

  // ระหว่างรอ Firebase ตรวจสอบสิทธิ์ ให้ขึ้นหน้าจอโหลด
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <p className="text-gray-500 font-bold animate-pulse">⏳ กำลังตรวจสอบสิทธิ์...</p>
      </div>
    );
  }

  // ถ้ายืนยันตัวตนยังไม่ผ่าน ให้แสดงหน้าจอ Login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm text-center border border-gray-200">
          <h1 className="text-2xl font-bold text-[#4A3C40] mb-2">🔒 ระบบหลังบ้าน</h1>
          <p className="text-[#826C72] mb-6 text-sm">สำหรับเจ้าของร้านเท่านั้น</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="อีเมลแอดมิน"
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-[#D496A7] focus:ring-1 focus:ring-[#D496A7]"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="รหัสผ่าน"
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-[#D496A7] focus:ring-1 focus:ring-[#D496A7]"
              required
            />
            {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}
            <button 
              type="submit" 
              className="w-full bg-[#1A1A1A] hover:bg-[#D496A7] text-white font-bold py-3 rounded-xl transition-colors shadow-md"
            >
              เข้าสู่ระบบ
            </button>
          </form>
          
          <div className="mt-8 text-sm border-t border-gray-100 pt-6">
            <Link href="/" className="text-[#D496A7] hover:text-[#B87A8B] font-semibold underline">
              กลับไปหน้าจองคิวสำหรับลูกค้า
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ถ้ายืนยันตัวตนผ่านแล้ว ให้แสดงแถบเมนูแอดมิน และเนื้อหาหน้าเว็บ
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-[#1A1A1A] text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            <div className="font-bold text-lg text-[#D496A7]">
              Admin Panel
            </div>
            
            <div className="flex space-x-2 sm:space-x-4 items-center">
              <Link 
                href="/admin" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/admin' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                ตารางคิวงาน
              </Link>
              <Link 
                href="/admin/portfolio" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/admin/portfolio' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                จัดการแกลเลอรี
              </Link>
              <button 
                onClick={handleLogout}
                className="ml-2 bg-[#D496A7] hover:bg-[#B87A8B] px-4 py-2 rounded-lg text-sm font-bold transition-colors"
              >
                ออกจากระบบ
              </button>
            </div>
            
          </div>
        </div>
      </nav>
      
      <div className="py-2">
        {children}
      </div>
    </div>
  );
}