-- =============================================================================
-- Tech-Store: Veritabanı Başlangıç Migrasyonu
-- Supabase (PostgreSQL) üzerinde çalıştırılacak SQL betiği.
-- Betik, idempotent yapıda yazılmıştır (defalarca çalıştırılabilir).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- GEREKLİ PostgreSQL EKLENTİLERİNİ AKTİF ET
-- -----------------------------------------------------------------------------

-- pgvector: Semantik (vektör tabanlı) arama için gerekli eklenti.
-- Ürün açıklamalarının embedding vektörlerini saklamak ve benzerlik sorguları
-- (örn. cosine distance) çalıştırmak için kullanılacak.
CREATE EXTENSION IF NOT EXISTS "vector";

-- uuid-ossp: PostgreSQL'in yerel UUID üretici fonksiyonunu sağlar.
-- gen_random_uuid() fonksiyonu zaten pg 13+ ile gelir; bu eklenti
-- uuid_generate_v4() alternatifini de sunar.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- =============================================================================
-- TABLO 1: users
-- Clerk üzerinden kimliği doğrulanmış kullanıcıları temsil eder.
-- Şifre Clerk tarafında yönetildiği için bu tabloda KESİNLİKLE password kolonu YOKTUR.
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (

    -- Birincil anahtar: UUID tipinde, veritabanı tarafından otomatik üretilir.
    -- Sequential (sıralı) int yerine UUID kullanmak; tahmin edilebilirliği önler
    -- ve dağıtık sistemlerde çakışma riskini ortadan kaldırır.
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Clerk'teki kullanıcı kimliği (örn. "user_2abc...").
    -- Webhook veya JWT claim'inden gelen bu değer ile yerel kayıt eşleştirilir.
    clerk_id            VARCHAR(255)    NOT NULL UNIQUE,

    -- Kullanıcının e-posta adresi. Clerk'ten senkronize edilir.
    email               VARCHAR(255)    NOT NULL UNIQUE,

    -- Kullanıcının adı ve soyadı (Clerk profilinden alınır).
    first_name          VARCHAR(100),
    last_name           VARCHAR(100),

    -- Kullanıcının profil fotoğraf URL'si (Clerk'ten senkronize edilir).
    profile_image_url   TEXT,

    -- Telefon numarası (opsiyonel, kullanıcı ekleyebilir).
    phone_number        VARCHAR(20),

    -- Soft Delete: Kaydı fiziksel olarak silmek yerine bu bayrağı false yaparız.
    -- Bu sayede kullanıcı geçmişi, siparişler ve ilişkili veriler korunur.
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,

    -- Auditing: Kaydın oluşturulma ve son güncellenme zamanları.
    -- TIMEZONE 'UTC' kullanmak, sunucu konumundan bağımsız tutarlılık sağlar.
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- users tablosu için performans indeksleri
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_email    ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active   ON users(is_active);


