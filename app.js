document.getElementById('identify-btn').addEventListener('click', function() {
    const fileInput = document.getElementById('image-upload');
    const file = fileInput.files[0];

    if (!file) {
        alert('Lütfen bir görsel yükleyin.');
        return;
    }

    const reader = new FileReader();
    reader.onloadend = function () {
        const imageData = reader.result.split(',')[1]; // Görseli Base64 formatına dönüştür

        // Google Vision API çağrısı
        fetch('https://vision.googleapis.com/v1/images:annotate?key=AIzaSyBX7EwlbQA_HbCsjBXxkCVecO33vRzHUDE', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                requests: [
                    {
                        image: { content: imageData },
                        features: [{ type: "LABEL_DETECTION", maxResults: 10 }]
                    }
                ]
            })
        })
        .then(response => response.json())
        .then(data => {
            // API yanıtındaki etiket verilerini kontrol et
            if (data.responses && data.responses[0] && data.responses[0].labelAnnotations) {
                const labels = data.responses[0].labelAnnotations;
                const resultType = labels[0].description; // İlk etiketin açıklaması
                document.getElementById('result-type').textContent = `Tür: ${resultType}`;

                // Sonuçları ekrana yazdır
                let details = '';
                if (labels.length > 0) {
                    details = 'Tanımlanan etiketler: <br>';
                    labels.forEach(label => {
                        details += `- ${label.description} (Kesinlik: ${label.score.toFixed(2)}) <br>`;
                    });
                } else {
                    details = 'Sonuç bulunamadı.';
                }
                
                document.getElementById('result-details').innerHTML = details;
            } else {
                alert('Google Vision API hatası: Yanıt beklenilen formatta değil.');
            }
        })
        .catch(error => {
            console.error('API çağrısı sırasında hata oluştu:', error);
            alert('Bir hata oluştu. Lütfen tekrar deneyin.');
        });
    };

    reader.readAsDataURL(file); // Görseli Base64 formatında okuyun
});
// Yorumlar listesi ve butonlara erişim
const yorumAlani = document.getElementById("yorum-alani");
const yorumEkleBtn = document.getElementById("yorum-ekle");
const yorumListesi = document.getElementById("yorum-listesi");

// Yorum ekleme fonksiyonu
yorumEkleBtn.addEventListener("click", () => {
    const yorumMetni = yorumAlani.value.trim();
    if (yorumMetni === "") {
        alert("Lütfen bir yorum yazın!");
        return;
    }

    // Yorum elemanını oluştur
    const li = document.createElement("li");
    li.textContent = yorumMetni;

    // Silme butonu ekle
    const silBtn = document.createElement("button");
    silBtn.textContent = "Sil";
    silBtn.style.marginLeft = "10px";
    silBtn.addEventListener("click", () => {
        yorumListesi.removeChild(li);
    });

    // Yorum ve silme butonunu listeye ekle
    li.appendChild(silBtn);
    yorumListesi.appendChild(li);

    // Yorum alanını temizle
    yorumAlani.value = "";
});
