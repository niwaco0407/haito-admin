# 本番公開の手順（未実施）

このリポジトリに、Cloudflare Workersで動く管理画面と配当JSON配信APIを実装しました。

## 必要な設定
1. Cloudflareアカウントを作成
2. Workersにこのリポジトリを接続するか、Wranglerでデプロイ
3. WorkersのSecretに `GITHUB_TOKEN`（この非公開リポジトリのContents読み書き権限のみ）と `ADMIN_KEY`（十分長いランダム文字列）を設定
4. Cloudflare Accessなどの追加アクセス制御を管理画面に設定することを推奨
5. 公開URLの `/api/dividends` を確認
6. HAITOアプリの配当マスターURLに `https://<worker-host>/api/dividends` を設定

**GitHubトークンや管理者キーをGitHubにコミットしないこと。**
Workersの実際のデプロイ、秘密情報の登録、iOS実機確認は未完了です。
このWorkerは管理者キーで書き込みを制限します。認証試行回数の制限はCloudflare側で設定してください。
公開時は商用利用・再配信権利を必ず確認してください。
