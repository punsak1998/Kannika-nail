'use client';

import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

type Service = {
  id: string;
  name: string;
  price: number;
  duration: number;
  image?: string; 
};

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [note, setNote] = useState(''); 
  const [portfolioImage, setPortfolioImage] = useState<string | null>(null); // State เก็บรูปลูกค้าเลือกจากแกลเลอรี
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const design = params.get('design');
      const price = params.get('price');
      const image = params.get('image'); // ดึงรูปลิงก์รูปภาพมาด้วย
      
      if (design) {
        let defaultNote = `เลือกลายเล็บ: ${design}`;
        if (price) defaultNote += ` (ราคาประเมิน ${price} บาท)`;
        
        setNote(defaultNote); 
        if (image) setPortfolioImage(image); // เซฟรูปลง State ไว้โชว์
        
        setSelectedServices([{
          id: 'portfolio_item',
          name: `ลายจากแกลเลอรี: ${design}`,
          price: price ? Number(price) : 0,
          duration: 60
        }]);

        setCurrentStep(2);
        
        setTimeout(() => {
          const element = document.getElementById('booking-section');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 500);
      }
    }
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'Services'));
        const servicesData: Service[] = [];
        querySnapshot.forEach((doc) => {
          servicesData.push({ id: doc.id, ...doc.data() } as Service);
        });
        setServices(servicesData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching services: ", error);
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const toggleService = (service: Service) => {
    const isSelected = selectedServices.some(s => s.id === service.id);
    if (isSelected) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file)); 
    }
  };

  const handleConfirmBooking = async () => {
    if (selectedServices.length === 0 || !selectedDate || !selectedTime || !customerName || !customerPhone) return;

    setIsSubmitting(true);
    // เริ่มต้นให้ใช้รูปจาก Portfolio ก่อน (ถ้าลูกค้ากดมาจากแกลเลอรี)
    let finalImageUrl = portfolioImage || ''; 

    try {
      // แต่ถ้าลูกค้ากดอัปโหลดรูปใหม่ (อยากแก้ลาย) ให้ใช้รูปใหม่แทน
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);
        const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
          method: 'POST',
          body: formData,
        });
        const imgbbData = await imgbbResponse.json();
        if (imgbbData.success) {
          finalImageUrl = imgbbData.data.url; 
        }
      }

      const allServiceNames = selectedServices.map(s => s.name).join(', ');

      await addDoc(collection(db, 'Bookings'), {
        customer_name: customerName,
        customer_phone: customerPhone,
        service_id: selectedServices.map(s => s.id).join(','),
        service_name: allServiceNames,
        note: note, 
        booking_date: selectedDate,
        booking_time: selectedTime,
        status: 'รอมัดจำ',
        reference_image: finalImageUrl, // เซฟรูปลง Database ให้แอดมินเห็น!
        total_price: selectedServices.reduce((total, s) => total + s.price, 0),
        created_at: serverTimestamp(),
      });

      localStorage.setItem('userPhone', customerPhone);
      alert('🎉 จองคิวสำเร็จ! ระบบจะพาไปหน้าเช็คสถานะการจองครับ');
      window.location.href = '/status'; 
      
    } catch (error) {
      console.error('Error adding booking: ', error);
      alert('เกิดข้อผิดพลาดในการจองคิว กรุณาลองใหม่อีกครั้ง');
      setIsSubmitting(false);
    }
  };

  const groupedServices = {
    'ทาสีเจล': services.filter(s => s.name.includes('ทาสีเจล')),
    'เสริมพิเศษ': services.filter(s => !s.name.includes('ทาสีเจล') && !s.name.includes('ต่อเล็บ') && !s.name.includes('ถอด PVC') && !s.name.includes('เท้า')),
    'ต่อเล็บ & ถอดเล็บ': services.filter(s => s.name.includes('ต่อเล็บ') || s.name.includes('ถอด PVC')),
    'บริการเล็บเท้า': services.filter(s => s.name.includes('เท้า')),
  };

  const scrollToBooking = () => {
    const element = document.getElementById('booking-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen bg-[#FCF9FA] font-sans text-[#4A3C40]">
      <div className="relative bg-gradient-to-br from-[#FFF0F3] to-[#FCE9ED] overflow-hidden py-16 sm:py-24 border-b border-[#EFE6E8]">
        <div className="absolute top-10 right-10 w-72 h-72 bg-[#FBDDE4] rounded-full blur-3xl opacity-60"></div>
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-[#FAD2DB] rounded-full blur-3xl opacity-50"></div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            <div className="text-center lg:text-left">
              <span className="text-xs uppercase tracking-widest text-[#D496A7] font-bold bg-white px-5 py-2 rounded-full shadow-sm border border-[#FAD2DB] inline-block mb-6">
                Premium Beauty Experience
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-extrabold text-[#4A3C40] tracking-tight leading-tight">
                รังสรรค์ความงามบนเรียวเล็บ <br className="hidden lg:block"/>
                <span className="text-[#D496A7] font-normal italic">ระดับมืออาชีพ</span>
              </h1>
              <p className="mt-6 text-base sm:text-lg text-[#826C72] max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                ให้รางวัลตัวเองด้วยบริการทำเล็บและต่อขนตาสุดพรีเมียมจาก Kannika Nail เราใส่ใจทุกรายละเอียด เพื่อความสวยและสุขภาพเล็บที่ดีของคุณ
              </p>
              <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <button 
                  onClick={scrollToBooking}
                  className="bg-[#D496A7] text-white hover:bg-[#B87A8B] font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-xl transition-all text-sm sm:text-base transform hover:-translate-y-1"
                >
                  ✨ จองคิวรับบริการ
                </button>
                <a 
                  href="/portfolio" 
                  className="bg-white text-[#826C72] border border-[#EFE6E8] hover:bg-[#FDF6F7] hover:border-[#D496A7] hover:text-[#D496A7] font-bold py-4 px-10 rounded-full shadow-sm transition-all text-sm sm:text-base flex items-center justify-center"
                >
                  ดูแกลเลอรีผลงาน
                </a>
              </div>
            </div>

            <div className="relative mt-8 lg:mt-0 w-full max-w-md mx-auto lg:max-w-none">
              <div className="relative h-80 sm:h-96 w-full">
                <img 
                  src="https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=800" 
                  alt="ผลงานทำเล็บเจล" 
                  className="absolute top-0 right-4 w-3/4 h-72 sm:h-80 object-cover rounded-3xl shadow-2xl border-4 border-white z-10 transform hover:scale-105 transition-transform duration-500"
                />
                <img 
                  src="https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=800" 
                  alt="ผลงานทำเล็บสไตล์ลูกแก้ว" 
                  className="absolute bottom-0 left-0 w-3/5 h-48 sm:h-56 object-cover rounded-3xl shadow-xl border-4 border-white z-20 transform hover:-translate-y-2 transition-transform duration-500"
                />
                <div className="absolute top-10 left-4 z-30 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-lg border border-[#FAD2DB] animate-bounce">
                  <p className="text-xs font-bold text-[#D496A7]">💅 Best Seller</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div id="booking-section" className="py-16 px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-[#EFE6E8] p-8 sm:p-12">
          
          <div className="flex justify-center items-center mb-12">
            <div className="flex items-center w-full max-w-sm justify-between relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-[#EFE6E8] -z-10"></div>
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex flex-col items-center bg-white px-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                    currentStep >= step ? 'bg-[#D496A7] border-[#D496A7] text-white' : 'bg-white border-[#EFE6E8] text-[#B8A3A9]'
                  }`}>
                    {step}
                  </div>
                  <span className={`text-xs mt-2 font-semibold ${currentStep >= step ? 'text-[#D496A7]' : 'text-[#B8A3A9]'}`}>
                    {step === 1 ? 'เลือกบริการ' : step === 2 ? 'วันและเวลา' : 'ข้อมูลลูกค้า'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center text-[#D496A7] py-10">กำลังโหลดข้อมูล...</div>
          ) : (
            <div className="animate-fade-in">
              
              {currentStep === 1 && (
                <div>
                  <h2 className="text-2xl font-bold mb-8">เลือกบริการที่ต้องการ</h2>
                  {note && (
                    <div className="mb-6 p-4 bg-[#FCE9ED] text-[#D496A7] rounded-xl font-medium border border-[#FAD2DB]">
                      ✨ {note} <br/>
                      <span className="text-sm opacity-80">(คุณสามารถเลือกบริการเสริมอื่นๆ ด้านล่างเพิ่มได้ หรือกดดำเนินการต่อได้เลย)</span>
                    </div>
                  )}

                  <div className="space-y-8">
                    {Object.entries(groupedServices).map(([category, items]) => {
                      if (items.length === 0) return null;
                      return (
                        <div key={category}>
                          <h3 className="text-[#D496A7] font-bold mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D496A7]"></span>
                            {category}
                          </h3>
                          <div className="space-y-3">
                            {items.map((service) => {
                              const isSelected = selectedServices.some(s => s.id === service.id);
                              return (
                                <label key={service.id} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all select-none ${isSelected ? 'border-[#D496A7] bg-[#FDF6F7] shadow-sm' : 'border-[#EFE6E8] hover:border-[#D496A7]'}`}>
                                  <input type="checkbox" className="hidden" checked={isSelected} onChange={() => toggleService(service)} />
                                  <div className="flex items-center gap-4">
                                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isSelected ? 'bg-[#D496A7] border-[#D496A7]' : 'bg-white border-gray-300'}`}>
                                      {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                    <span className={isSelected ? 'font-bold text-[#4A3C40]' : 'text-[#826C72] font-medium'}>{service.name}</span>
                                  </div>
                                  <span className="text-sm font-semibold text-[#D496A7]">฿{service.price}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {selectedServices.length > 0 && (
                    <div className="mt-8 p-5 bg-[#FDF6F7] border border-[#D496A7] rounded-xl flex justify-between items-center shadow-sm">
                      <span className="font-bold text-[#4A3C40]">ยอดรวมเบื้องต้น:</span>
                      <span className="text-2xl font-bold text-[#D496A7]">฿{selectedServices.reduce((total, s) => total + s.price, 0)}</span>
                    </div>
                  )}

                  <div className="mt-8 flex justify-end border-t border-[#EFE6E8] pt-6">
                    <button onClick={() => setCurrentStep(2)} disabled={selectedServices.length === 0} className="bg-[#D496A7] hover:bg-[#B87A8B] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 px-8 rounded-full transition-colors shadow-sm">
                      ดำเนินการต่อ
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h2 className="text-2xl font-bold mb-8">เลือกวันและเวลา</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block font-medium mb-3 text-[#4A3C40]">วันที่ต้องการจอง</label>
                      <input type="date" min={new Date().toISOString().split('T')[0]} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full border border-[#EFE6E8] rounded-xl p-4 focus:outline-none focus:border-[#D496A7] focus:ring-1 focus:ring-[#D496A7] text-[#4A3C40]" />
                    </div>
                    {selectedDate && (
                      <div className="pt-4">
                        <label className="block font-medium mb-3 text-[#4A3C40]">เวลาที่สะดวก</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                          {timeSlots.map((time) => (
                            <button key={time} onClick={() => setSelectedTime(time)} className={`py-3 rounded-xl border font-medium transition-colors ${selectedTime === time ? 'bg-[#D496A7] text-white border-[#D496A7] shadow-sm' : 'bg-white text-[#826C72] border-[#EFE6E8] hover:border-[#D496A7] hover:text-[#D496A7]'}`}>
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-10 flex justify-between border-t border-[#EFE6E8] pt-6">
                    <button onClick={() => setCurrentStep(1)} className="text-[#B8A3A9] hover:text-[#826C72] font-bold px-4 py-2 transition-colors">ย้อนกลับ</button>
                    <button onClick={() => setCurrentStep(3)} disabled={!selectedDate || !selectedTime} className="bg-[#D496A7] hover:bg-[#B87A8B] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 px-8 rounded-full transition-colors shadow-sm">
                      ดำเนินการต่อ
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <h2 className="text-2xl font-bold mb-8">ข้อมูลการติดต่อ</h2>
                  
                  {/* ====== แสดงรูปจากแกลเลอรี (ถ้าลูกค้าจองมาจากแกลเลอรี) ====== */}
                  {portfolioImage && (
                    <div className="mb-6 p-4 bg-[#FDF6F7] rounded-xl border border-[#FAD2DB]">
                      <label className="block font-bold mb-3 text-[#D496A7]">💅 ลายเล็บที่คุณเลือกจากแกลเลอรี</label>
                      <img src={portfolioImage} alt="Selected Design" className="h-48 w-auto rounded-lg object-cover shadow-sm border border-[#EFE6E8]" />
                      <p className="text-xs text-[#826C72] mt-3">* รูปนี้จะถูกส่งให้ช่างอัตโนมัติ ไม่ต้องอัปโหลดใหม่ครับ</p>
                    </div>
                  )}

                  <div className="space-y-5 mb-8">
                    <div>
                      <label className="block font-medium mb-2 text-[#4A3C40]">ชื่อ-นามสกุล</label>
                      <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full border border-[#EFE6E8] rounded-xl p-3 focus:outline-none focus:border-[#D496A7] focus:ring-1 focus:ring-[#D496A7]" />
                    </div>
                    <div>
                      <label className="block font-medium mb-2 text-[#4A3C40]">เบอร์โทรศัพท์ (ใช้สำหรับเช็คสถานะ)</label>
                      <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full border border-[#EFE6E8] rounded-xl p-3 focus:outline-none focus:border-[#D496A7] focus:ring-1 focus:ring-[#D496A7]" placeholder="08xxxxxxxx" />
                    </div>
                    
                    <div>
                      <label className="block font-medium mb-2 text-[#4A3C40]">หมายเหตุ / ลายเล็บที่ต้องการ</label>
                      <textarea 
                        value={note} 
                        onChange={(e) => setNote(e.target.value)} 
                        className="w-full border border-[#EFE6E8] rounded-xl p-3 focus:outline-none focus:border-[#D496A7] focus:ring-1 focus:ring-[#D496A7]" 
                        rows={2}
                        placeholder="เช่น ลายลูกแก้ว, ขอช่างมือเบาๆ"
                      />
                    </div>

                    <div className="pt-2">
                      <label className="block font-medium mb-2 text-[#4A3C40]">{portfolioImage ? 'อัปโหลดรูปเพิ่มเติม (ถ้าต้องการปรับเปลี่ยนลาย)' : 'แนบรูปภาพตัวอย่างลายเล็บ (ถ้ามี)'}</label>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FDF6F7] file:text-[#D496A7] hover:file:bg-[#FAD2DB] transition-colors cursor-pointer" />
                      {imagePreview && <img src={imagePreview} alt="Preview" className="mt-4 h-32 rounded-xl object-cover border border-[#EFE6E8] shadow-sm" />}
                    </div>
                  </div>

                  <div className="bg-[#FDF6F7] p-6 rounded-xl border border-[#FAD2DB] mb-8 text-sm space-y-3 shadow-sm">
                    <h4 className="font-bold text-[#D496A7] mb-2 text-base border-b border-[#FAD2DB] pb-2">สรุปรายการจอง</h4>
                    <p className="flex justify-between"><span className="text-[#826C72]">บริการ:</span> <span className="font-medium text-[#4A3C40] text-right">{selectedServices.map(s => s.name).join(', ')}</span></p>
                    <p className="flex justify-between"><span className="text-[#826C72]">วัน-เวลา:</span> <span className="font-medium text-[#4A3C40]">{selectedDate} เวลา {selectedTime} น.</span></p>
                    <p className="flex justify-between pt-2 border-t border-dashed border-[#FAD2DB]"><span className="font-bold text-[#4A3C40]">ยอดรวมเบื้องต้น:</span> <span className="font-bold text-[#D496A7] text-lg">฿{selectedServices.reduce((total, s) => total + s.price, 0)}</span></p>
                  </div>

                  <div className="flex justify-between border-t border-[#EFE6E8] pt-6">
                    <button onClick={() => setCurrentStep(2)} className="text-[#B8A3A9] hover:text-[#826C72] font-bold px-4 py-2 transition-colors">ย้อนกลับ</button>
                    <button onClick={handleConfirmBooking} disabled={!customerName || !customerPhone || isSubmitting} className="bg-[#D496A7] hover:bg-[#B87A8B] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 px-8 rounded-full transition-colors shadow-md flex items-center">
                      {isSubmitting ? 'กำลังบันทึกข้อมูล...' : 'ยืนยันการจองคิว'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}