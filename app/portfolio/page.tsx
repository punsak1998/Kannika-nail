'use client';

import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  price?: number;
  image: string; 
  imageUrl?: string; 
}

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ทั้งหมด');

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const q = query(collection(db, 'Portfolio'), orderBy('created_at', 'desc'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PortfolioItem[];
        
        setItems(data);
      } catch (error) {
        console.error("Error fetching portfolio:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  const filteredItems = filter === 'ทั้งหมด' 
    ? items 
    : items.filter(item => item.category === filter);

  return (
    <div className="min-h-screen bg-[#FCF9FA] pb-20 pt-10">
      <div className="text-center px-4 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#4A3C40] mb-4">
          ผลงานของเรา (Portfolio)
        </h1>
        <p className="text-[#826C72] mb-8">รวมไอเดียและผลงานการทำเล็บ ต่อขนตา จากทางร้าน</p>
        
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {['ทั้งหมด', 'เล็บเจล', 'ต่อเล็บ', 'ต่อขนตา'].map(cat => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${
                filter === cat 
                ? 'bg-[#D496A7] text-white scale-105' 
                : 'bg-white text-[#4A3C40] hover:bg-[#FDF6F7]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-center col-span-full text-[#826C72] py-10 animate-pulse font-semibold">
            ⏳ กำลังโหลดผลงานสวยๆ...
          </p>
        ) : filteredItems.length === 0 ? (
          <p className="text-center col-span-full text-[#826C72] py-10">
            ยังไม่มีผลงานในหมวดหมู่นี้ 🥺
          </p>
        ) : (
          filteredItems.map(item => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-[#EFE6E8] overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              
              <div className="relative w-full h-64 bg-[#FDF6F7]">
                <img 
                  src={item.image || item.imageUrl} 
                  alt={item.title}
                  loading="lazy" 
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 bg-white/95 text-[#D496A7] px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                  {item.category}
                </span>
              </div>
              
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-bold text-[#4A3C40] text-lg mb-1">{item.title}</h3>
                
                {item.price && item.price > 0 ? (
                  <p className="text-[#D496A7] font-semibold text-md">ราคา {item.price} บาท</p>
                ) : (
                  <p className="text-sm text-[#826C72]">สอบถามราคาเพิ่มเติม</p>
                )}
                
                <div className="flex-grow"></div>

                {/* === ส่งลิงก์รูปภาพเพิ่มไปใน URL ด้วย === */}
                <Link 
                  href={`/?design=${encodeURIComponent(item.title)}&price=${item.price || ''}&image=${encodeURIComponent(item.image || item.imageUrl || '')}`}
                  className="mt-5 flex items-center justify-center w-full bg-[#1A1A1A] text-white py-3 rounded-xl text-sm font-bold hover:bg-[#D496A7] transition-colors shadow-sm"
                >
                  💅 จองคิวลายนี้
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="text-center mt-12">
        <Link href="/" className="inline-block bg-[#4A3C40] hover:bg-[#33292C] transition-colors text-white px-8 py-3.5 rounded-xl font-bold shadow-md">
          กลับไปหน้าจองคิว
        </Link>
      </div>
    </div>
  );
}