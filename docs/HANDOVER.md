# 引き継ぎメモ（別セッションで実装を続ける人へ）

2026-09-10 時点の状態。設計は `docs/DESIGN.md`。

## 今できていること

- Next.js 16 + TypeScript + Tailwind v4 の試作。`npm run build` / `npm run lint` / `tsc --noEmit` すべて通過
- 画面: `/`（ヒーロー・日記・お手紙ポスト・体質）、`/diary`、`/call`
- API: `/api/letters`（GitHub mailbox 投函）、`/api/call`（OpenAI SSE ストリーミング、50 秒 abort）
- `scripts/tick.ts` と `.github/workflows/tick.yml`（20 分おきに日記と返事を生成して push）
- 立ち絵は `public/imouto/` の画像 3 枚（ツンデレ既定・デレデレ・クーデレ）。きぶんから `moodToMode` で決まる
- ローカルで API キー未設定のとき、両 API が 503 と日本語メッセージを返すことは確認済み

## 2026-09-10 夜の時点で完了したこと

- 公開中: https://nau-chan.lolipop-now.app （プロジェクト `nau-chan`、ID `01M25KEG9SJ83QDV6Q511PVBHS`）
- GitHub Secrets `OPENAI_API_KEY`、fine-grained PAT、デプロイナウの環境変数 4 つ、すべて設定済み
- `.lolipop/project.json` でカレントディレクトリをリンク済み（gitignore）
- 本番で確認済み: 通話 API のストリーミング、手紙の投函 → tick が返事 → mailbox 片付け、の一周
- tick を手動 2 回実行してなうは第 2 回デプロイ目。最初の手紙（とも）に返事済み

## まだやっていないこと

1. **GitHub 連携**（ダッシュボードのみ。CLI では不可）
   https://deploy.lolipop.jp/projects/01M25KEG9SJ83QDV6Q511PVBHS → 設定タブ → GitHub 連携 → リポジトリ `onaka-yurusugi/deploy-imouto`、デプロイブランチ `main`。
   連携するまでは tick が push しても本番に反映されない。手動なら `lolipop deploy`
2. **cron の起動確認**: `gh run list --repo onaka-yurusugi/deploy-imouto` に `schedule` の行が出るか。新規リポジトリは最初の cron が遅れることがある
3. **実機で制限を計測**（設計書 §2 の未記載項目）
   - `/api/call` を 55 秒以上引き延ばして本当に 60 秒で切れるか（`max_output_tokens` を一時的に大きくして試す）
   - `/tmp` への書き込み可否
4. コンテスト応募フォームに URL を送る（締切 2026-12-08）

## ハマりそうなところ

- `.env` はデプロイナウのビルドで読まれない。`.env.local` は本番に効かない
- route ファイル（`app/api/**/route.ts`）から HTTP メソッド以外を export すると Next のビルドが落ちる。定数は `lib/` に置く
- `react-hooks/set-state-in-effect` が eslint で error 扱い。時間依存の値は `hooks/useClock.ts` の `useSyncExternalStore` パターンに寄せる
- tick の cron が 1 日 100 ビルドを超えないよう、間隔を変えるときは計算し直す（`*/20` = 72 回）
- `mailbox` の片付けが競合で失敗しても、`state.letters` の id で重複排除しているので二重返事にはならない
- OpenAI API のモデルは `lib/openai.ts` の `MODEL_ID` 一箇所。コストを下げたいときは `effort` を先に触る
- `pkill -f "next dev"` は自分のシェルまで殺すことがある。止めるときは PID 指定で

## ローカル開発

```bash
npm install
cp .env.example .env.local   # 値を埋める
npm run dev
```