-- =============================================================================
-- TABLO 2: products
-- Teknoloji mağazasındaki ürünleri temsil eder.
-- Dinamik teknik özellikler (RAM, GPU, ekran boyutu vb.) JSONB kolonunda saklanır;
-- bu sayede her ürün kategorisi için ayrı tablo açmadan esnek veri yapısı kurulur.
-- =============================================================================
CREATE TABLE IF NOT EXISTS products (

    -- Birincil anahtar: UUID
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Ürünün tam adı (örn. "Apple MacBook Pro 16 M4 Pro")
    name                VARCHAR(500)    NOT NULL,

    -- Ürünün SEO dostu URL parçası (slug).
    -- Benzersiz olmalıdır; örn. "apple-macbook-pro-16-m4-pro"
    slug                VARCHAR(600)    NOT NULL UNIQUE,

    -- Kısa açıklama: Liste kartlarında gösterilecek özet.
    short_description   VARCHAR(500),

    -- Uzun açıklama: Ürün detay sayfasında gösterilecek tam içerik.
    description         TEXT,

    -- Satış fiyatı. NUMERIC(10,2) ile kuruş hassasiyetinde saklanır.
    -- FLOAT yerine NUMERIC kullanmak, finansal hesaplarda yuvarlama hatalarını önler.
    price               NUMERIC(10, 2)  NOT NULL,

    -- İndirimli fiyat (kampanya durumunda dolu olur, aksi halde NULL).
    discounted_price    NUMERIC(10, 2),

    -- Marka adı (örn. "Apple", "Samsung", "ASUS")
    brand               VARCHAR(150),

    -- Ürün kategorisi (örn. "Laptop", "Smartphone", "GPU")
    category            VARCHAR(150),

    -- Stok adedi. Negatif olamaz.
    stock_quantity      INT             NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),

    -- Görsel URL listesi: Bir ürünün birden fazla görseli olabilir.
    -- TEXT[] PostgreSQL dizisi ile saklanır; JPA tarafında List<String> olarak eşlenir.
    -- Büyük dosyalar lokal dosya sisteminde tutulur, buraya sadece relative/absolute path gelir.
    image_urls          TEXT[]          NOT NULL DEFAULT '{}',

    -- ==========================================================================
    -- JSONB KOLONU: Dinamik Ürün Özellikleri (Teknik Detaylar)
    -- ==========================================================================
    -- Her ürün kategorisinin farklı özellikleri vardır:
    --   Laptop     -> {"ram": "16GB", "cpu": "M4 Pro", "storage": "512GB SSD"}
    --   Smartphone -> {"screen_size": "6.7", "battery": "4000mAh", "5g": true}
    --   GPU        -> {"vram": "24GB", "tdp": "350W", "connector": "PCIe 4.0"}
    -- JSONB formatı:
    --   - Sıkıştırılmış binary olarak saklanır (TEXT'ten daha hızlı sorgulanır)
    --   - GIN indeksi ile alan bazlı filtreleme desteklenir
    --   - Tablo şeması değiştirmeye gerek kalmaz
    attributes         JSONB            NOT NULL DEFAULT '{}',

    -- ==========================================================================
    -- pgvector KOLONU: Semantik Arama Embedding Vektörü
    -- ==========================================================================
    -- Ürün adı + açıklaması + özelliklerinden üretilen embedding vektörü.
    -- OpenAI text-embedding-3-small modeli 1536 boyutlu vektör üretir.
    -- Bu vektör; "bana oyun için iyi bir laptop öner" gibi doğal dil sorgularına
    -- karşı cosine similarity hesabı yapmak için kullanılır.
    embedding           vector(1536),

    -- Ürünün aktif/pasif durumu (Soft Delete mantığı).
    -- false yapılmış ürünler vitrine çıkmaz ama veritabanında kalır.
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,

    -- Öne çıkan ürün bayrağı (anasayfa hero/featured section için).
    is_featured         BOOLEAN         NOT NULL DEFAULT FALSE,

    -- Auditing: Kayıt zamanları
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- products tablosu için performans indeksleri
CREATE INDEX IF NOT EXISTS idx_products_slug        ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_brand       ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_category    ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active      ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured    ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_price       ON products(price);

-- JSONB attributes kolonu üzerinde GIN indeksi:
-- Bu indeks sayesinde örn. attributes @> '{"ram": "16GB"}' gibi
-- JSONB içerik sorguları çok daha hızlı çalışır.
CREATE INDEX IF NOT EXISTS idx_products_attributes  ON products USING GIN (attributes);

-- pgvector için HNSW indeksi:
-- HNSW (Hierarchical Navigable Small World), büyük veri setlerinde
-- yaklaşık en-yakın-komşu (ANN) aramasını hızlandırır.
-- cosine_ops: Cosine benzerliği metriği kullanılacağını belirtir.
CREATE INDEX IF NOT EXISTS idx_products_embedding
    ON products USING hnsw (embedding vector_cosine_ops);


-- =============================================================================
-- TRIGGER: updated_at kolonunu otomatik güncelleyen fonksiyon
-- Her tablodaki kayıt güncellendiğinde updated_at'ı NOW() yapar.
-- Spring JPA Auditing da bunu yönetir; bu trigger ek bir güvenlik katmanıdır
-- (uygulama dışından yapılan güncellemelerde de çalışır).
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- users tablosu için trigger
CREATE OR REPLACE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- products tablosu için trigger
CREATE OR REPLACE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
