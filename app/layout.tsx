import type { Metadata } from "next";
import Link from "next/link";
import { M_PLUS_1_Code, Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";
import { imoutoState } from "@/lib/state";

const zenMaru = Zen_Maru_Gothic({
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-zen-maru",
  display: "swap",
});

const mplusCode = M_PLUS_1_Code({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mplus-code",
  display: "swap",
});

export const metadata: Metadata = {
  title: "なう | デプロイで生きる妹",
  description: "ロリポップ！デプロイナウの無料プランの上で暮らす妹「なう」。デプロイされるたびに1回ぶん成長します。手紙はGitで届き、電話は60秒で切れます。",
};

/** JSTの時間帯を <html data-time> に書き込む。描画前に走らせてチラつきを防ぐ。 */
const timeScript = `(function(){var h=(new Date().getUTCHours()+9)%24;var t=h>=5&&h<10?"morning":h>=10&&h<17?"day":h>=17&&h<22?"evening":"night";document.documentElement.dataset.time=t;})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={`${zenMaru.variable} ${mplusCode.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: timeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <header className="mx-auto w-full max-w-3xl px-5 pt-6 pb-2 flex items-center justify-between">
          <Link href="/" className="font-black text-xl tracking-wide text-pink-deep">
            なう
          </Link>
          <nav className="flex gap-5 text-sm font-bold text-ink-soft">
            <Link href="/diary" className="hover:text-pink-deep">
              成長日記
            </Link>
            <Link href="/call" className="hover:text-pink-deep">
              電話する
            </Link>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-3xl px-5 pb-16 flex-1">{children}</main>
        <footer className="mx-auto w-full max-w-3xl px-5 py-8 text-xs text-ink-soft border-t border-line">
          <p>
            第{imoutoState.generation}回デプロイ目のなう。ロリポップ！デプロイナウの無料プランで暮らしています。
          </p>
          <p className="log-line mt-1">runtime: lolipop deploy-now free / storage: git / db: none</p>
        </footer>
      </body>
    </html>
  );
}
