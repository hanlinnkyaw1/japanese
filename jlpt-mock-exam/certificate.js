/**
 * Certificate engine (Memory-Based / No LocalStorage for Results)
 */

(function () {
  const STYLE_ID = 'certificate-engine-styles';
  const OVERLAY_ID = 'certificate-overlay';
  const NAME_FORM_ID = 'certificate-name-form';
  const NAME_STORAGE_KEY = 'jlpt_user_name';
  const HTML2CANVAS_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';

  let html2canvasPromise = null;
  let currentResults = null; 

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

      #${OVERLAY_ID}, #${NAME_FORM_ID} {
        position: fixed; inset: 0; background: rgba(15, 15, 20, 0.85);
        display: flex; align-items: center; justify-content: center;
        z-index: 9999; padding: 10px; box-sizing: border-box;
      }

      /* ---- Name entry form ---- */
      #${NAME_FORM_ID} .name-form-card {
        background: #fff; border-radius: 12px; padding: 30px;
        width: 340px; max-width: 90vw; box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        font-family: 'Noto Serif JP', system-ui, sans-serif; text-align: center;
      }
      #${NAME_FORM_ID} h3 { margin: 0 0 8px; font-size: 20px; color: #1f2937; }
      #${NAME_FORM_ID} p { margin: 0 0 20px; font-size: 13px; color: #6b7280; line-height: 1.5; }
      #${NAME_FORM_ID} input[type="text"] {
        width: 100%; box-sizing: border-box; padding: 12px; font-size: 16px;
        border: 2px solid #e5e7eb; border-radius: 8px; margin-bottom: 14px;
        text-align: center; font-family: inherit; transition: border-color 0.2s;
      }
      #${NAME_FORM_ID} input[type="text"]:focus { outline: none; border-color: #2c3e50; }
      #${NAME_FORM_ID} .name-form-btn {
        width: 100%; padding: 12px; font-size: 15px; font-weight: 700;
        background: #2c3e50; color: #fff; border: none; border-radius: 8px; cursor: pointer;
        transition: background 0.2s;
      }
      #${NAME_FORM_ID} .name-form-btn:hover { background: #1a252f; }
      #${NAME_FORM_ID} .name-form-error { color: #dc2626; font-size: 13px; min-height: 18px; margin-bottom: 8px; font-weight: bold; }

      /* ---- Certificate wrapper ---- */
      #${OVERLAY_ID} .cert-preview {
        flex: 1 1 480px;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      #${OVERLAY_ID} .certificate-wrapper {
        background: #ffffff;
        padding: 0.6rem;
        border-radius: 6px;
        box-shadow: 0 25px 40px -10px rgba(0,0,0,0.06), 0 8px 18px rgba(0,0,0,0.03);
        width: 100%;
        max-width: 500px;
        transition: transform 0.3s ease;
      }

      #${OVERLAY_ID} .certificate {
        border: 3.5px double #cbd5e1;
        padding: 2rem 2.2rem;
        text-align: center;
        font-family: 'Noto Serif JP', 'Times New Roman', serif;
        position: relative;
        background: #ffffff;
        background-image: radial-gradient(circle at 30% 40%, rgba(248,250,252,0.5) 0%, transparent 35%);
      }

      #${OVERLAY_ID} .certificate::before {
        content: 'JLPT Burmese';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-28deg);
        font-size: 4.2rem;
        color: rgba(0,0,0,0.018);
        font-weight: 700;
        font-family: 'Inter', sans-serif;
        white-space: nowrap;
        pointer-events: none;
        z-index: 0;
      }

      #${OVERLAY_ID} .cert-head {
        position: relative;
        z-index: 2;
      }

      #${OVERLAY_ID} .cert-head p {
        margin: 0 0 4px;
        font-size: 0.8rem;
        color: #475569;
        letter-spacing: 2.5px;
        font-weight: 500;
      }

      #${OVERLAY_ID} .cert-head h2 {
        margin: 0 0 1.8rem;
        font-size: 2rem;
        letter-spacing: 5px;
        color: #0f172a;
        font-weight: 700;
      }

      #${OVERLAY_ID} .student-name {
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
        display: inline-block;
        border-bottom: 1.5px solid #0f172a;
        padding: 0 18px 5px;
        min-width: 190px;
        font-weight: 600;
        position: relative;
        z-index: 2;
      }

      #${OVERLAY_ID} .cert-level-badge {
        font-size: 1.7rem;
        font-weight: 700;
        margin: 0.8rem 0 1.2rem;
        color: #1e293b;
        
        transition: color 0.25s;
        position: relative;
        z-index: 2;
      }

      #${OVERLAY_ID} .cert-message {
        font-size: 0.88rem;
        line-height: 1.9;
        margin-bottom: 1.8rem;
        color: #334155;
        position: relative;
        z-index: 2;
      }

      #${OVERLAY_ID} .score-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 1.8rem;
        font-size: 0.85rem;
        text-align: left;
        position: relative;
        z-index: 2;
      }

      #${OVERLAY_ID} .score-table td {
        padding: 7px 4px;
        border-bottom: 1px dashed #cbd5e1;
        color: #1e293b;
      }

      #${OVERLAY_ID} .score-table tr:last-child td {
        border-bottom: none;
        font-weight: 700;
        font-size: 0.95rem;
        padding-top: 14px;
        color: #0f172a;
      }

      #${OVERLAY_ID} .score-num {
        text-align: right !important;
        font-weight: 600;
      }

      #${OVERLAY_ID} .cert-foot {
        text-align: right;
        font-size: 0.8rem;
        margin-right: 2.5rem;
        color: #334155;
        position: relative;
        z-index: 2;
        margin-top: 0.5rem;
      }

      #${OVERLAY_ID} .official-stamp {
        position: absolute;
        bottom: -20px;
        right: -20px;
        width: 76px;
        height: 76px;
        border: 2.8px solid #94a3b8;
        border-radius: 6px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 0.75rem;
        color: #475569;
        line-height: 1.3;
        text-align: center;
        transform: rotate(-3deg);
        background: rgba(255,255,255,0.97);
        font-weight: 600;
        backdrop-filter: blur(4px);
        z-index: 3;
      }

      #${OVERLAY_ID} .cert-edit-name {
        font-family: 'Inter', system-ui, sans-serif;
        font-size: 0.75rem;
        color: #2563eb;
        background: none;
        border: none;
        cursor: pointer;
        text-decoration: underline;
        padding: 0 0 4px 0;
        position: relative;
        z-index: 2;
        margin-left: 8px;
        display: inline-block;
        padding-bottom: 1.7rem;
      }

      /* Fail state styles */
      #${OVERLAY_ID}.is-fail .certificate {
        border-color: #94a3b8;
        background-image: radial-gradient(circle at 30% 40%, rgba(241,245,249,0.5) 0%, transparent 35%);
      }
      
      #${OVERLAY_ID}.is-fail .cert-head h2 {
        color: #475569;
      }
      
      #${OVERLAY_ID}.is-fail .cert-level-badge {
        color: #64748b;
      }
      
      #${OVERLAY_ID}.is-fail .official-stamp {
        border-color: red;
        color: red;
      }

      /* Buttons */
      #${OVERLAY_ID} .cert-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
        margin-top: 20px;
        font-family: 'Inter', system-ui, sans-serif;
      }
      
      #${OVERLAY_ID} .cert-btn {
        font-family: inherit;
        font-size: 15px;
        padding: 12px 24px;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        font-weight: 600;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        transition: transform 0.1s, box-shadow 0.1s;
      }
      
      #${OVERLAY_ID} .cert-btn:active {
        transform: translateY(2px);
        box-shadow: 0 2px 3px rgba(0,0,0,0.1);
      }
      
      #${OVERLAY_ID} .cert-btn.primary {
        background: #2c3e50;
        color: #fff;
      }
      
      #${OVERLAY_ID} .cert-btn.secondary {
        background: #e5e7eb;
        color: #374151;
      }

      /* Responsive */
      @media (max-width: 720px) {
        #${OVERLAY_ID} .certificate {
          padding: 1.5rem 1.3rem;
        }
      }

      @media (max-width: 480px) {
        #${OVERLAY_ID} .certificate-wrapper {
          max-width: 95vw;
        }
        #${OVERLAY_ID} .cert-head h2 {
          font-size: 1.6rem;
        }
        #${OVERLAY_ID} .student-name {
          font-size: 1.3rem;
          min-width: 150px;
        }
        #${OVERLAY_ID} .cert-level-badge {
          font-size: 1.4rem;
        }
        #${OVERLAY_ID} .cert-message {
          font-size: 0.78rem;
        }
        #${OVERLAY_ID} .score-table {
          font-size: 0.75rem;
        }
        #${OVERLAY_ID} .cert-btn {
          font-size: 14px;
          padding: 10px 18px;
        }
        #${OVERLAY_ID} .official-stamp {
          width: 64px;
          height: 64px;
          font-size: 0.65rem;
          bottom: -8px;
          right: -8px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  
  function todayJP() { 
    const d = new Date();
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`; 
  }
  
  function getSavedName() { try { return localStorage.getItem(NAME_STORAGE_KEY) || ''; } catch (e) { return ''; } }
  function saveName(name) { try { localStorage.setItem(NAME_STORAGE_KEY, name); } catch (e) { } }
  function closeCertificate() { const existing = document.getElementById(OVERLAY_ID); if (existing) existing.remove(); }
  function closeNameForm() { const existing = document.getElementById(NAME_FORM_ID); if (existing) existing.remove(); }

  function showNameForm(currentName, onSubmit) {
    injectStyles(); closeNameForm(); closeCertificate();
    const wrap = document.createElement('div');
    wrap.id = NAME_FORM_ID;
    wrap.innerHTML = `
      <div class="name-form-card">
        <h3>証明書の氏名設定</h3>
        <p>証明書に印字されるお名前を入力してください。</p>
        <div class="name-form-error"></div>
        <input type="text" id="certNameInput" maxlength="60" value="${escapeHtml(currentName)}" placeholder="お名前を入力" />
        <button type="button" class="name-form-btn" data-action="submit">証明書を作成</button>
      </div>`;
    document.body.appendChild(wrap);
    
    const input = wrap.querySelector('#certNameInput');
    const errorDiv = wrap.querySelector('.name-form-error');
    input.focus(); input.select();
    
    function submit() { 
      const val = input.value.trim(); 
      if (!val) {
        errorDiv.textContent = 'Please Enter your name...';
        input.focus();
        return;
      }
      errorDiv.textContent = '';
      saveName(val); 
      closeNameForm(); 
      onSubmit(val); 
    }
    
    wrap.querySelector('[data-action="submit"]').addEventListener('click', submit);
    input.addEventListener('keydown', (e) => { 
      if (e.key === 'Enter') submit();
      if (e.key === 'Escape') { closeNameForm(); }
    });
    
    wrap.addEventListener('click', (e) => {
      if (e.target === wrap) { closeNameForm(); }
    });
  }

  function loadHtml2Canvas() {
    if (window.html2canvas) return Promise.resolve(window.html2canvas);
    if (html2canvasPromise) return html2canvasPromise;
    html2canvasPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script'); script.src = HTML2CANVAS_SRC;
      script.onload = () => resolve(window.html2canvas);
      script.onerror = () => reject(new Error('Failed to load html2canvas'));
      document.head.appendChild(script);
    });
    return html2canvasPromise;
  }

  function sanitizeFilename(str) { 
    return String(str).replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_').replace(/^_+|_+$/g, '').slice(0, 100);
  }

  function saveCertificateAsImage(cardEl, level, name, btn) {
    const originalLabel = btn.textContent;
    btn.disabled = true; btn.textContent = 'Loading...';
    
    loadHtml2Canvas()
      .then((html2canvas) => {
        return html2canvas(cardEl, { 
          backgroundColor: '#ffffff', 
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true
        });
      })
      .then((canvas) => {
        return new Promise((resolve) => {
          canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url;
            a.download = `JLPT-${sanitizeFilename(level)}-Certificate-${sanitizeFilename(name)}.png`;
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 5000);
            resolve();
          }, 'image/png');
        });
      })
      .catch((err) => {
        console.error('Failed to save certificate:', err);
        alert('証明書の保存に失敗しました。もう一度お試しください。');
      })
      .finally(() => { 
        btn.disabled = false; 
        btn.textContent = originalLabel; 
      });
  }

  function shareCertificate(cardEl, level, name) {
    loadHtml2Canvas()
      .then((html2canvas) => html2canvas(cardEl, { backgroundColor: '#ffffff', scale: 2, useCORS: true }))
      .then((canvas) => {
        canvas.toBlob((blob) => {
          const file = new File([blob], `JLPT-${level}-Certificate.png`, { type: 'image/png' });
          
          if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({
              title: `JLPT ${level} 証明書`,
              text: `私の JLPT ${level} 模擬試験の結果です！`,
              files: [file]
            }).catch(() => {});
          } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `JLPT-${level}-Certificate-${sanitizeFilename(name)}.png`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 5000);
          }
        }, 'image/png');
      })
      .catch(console.error);
  }

  function buildAndShowCard(results, name) {
    const level = results.level || (window.CURRENT_LEVEL);
    const passed = !!results.passed;
    const dateJP = todayJP();
    
    const vg = results.vocabGrammar || { score: 0, max: 60 };
    const rd = results.reading || { score: 0, max: 60 };
    const ls = results.listening || { score: 0, max: 60 };
    const tot = results.total || { score: 0, max: 180 };
    const percentage = tot.max > 0 ? ((tot.score / tot.max) * 100).toFixed(1) : 0;

    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    if (!passed) overlay.classList.add('is-fail');

    const titleText = passed ? '合格証書' : '成績証明書';
    const passStatus = passed ? '合格' : '不合格';
    const bodyText = passed 
      ? `あなたは当プラットフォーム主催の模擬試験において<br>頭書の成績を収め見事合格されました<br>よってここにその実力を証明します`
      : `あなたは当プラットフォーム主催の模擬試験において<br>全課程を修了し頭書の成績を収めました<br>今後のさらなるご活躍を期待します`;

    overlay.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; z-index: 10;">
        <div class="cert-preview">
          <div class="certificate-wrapper" id="certCardCapture">
            <div class="certificate">
              <div class="cert-head">
                <p>日本語能力試験 模擬テスト</p>
                <h2>${titleText}</h2>
              </div>
              
              <div style="display: flex; align-items: flex-end; justify-content: center; gap: 4px; margin-bottom: 1.2rem;">
                <div class="student-name">${escapeHtml(name)}</div>
                <button type="button" class="cert-edit-name" data-action="edit-name">編集</button>
              </div>
              
              <div class="cert-level-badge">JLPT ${escapeHtml(level)}</div>
              
              <div class="cert-message">${bodyText}</div>
              
              <table class="score-table">
                <tbody>
                  <tr>
                    <td>言語知識（文字・語彙・文法）</td>
                    <td class="score-num">${vg.score} / ${vg.max}</td>
                  </tr>
                  <tr>
                    <td>読解</td>
                    <td class="score-num">${rd.score} / ${rd.max}</td>
                  </tr>
                  <tr>
                    <td>聴解</td>
                    <td class="score-num">${ls.score} / ${ls.max}</td>
                  </tr>
                  <tr>
                    <td>総合得点 (${percentage}%)</td>
                    <td class="score-num">${tot.score} / ${tot.max} — ${passStatus}</td>
                  </tr>
                </tbody>
              </table>
              
              <div class="cert-foot">
                <div>${dateJP}</div>
                <div style="font-weight: 600; margin-top: 4px;">JLPT Burmese</div>
              </div>
              
              <div class="official-stamp">JLPT<br>Burmese<br>之印</div>
            </div>
          </div>
        </div>
        
        <div class="cert-actions">
          <button type="button" class="cert-btn primary" data-action="save-image">Save certificate</button>
          ${typeof navigator.share === 'function' ? '<button type="button" class="cert-btn secondary" data-action="share">share</button>' : ''}
          <button type="button" class="cert-btn secondary" data-action="close">Close</button>
        </div>
      </div>
    `;

    overlay.addEventListener('click', (e) => {
      const action = e.target?.closest?.('[data-action]')?.dataset?.action;
      
      if (action === 'close') closeCertificate();
      if (action === 'edit-name') showNameForm(name, (newName) => internalRender(currentResults, { name: newName }));
      if (action === 'save-image') {
        saveCertificateAsImage(overlay.querySelector('#certCardCapture'), level, name, e.target.closest('[data-action]'));
      }
      if (action === 'share') shareCertificate(overlay.querySelector('#certCardCapture'), level, name);
    });
    
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeCertificate(); });
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeCertificate();
        document.removeEventListener('keydown', handleKeyDown);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.appendChild(overlay);
  }

  function internalRender(resultsObj, options) {
    options = options || {}; 
    injectStyles(); 
    closeCertificate();
    
    const name = options.name || getSavedName();
    if (!name) { 
      showNameForm('', (enteredName) => internalRender(resultsObj, { name: enteredName })); 
      return; 
    }
    
    buildAndShowCard(resultsObj, name);
  }

  // ==========================================
  // EXPOSED API
  // ==========================================
  
  window.renderCertificate = function(results, options) {
    if (results) {
      currentResults = results;
    }
    
    if (!currentResults) {
      alert("まだテスト結果がありません。先に模擬試験を完了してください。\n(No test results found. Please complete the mock exam first.)");
      return;
    }

    internalRender(currentResults, options);
  };
  
  window.closeCertificate = closeCertificate;
})();