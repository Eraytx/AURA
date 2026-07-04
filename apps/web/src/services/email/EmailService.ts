import { Resend } from "resend";
import { env } from "../../lib/env";

export class EmailService {
  private static resend: Resend | null = null;

  private static getClient() {
    if (!this.resend && env.RESEND_API_KEY && env.RESEND_API_KEY !== "") {
      this.resend = new Resend(env.RESEND_API_KEY);
    }
    return this.resend;
  }

  private static getEmailTemplate(contentHtml: string) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: sans-serif; background-color: #0D0D0D; color: #F0EDE6; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background-color: #121212; border: 1px border #1E1E1E; padding: 30px; border-radius: 8px; }
            .header { text-align: center; border-bottom: 1px solid #1E1E1E; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #D4A017; letter-spacing: 2px; }
            .content { font-size: 14px; line-height: 1.6; color: #C5C4C0; }
            .footer { text-align: center; font-size: 11px; color: #666; margin-top: 30px; border-top: 1px solid #1E1E1E; padding-top: 20px; }
            .btn { display: inline-block; padding: 10px 20px; background-color: #D4A017; color: #0D0D0D; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <span class="logo">Au AURA XAUUSD</span>
            </div>
            <div class="content">
              ${contentHtml}
            </div>
            <div class="footer">
              Bu e-posta AURA XAUUSD portalı tarafından gönderilmiştir.<br/>
              Aboneliklerinizi dilediğiniz an dashboard ayarlarınızdan kapatabilirsiniz.<br/>
              © 2026 AURA. Tüm hakları saklıdır.
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private static async sendEmail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) {
    const client = this.getClient();
    const fromAddress = env.EMAIL_FROM;

    if (!client) {
      console.log(`✉️ [MOCK EMAIL SENT] To: ${to} | Subject: ${subject}`);
      return;
    }

    try {
      await client.emails.send({
        from: fromAddress,
        to,
        subject,
        html: this.getEmailTemplate(html),
      });
      console.log(`✉️ Email successfully dispatched to ${to}`);
    } catch (err: any) {
      console.error(`Failed to send email: ${err.message}`);
    }
  }

  public static async sendWelcome(email: string, name: string) {
    const html = `
      <h2>AURA XAUUSD'ye Hoş Geldiniz, ${name}!</h2>
      <p>Altın analiz portalımıza başarıyla kaydoldunuz. Platformumuzla piyasadaki en son HIGH impact verileri takip edebilir ve AI analiz motorumuzdan faydalanabilirsiniz.</p>
      <a href="${env.NEXT_PUBLIC_APP_URL}/dashboard" class="btn">Paneli Keşfet</a>
    `;
    await this.sendEmail({ to: email, subject: "AURA XAUUSD'ye Hoş Geldiniz!", html });
  }

  public static async sendEmailVerification(email: string, token: string) {
    const link = `${env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
    const html = `
      <h2>E-posta Adresinizi Doğrulayın</h2>
      <p>Lütfen AURA XAUUSD hesabınızı doğrulamak için aşağıdaki butona tıklayın. Bu bağlantı 24 saat boyunca geçerlidir.</p>
      <a href="${link}" class="btn">E-postayı Doğrula</a>
    `;
    await this.sendEmail({ to: email, subject: "Hesap Doğrulama", html });
  }

  public static async sendPasswordReset(email: string, token: string) {
    const link = `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    const html = `
      <h2>Şifre Sıfırlama Talebi</h2>
      <p>Hesabınız için bir şifre sıfırlama talebi aldık. Şifrenizi güncellemek için aşağıdaki bağlantıya tıklayın. Bu bağlantı 1 saat boyunca geçerlidir.</p>
      <a href="${link}" class="btn">Şifreyi Sıfırla</a>
    `;
    await this.sendEmail({ to: email, subject: "Şifre Sıfırlama Talebi", html });
  }

  public static async sendPaymentSuccess(email: string, planName: string, amount: string) {
    const html = `
      <h2>Ödeme Başarılı! 🎉</h2>
      <p>Aboneliğiniz başarıyla etkinleştirildi. AURA XAUUSD <strong>${planName}</strong> planına geçiş yaptınız.</p>
      <p>Ödenen Tutar: <strong>${amount}</strong></p>
      <p>Artık tam AI analiz motoru, simülatör, gelişmiş grafikler ve API erişimi gibi tüm premium özelliklerin tadını çıkarabilirsiniz.</p>
      <a href="${env.NEXT_PUBLIC_APP_URL}/dashboard" class="btn">Premium Özellikleri Başlat</a>
    `;
    await this.sendEmail({ to: email, subject: "Aboneliğiniz Başarıyla Etkinleştirildi!", html });
  }

  public static async sendPaymentFailed(email: string) {
    const html = `
      <h2>⚠️ Ödeme İşlemi Başarısız Oldu</h2>
      <p>Son abonelik ödemeniz tahsil edilemedi. Lütfen fatura bilgilerinizi kontrol edin.</p>
      <p>Size fatura bilgilerinizi güncellemeniz için <strong>3 günlük ek süre (grace period)</strong> tanımladık. Bu süre zarfında premium özelliklere erişiminiz devam edecektir.</p>
      <a href="${env.NEXT_PUBLIC_APP_URL}/dashboard/subscription" class="btn">Ödeme Bilgilerini Güncelle</a>
    `;
    await this.sendEmail({ to: email, subject: "Abonelik Ödemesi Başarısız Uyarısı", html });
  }

  public static async sendSubscriptionCanceled(email: string, expireDate: string) {
    const html = `
      <h2>Aboneliğiniz İptal Edildi</h2>
      <p>Aboneliğiniz talebiniz üzerine iptal edilmiştir. Premium özelliklere <strong>${expireDate}</strong> tarihine kadar erişebilirsiniz.</p>
      <p>Fikrinizi değiştirirseniz istediğiniz zaman abonelik sayfanızdan planınızı tekrar aktifleştirebilirsiniz.</p>
      <a href="${env.NEXT_PUBLIC_APP_URL}/dashboard/subscription" class="btn">Aboneliği Yönet</a>
    `;
    await this.sendEmail({ to: email, subject: "Abonelik İptal Onayı", html });
  }

  public static async sendHighImpactAlert(email: string, eventTitle: string, forecast: string) {
    const html = `
      <h2>🚨 Yüksek Etkili Haber Açıklanıyor!</h2>
      <p>XAUUSD üzerinde yüksek etki yaratacak olan <strong>${eventTitle}</strong> verisi birazdan açıklanacak.</p>
      <p>Beklenti Değeri: <strong>${forecast}</strong></p>
      <p>AI Analiz motorumuzun beklenti ve sapma analizlerini canlı olarak takip etmek için hemen platforma giriş yapın.</p>
      <a href="${env.NEXT_PUBLIC_APP_URL}/dashboard" class="btn">Analizi ve Canlı Tepkiyi Gör</a>
    `;
    await this.sendEmail({ to: email, subject: `AURA ALERTI: ${eventTitle}`, html });
  }
}
