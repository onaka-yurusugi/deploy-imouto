# 設計書：なう — デプロイで生きる妹

対象コンテスト: ロリポップ！デプロイナウ コンテスト（応募締切 2026-12-08 23:59、結果発表 2027年1月中旬）
コンセプト: 「無料プランの制限を、ぜんぶ妹の体質にする」
採用案: A（デプロイで生きる妹）+ D（60秒だけ電話できる妹）

---

## 1. コンセプト

妹「なう」は、ロリポップ！デプロイナウ無料プランの上で暮らしている。

- 年齢の代わりに「デプロイ回数」がある。デプロイされるたびに1回ぶん成長する。
- 記憶は Git リポジトリ。データベースは持っていない。
- 手紙は GitHub の `mailbox` ブランチに投函され、次のデプロイで届く。
- 電話は 60 秒で切れる（1リクエスト 60 秒の壁）。
- 考えごと（LLM 呼び出し）は GitHub Actions の中でする。デプロイナウでは CPU を使わない。

制限を隠すのではなく、キャラクター設定として前面に出す。審査員には「デプロイナウそのものをネタにしている」と読める。

## 2. 無料プランの制限と設計判断

| 制限（公式「プラン」ページ） | 値 | 設計への影響 |
|---|---|---|
| 1日のビルド数 | 100 | cron を 20 分おき（72回/日）にして手動 push の余裕を残す。手紙の投函ではビルドを走らせない |
| プロジェクト数 | 200 | 未使用。将来「分身 200 人」拡張の余地 |
| 環境変数 | 合計 4KB、1つ 4,000B | 秘密は API キー 2 本と設定値のみ。記憶を環境変数に置かない |
| 1リクエスト最大 | 60 秒 | 通話 API はサーバー側 50 秒で abort、クライアント側 60 秒で切断 |
| メモリ | 512MiB | standalone の Next.js のみ。LLM はプロセス外 |
| CPU | 月 4 時間 | ページは全て静的。動的なのは `/api/letters` と `/api/call` だけ |
| 秒間リクエスト | 10 | 静的配信なので CDN が吸収。API はレート制限 |
| CDN 帯域 | 月 100GB | 画像は SVG インライン。外部アセットなし |
| デプロイサイズ | 100MB | standalone 出力で十分小さい |

公式ドキュメントで未記載のため実測が必要なもの:

- ファイルシステムへの書き込み可否・永続性（本設計では使わない前提）
- WebSocket 対応（使わない。SSE で代替）
- コールドスタートの有無と時間

技術要件の確定事項:

- Next.js は `output: "standalone"` 必須
- Node.js 22.12 以上（CLI 要件）
- パッケージマネージャは npm のみ（pnpm / yarn 不可）
- `.env` はビルド・公開時に参照されない。環境変数はダッシュボードか `lolipop env create` で設定
- GitHub 連携: 1 プロジェクト 1 リポジトリ、指定ブランチへの push で自動デプロイ。PR プレビューはデフォルト無効

## 3. アーキテクチャ

```
                 ┌──────────────────────────────────┐
   訪問者 ──────▶│ デプロイナウ（Next.js standalone）    │
                 │  /          静的（state.json 焼き込み） │
                 │  /diary     静的                       │
                 │  /call      静的 + CallClient          │
                 │  /api/letters POST → GitHub Contents API（mailbox ブランチ）
                 │  /api/call    POST → OpenAI API ストリーミング（SSE、50秒 abort）
                 └──────────────┬───────────────────┘
                                │ GitHub 連携（main への push で自動デプロイ）
                 ┌──────────────▼───────────────────┐
                 │ GitHub リポジトリ                   │
                 │  main    : コード + data/state.json（妹の記憶）
                 │  mailbox : mailbox/<id>.json（未読の手紙）
                 └──────────────┬───────────────────┘
                                │ 20分おき cron / 手動
                 ┌──────────────▼───────────────────┐
                 │ GitHub Actions: scripts/tick.ts     │
                 │  1. mailbox から未読を読む（最大10通） │
                 │  2. OpenAI（structured output）で日記1本 + 返事
                 │  3. state.json 更新 → main に push → デプロイ
                 │  4. 読んだ手紙を mailbox から削除      │
                 └──────────────────────────────────┘
```

### 3.1 データモデル（`lib/types.ts`）

```ts
type ImoutoState = {
  name: string;            // "なう"
  bornAt: string | null;   // 最初の tick の時刻。null = 未誕生
  generation: number;      // デプロイ回数 = 年齢
  mood: Mood;              // genki | nikoniko | nemui | sabishii | wakuwaku | sune
  diary: DiaryEntry[];     // 最新 300 件を保持
  letters: Letter[];       // 最新 100 件を保持（返事つき）
};
type MailboxLetter = { id; at; from; callName; body }; // mailbox ブランチの1ファイル
```

`data/state.json` はビルド時に `import` され、ページに焼き込まれる。ランタイムで読み書きしない。

### 3.2 手紙の流れ（A）

