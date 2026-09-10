# なう — デプロイで生きる妹

ロリポップ！デプロイナウの無料プランの上で暮らす妹「なう」。デプロイされるたびに 1 回ぶん成長します。

- 年齢 = デプロイ回数。20 分おきに GitHub Actions が日記を書いて push し、デプロイナウが焼き直す
- 記憶 = Git リポジトリ（`data/state.json`）。データベースなし
- 手紙 = `mailbox` ブランチに 1 ファイルずつ投函。次のデプロイで返事が届く
- 電話 = 60 秒で切れる（無料プランの 1 リクエスト 60 秒制限をそのまま演出に）

設計は [docs/DESIGN.md](docs/DESIGN.md)、続きの作業は [docs/HANDOVER.md](docs/HANDOVER.md)。

## 公開URL

https://nau-chan.lolipop-now.app

## 開発

```bash
npm install
cp .env.example .env.local
npm run dev
npm run build && npm run lint
```

## デプロイ

```bash
lolipop login
lolipop deploy --name nau-chan --framework next --domain nau-chan
```

`next.config.ts` の `output: "standalone"` が必須です。
