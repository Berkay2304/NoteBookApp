/* public/app.js */
/*-------------------------------------------------
 Bu dosya:
  1. Sayfa açılınca mevcut notları çeker.
  2. Form gönderilince yeni not ekler.
  3. NotesContainer’a notları render eder.
--------------------------------------------------*/

// ---- 0) TOKEN HAZIRLIĞI ----
// Giriş yaptığında localStorage'a kaydettiğin token'ı al.
const token = localStorage.getItem('token');    // TODO: Eğer token yoksa login sayfasına yönlendirmek isteyebilirsin.
if (!token) {
  window.location.href = 'login.html';
}
// ---- 1) DOM Elementlerini seç ----
const noteForm       = document.getElementById('noteForm');
const titleInput     = document.getElementById('title');
const contentInput   = document.getElementById('content');
const notesContainer = document.getElementById('notesContainer');

// ---- 2) Yardımcı fonksiyon: Notları ekrana bas ----
function renderNotes(notes) {
  notesContainer.innerHTML = '';               // önce temizle
  notes.forEach(note => {
    const div = document.createElement('div');
    div.className = 'note';
    div.innerHTML = `
      <h3>${note.title}</h3>
      <p>${note.content}</p>
      <small>${new Date(note.createdAt).toLocaleString()}</small>
      <button class="edit-btn" data-id="${note._id}">Düzenle</button>
      <button class="delete-btn" data-id="${note._id}">Sil</button>
    `;
    notesContainer.appendChild(div);
  });
}

// ---- 3) Sayfa yüklenince kullanıcının notlarını getir ----
async function fetchNotes() {
  try {
    const res = await fetch('/notes', {
      headers: { Authorization: 'Bearer ' + token }
    });
    if (!res.ok) throw new Error('Notlar çekilemedi');
    const data = await res.json();      // { notes: [...] }
    renderNotes(data.notes);
  } catch (err) {
    alert(err.message);                 // TODO: Daha şık hata gösterimi yapabilirsin
  }
}

// ---- 4) Form submit → yeni not ekle ----
noteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  if (!title || !content) return alert('Başlık ve içerik gerekli');

  try {
    let res;
    if (editingNoteId) {
      // Güncelleme
      res = await fetch('/notes/' + editingNoteId, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({ title, content })
      });
    } else {
      // Yeni not ekleme
      res = await fetch('/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({ title, content })
      });
    }

    if (!res.ok) throw new Error('İşlem başarısız.');

    // İşlem başarılıysa formu temizle, notları tekrar yükle
    titleInput.value = '';
    contentInput.value = '';
    editingNoteId = null; // Düzenleme bitti
    fetchNotes();

  } catch (err) {
    alert(err.message);
  }
});


notesContainer.addEventListener('click', async (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const id = e.target.getAttribute('data-id');
    try {
      const res = await fetch(`/notes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token }
      });
      if (!res.ok) throw new Error('Not silinemedi');
      fetchNotes();
    } catch (err) {
      alert(err.message);
    }
  }
});

let editingNoteId = null; // Düzenlenen notun ID'sini burada tutacağız

notesContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('edit-btn')) {
    // Düzenle butonuna tıklandı
    editingNoteId = e.target.dataset.id; // Butondan notun ID'sini al
    // Düzenlenecek notu bul
    const noteDiv = e.target.parentElement;
    const title = noteDiv.querySelector('h3').textContent;
    const content = noteDiv.querySelector('p').textContent;
    // Form inputlarına doldur
    titleInput.value = title;
    contentInput.value = content;
  }
});

// ---- 5) İlk yüklemede notları çek ----
fetchNotes();
