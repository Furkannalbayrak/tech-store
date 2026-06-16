package com.techstore.backend.infrastructure.persistence.converter;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;

/**
 * JPA <-> PostgreSQL TEXT[] (metin dizisi) dönüştürücüsü.
 *
 * Sorun: JPA, PostgreSQL'in yerel TEXT[] array tipini doğrudan desteklemez.
 * Çözüm: List<String> ↔ JSON Array String dönüşümünü bu converter yönetir.
 *
 * Veritabanında TEXT[] olarak tanımlanan image_urls kolonu,
 * JPA katmanında List<String> olarak erişilebilir hale gelir.
 *
 * Alternatif yaklaşım olarak @JdbcTypeCode(SqlTypes.ARRAY) kullanılabilirdi
 * ancak Supabase + Hibernate 6 uyumluluğunda zaman zaman sorun çıkardığından
 * bu converter yaklaşımı daha güvenilirdir.
 */
@Slf4j
@Converter(autoApply = false)
public class StringListConverter implements AttributeConverter<List<String>, String> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Java List<String> → JSON Array String (veritabanına yazılırken)
     *
     * Örnek: ["url1.jpg", "url2.jpg"] → '["url1.jpg","url2.jpg"]'
     * PostgreSQL TEXT[] kolonu bu JSON array string'ini kabul eder.
     *
     * NOT: Supabase/PostgreSQL bu değeri TEXT[] olarak cast eder.
     * Eğer sorun yaşanırsa columnDefinition'da "TEXT" kullanmak daha
     * pratik bir alternatiftir; ancak TEXT[] daha semantik açıktır.
     */
    @Override
    public String convertToDatabaseColumn(List<String> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return "[]"; // Boş liste için geçerli JSON array döndür
        }
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (Exception e) {
            log.error("[StringListConverter] List'ten JSON array'e dönüştürme hatası: {}", e.getMessage());
            return "[]";
        }
    }

    /**
     * JSON Array String → Java List<String> (veritabanından okunurken)
     *
     * Örnek: '["url1.jpg","url2.jpg"]' → ["url1.jpg", "url2.jpg"]
     */
    @Override
    public List<String> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(dbData, new TypeReference<>() {});
        } catch (Exception e) {
            log.error("[StringListConverter] JSON array'den List'e dönüştürme hatası: {}", e.getMessage());
            return new ArrayList<>();
        }
    }
}
