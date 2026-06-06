# 鮫月ナツネ 公式サイト 管理ページ

`admin/index.html` は GitHub Pages 本番サイトの `data/site.json` を更新するための静的管理ページです。

## 使い方

1. GitHubで fine-grained personal access token を作成する
2. 対象リポジトリを `natsune-vrc/natsune-vrc.github.io` に限定する
3. Repository permissions の `Contents` を `Read and write` にする
4. `https://natsune-vrc.com/admin/` を開く
5. トークンを入力して「現在の公開内容を読み込む」
6. 内容を編集して「GitHubへ送信して公開サイトに反映」

## 注意

- トークンはHTML内に書かない。
- 管理ページはサーバー認証を持たないため、トークンを知らない人は保存できないが、画面自体は公開される。
- この方式はサーバーなし・無料で運用するための最小構成。
- VRChatワールド情報の取得はブラウザから直接できないため、ローカル管理サーバーの `/api/world/:worldId` を使う。GitHub Pages上だけで検索・取得まで完結させるにはCloudflare Worker等の取得用バックエンドが必要。
- より安全にするなら Pages CMS / Decap CMS / GitHub App / 独自バックエンドへ移行する。
- 保存するとGitHubにコミットされる。GitHub Pagesへの反映には少し時間がかかる。
