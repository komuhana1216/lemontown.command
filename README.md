# FiveM Command List + Admin

1. Firebase Console でプロジェクトを作成し、ウェブアプリを登録する。
2. Authentication > Sign-in method で Email/Password を有効化。Users で運営ユーザーを作成。
3. Firestore Database を作成し、`firestore.rules` の内容を Firestore の Rules に貼り付けて公開。
4. Firestore の `admins` コレクションに、運営ユーザーの **Authentication UID をドキュメントID** としたドキュメントを作成し、フィールド `enabled` を boolean `true` に設定する。メールアドレスをIDにしない。
5. `script.js` の `firebaseConfig` を Firebase ウェブアプリの設定値に置き換える。
6. `index.html` `style.css` `script.js` を GitHub リポジトリ直下にアップロードし、Settings > Pages で main / root を公開する。
7. 最初のコマンドは管理画面から追加: 一般 /jobmusic / 音楽再生範囲内の音楽を再生できる

注意: GitHub Pages は静的配信のみ。Firebase の API キーは公開前提の設定値であり、秘密の管理者パスワードではありません。アクセス制御は Firestore Rules で行います。管理者の追加は Firebase Console からのみ行います。ログインできても admins に登録されていなければ編集できません。
