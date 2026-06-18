package com.techstore.backend.domain.exception;

/**
 * Veritabanında aranılan kayıt bulunamadığında fırlatılan özel istisna sınıfı.
 *
 * Spring'in @ResponseStatus ile eşleştirilerek HTTP 404 döndürülür.
 * Service katmanında Optional.orElseThrow() ile kullanılır:
 *
 *   repository.findById(id)
 *       .orElseThrow(() -> new EntityNotFoundException("Ürün bulunamadı: " + id));
 *
 * RuntimeException'dan türetilmesi, metodların throws bildirimi yapmasını
 * gerektirmez (unchecked exception); bu da iş mantığı kodunu temiz tutar.
 */
public class EntityNotFoundException extends RuntimeException {

    /**
     * Yalnızca mesaj içeren constructor.
     * Örn: new EntityNotFoundException("User bulunamadı: " + clerkId)
     */
    public EntityNotFoundException(String message) {
        super(message);
    }

    /**
     * Mesaj + kök neden içeren constructor.
     * Zincirlenmiş istisna durumlarında debug kolaylığı sağlar.
     */
    public EntityNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
