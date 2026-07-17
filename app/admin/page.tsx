'use client';

import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';

type Booking = {
  id: string;
  customer_name: string;
  customer_phone: string;
  service_name: string;
  booking_date: string;
  booking_time: string;
  status: string;
  total_price: number;
  reference_image?: string;
  created_at: any;
};

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ทั้งหมด');

  // ดึงข้อมูลการจองทั้งหมด
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'Bookings'));
      const bookingsData: Booking[] = [];
      querySnapshot.forEach((doc) => {
        bookingsData.push({ id: doc.id, ...doc.data() } as Booking);
      });
      
      // เรียงลำดับจากวันที่ล่าสุด
      bookingsData.sort((a, b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime());
      
      setBookings(bookingsData);
    } catch (error) {
      console.error("Error fetching bookings: ", error);
      alert("เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    const confirmUpdate = window.confirm(`ยืนยันการเปลี่ยนสถานะเป็น "${newStatus}" ใช่หรือไม่?`);
    if (!confirmUpdate) return;

    try {
      const bookingRef = doc(db, 'Bookings', id);
      await updateDoc(bookingRef, { status: newStatus });
      alert('อัปเดตสถานะสำเร็จ!');
      fetchBookings(); 
    } catch (error) {
      console.error("Error updating status: ", error);
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  const deleteBooking = async (id: string) => {
    const confirmDelete = window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบคิวนี้? (ข้อมูลจะหายไปถาวร)');
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'Bookings', id));
      alert('ลบข้อมูลสำเร็จ');
      fetchBookings();
    } catch (error) {
      console.error("Error deleting booking: ", error);
      alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  // ================= คำนวณสรุปยอด (Dashboard Metrics) =================
  
  // 1. หาวันที่ และ เดือน ปัจจุบัน
  const todayDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  const currentMonth = todayDate.substring(0, 7); // Format: YYYY-MM

  // 2. ดึงเฉพาะคิวที่นับเป็นรายได้ (ยืนยันแล้ว หรือ เสร็จสิ้น)
  const validBookings = bookings.filter(b => b.status === 'เสร็จสิ้น' || b.status === 'ยืนยันแล้ว');

  // 3. คำนวณยอดขาย
  const totalRevenue = validBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
  
  const dailyRevenue = validBookings
    .filter(b => b.booking_date === todayDate)
    .reduce((sum, b) => sum + (b.total_price || 0), 0);
    
  const monthlyRevenue = validBookings
    .filter(b => b.booking_date.startsWith(currentMonth))
    .reduce((sum, b) => sum + (b.total_price || 0), 0);

  // 4. คำนวณจำนวนคิว
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'รอมัดจำ').length;
  const completedBookings = bookings.filter(b => b.status === 'เสร็จสิ้น').length;

  // กรองข้อมูลตามแถบเมนู
  const filteredBookings = filter === 'ทั้งหมด' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ยืนยันแล้ว': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">✅ ยืนยันแล้ว</span>;
      case 'รอมัดจำ': return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200 animate-pulse">⏳ รอมัดจำ</span>;
      case 'ยกเลิก': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">❌ ยกเลิก</span>;
      case 'เสร็จสิ้น': return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">🏁 เสร็จสิ้น</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <main className="min-h-screen bg-[#FCF9FA] font-sans text-[#4A3C40] pb-12">
      
      {/* Header หลังบ้าน */}
      <div className="bg-white shadow-sm border-b border-[#EFE6E8] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#D496A7]">💻 ระบบจัดการหลังบ้าน (Admin)</h1>
          <a href="/" className="text-sm font-semibold text-[#826C72] hover:text-[#D496A7] transition-colors">
            กลับหน้าแรก ➜
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* ================= โซนที่ 1: สรุปยอดขาย (Revenue) ================= */}
        <h2 className="text-lg font-bold text-[#4A3C40] mb-4 flex items-center gap-2">
          💰 สรุปยอดขาย (บาท)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#EFE6E8] border-l-4 border-l-[#D496A7]">
            <p className="text-sm text-[#826C72] font-semibold mb-1">ยอดขายวันนี้</p>
            <p className="text-2xl sm:text-4xl font-extrabold text-[#D496A7]">฿{dailyRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#EFE6E8] border-l-4 border-l-purple-400">
            <p className="text-sm text-[#826C72] font-semibold mb-1">ยอดขายเดือนนี้</p>
            <p className="text-2xl sm:text-4xl font-extrabold text-[#4A3C40]">฿{monthlyRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#EFE6E8] border-l-4 border-l-green-400">
            <p className="text-sm text-[#826C72] font-semibold mb-1">ยอดขายรวมทั้งหมด</p>
            <p className="text-2xl sm:text-4xl font-extrabold text-[#4A3C40]">฿{totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* ================= โซนที่ 2: สรุปคิว (Bookings) ================= */}
        <h2 className="text-lg font-bold text-[#4A3C40] mb-4 flex items-center gap-2">
          📅 สรุปจำนวนคิว
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#EFE6E8]">
            <p className="text-xs sm:text-sm text-[#826C72] font-semibold mb-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span> รอมัดจำ (ต้องตรวจ)
            </p>
            <p className="text-xl sm:text-3xl font-bold text-[#4A3C40]">{pendingBookings} <span className="text-sm font-normal text-[#826C72]">คิว</span></p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#EFE6E8]">
            <p className="text-xs sm:text-sm text-[#826C72] font-semibold mb-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span> คิวทั้งหมดในระบบ
            </p>
            <p className="text-xl sm:text-3xl font-bold text-[#4A3C40]">{totalBookings} <span className="text-sm font-normal text-[#826C72]">คิว</span></p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#EFE6E8] col-span-2 md:col-span-1">
            <p className="text-xs sm:text-sm text-[#826C72] font-semibold mb-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gray-400"></span> ให้บริการเสร็จสิ้น
            </p>
            <p className="text-xl sm:text-3xl font-bold text-[#4A3C40]">{completedBookings} <span className="text-sm font-normal text-[#826C72]">คิว</span></p>
          </div>
        </div>

        {/* ================= แถบตัวกรองสถานะ ================= */}
        <div className="bg-white p-2 rounded-xl shadow-sm border border-[#EFE6E8] mb-6 flex overflow-x-auto hide-scrollbar">
          {['ทั้งหมด', 'รอมัดจำ', 'ยืนยันแล้ว', 'เสร็จสิ้น', 'ยกเลิก'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`flex-shrink-0 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                filter === status 
                  ? 'bg-[#D496A7] text-white shadow-sm' 
                  : 'text-[#826C72] hover:bg-[#FDF6F7] hover:text-[#D496A7]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* ================= ตารางแสดงข้อมูล ================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#EFE6E8] overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-[#D496A7] font-bold">กำลังโหลดข้อมูลคิว...</div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-10 text-center text-[#826C72]">ไม่มีข้อมูลคิวในสถานะนี้</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FDF6F7] text-[#826C72] text-sm uppercase tracking-wider border-b border-[#EFE6E8]">
                    <th className="p-4 font-bold">วัน/เวลาจอง</th>
                    <th className="p-4 font-bold">ข้อมูลลูกค้า</th>
                    <th className="p-4 font-bold">บริการที่เลือก</th>
                    <th className="p-4 font-bold">ยอดเงิน</th>
                    <th className="p-4 font-bold text-center">สถานะ</th>
                    <th className="p-4 font-bold text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE6E8]">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-[#FCF9FA] transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-[#4A3C40]">{booking.booking_date}</div>
                        <div className="text-sm text-[#D496A7] font-semibold">{booking.booking_time} น.</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-[#4A3C40]">{booking.customer_name}</div>
                        <a href={`tel:${booking.customer_phone}`} className="text-sm text-blue-500 hover:underline">
                          📞 {booking.customer_phone}
                        </a>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-[#826C72] max-w-[200px] truncate" title={booking.service_name}>
                          {booking.service_name}
                        </div>
                        {booking.reference_image && (
                          <a href={booking.reference_image} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-1 inline-block">
                            🖼️ ดูรูปเรฟเฟอเรนซ์
                          </a>
                        )}
                      </td>
                      <td className="p-4 font-bold text-[#4A3C40]">
                        ฿{booking.total_price}
                      </td>
                      <td className="p-4 text-center">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap justify-center gap-2">
                          {booking.status === 'รอมัดจำ' && (
                            <button onClick={() => updateStatus(booking.id, 'ยืนยันแล้ว')} className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm transition-colors">
                              กดยืนยันคิว
                            </button>
                          )}
                          {booking.status === 'ยืนยันแล้ว' && (
                            <button onClick={() => updateStatus(booking.id, 'เสร็จสิ้น')} className="bg-[#4A3C40] hover:bg-black text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm transition-colors">
                              ทำเสร็จแล้ว
                            </button>
                          )}
                          {(booking.status === 'รอมัดจำ' || booking.status === 'ยืนยันแล้ว') && (
                            <button onClick={() => updateStatus(booking.id, 'ยกเลิก')} className="bg-red-400 hover:bg-red-500 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm transition-colors">
                              ยกเลิก
                            </button>
                          )}
                          <button onClick={() => deleteBooking(booking.id)} className="bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-red-600 text-xs font-bold py-1.5 px-2 rounded-lg transition-colors" title="ลบข้อมูล">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}