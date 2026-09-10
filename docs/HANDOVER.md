# 引き継ぎメモ（別セッションで実装を続ける人へ）

2026-09-10 時点の状態。設計は `docs/DESIGN.md`。

## 今できていること

- Next.js 16 + TypeScript + Tailwind v4 の試作。`npm run build` / `npm run lint` / `tsc --noEmit` すべて通過
- 画面: `/`（ヒーロー・日記・お手紙ポスト・体質）、`/diary`、`/call`
- API: `/api/letters`（GitHub mailbox 投函）、`/api/call`（OpenAI SSE ストリーミング、50 秒 abort）
- `scripts/tick.ts` と `.github/workflows/tick.yml`（20 分おきに日記と返事を生成して push）
- 立ち絵は SVG（`components/ImoutoAvatar.tsx`）。きぶん 6 種 × 時間帯 4 種
- ローカルで API キー未設定のとき、両 API が 503 と日本語メッセージを返すことは確認済み

## 2026-09-10 夜の時点で完了したこと

- GitHub Secrets `OPENAI_API_KEY` 設定済み。fine-grained PAT 発行済み
- デプロイナウにプロジェクト `nau-chan`（ID `01M25KEG9SJ83QDV6Q511PVBHS`）を作成。URL: https://nau-chan.lolipop-now.app
- 環境変数 4 つ（OPENAI_API_KEY / GITHUB_TOKEN / GITHUB_REPO / MAILBOX_BRANCH）を登録済み
- `.lolipop/project.json` でカレントディレクトリをリンク済み（gitignore）

## まだやっていないこと（順番どおりに進めると早い）

1. **GitHub リポジトリの設定**
   - Settings → Secrets and variables → Actions → `OPENAI_API_KEY`
   - fine-grained PAT を発行（Contents: Read and write、対象リポジトリのみ）→ デプロイナウ側の `GITHUB_TOKEN` に
   - `mailbox` ブランチ（空の `mailbox/.gitkeep`）が無ければ作る
2. **tick の動作確認**（API キーが必要。まだ一度も実行していない）
   ```bash
   OPENAI_API_KEY=... DRY_RUN=1 npx tsx scripts/tick.ts   # commit しない
   ```
   `data/state.json` に日記が 1 本入れば OK。structured output の形で落ちたら `TickOutput` と `messages.parse` の呼び方を直す
3. **GitHub 連携**（ダッシュボードのみ。CLI では不可）
   https://deploy.lolipop.jp/projects/01M25KEG9SJ83QDV6Q511PVBHS → 設定タブ → GitHub 連携 → リポジトリ `onaka-yurusugi/deploy-imouto`、デプロイブランチ `main`。
   連携までは `lolipop deploy` の手動デプロイで反映する
4. **実機で制限を計測**（設計書 §2 の未記載項目）
   - `/api/call` を 55 秒以上引き延ばして本当に 60 秒で切れるか
   - `/tmp` への書き込み可否（書けるなら「なでなで」集計を FS に置ける）
5. **Actions を有効化**して 20 分待ち、`generation` が 1 になるのを確認（なうが生まれる）
6. コンテスト応募フォームに URL を送る（締切 2026-12-08）

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
