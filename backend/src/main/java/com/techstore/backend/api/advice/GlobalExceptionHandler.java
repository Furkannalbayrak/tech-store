package com.techstore.backend.api.advice;

import com.techstore.backend.domain.exception.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.stream.Collectors;

/**
 * Global İstisna İşleyici (Global Exception Handler).
 *
 * @RestControllerAdvice: Tüm @RestController sınıflarından fırlatılan
 * istisnaları merkezi bir noktada yakalar.
 * Bu sayede:
 *   1. Her Controller'da try-catch blokları yazmak gerekmez.
 *   2. Tüm hata yanıtları tek bir DTO formatında (ErrorResponse) döner.
 *   3. Hata loglaması merkezi olarak yapılır.
 *   4. Frontend, hangi endpoint'ten gelirse gelsin tutarlı hata formatını işler.
 *
 * SINIF SIRASI (ÖNCELİK):
 * Spring, en spesifik exception handler'ı önce çalıştırır.
 * Genel Exception handler en sona bırakılmıştır.
 */
// log için bu kutuphaneyi ekliyoruz
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // =========================================================================
    // DOMAIN İSTİSNALARI
    // =========================================================================

    /**
     * EntityNotFoundException → HTTP 404 Not Found
     *
     * Ürün veya kullanıcı bulunamadığında Service katmanı bu istisnayı fırlatır.
     * Frontend bu yanıtla "404 Ürün Bulunamadı" sayfasını gösterebilir.
     */
    // EntityNotFoundException isimli hata fırlatılırsa onu yakala ve hemen altındaki metoda sok
    @ExceptionHandler(EntityNotFoundException.class)
    // Bir API'den cevap dönerken sadece veri dönmeyiz; aynı zamanda HTTP durum kodu (404, 200, 500 vb.)
    // dönmemiz gerekir. ResponseEntity bu ikisini (Data + Status Code) paketlememizi sağlar.
    public ResponseEntity<ErrorResponse> handleEntityNotFound(EntityNotFoundException ex, HttpServletRequest request){
        // EntityNotFoundException objesini ex değişkeninin içine koyar

        // request bizim o anki kullanıcının bizim sunucumuza yaptığı isteğin ta kendisidir
        // Hangi URL'ye girmeye çalışıyordu? Hangi tarayıcıyı kullanıyordu? gibi bilgileri içerir

        log.warn("[GlobalHandler] Kayıt bulunamadı. path={}, mesaj={}", request.getRequestURI(), ex.getMessage());

        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request.getRequestURI());
    }

    // =========================================================================
    // VALIDATION İSTİSNALARI
    // =========================================================================

    /**
     * MethodArgumentNotValidException → HTTP 400 Bad Request
     *
     * @Valid veya @Validated ile işaretlenmiş DTO alanları doğrulama
     * kurallarını ihlal ettiğinde Spring bu istisnayı fırlatır.
     * Örn: @NotBlank, @Email, @Size anotasyonlarının başarısız olması.
     *
     * Hata mesajı oluşturma:
     *   Tüm alan hatalarını "fieldName: mesaj" formatında birleştirip
     *   tek bir string olarak döndürürüz. Frontend tüm hataları aynı anda görebilir.
     */
    // Spring, uygulamanın neresinde olursa olsun (Kayıt olma, ürün ekleme vb.) DTO'larımızdaki
    // @NotBlank (Boş geçilemez), @Email (E-posta formatı olmalı) gibi doğrulama (validation) kurallarına
    // takılan bir istek gelirse, otomatik olarak MethodArgumentNotValidException isimli bu hatayı fırlatır. 
    // Bu satır da o hatayı havada kapar.
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationError(MethodArgumentNotValidException ex, HttpServletRequest request) {
        // Dışarıya veri (Data) + HTTP Durum Kodu (Status Code) fırlatacağımızı söyleriz. Verimizin kalıbı da ErrorResponse objesidir.
        
        // Tüm alan hatalarını topla ve tek bir mesajda birleştir
        String errorMessage = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));

        log.warn("[GlobalHandler] Validation hatası. path={}, hatalar={}", request.getRequestURI(), errorMessage);

        return buildResponse(HttpStatus.BAD_REQUEST, errorMessage, request.getRequestURI());
    }

    /**
     * MissingServletRequestParameterException → HTTP 400 Bad Request
     *
     * Zorunlu bir query parametresi eksik olduğunda fırlatılır.
     * Örn: GET /api/v1/products/attributes?key=ram (value parametresi eksik)
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParam(
            MissingServletRequestParameterException ex, HttpServletRequest request) {

        String message = "Zorunlu parametre eksik: " + ex.getParameterName();
        log.warn("[GlobalHandler] Eksik parametre. path={}, parametre={}", request.getRequestURI(), ex.getParameterName());

        return buildResponse(HttpStatus.BAD_REQUEST, message, request.getRequestURI());
    }

    /**
     * HttpMessageNotReadableException → HTTP 400 Bad Request
     *
     * Gelen HTTP istek gövdesi (body) parse edilemediğinde fırlatılır.
     * Örn: Beklenen JSON yerine bozuk veya boş body gönderilmesi.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleMessageNotReadable(
            HttpMessageNotReadableException ex, HttpServletRequest request) {

        log.warn("[GlobalHandler] Okunamayan istek gövdesi. path={}", request.getRequestURI());

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "İstek gövdesi okunamadı veya geçersiz JSON formatı.",
                request.getRequestURI()
        );
    }

    /**
     * IllegalArgumentException → HTTP 400 Bad Request
     *
     * İş mantığında geçersiz parametre ile çağrı yapıldığında fırlatılır.
     * Örn: JSONB filtre string'i oluşturulamazsa ProductServiceImpl bu istisnayı atar.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex, HttpServletRequest request) {

        log.warn("[GlobalHandler] Geçersiz argüman. path={}, mesaj={}", request.getRequestURI(), ex.getMessage());

        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request.getRequestURI());
    }

    // =========================================================================
    // GÜVENLİK İSTİSNALARI
    // =========================================================================

    /**
     * AuthenticationException → HTTP 401 Unauthorized
     *
     * JWT token eksik, süresi dolmuş veya geçersiz olduğunda Spring Security
     * bu istisnayı fırlatır.
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthentication(
            AuthenticationException ex, HttpServletRequest request) {

        log.warn("[GlobalHandler] Kimlik doğrulama başarısız. path={}", request.getRequestURI());

        return buildResponse(
                HttpStatus.UNAUTHORIZED,
                "Kimlik doğrulama gereklidir. Geçerli bir JWT token sağlayın.",
                request.getRequestURI()
        );
    }

    /**
     * AccessDeniedException → HTTP 403 Forbidden
     *
     * Kimliği doğrulanmış kullanıcının bu kaynağa erişim yetkisi yoksa
     * Spring Security bu istisnayı fırlatır.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest request) {

        log.warn("[GlobalHandler] Erişim reddedildi. path={}", request.getRequestURI());

        return buildResponse(
                HttpStatus.FORBIDDEN,
                "Bu kaynağa erişim yetkiniz bulunmamaktadır.",
                request.getRequestURI()
        );
    }

    // =========================================================================
    // GENEL HATA YAKALAYICI (FALLBACK)
    // =========================================================================

    /**
     * Exception → HTTP 500 Internal Server Error
     *
     * Yukarıdaki handler'ların hiçbirinin yakalamadığı beklenmedik hatalar
     * buraya düşer. Üretim ortamında stack trace kullanıcıya gösterilmez;
     * yalnızca genel bir mesaj döner (güvenlik gereği).
     *
     * LOGLAMA: Beklenmedik hatalar ERROR seviyesinde loglanır;
     * bu sayede monitoring/alerting sistemleri (Sentry vb.) tetiklenebilir.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex, HttpServletRequest request) {

        // Beklenmedik hata → stack trace log'a yazılır ama response'a dahil edilmez
        log.error("[GlobalHandler] Beklenmedik hata. path={}, hata={}", request.getRequestURI(), ex.getMessage(), ex);

        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Sunucu tarafında beklenmedik bir hata oluştu. Lütfen tekrar deneyin.",
                request.getRequestURI()
        );
    }

    // =========================================================================
    // YARDIMCI METOD
    // =========================================================================

    /**
     * Standart ErrorResponse nesnesi oluşturup ResponseEntity içinde döndürür.
     *
     * Tüm handler'lar bu metodla ErrorResponse'ı oluşturur;
     * bu da formatın her yerde tutarlı olmasını garantiler.
     *
     * @param status  HTTP durum kodu (HttpStatus enum)
     * @param message Hata açıklaması
     * @param path    İstek URL'si
     * @return Standart hata yanıtı
     */
    private ResponseEntity<ErrorResponse> buildResponse(HttpStatus status, String message, String path) {
        ErrorResponse body = new ErrorResponse(
                Instant.now(),       // Hatanın oluşma zamanı (UTC)
                status.value(),      // HTTP kod (örn. 404)
                status.getReasonPhrase(), // HTTP açıklaması (örn. "Not Found")
                message,             // İş mantığı hata mesajı
                path                 // Hatanın oluştuğu endpoint
        );
        return ResponseEntity.status(status).body(body);
    }
}
