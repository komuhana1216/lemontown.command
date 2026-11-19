import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,signOut} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {getFirestore,collection,doc,getDoc,onSnapshot,addDoc,updateDoc,deleteDoc,serverTimestamp,query,orderBy} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

// Firebase コンソール > プロジェクトの設定 > ウェブアプリ からコピーして置き換えてください。
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  appId: 'YOUR_APP_ID'
};
const $=id=>document.getElementById(id);
const categories=['一般','PD','EMS','犯罪系','Admin'];
let selected='一般',items=[],isAdmin=false,currentUser=null;
const configured=!Object.values(firebaseConfig).some(v=>v.startsWith('YOUR_'));
const app=configured?initializeApp(firebaseConfig):null;
const auth=app?getAuth(app):null;
const db=app?getFirestore(app):null;
const commands=db?collection(db,'commands'):null;
const status=msg=>{$('status').textContent=msg};
function renderCategories(){const nav=$('categories');nav.replaceChildren();for(const c of categories){const b=document.createElement('button');b.textContent=c;b.className=selected===c?'active':'';b.onclick=()=>{selected=c;renderCategories();render()};nav.append(b)}}
function render(){const term=$('search').value.trim().toLocaleLowerCase();const shown=items.filter(x=>x.category===selected&&(x.command+' '+x.description).toLocaleLowerCase().includes(term));const tbody=$('rows');tbody.replaceChildren();$('actionHead').hidden=!isAdmin;for(const item of shown){const tr=document.createElement('tr');const cat=document.createElement('td');cat.className='category';cat.textContent=item.category;const cmd=document.createElement('td');const name=document.createElement('span');name.textContent=item.command;const copy=document.createElement('button');copy.className='copy';copy.textContent='Copy';copy.onclick=async()=>{try{await navigator.clipboard.writeText(item.command);copy.textContent='Copied!';setTimeout(()=>copy.textContent='Copy',1300)}catch{alert('コピーできませんでした')}};cmd.append(name,copy);const desc=document.createElement('td');desc.textContent=item.description;tr.append(cat,cmd,desc);if(isAdmin){const act=document.createElement('td');act.className='actions';const edit=document.createElement('button');edit.textContent='編集';edit.onclick=()=>{$('editId').value=item.id;$('formCategory').value=item.category;$('formCommand').value=item.command;$('formDescription').value=item.description;$('adminPanel').scrollIntoView({behavior:'smooth'})};const del=document.createElement('button');del.textContent='削除';del.className='danger';del.onclick=async()=>{if(!confirm(`${item.command} を削除しますか？`))return;try{await deleteDoc(doc(db,'commands',item.id))}catch(e){alert('削除できません: '+e.message)}};act.append(edit,del);tr.append(act)}tbody.append(tr)}status(`${shown.length} 件のコマンド`)}
function resetForm(){$('commandForm').reset();$('editId').value=''}
$('search').addEventListener('input',render);$('cancelBtn').onclick=resetForm;
$('loginBtn').onclick=()=>{if(currentUser)signOut(auth);else $('loginDialog').showModal()};
$('closeLogin').onclick=()=>$('loginDialog').close();
$('loginForm').addEventListener('submit',async e=>{e.preventDefault();$('loginError').textContent='';if(!auth)return;try{await signInWithEmailAndPassword(auth,$('email').value,$('password').value);$('loginDialog').close();$('password').value=''}catch{$('loginError').textContent='ログインに失敗しました。メールアドレスとパスワードを確認してください。'}});
$('commandForm').addEventListener('submit',async e=>{e.preventDefault();if(!isAdmin)return;const id=$('editId').value;const data={category:$('formCategory').value,command:$('formCommand').value.trim(),description:$('formDescription').value.trim()};if(!categories.includes(data.category)||!data.command||!data.description)return;const btn=$('saveBtn');btn.disabled=true;try{if(id)await updateDoc(doc(db,'commands',id),{...data,updatedAt:serverTimestamp()});else await addDoc(commands,{...data,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});resetForm()}catch(err){alert('保存できません: '+err.message)}finally{btn.disabled=false}});
renderCategories();
if(!configured){status('Firebase設定が未入力です。script.js の firebaseConfig を設定してください。')}else{
  onSnapshot(query(commands,orderBy('command')),(snapshot)=>{items=snapshot.docs.map(d=>({id:d.id,...d.data()}));render()},err=>status('読み込みエラー: '+err.message));
  onAuthStateChanged(auth,async user=>{currentUser=user;isAdmin=false;if(user){try{const admin=await getDoc(doc(db,'admins',user.uid));isAdmin=admin.exists()&&admin.data().enabled===true}catch(e){console.error('管理者確認に失敗:',e)}}$('adminPanel').hidden=!isAdmin;$('loginBtn').textContent=user?'ログアウト':'運営ログイン';render();if(user&&!isAdmin)status('このアカウントには管理権限がありません。')});
}
