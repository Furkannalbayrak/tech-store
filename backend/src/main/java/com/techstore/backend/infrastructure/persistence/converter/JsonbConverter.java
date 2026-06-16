package com.techstore.backend.infrastructure.persistence.converter;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;

/**
 * JPA <-> PostgreSQL JSONB dönüştürücüsü.
 *
 * Sorun: JPA/Hibernate, PostgreSQL'in JSONB veri tipini doğrudan anlayamaz.
 * Çözüm: Bu @Converter sınıfı, Java Map<String, Object> ↔ JSON String
 * dönüşümünü otomatik olarak yönetir.
 *
 * Kullanım: Entity'deki ilgili alanda @Convert(converter = JsonbConverter.class)
 * anotasyonu eklenir.
 *
 * @Converter(autoApply = false): Bu converter'ı sadece açıkça belirtilen
 * alanlarda kullan. autoApply = true yapılırsa tüm Map alanlarına uygulanır
 * ki bu istenmeyen bir davranıştır.
 */
@Slf4j
@Converter(autoApply = false)
public class JsonbConverter implements AttributeConverter<Map<String, Object>, String> {

    // Jackson ObjectMapper: JSON serileştirme/ayrıştırma için kullanılır.
    // Thread-safe olduğu için singleton olarak tutulabilir.
    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Java Map → JSON String (veritabanına yazılırken)
     *
     * Örnek: {"ram": "16GB", "cpu": "M4 Pro"} → '{"ram":"16GB","cpu":"M4 Pro"}'
     * PostgreSQL bu string'i JSONB tipinde saklar.
     */
    @Override
    public String convertToDatabaseColumn(Map<String, Object> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return "{}"; // Boş map için geçerli JSON döndür
        }
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (Exception e) {
            // Serileştirme hatası olursa loglayıp boş JSON dön
            log.error("[JsonbConverter] Map'ten JSON'a dönüştürme hatası: {}", e.getMessage());
            return "{}";
        }
    }

    /**
     * JSON String → Java Map (veritabanından okunurken)
     *
     * Örnek: '{"ram":"16GB","cpu":"M4 Pro"}' → {"ram": "16GB", "cpu": "M4 Pro"}
     */
    @Override
    public Map<String, Object> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return new HashMap<>(); // Null/boş string için boş map döndür
        }
        try {
            return objectMapper.readValue(dbData, new TypeReference<>() {});
        } catch (Exception e) {
            // Parse hatası olursa loglayıp boş map dön (uygulama çökmesini önle)
            log.error("[JsonbConverter] JSON'dan Map'e dönüştürme hatası: {}", e.getMessage());
            return new HashMap<>();
        }
    }
}
