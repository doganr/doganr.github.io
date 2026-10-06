Title: Derin Öğrenme ile Tıbbi Görüntü Segmentasyonu: Pratik Bir Giriş
Date: 2025-01-15 10:00
Category: Derin Öğrenme
Tags: derin öğrenme, tıbbi görüntüleme, segmentasyon, U-Net, pankreas
Slug: derin-ogrenme-tibbi-goruntu-segmentasyonu
Author: Ramazan Ozgur Dogan
Lang: tr
Summary: Derin öğrenme teknikleri, tıbbi görüntü segmentasyonunda devrim yaratıyor. Bu yazıda, BT görüntülerinde pankreas segmentasyonu üzerine yürüttüğüm araştırmadan edindiğim pratik içgörüleri paylaşıyorum.

# Derin Öğrenme ile Tıbbi Görüntü Segmentasyonu

Tıbbi görüntü segmentasyonu, derin öğrenmenin sağlık alanındaki en etkili uygulamalarından biridir. Pankreas gibi
anatomik yapıların otomatik segmentasyonu, klinisyenlerin tümörleri daha erken tespit etmesini, ameliyatları daha
hassas planlamasını ve tedavi sürecini otomatik olarak izlemesini sağlar.

Bu yazıda, *Computer Methods and Programs in Biomedicine* (2021) dergisinde yayımlanan **iki aşamalı Mask R-CNN
ve 3D U-Net** yaklaşımıma ilişkin temel öngörülerimi paylaşacağım.

## Pankreas Segmentasyonu Neden Bu Kadar Zor?

Pankreas, otomatik segmentasyon açısından son derece zorlu bir organdır:

- **Küçük ve düzensiz şekil** — Karaciğer veya kalpten farklı olarak pankreasın tutarlı bir geometrisi yoktur
- **Düşük kontrast** — BT taramalarında çevre yağ dokusu ile iç içe geçer
- **Yüksek hasta-arası varyasyon** — Boyut ve konum bireyler arasında büyük farklılıklar gösterir

Bu zorluklar, klasik algoritmaları (eşikleme, bölge büyütme) büyük ölçüde işlevsiz kılar. Derin öğrenme,
bu alanda tek gerçekçi yaklaşımdır.

## İki Aşamalı Yaklaşım

Çözümümüz problemi iki aşamaya ayırır:

### Aşama 1 — Kaba Lokalizasyon (Mask R-CNN)
İlk olarak **Mask R-CNN**, her BT diliminde pankreas bölgesini kabaca tespit eder. Bu adım, arama uzayını
dramatik biçimde daraltır ve ilgisiz arka plan anatomisini elenmiş olur.

### Aşama 2 — İnce Segmentasyon (3D U-Net)
Kırpılmış bölge, hacimsel yamalar üzerinde çalışan ve 3D uzaysal bağlamı yakalayan bir **3D U-Net**'e beslenir.
Bu özellik, pankreas gibi ince ve düzensiz yapılar için kritik öneme sahiptir.

## Temel Sonuçlar

NIH Pancreas-CT veri setinde **~%85 Dice Benzerlik Katsayısı (DSC)** elde ettik — tek aşamalı yaklaşımlarla
kıyaslandığında önemli ölçüde daha az yanlış pozitif oranıyla birlikte dönemin son teknoloji yöntemleriyle
rekabet edebilir bir performans.

## Deneyimlerden Çıkan Dersler

1. **Kaba-ince yaklaşım her zaman işe yarar** — Küçük yapılar için doğrudan tam hacimden segmentasyon yapmaya çalışmayın
2. **3D bağlam önemlidir** — 2D dilim-dilim yaklaşımlar dilimler arası bilgiyi kaçırır
3. **Veri artırma şarttır** — Rastgele döndürme, elastik deformasyon ve yoğunluk kaydırmaları uyguladık
4. **Son-işlem gürültüyü temizler** — Bağlı bileşen analizi ve morfolojik işlemler tahminleri düzenler

---

📄 **Tam makale:** [DOI: 10.1016/j.cmpb.2021.106141](https://doi.org/10.1016/j.cmpb.2021.106141)
