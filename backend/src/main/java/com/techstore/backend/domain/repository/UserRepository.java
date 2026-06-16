package com.techstore.backend.domain.repository;

import com.techstore.backend.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Kullanıcı (User) Repository arayüzü.
 *
 * Spring Data JPA'nın JpaRepository'sini genişletir.
 * Bu sayede save(), findById(), findAll(), delete() gibi
 * standart CRUD metodları otomatik olarak kullanılabilir hale gelir.
 *
 * KİMLİK DOĞRULAMA STRATEJİSİ:
 * Clerk entegrasyonunda iki senaryo söz konusudur:
 *   1. Webhook (user.created eventi): Clerk, yeni kullanıcı kaydında
 *      POST isteği gönderir → clerk_id ile yeni User kaydı oluşturulur.
 *   2. API isteği: JWT token'dan çıkarılan clerk_id ile yerel kullanıcı bulunur.
 * Bu nedenle clerk_id üzerinden sorgulama bu repository'nin en kritik işlevidir.
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    // -------------------------------------------------------------------------
    // clerk_id Üzerinden Sorgular
    // -------------------------------------------------------------------------

    /**
     * Verilen clerk_id'ye sahip aktif kullanıcıyı döndürür.
     *
     * Kullanım: Korumalı bir API endpointine gelen JWT token parse edildiğinde,
     * token içindeki clerk_id ile yerel User kaydı bu metod aracılığıyla bulunur.
     *
     * Optional dönmesinin nedeni: Clerk'te var olan ama henüz webhook'u
     * gelmemiş (yani yerel veritabanında kaydı oluşturulmamış) bir kullanıcı
     * olabilir. Optional ile bu durum null pointer exception'a yol açmadan yönetilir.
     *
     * Spring Data JPA, metod adından JPQL'i otomatik türetir:
     *   SELECT u FROM User u WHERE u.clerkId = :clerkId AND u.isActive = true
     */

    // Spring Data JPA'nın müthiş bir özelliği vardır: Metodun adını İngilizce kurallarına göre doğru yazarsanız, SQL kodunu kendisi arka planda yazar!
    // Ne yapıyor? "Bana clerk_id'si şu olan VE aktif (isActive=true) olan kullanıcıyı getir" diyor.
    Optional<User> findByClerkIdAndIsActiveTrue(String clerkId);

    /**
     * Verilen clerk_id'ye sahip bir kullanıcının var olup olmadığını kontrol eder.
     *
     * Kullanım: Clerk webhook'u geldiğinde (user.created eventi) önce bu metod
     * çağrılır. Eğer true dönerse webhook tekrar işlenmez (idempotency sağlanır).
     * Bu kontrol, aynı webhook'un birden fazla tetiklenmesi durumunda
     * veritabanına mükerrer kayıt yazılmasını önler.
     *
     * Otomatik türetilen JPQL:
     *   SELECT COUNT(u) > 0 FROM User u WHERE u.clerkId = :clerkId
     */

    // Bu clerk_id veritabanında var mı?" diye sorar.
    boolean existsByClerkId(String clerkId);

    /**
     * Verilen e-posta adresine sahip bir kullanıcının var olup olmadığını kontrol eder.
     *
     * Kullanım: E-posta değişikliği webhook'u geldiğinde (user.updated) çakışma
     * kontrolü için kullanılır. Farklı bir clerk_id ama aynı e-posta ile
     * kayıt oluşturulmaya çalışıldığında bu metod tetiklenir.
     *
     * Otomatik türetilen JPQL:
     *   SELECT COUNT(u) > 0 FROM User u WHERE u.email = :email
     */
    // bu email veritabanında var mı?" diye sorar.
    boolean existsByEmail(String email);

    /**
     * Verilen e-posta adresine sahip aktif kullanıcıyı döndürür.
     *
     * Kullanım: E-posta ile kullanıcı arama veya profil sayfası
     * doğrulama senaryolarında kullanılır.
     *
     * Otomatik türetilen JPQL:
     *   SELECT u FROM User u WHERE u.email = :email AND u.isActive = true
     */

    // E-posta adresine göre aktif kullanıcıyı arar.
    Optional<User> findByEmailAndIsActiveTrue(String email);

    // -------------------------------------------------------------------------
    // Soft Delete Destekli Özel Sorgu
    // -------------------------------------------------------------------------

    /**
     * Clerk webhook'u ile kullanıcı hesabı silindiğinde (user.deleted eventi)
     * yerel kaydı "pasif" yapmak için kullanılır.
     *
     * NEDEN @Query?
     * Spring Data'nın türetilmiş metodları DELETE veya UPDATE işlemi yapamaz.
     * Soft delete için UPDATE sorgusu gerektiğinden @Query + @Modifying kullanılması
     * gerekir; ancak bu bir "durum değişikliği" olduğu için Service katmanında
     * findByClerkId + entity.setIsActive(false) + save() üçlüsüyle de yapılabilir.
     * Buraya sadece yardımcı bir lookup metodu koyuyoruz; güncelleme Service'e bırakılıyor.
     *
     * clerk_id ile kullanıcıyı bulur (aktif veya pasif fark etmeksizin).
     * Webhook "hesap silme" işleminde mevcut durumu kontrol etmek için gereklidir.
     */

    // Sadece clerkId'ye bakar. Kullanıcı aktifmiş (isActive=true) veya silinmiş (isActive=false) umurunda olmaz. Direkt bulup getirir.
    // @Query kullanmamızın nedeni tamamen özel bir sorgu olması
    @Query("SELECT u FROM User u WHERE u.clerkId = :clerkId")
    Optional<User> findByClerkIdRegardlessOfStatus(@Param("clerkId") String clerkId);
}
