'use client';

import { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

// กำหนดโครงสร้างข้อมูลผลงาน
interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  price?: number;
  image?: string;
  imageUrl?: string;
}

export default function AdminAddPortfolio() {
  // State สำหรับฟอร์มเพิ่มผลงาน
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('เล็บเจล');
  const [price, setPrice] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State สำหรับดึงผลงานมาแสดงและลบ
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  // === นำ API KEY ของ ImgBB มาใส่ตรงนี้ ===
  const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

  // 1. ฟังก์ชันดึงผลงานทั้งหมดมาแสดง
  const fetchItems = async () => {
    setLoadingItems(true);
    try {
      const q = query(collection(db, 'Portfolio'), orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PortfolioItem[];
      setItems(data);
    } catch (error) {
      console.error("Error fetching portfolio items:", error);
    } finally {
      setLoadingItems(false);
    }
  };

  // ดึงข้อมูลทันทีที่เปิดหน้านี้
  useEffect(() => {
    fetchItems();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 2. ฟังก์ชันอัปโหลดผลงานใหม่
  const handleUpload = async () => {
    if (!title || !selectedImage) {
      alert('กรุณากรอกชื่อผลงานและเลือกรูปภาพ');
      return;
    }
    
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
      });
      const imgbbData = await imgbbResponse.json();

      if (!imgbbData.success) {
        throw new Error('อัปโหลดรูปภาพไม่สำเร็จ');
      }

      await addDoc(collection(db, 'Portfolio'), {
        title: title,
        category: category,
        price: price ? Number(price) : 0, 
        image: imgbbData.data.url, 
        created_at: serverTimestamp()
      });

      alert('✅ อัปโหลดผลงานสำเร็จ!');
      
      // ล้างค่าในฟอร์ม
      setTitle('');
      setCategory('เล็บเจล');
      setPrice('');
      setSelectedImage(null);
      setImagePreview(null);

      // รีเฟรชรายการผลงานด้านล่างใหม่ทันที!
      fetchItems();
      
    } catch (error) {
      console.error('Error uploading:', error);
      alert('❌ เกิดข้อผิดพลาดในการอัปโหลด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. ฟังก์ชันลบผลงาน
  const handleDelete = async (id: string) => {
    const isConfirm = window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผลงานชิ้นนี้?');
    if (!isConfirm) return;

    try {
      await deleteDoc(doc(db, 'Portfolio', id));
      alert('🗑️ ลบผลงานสำเร็จ!');
      fetchItems(); // รีเฟรชรายการใหม่หลังลบเสร็จ
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('เกิดข้อผิดพลาดในการลบ กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div className="min-h-screen bg-[#FCF9FA] flex flex-col items-center py-10 px-4">
      
      {/* ================= ส่วนที่ 1: ฟอร์มเพิ่มผลงาน ================= */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#EFE6E8] w-full max-w-2xl mb-12">
        <h2 className="text-2xl font-bold text-[#4A3C40] mb-6">เพิ่มผลงานใหม่ (Portfolio)</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-bold text-[#4A3C40] mb-2">ชื่อผลงาน / ลายเล็บ</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น ลายลูกแก้วโทนชมพู"
              className="w-full px-4 py-2 border border-[#EFE6E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D496A7]"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#4A3C40] mb-2">หมวดหมู่</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-[#EFE6E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D496A7]"
            >
              <option value="เล็บเจล">เล็บเจล</option>
              <option value="ต่อเล็บ">ต่อเล็บ</option>
              <option value="ต่อขนตา">ต่อขนตา</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold text-[#4A3C40] mb-2">ราคา (บาท)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="เช่น 399 (หากไม่ระบุให้เว้นว่างไว้)"
            className="w-full px-4 py-2 border border-[#EFE6E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D496A7]"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold text-[#4A3C40] mb-2">เลือกรูปภาพ</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-sm text-[#826C72] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FDF6F7] file:text-[#D496A7] hover:file:bg-[#F9ECEF] transition-colors cursor-pointer"
          />
          {imagePreview && (
            <div className="mt-4">
              <p className="text-sm text-[#826C72] mb-2">ตัวอย่างรูปภาพ:</p>
              <img src={imagePreview} alt="Preview" className="h-48 object-cover rounded-xl border border-[#EFE6E8]" />
            </div>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={isSubmitting}
          className={`w-full py-3 rounded-xl font-bold text-white transition-colors ${
            isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-[#D496A7] hover:bg-[#C28293] shadow-md hover:shadow-lg'
          }`}
        >
          {isSubmitting ? 'กำลังอัปโหลด...' : 'อัปโหลดผลงาน'}
        </button>
      </div>

      {/* ================= ส่วนที่ 2: จัดการผลงาน (ลบ/ดูรายการ) ================= */}
      <div className="w-full max-w-5xl">
        <h2 className="text-2xl font-bold text-[#4A3C40] mb-2">จัดการผลงานแกลเลอรี</h2>
        <p className="text-[#826C72] mb-6">หากต้องการแก้ไขลายเล็บ ให้กดลบอันเก่าทิ้ง แล้วใช้ฟอร์มด้านบนอัปโหลดใหม่ได้เลยครับ</p>
        
        {loadingItems ? (
          <p className="text-center text-[#D496A7] py-10 animate-pulse font-bold">กำลังโหลดข้อมูลผลงาน...</p>
        ) : items.length === 0 ? (
          <p className="text-center text-[#826C72] bg-white p-10 rounded-2xl border border-[#EFE6E8]">ยังไม่มีผลงานในระบบ</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-[#EFE6E8] overflow-hidden flex flex-col">
                <div className="relative h-48 bg-[#FDF6F7]">
                  <img src={item.image || item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 bg-white/90 text-[#D496A7] px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                    {item.category}
                  </span>
                </div>
                
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-bold text-[#4A3C40] text-lg mb-1">{item.title}</h3>
                  <p className="text-[#D496A7] font-semibold text-sm mb-4">
                    {item.price ? `ราคา ${item.price} บาท` : 'ไม่ระบุราคา'}
                  </p>
                  
                  <div className="flex-grow"></div>
                  
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="w-full bg-[#FFF0F3] text-red-500 hover:bg-red-500 hover:text-white border border-[#FAD2DB] hover:border-red-500 font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    ลบผลงานนี้
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}