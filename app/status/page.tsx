'use client';

import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

type Booking = {
  id: string;
  customer_name: string;
  service_name: string;
  booking_date: string;
  booking_time: string;
  status: string;
  total_price?: number;
};

export default function BookingStatus() {
  const [phone, setPhone] = useState('');
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const savedPhone = localStorage.getItem('userPhone');
    if (savedPhone) {
      setPhone(savedPhone);
      handleSearch(savedPhone);
    }
  }, []);

  const handleSearch = async (searchPhone: string = phone) => {
    if (!searchPhone) return;
    setIsSearching(true);
    setHasSearched(false);
    
    try {
      const q = query(
        collection(db, 'Bookings'), 
        where('customer_phone', '==', searchPhone)
      );
      
      const querySnapshot = await getDocs(q);
      const bookingsData: Booking[] = [];
      querySnapshot.forEach((doc) => {
        bookingsData.push({ id: doc.id, ...doc.data() } as Booking);
      });
      
      bookingsData.sort((a, b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime());
      
      setMyBookings(bookingsData);
    } catch (error) {
      console.error("Error searching bookings: ", error);
      alert("เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ยืนยันแล้ว': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold border border-green-200">✅ ยืนยันแล้ว</span>;
      case 'รอมัดจำ': return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold border border-yellow-200">⏳ รอมัดจำ</span>;
      case 'ยกเลิก': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold border border-red-200">❌ ยกเลิก</span>;
      case 'เสร็จสิ้น': return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-bold border border-gray-200">🏁 เสร็จสิ้นแล้ว</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-bold">{status}</span>;
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5] py-12 px-4 sm:px-6 lg:px-8 font-sans text-[#5A4A42]">
      <div className="max-w-2xl mx-auto">
        
        <div className="bg-white rounded-3xl shadow-sm border border-[#E8E0D5] p-8 sm:p-10 mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">เช็คสถานะการจองคิว</h1>
          <p className="text-[#A69B91] mb-8">กรอกเบอร์โทรศัพท์ที่คุณใช้จองคิวเพื่อตรวจสอบสถานะ</p>
          
          <div className="flex gap-3 max-w-md mx-auto">
            <input 
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="ใส่เบอร์โทรศัพท์..."
              className="flex-1 border border-[#E8E0D5] rounded-xl p-3 focus:outline-none focus:border-[#C1A68D] focus:ring-1 focus:ring-[#C1A68D]"
            />
            <button 
              onClick={() => handleSearch(phone)}
              disabled={!phone || isSearching}
              className="bg-[#C1A68D] hover:bg-[#B0957C] text-white font-bold py-3 px-6 rounded-xl transition-colors disabled:bg-gray-300"
            >
              {isSearching ? 'ค้นหา...' : 'ค้นหา'}
            </button>
          </div>
        </div>

        {hasSearched && !isSearching && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg mb-4">รายการจองของคุณ ({myBookings.length} รายการ)</h3>
            
            {myBookings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E8E0D5] p-10 text-center text-[#A69B91]">
                ไม่พบประวัติการจองสำหรับเบอร์โทรนี้
              </div>
            ) : (
              myBookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-[#E8E0D5] p-6 hover:border-[#C1A68D] transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-[#F5F0EA]">
                    <div>
                      <div className="text-sm text-[#A69B91]">วันที่จอง</div>
                      <div className="font-bold text-lg text-[#5A4A42]">{booking.booking_date} | {booking.booking_time} น.</div>
                    </div>
                    <div>
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-[#A69B91]">ชื่อลูกค้า</div>
                      <div className="font-semibold">{booking.customer_name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#A69B91]">บริการที่เลือก</div>
                      <div className="font-semibold">{booking.service_name}</div>
                    </div>
                  </div>

                  {booking.total_price && (
                    <div className="mt-4 pt-4 border-t border-dashed border-[#E8E0D5] flex justify-between items-center">
                      <span className="text-sm font-bold text-[#A69B91]">ยอดรวมทั้งหมด</span>
                      <span className="font-bold text-[#C1A68D] text-lg">฿{booking.total_price}</span>
                    </div>
                  )}
                  
                  {booking.status === 'รอมัดจำ' && booking.total_price && (
                    <div className="mt-6 bg-[#FDFBF9] p-6 rounded-2xl border border-[#C1A68D] flex flex-col items-center text-center shadow-sm">
                      <h4 className="font-bold text-[#5A4A42] mb-1">สแกน QR Code เพื่อชำระเงินมัดจำ</h4>
                      
                      <p className="text-[#A69B91] text-sm mb-4">
                        มัดจำ 50% ของยอดรวม: <span className="font-bold text-[#C1A68D] text-xl">฿{booking.total_price * 0.5}</span>
                      </p>

                      <img 
                        src={`https://promptpay.io/0823758440/${booking.total_price * 0.5}.png`} 
                        alt="PromptPay QR Code" 
                        className="w-48 h-48 mb-4 border border-[#E8E0D5] p-3 rounded-2xl bg-white shadow-sm"
                      />
                      
                      <p className="text-sm text-[#7A6A62]">
                        ธนาคารกรุงเทพ / พร้อมเพย์: <strong className="text-[#5A4A42]">082-375-8440</strong><br/>
                        ชื่อบัญชี: <strong className="text-[#5A4A42]">กรรณิกา แสงสุขวาว</strong>
                      </p>
                      
                      <div className="mt-6 text-sm text-yellow-800 bg-yellow-50 p-4 rounded-xl border border-yellow-200 w-full">
                        <p className="mb-3 font-semibold">📌 เมื่อโอนเงินเรียบร้อยแล้ว กรุณากดปุ่มด้านล่างเพื่อส่งสลิปยืนยันคิวนะคะ</p>
                        
                        <div className="flex flex-col sm:flex-row gap-2 justify-center">
                          <a href="https://line.me/ti/p/~0823758440" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#00B900] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#009900] transition-colors shadow-sm">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 3.961 8.878 9.539 9.614.417.054.975.166 1.118.577.128.368.083.945.039 1.341l-.161.996c-.049.309-.234 1.168 1.026.637 1.258-.532 6.782-3.993 9.429-6.953C22.951 14.542 24 12.528 24 10.304z"/>
                            </svg>
                            แจ้งโอนทาง Line
                          </a>
                          
                          {/* อัปเดตลิงก์ Facebook ตรงนี้ให้เด้งเข้า Inbox ทันที */}
                          <a href="https://m.me/xeuxm.nxy" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#1877F2] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#1664D9] transition-colors shadow-sm">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            Inbox เพจร้าน
                          </a>
                        </div>
                        
                      </div>
                    </div>
                  )}

                </div>
              ))
            )}
          </div>
        )}

      </div>
    </main>
  );
}