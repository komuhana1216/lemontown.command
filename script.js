
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

import { firebaseConfig } from './firebase-config.js';

// Firebase初期化
const db = getFirestore(initializeApp(firebaseConfig));

// カテゴリ一覧（Allを追加）
const cats = ['All', '一般', 'PD', 'EMS', '犯罪系', 'Admin'];

// 初期表示をAllに設定
let active = 'All';
let data = [];

const tabs = document.getElementById('tabs');
const items = document.getElementById('items');
const search = document.getElementById('search');
const status = document.getElementById('status');

// 一覧表示
function render() {
  tabs.replaceChildren();

  // カテゴリボタン生成
  for (const c of cats) {
    const b = document.createElement('button');

    b.textContent = c;
    b.className = c === active ? 'active' : '';

    b.onclick = () => {
      active = c;
      render();
    };

    tabs.append(b);
  }

  items.replaceChildren();

  const keyword = search.value.toLowerCase();

  // Allの場合は全カテゴリを表示
  const filtered = data.filter(x => {
    const matchesCategory =
      active === 'All' || x.category === active;

    const matchesSearch =
      `${x.command} ${x.description}`
        .toLowerCase()
        .includes(keyword);

    return matchesCategory && matchesSearch;
  });

  // コマンド一覧生成
  for (const x of filtered) {
    const tr = document.createElement('tr');

    // カテゴリ
    const a = document.createElement('td');
    a.textContent = x.category;

    // コマンド名
    const b = document.createElement('td');

    const code = document.createElement('code');
    code.textContent = x.command;

    // Copyボタン
    const copy = document.createElement('button');
    copy.textContent = 'Copy';
    copy.className = 'secondary';
    copy.style.marginLeft = '8px';

    copy.onclick = async () => {
      try {
        await navigator.clipboard.writeText(x.command);

        copy.textContent = 'Copied!';

        setTimeout(() => {
          copy.textContent = 'Copy';
        }, 1300);

      } catch {
        status.textContent = 'コピーに失敗しました';
      }
    };

    b.append(code, copy);

    // 用途
    const d = document.createElement('td');
    d.textContent = x.description;

    tr.append(a, b, d);
    items.append(tr);
  }

  // 検索結果なし
  if (!filtered.length) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');

    td.colSpan = 3;
    td.textContent = '該当するコマンドはありません';

    tr.append(td);
    items.append(tr);
  }
}

// 検索イベント
search.addEventListener('input', render);

// 初期描画
render();

// Firestoreからリアルタイム取得
onSnapshot(
  query(
    collection(db, 'commands'),
    orderBy('command')
  ),
  snap => {
    data = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    status.textContent =
      `${data.length} 件登録されています`;

    render();
  },
  err => {
    status.textContent =
      `読み込みエラー: ${err.message}`;
  }
);
