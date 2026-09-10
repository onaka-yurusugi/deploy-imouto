import type { Metadata } from "next";
import { CallClient } from "@/components/CallClient";
import { imoutoState } from "@/lib/state";

export const metadata: Metadata = { title: "60秒だけ電話 | なう" };

export default function CallPage() {
  return (
    <div className="flex flex-col gap-8 pt-6">
      <section>
        <h1 className="text-2xl font-black">60秒だけ電話する</h1>
        <p className="mt-2 text-sm text-ink-soft">
          無料プランは1リクエスト60秒まで。だからなうとの電話も60秒で切れます。切れる前に言いたいことを言ってください。
        </p>
      </section>
      <CallClient mood={imoutoState.mood} />
    </div>
  );
}
