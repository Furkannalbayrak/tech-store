package com.techstore.backend.application.dto.webhook;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * Clerk Webhook Event Sarmalayıcı DTO'su.
 *
 * Clerk'in gönderdiği tüm webhook event'lerinin dış zarfıdır.
 * İçindeki "data" alanı event tipine göre farklı yapıda olabilir;
 * bu yüzden "data" alanı, içerdiği her alt objeyi kapsayan
 * ayrı bir iç record ile modellenir.
 *
 * Örnek Clerk webhook payload (user.created / user.updated):
 * {
 *   "type": "user.created",
 *   "data": {
 *     "id": "user_2abc...",
 *     "email_addresses": [{"email_address": "ali@test.com", "id": "idn_..."}],
 *     "first_name": "Ali",
 *     "last_name": "Yılmaz",
 *     "image_url": "https://img.clerk.com/...",
 *     "phone_numbers": [{"phone_number": "+905551234567"}]
 *   }
 * }
 *
 * @JsonIgnoreProperties(ignoreUnknown = true):
 * Clerk ileride payload'a yeni alanlar ekleyebilir.
 * Bu anotasyon, bilinmeyen alanları sessizce yoksayarak
 * derleme hatası veya JSON parse hatası oluşmasını önler.
 *
 * @param type Clerk event tipi: "user.created" | "user.updated" | "user.deleted"
 * @param data Event'e ait veri zarfı (kullanıcı bilgileri)
 */
// Clerk ileride bize yolladığı mesajın içine yeni bir özellik eklerse (örneğin kullanıcının doğum tarihi)
// ve bizim Java sınıfımızda o alan yoksa, sistem normalde "Böyle bir alan bulamadım!" diyerek çöker.
// Bu anotasyon Spring'e şunu der: "Eğer senin tanımadığın bir veri gelirse onu görmezden gel ve kodu patlatma."
@JsonIgnoreProperties(ignoreUnknown = true)
public record ClerkWebhookEvent(

        String type,
        UserData data
) {

    /**
     * "data" alanının içeriği — kullanıcı bilgileri.
     *
     * @param id           Clerk'teki kullanıcı ID'si (clerk_id olarak kaydedilir)
     * @param emailAddresses Birincil e-posta listesi (ilki alınır)
     * @param firstName    Ad
     * @param lastName     Soyad
     * @param imageUrl     Profil fotoğrafı URL'si
     * @param phoneNumbers Telefon numarası listesi (ilki alınır)
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record UserData(

            String id,

            // Clerk'te e-posta listesi gönderilir; biz sadece birincil (ilk) olanı alırız.
            // @JsonProperty: JSON'daki snake_case alan adını Java camelCase ile eşleştirir.
            @JsonProperty("email_addresses")
            List<EmailAddress> emailAddresses,

            @JsonProperty("first_name")
            String firstName,

            @JsonProperty("last_name")
            String lastName,

            @JsonProperty("image_url")
            String imageUrl,

            @JsonProperty("phone_numbers")
            List<PhoneNumber> phoneNumbers
    ) {
        /**
         * Birincil e-posta adresini döndüren yardımcı metod.
         * Liste boşsa null döner; Service katmanında null kontrolü yapılır.
         */
        public String primaryEmail() {
            if (emailAddresses == null || emailAddresses.isEmpty()) return null;
            return emailAddresses.get(0).emailAddress();
        }

        /**
         * Birincil telefon numarasını döndüren yardımcı metod.
         */
        public String primaryPhone() {
            if (phoneNumbers == null || phoneNumbers.isEmpty()) return null;
            return phoneNumbers.get(0).phoneNumber();
        }
    }

    /** Clerk e-posta nesnesi */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record EmailAddress(
            @JsonProperty("email_address") String emailAddress,
            String id
    ) {}

    /** Clerk telefon numarası nesnesi */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PhoneNumber(
            @JsonProperty("phone_number") String phoneNumber,
            String id
    ) {}
}
