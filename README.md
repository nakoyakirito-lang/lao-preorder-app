# Lao Preorder Logistics Web App 🇱🇦🇨🇳🇹🇭
### ລະບົບຈັດການພຣີອໍເດີ ຈີນ-ລາວ & ໄທ-ລາວ (Dark Neon Theme)

ລະບົບເວັບແອັບສຳລັບທຸລະກິດພຣີອໍເດີສິນຄ້າ ແລະ ຂົນສົ່ງລະຫວ່າງປະເທດ:
- 🇨🇳 **ຈີນ ➔ ລາວ** (CNY ¥ ➔ LAK)
- 🇹🇭 **ໄທ ➔ ລາວ** (THB ฿ ➔ LAK)

---

## ✨ ຈຸດເດັ່ນຂອງລະບົບ (Features)

1. **ຄິດໄລ່ເງິນ 2 ຂັ້ນຕອນ (Two-Stage Cost Workflow)**:
   - **ຕອນສັ່ງຊື້**: ປ້ອນລາຄາຕົ້ນທາງ (ຢວນ ¥ ຫຼື ບາດ ฿) ➔ ລະບົບແປງເປັນເງິນກີບ (LAK) ອັດຕະໂນມັດ ພ້ອມເກັບຮູບສິນຄ້າ, ຮູບແຊັດ FB/WhatsApp ແລະ ຈຸດຈັດສົ່ງໃນລາວ.
   - **ຕອນຮອດລາວ**: ປ້ອນ **ຄ່າຂົນສົ່ງມາລາວ (ກີບ LAK)** ➔ ລະບົບຄຳນວຸນຕົ້ນທຶນລວມ ແລະ ຍອດ COD ທີ່ຕ້ອງເກັບທັນທີ.
2. **ພິມບິນ Thermal (100mm / 80mm)**:
   - ຕິກເລືອກພັດສະດຸຫຼາຍລາຍການແລ້ວກົດ **Batch Print** ພິມພ້ອມກັນໄດ້ທັນທີ.
   - ຮູບແບບບິນສະອາດ ຄົບຖ້ວນ ຊັດເຈນ ບໍ່ມີ QR Code ລົບກວນ.
3. **ສ້າງຂໍ້ຄວາມແຈ້ງລູກຄ້າອັດຕະໂນມັດ (Auto Message Generator)**:
   - ປຸ່ມ **1-Click Copy** ຂໍ້ຄວາມສະຫຼຸບອໍເດີ ແລະ ແຈ້ງເຄື່ອງຮອດ ພ້ອມສົ່ງເຂົ້າ WhatsApp / Facebook ໄດ້ທັນທີ ແຕ່ລະອໍເດີບໍ່ຊ້ຳກັນ.
4. **ໜ້າຕິດຕາມພັດສະດຸສາທາລະນະ (Public Tracking Link)**:
   - ລູກຄ້າເປີດລິ້ງ `/track/[tracking_code]` ເພື່ອກວດສອບສະຖານະ ແລະ ຍອດເງິນໄດ້ເລີຍໂດຍບໍ່ຕ້ອງລັອກອິນ.
5. **UI/UX Dark Neon Green (`#00FF00`)**:
   - ພື້ນຫຼັງດຳສະອາດ, ໄຮໄລ້ສີຂຽວ Neon ສະຫວ່າງ, ຟອນ `Noto Sans Lao` ສະແດງຜົນງາມໃນມືຖື.
6. **Supabase + Offline Fallback**:
   - ໃຊ້ງານໄດ້ທັນທີເຖິງວ່າຈະຍັງບໍ່ທັນເຊື່ອມຕໍ່ Supabase (ບັນທຶກຜ່ານ Local Storage) ແລະ ພ້ອມເຊື່ອມຕໍ່ PostgreSQL Database ທຸກເວລາ.

---

## 🚀 ວິທີຕິດຕັ້ງ & ເປີດໃຊ້ງານ (Quick Start)

### 1. ຕິດຕັ້ງ Dependencies
```bash
npm install
```

### 2. ເປີດ Server ທົດສອບ (Development)
```bash
npm run dev
```
ເປີດ Browser ໄປທີ່ `http://localhost:3000`

### 3. Build ສຳລັບ Production
```bash
npm run build
npm start
```

---

## 🗄️ ການເຊື່ອມຕໍ່ Supabase

1. ສ້າງໂຄງການໃໝ່ທີ່ [Supabase.com](https://supabase.com)
2. ໄປທີ່ **SQL Editor** ແລ້ວກັອບປີ້ SQL ຈາກໄຟລ໌ `supabase/schema.sql` ໄປວາງແລ້ວກົດ **Run**
3. ສ້າງໄຟລ໌ `.env.local` ແລ້ວໃສ່ API Keys:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

---

## 📦 ການ Deploy ຂຶ້ນ GitHub & Vercel
1. ສ້າງ Repository ໃໝ່ໃນ GitHub
2. Push ໂຄດຂຶ້ນ GitHub:
```bash
git init
git add .
git commit -m "feat: Initial commit for Lao Preorder Web App"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```
3. ເຊື່ອມຕໍ່ GitHub Repository ກັບ **Vercel** ຫຼື **Netlify** ເພື່ອ Deploy ອັດຕະໂນມັດ.