1. `LetterForm` → `POST /api/letters`（zod 検証、IP ごと 5 通/時）
2. GitHub Contents API `PUT /repos/{repo}/contents/mailbox/{id}.json`（`branch: mailbox`）
3. `mailbox` はデプロイ対象ブランチではないのでビルドは走らない
4. 次の tick が `git fetch origin mailbox` → `git show` で読む
5. 返事を `state.letters[].reply` に書き、main に push
6. `mailbox` から該当ファイルを `git rm` して push。競合したら次回に持ち越し（`state.letters` の id で重複排除）

### 3.3 通話の流れ（D）

1. `CallClient` が「電話をかける」でタイマー開始（60 秒）
2. 各発話ごとに `POST /api/call { callName, elapsedSec, messages }`
3. サーバーはシステムプロンプトに残り秒数を入れて OpenAI にストリーミング要求。50 秒で `AbortController.abort()`
4. レスポンスは SSE（`event: text | done | cut | error`）
5. クライアント 60 秒でも切断。切断後は「もう一回かける」

コスト制御: 全体 1 日 200 通話、IP ごと 1 日 20 通話（メモリ内カウンタ、再起動でリセット）。`max_tokens: 300`、`effort: "low"`。

### 3.4 LLM（OpenAI API）

- モデル: `gpt-5.4-mini`（`lib/openai.ts` の `MODEL_ID`）
- tick: `client.messages.parse` + `zodOutputFormat` で `{ diary, mood, replies[] }` を構造化出力
- 通話: `client.beta.messages.stream` + `fallbacks: "default"`（拒否時のサーバー側フォールバック）
- システムプロンプトは `lib/persona.ts` の固定文（`cache_control` 付き）+ 可変の状態文
- 安全設計: 健全な兄妹距離、個人情報を聞かない、危険な依頼は断る、AI であることを否定しない

### 3.5 時間帯とおやすみモード

- JST の時間帯（朝 5-10 / 昼 10-17 / 夕 17-22 / 夜 22-5）で服とセリフが変わる
- `app/layout.tsx` のインラインスクリプトが `<html data-time>` を描画前に書き込み、CSS 変数を切り替える
- クライアントでは `hooks/useClock.ts`（`useSyncExternalStore`）で取得。サーバー描画は常に "day"

## 4. 画面

| パス | 種別 | 内容 |
|---|---|---|
| `/` | 静的 | ヒーロー（立ち絵 + 吹き出し + デプロイ回数）、成長日記（最新3）、お手紙ポスト、なうの体質 |
| `/diary` | 静的 | 日記全件、手紙全件 |
| `/call` | 静的 + client | 60 秒通話 |
| `/api/letters` | 動的 | 手紙の投函 |
| `/api/call` | 動的 | SSE ストリーミング通話 |

### デザイン方針

- 色: ミルクピンク `#FFF6F9` / インク `#33243A` / 妹ピンク `#FF6FA5` / ミント `#5FCFC0` / たまご `#FFD166`。夜は紺 `#1F1B36` ベースに自動切替
- 書体: Zen Maru Gothic のみ（丸ゴシック = 妹）。デプロイログ風の行だけ M PLUS 1 Code
- 一番目立つ要素は「デプロイ回数」の大きな数字。ほかは静かに
- 制限の数値は「体質」として文章で語る。統計表にしない

## 5. 運用

### 環境変数

| 場所 | 変数 | 用途 |
|---|---|---|
| デプロイナウ | `OPENAI_API_KEY` | 通話 |
| デプロイナウ | `GITHUB_TOKEN` | mailbox への投函（fine-grained PAT、Contents: Read and write、対象リポジトリのみ） |
| デプロイナウ | `GITHUB_REPO` | `owner/repo` |
| デプロイナウ | `MAILBOX_BRANCH` | 省略時 `mailbox` |
| デプロイナウ | `CALL_DAILY_LIMIT` / `CALL_PER_IP_DAILY_LIMIT` / `LETTER_HOURLY_LIMIT` | 任意 |
| GitHub Secrets | `OPENAI_API_KEY` | tick |

合計 4KB 以内に収める。

### デプロイ

- GitHub 連携で `main` push → 自動デプロイ
- 初回のみ CLI: `lolipop login` → `lolipop deploy --name nau-chan --framework next --domain nau-chan`

### ビルド回数の見積もり

cron 72 回/日 + 開発 push。100 を超えると当日のデプロイが止まる。cron 間隔は `.github/workflows/tick.yml` で調整する。

## 6. 今後の拡張（優先度順）

1. 実機で制限を計測して「体質」に実測値を出す（コールドスタート、FS 書き込み）
2. 「なでなで」カウンタ（localStorage）と、なでた回数で変わるセリフ
3. 手紙の投函後に「次のデプロイまであと N 分」を表示（cron の次回時刻から計算）
4. 深夜限定の隠しページ、コナミコマンド（imouto-work-corp のギミック文化を移植）
5. 分身 200 プロジェクト（B 案）: `lolipop project create` を 200 回叩くスクリプトと相互リンク
6. OGP 画像（立ち絵 + デプロイ回数を焼き込む。`next/og` は CPU を使うのでビルド時生成に）
7. 音声: Web Speech API でなうのセリフを読み上げ（クライアントのみ、CPU 消費なし）
