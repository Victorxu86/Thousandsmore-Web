"use client";
import Link from "next/link";
import { useLang } from "@/lib/lang";

export default function TermsPage() {
  const lang = useLang();
  return (
    <main className="min-h-[calc(100vh-64px)] px-6 py-8 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-sm underline">{lang === "en" ? "Back to Home" : "返回首页"}</Link>
      </div>
      <h1 className="text-2xl font-semibold mb-4">{lang === "en" ? "Terms of Service" : "服务条款"}</h1>
      {lang === "en" ? (
        <>
          <p className="opacity-80 leading-7 text-sm">These Terms of Service (the “Terms”) constitute a legally binding agreement between you (“User”) and Thousandsmore (thousandsmore.com, “the Platform”) regarding your access to and use of the Platform. By using the Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms.</p>
          <h2 className="text-lg font-semibold mt-6 mb-2">1. Eligibility and Compliance</h2>
          <p className="opacity-80 leading-7 text-sm">You must have full legal capacity and comply with applicable laws in your jurisdiction. Adult-related content is strictly for consenting adults and must be used responsibly, lawfully, and with respect for boundaries.</p>
          <h2 className="text-lg font-semibold mt-6 mb-2">2. Services and Changes</h2>
          <p className="opacity-80 leading-7 text-sm">The Platform provides interactive content such as questions, prompts, Truth or Dare, and related premium services. We may modify, suspend, or discontinue all or part of the services for operational or compliance reasons, with reasonable notice where feasible.</p>
          <h2 className="text-lg font-semibold mt-6 mb-2">3. Payments and Access</h2>
          <p className="opacity-80 leading-7 text-sm">Payments are processed by third-party providers (e.g., Stripe). Upon successful payment, access rights associated with your account or email will be provisioned and may be restored via email. You are responsible for providing a valid and accessible email address.</p>
          <h2 className="text-lg font-semibold mt-6 mb-2">4. Acceptable Use</h2>
          <p className="opacity-80 leading-7 text-sm">You agree not to engage in unlawful, infringing, harassing, defamatory, abusive, or disruptive activities. You may not copy, scrape, resell, or otherwise exploit Platform content for commercial purposes without prior written consent.</p>
          <h2 className="text-lg font-semibold mt-6 mb-2">5. Intellectual Property</h2>
          <p className="opacity-80 leading-7 text-sm">All rights in the Platform and its content (including software, text, graphics, trademarks) are owned by the Platform or respective rights holders. No license is granted except as expressly stated. You may not reproduce or create derivative works without permission.</p>
          <h2 className="text-lg font-semibold mt-6 mb-2">6. Disclaimer and Limitation of Liability</h2>
          <p className="opacity-80 leading-7 text-sm">To the maximum extent permitted by law, the Platform is provided “as is” and “as available” without warranties of any kind. We are not liable for losses arising from force majeure, third‑party outages, or User actions, to the extent permitted by law.</p>
          <h2 className="text-lg font-semibold mt-6 mb-2">7. Termination</h2>
          <p className="opacity-80 leading-7 text-sm">We may restrict, suspend, or terminate access if you materially breach these Terms or applicable laws. We may also terminate or suspend services for compliance or security reasons.</p>
          <h2 className="text-lg font-semibold mt-6 mb-2">8. Governing Law and Dispute Resolution</h2>
          <p className="opacity-80 leading-7 text-sm">These Terms are subject to the mandatory laws of your jurisdiction. Disputes shall first be resolved amicably; failing that, they shall be submitted to a court of competent jurisdiction.</p>
          <h2 className="text-lg font-semibold mt-6 mb-2">9. Changes to the Terms</h2>
          <p className="opacity-80 leading-7 text-sm">We may update these Terms from time to time for business or legal reasons. Updates are effective upon posting. Continued use constitutes acceptance of the updated Terms.</p>
          <p className="opacity-80 leading-7 text-xs mt-8">In the event of conflict with applicable law, the law shall prevail.</p>
        </>
      ) : (
        <>
          <p className="opacity-80 leading-7 text-sm">本服务条款（“本条款”）系您（“用户”）与 Thousandsmore（thousandsmore.com，以下简称“本平台”）就您访问和/或使用本平台及相关服务所订立的具有法律约束力的协议。请在使用前仔细阅读并确保充分理解：使用本平台即表示您同意遵守本条款。</p>
          <h2 className="text-lg font-semibold mt-6 mb-2">一、资格与合规</h2>
          <p className="opacity-80 leading-7 text-sm">您应具备完全民事行为能力并遵守所在地适用法律法规。成人相关内容仅面向依法已成年的用户，且需在自愿、合规、尊重边界的前提下使用。</p>
          <h2 className="text-lg font-semibold mt-6 mb-2">二、服务内容与变更</h2>
          <p className="opacity-80 leading-7 text-sm">本平台提供话题/问题/真心话/大冒险等互动内容与相关增值服务。我们保留基于运营或合规需要随时调整、变更或中止全部或部分服务的权利，并尽可能以合理方式进行通知。</p>
          <h2 className="text-lg font-semibold mt-6 mb-2">三、付费与权益</h2>
          <p className="opacity-80 leading-7 text-sm">付费由第三方支付机构（如 Stripe）受理。订单完成后，在相应账户或邮箱识别下的权益将被开通并可通过邮件找回与恢复。您应确保提供的邮箱真实、可用且受您控制。</p>
          <h2 className="text-lg font-semibold mt-6 mb-2">四、用户行为规范</h2>
          <p className="opacity-80 leading-7 text-sm">您承诺不从事任何违法违规、侵权、骚扰、诽谤、散布不当内容、技术破坏或影响平台正常运营的行为。您不应以商业目的复制、抓取、转售或以其他方式利用平台内容，除非事先获得书面授权。</p>
          <h2 className="text-lg font-semibold mt-6 mb-2">五、知识产权</h2>
          <p className="opacity-80 leading-7 text-sm">平台内容与软件相关的著作权、商标权及其他合法权利归本平台或相关权利人所有。未经书面许可，任何人不得擅自使用、复制、传播或创作衍生作品。</p>
          <h2 className="text-lg font-semibold mt-6 mb-2">六、免责声明与责任限制</h2>
          <p className="opacity-80 leading-7 text-sm">在法律允许范围内，本平台按“现状”与“可用性”提供服务，不对适销性、特定用途适用性或非侵权作出明示或默示担保。对因不可抗力、第三方服务故障或用户自身原因导致的损失，本平台在法律允许范围内不承担责任。</p>
          <h2 className="text-lg font-semibold mt-6 mb-2">七、终止</h2>
          <p className="opacity-80 leading-7 text-sm">如用户严重违反本条款或法律法规，本平台有权在合理范围内采取包括但不限于限制、暂停或终止提供服务等措施。出于合规或安全原因，我们亦可能随时终止或中止部分或全部服务。</p>
          <h2 className="text-lg font-semibold mt-6 mb-2">八、适用法律与争议解决</h2>
          <p className="opacity-80 leading-7 text-sm">本条款的订立、效力、解释及争议解决，适用您所在地的强制性法律规定。因本条款引发的争议，双方应友好协商解决；协商不成的，提交有管辖权的法院裁判。</p>
          <h2 className="text-lg font-semibold mt-6 mb-2">九、条款更新</h2>
          <p className="opacity-80 leading-7 text-sm">我们可能基于业务与合规需要不时修订本条款。修订后的条款自发布之日起生效。您继续使用平台即表示接受更新后的条款。</p>
          <p className="opacity-80 leading-7 text-xs mt-8">如本条款与适用法律发生冲突，以法律规定为准。</p>
        </>
      )}
    </main>
  );
}


