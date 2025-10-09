import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-[calc(100vh-64px)] px-6 py-8 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-sm underline">返回首页</Link>
      </div>
      <h1 className="text-2xl font-semibold mb-4">服务条款</h1>
      <p className="opacity-80 leading-7 text-sm">
        本服务条款（“本条款”）系您（“用户”）与 Thousandsmore（thousandsmore.com，以下简称“本平台”）就您访问和/或使用本平台及相关服务所订立的具有法律约束力的协议。请在使用前仔细阅读并确保充分理解：使用本平台即表示您同意遵守本条款。
      </p>
      <h2 className="text-lg font-semibold mt-6 mb-2">一、资格与合规</h2>
      <p className="opacity-80 leading-7 text-sm">
        您应具备完全民事行为能力并遵守所在地适用法律法规。成人相关内容仅面向依法已成年的用户，且需在自愿、合规、尊重边界的前提下使用。
      </p>
      <h2 className="text-lg font-semibold mt-6 mb-2">二、服务内容与变更</h2>
      <p className="opacity-80 leading-7 text-sm">
        本平台提供话题/问题/真心话/大冒险等互动内容与相关增值服务。我们保留基于运营或合规需要随时调整、变更或中止全部或部分服务的权利，并尽可能以合理方式进行通知。
      </p>
      <h2 className="text-lg font-semibold mt-6 mb-2">三、付费与权益</h2>
      <p className="opacity-80 leading-7 text-sm">
        付费由第三方支付机构（如 Stripe）受理。订单完成后，在相应账户或邮箱识别下的权益将被开通并可通过邮件找回与恢复。您应确保提供的邮箱真实、可用且受您控制。
      </p>
      <h2 className="text-lg font-semibold mt-6 mb-2">四、用户行为规范</h2>
      <p className="opacity-80 leading-7 text-sm">
        您承诺不从事任何违法违规、侵权、骚扰、诽谤、散布不当内容、技术破坏或影响平台正常运营的行为。您不应以商业目的复制、抓取、转售或以其他方式利用平台内容，除非事先获得书面授权。
      </p>
      <h2 className="text-lg font-semibold mt-6 mb-2">五、知识产权</h2>
      <p className="opacity-80 leading-7 text-sm">
        平台内容与软件相关的著作权、商标权及其他合法权利归本平台或相关权利人所有。未经书面许可，任何人不得擅自使用、复制、传播或创作衍生作品。
      </p>
      <h2 className="text-lg font-semibold mt-6 mb-2">六、免责声明与责任限制</h2>
      <p className="opacity-80 leading-7 text-sm">
        在法律允许范围内，本平台按“现状”与“可用性”提供服务，不对适销性、特定用途适用性或非侵权作出明示或默示担保。对因不可抗力、第三方服务故障或用户自身原因导致的损失，本平台在法律允许范围内不承担责任。
      </p>
      <h2 className="text-lg font-semibold mt-6 mb-2">七、终止</h2>
      <p className="opacity-80 leading-7 text-sm">
        如用户严重违反本条款或法律法规，本平台有权在合理范围内采取包括但不限于限制、暂停或终止提供服务等措施。出于合规或安全原因，我们亦可能随时终止或中止部分或全部服务。
      </p>
      <h2 className="text-lg font-semibold mt-6 mb-2">八、适用法律与争议解决</h2>
      <p className="opacity-80 leading-7 text-sm">
        本条款的订立、效力、解释及争议解决，适用您所在地的强制性法律规定。因本条款引发的争议，双方应友好协商解决；协商不成的，提交有管辖权的法院裁判。
      </p>
      <h2 className="text-lg font-semibold mt-6 mb-2">九、条款更新</h2>
      <p className="opacity-80 leading-7 text-sm">
        我们可能基于业务与合规需要不时修订本条款。修订后的条款自发布之日起生效。您继续使用平台即表示接受更新后的条款。
      </p>
      <p className="opacity-80 leading-7 text-xs mt-8">如本条款与适用法律发生冲突，以法律规定为准。</p>
    </main>
  );
}


