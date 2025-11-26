document.getElementById('identify-btn').addEventListener('click', function() {
    const fileInput = document.getElementById('image-upload');
    const file = fileInput.files[0];
    const resultTypeElement = document.getElementById('result-type');
    const resultDetailsElement = document.getElementById('result-details');

    if (!file) {
        alert('Lütfen bir görsel yükleyin.');
        return;
    }

    resultTypeElement.textContent = 'İşleniyor...';
    resultDetailsElement.innerHTML = 'Görsel analiz ediliyor, lütfen bekleyin...';

    const reader = new FileReader();
    
    reader.onloadend = function() {
        const base64Data = reader.result.split(',')[1];
        if (!base64Data) {
            showError('Görsel yüklenirken bir hata oluştu.');
            return;
        }

        // Hata gösteren yardımcı fonksiyon
        function showError(message) {
            console.error(message);
            resultTypeElement.textContent = 'Hata';
            resultDetailsElement.innerHTML = `Hata: ${message}`;
        }

        // Google Vision API isteği
        fetch('https://vision.googleapis.com/v1/images:annotate?key=AIzaSyByDxDw93I3UYMjH6dpnWoQKj3OYwa4wuw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                requests: [{
                    image: { content: base64Data },
                    features: [
                        { type: 'LABEL_DETECTION', maxResults: 10 },
                        { type: 'TEXT_DETECTION', maxResults: 5 }
                    ]
                }]
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    console.error('API Hatası:', response.status, text);
                    throw new Error(`API Hatası (${response.status}): ${text || 'Yanıt alınamadı'}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('API Yanıtı:', JSON.stringify(data, null, 2));
            
            if (!data || !data.responses || !Array.isArray(data.responses)) {
                console.error('Geçersiz API yanıt formatı:', data);
                throw new Error('API geçersiz yanıt formatı döndürdü');
            }

            const response = data.responses[0];
            
            if (response.error) {
                throw new Error(response.error.message || 'API hatası');
            }

            if (!response.labelAnnotations || response.labelAnnotations.length === 0) {
                resultTypeElement.textContent = 'Sonuç Bulunamadı';
                resultDetailsElement.innerHTML = 'Görselde tanımlanabilir bir nesne bulunamadı.';
                return;
            }

            // Sonuçları göster
            resultTypeElement.textContent = 'Analiz Tamamlandı';
            resultDetailsElement.innerHTML = 
                '<h3>Tanımlanan Nesneler:</h3><ul>' + 
                response.labelAnnotations
                    .slice(0, 5)
                    .map(label => 
                        `<li>${label.description} (${(label.score * 100).toFixed(1)}%)</li>`
                    )
                    .join('') + 
                '</ul>';
        })
        .catch(error => {
            console.error('Hata Detayı:', error);
            showError(error.message || 'Bilinmeyen bir hata oluştu');
        });
    };

    reader.onerror = function() {
        showError('Dosya okunurken bir hata oluştu. Lütfen başka bir dosya deneyin.');
    };

    reader.readAsDataURL(file);
});
