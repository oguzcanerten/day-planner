# 📋 Günlük İş Planlayıcısı

Vue.js ile geliştirilmiş yazılım mühendisleri için modern ve kullanıcı dostu günlük iş planlama uygulaması.

## ✨ Özellikler

- 🔄 **Sürükle-Bırak**: Görevleri sütunlar arasında kolayca taşıyın
- 📱 **Responsive Tasarım**: Mobil ve masaüstü uyumlu
- 🎯 **Öncelik Seviyeleri**: Yüksek, orta, düşük öncelik seviyeleri
- ⏱️ **Zaman Tahmini**: Her görev için tahmini süre
- 🎨 **Modern Arayüz**: Güzel ve kullanıcı dostu tasarım
- 🇹🇷 **Türkçe Dil Desteği**: Tam Türkçe arayüz
- 🔥 **Firebase Entegrasyonu**: Real-time veri senkronizasyonu
- ✏️ **Görev Düzenleme**: Görevleri anında düzenleme
- 🗑️ **Görev Silme**: Kolay görev silme işlemi

## 🚀 Kurulum

1. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

2. **Firebase Konfigürasyonu:**
   - [Firebase Console](https://console.firebase.google.com/) 'da yeni proje oluşturun
   - Firestore Database'i etkinleştirin (test modunda başlayın)
   - Web uygulaması ekleyin ve config bilgilerini alın
   - `.env` dosyasını güncelleyin:
   ```bash
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

3. **Geliştirme sunucusunu başlatın:**
   ```bash
   npm run dev
   ```

4. **Tarayıcınızda açın:**
   ```
   http://localhost:5173
   ```

## 🏗️ Proje Yapısı

```
day-planner/
├── index.html              # Ana HTML dosyası
├── main.js                 # Vue uygulaması giriş noktası
├── style.css               # Ana stil dosyası
├── package.json            # Proje bağımlılıkları
├── vite.config.js          # Vite konfigürasyonu
└── src/
    ├── App.vue             # Ana uygulama bileşeni
    └── components/
        ├── TaskColumn.vue  # Görev sütunu bileşeni
        └── TaskCard.vue    # Görev kartı bileşeni
```

## 🎯 Kullanım

1. **Görev Ekleme**: Her sütunun altındaki "Yeni Görev Ekle" butonuna tıklayın
2. **Görev Taşıma**: Görev kartlarını sürükleyip istediğiniz sütuna bırakın
3. **Görev Düzenleme**: Kart üzerine gelip düzenleme butonuna tıklayın
4. **Görev Silme**: Kart üzerine gelip silme butonuna tıklayın
5. **Real-time Güncellemeler**: Firebase sayesinde tüm değişiklikler anında senkronize olur

## 🛠️ Teknolojiler

- **Vue 3**: Modern Vue.js framework
- **Vite**: Hızlı geliştirme ortamı
- **Composition API**: Vue 3'ün yeni API yapısı
- **Firebase**: Real-time veritabanı ve hosting
- **Firestore**: NoSQL doküman veritabanı
- **CSS3**: Modern stil özellikleri
- **Font Awesome**: İkon kütüphanesi

## 📦 Komutlar

- `npm run dev` - Geliştirme sunucusunu başlatır
- `npm run build` - Üretim için derler
- `npm run preview` - Derlenen uygulamayı önizler

## 🎨 Tema

Uygulama modern gradient tema ile tasarlanmıştır:
- **Renk Paleti**: Mavi-mor gradient arka plan
- **Kartlar**: Saydam beyaz kartlar ile cam efekti
- **İkonlar**: Font Awesome ikonu seti
- **Tipografi**: Segoe UI font ailesi

## 🔮 Gelecek Güncellemeler

- [x] Firebase entegrasyonu
- [x] Görev düzenleme özelliği
- [x] Görev silme özelliği
- [x] Real-time güncellemeler
- [ ] Kullanıcı authentication
- [ ] Göreve tarih ekleme
- [ ] Dosya ekleme özelliği
- [ ] Görev filtreleme ve arama
- [ ] Dark mode desteği
- [ ] Görev kategorileri
- [ ] E-mail bildirimleri

---

**Güzel kodlamalar! 🚀** 