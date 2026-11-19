# FiveM Command List

1. Firebase ConsoleでWebアプリを登録し、`firebase-config.js` の値を実際のFirebase設定値に変更する。
2. Firebase Authenticationでメール/パスワードを有効にし、管理者ユーザーを作る。
3. Firestoreの `admins` コレクションに、ドキュメントIDを管理者のAuthentication UIDとして作成し、`role` (string) = `admin` を設定する。
4. Firestore Database > ルールに `firestore.rules` の全文を貼り付けて公開する。
5. Firebase Authentication > Settings > Authorized domains に GitHub Pagesのドメイン（例: `username.github.io`）を追加する。
6. ファイルをすべてGitHubリポジトリの同じ階層にアップロードする。Settings > Pagesでmainブランチ/rootを公開する。
7. `https://username.github.io/repository/admin.html` にアクセスしてログインする。

注意: `firebaseConfig` は公開されるWebアプリ設定値であり、管理者パスワードやサービスアカウント秘密鍵を入れないこと。Firestoreの権限制御は必ずルールで行うこと。GitHub Pages上のadmin.htmlはURLを知れば誰でも開けるが、管理者以外はFirestoreの書き込みができない。
