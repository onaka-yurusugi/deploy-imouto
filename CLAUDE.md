# CLAUDE.md

妹「なう」のサイト。ロリポップ！デプロイナウ無料プラン向け。設計は `docs/DESIGN.md`、未完了タスクは `docs/HANDOVER.md`。

## コマンド

```bash
npm run dev     # http://localhost:3000
npm run build   # standalone 出力。完了報告前に必ず通す
npm run lint    # eslint（react-hooks/set-state-in-effect は error）
npx tsc --noEmit
ANTHROPIC_API_KEY=... DRY_RUN=1 npx tsx scripts/tick.ts   # 妹を1回成長させる（commit しない）
```

## 構成

- `data/state.json` 妹の全状態。ビルド時に焼き込み。ランタイムで書かない
- `lib/` 型・状態・時間帯・セリフ・人格プロンプト・GitHub/Anthropic クライアント・レート制限
- `app/api/letters` 手紙 → GitHub mailbox ブランチ / `app/api/call` Claude SSE 通話（50 秒 abort）
- `scripts/tick.ts` GitHub Actions から実行。日記と返事を生成して main に push
- `components/ImoutoAvatar.tsx` SVG 立ち絵。きぶん × 時間帯

## ルール

- 制限値は `lib/state.ts` の `FREE_PLAN` から参照する。数字を直書きしない
- route ファイルからは HTTP メソッド以外を export しない
- 時間に依存する表示は `hooks/useClock.ts` を使う（effect 内 setState 禁止）
- LLM モデル ID は `lib/anthropic.ts` の `MODEL_ID` のみ
- 妹のセリフは絵文字・顔文字なし。健全な兄妹距離を守る（`lib/persona.ts`）
