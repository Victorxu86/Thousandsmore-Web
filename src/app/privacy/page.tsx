import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-[calc(100vh-64px)] px-6 py-8 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-sm underline">返回首页</Link>
      </div>
      <h1 className="text-2xl font-semibold mb-4">隐私政策</h1>
      <p className="opacity-80 leading-7 text-sm">
        本隐私政策旨在以正式、清晰的方式说明我们在您访问、使用 Thousandsmore 平台时如何收集、使用、存储与共享您的个人信息，以及您就该等信息所享有的权利。除非另有约定，本政策所称“我们”或“本平台”，系指 Thousandsmore（thousandsmore.com）。
      </p>
      <h2 className="text-lg font-semibold mt-6 mb-2">一、信息收集范围</h2>
      <p className="opacity-80 leading-7 text-sm">
        我们可能根据业务需要收集以下信息：
        1) 与支付与履约相关的信息（例如：邮箱、支付凭证标识符、交易摘要与时间戳）；2) 为改进产品所需的技术日志（例如：设备信息、浏览器信息、IP 大致来源与错误日志）；3) 您在自愿情况下提供的反馈、邮件与支持沟通记录。我们不收集与题库内容之外的敏感个人信息，且不会在未告知的情况下进行与业务无关的个人画像。
      </p>
      <h2 className="text-lg font-semibold mt-6 mb-2">二、信息使用目的</h2>
      <p className="opacity-80 leading-7 text-sm">
        我们收集并使用信息系为：完成订单与权益开通、提供与改进产品功能、进行必要的安全审计与风险控制、履行法律法规或监管要求，以及向您提供售后与支持服务。
      </p>
      <h2 className="text-lg font-semibold mt-6 mb-2">三、信息存储与保护</h2>
      <p className="opacity-80 leading-7 text-sm">
        我们采用行业通行的安全措施（包括但不限于访问控制、加密存储、最小化权限与备份/PITR）保护您的信息安全。除法律法规另有规定或为实现业务目的所必需的最短期限外，我们将以实现上述目的所必要的合理期限保留您的信息。
      </p>
      <h2 className="text-lg font-semibold mt-6 mb-2">四、信息共享与第三方</h2>
      <p className="opacity-80 leading-7 text-sm">
        为实现支付、数据托管与基础设施服务，我们可能与需要履行相应职责的第三方共享必要信息（例如：支付处理方 Stripe、数据库与鉴权服务 Supabase、托管与部署服务 Vercel）。该等第三方将受合约或政策约束，仅在必要范围内处理您的信息。
      </p>
      <h2 className="text-lg font-semibold mt-6 mb-2">五、您的权利</h2>
      <p className="opacity-80 leading-7 text-sm">
        在法律允许范围内，您有权访问、更正或删除您的个人信息，有权撤回同意或限制某些处理活动，并有权就本政策与我们的数据处理行为进行咨询与投诉。您可通过站内联系渠道或邮件与我们联系。
      </p>
      <h2 className="text-lg font-semibold mt-6 mb-2">六、政策更新</h2>
      <p className="opacity-80 leading-7 text-sm">
        我们会根据业务及法律要求适时更新本政策。重大变更将以显著方式提醒。继续使用本平台即表示您已阅读、理解并同意受更新后的政策约束。
      </p>
      <p className="opacity-80 leading-7 text-xs mt-8">如本政策与适用法律发生冲突，以法律规定为准。</p>
    </main>
  );
}


