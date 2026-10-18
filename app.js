'use strict';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const toast = (message) => { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toast.timer); toast.timer = setTimeout(() => $('#toast').classList.remove('visible'), 2800); };
function applyTheme(dark) { document.body.classList.toggle('dark', dark); $('#theme-toggle').setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme'); $('meta[name="theme-color"]').content = dark ? '#17251f' : '#f4f1e9'; }
document.body.classList.remove('dark');
function toggleTheme() { const dark = !document.body.classList.contains('dark'); applyTheme(dark); try { localStorage.setItem('raish-theme', dark ? 'dark' : 'light'); } catch (_) {} }
$('#theme-toggle').addEventListener('click', toggleTheme);
$('#year').textContent = new Date().getFullYear();
// Reveal only after the observer is ready; all content stays visible without JS.
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { threshold: .08 });
  $$('.reveal').forEach(el => observer.observe(el)); document.documentElement.classList.add('js');
}
let ticking = false;
function updateProgress() { const total = document.documentElement.scrollHeight - innerHeight; $('#progress').style.width = `${total > 0 ? Math.min(100,scrollY / total * 100) : 0}%`; ticking = false; }
addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(updateProgress); ticking = true; } }, { passive: true });
addEventListener('resize', updateProgress); updateProgress();
const art = $('#hero-art');
if (matchMedia('(pointer:fine)').matches && !reducedMotion.matches) {
  art.addEventListener('pointermove', e => { const r = art.getBoundingClientRect(); art.style.setProperty('--mx', `${((e.clientX-r.left)/r.width-.5)*10}px`); art.style.setProperty('--my', `${((e.clientY-r.top)/r.height-.5)*8}px`); });
  art.addEventListener('pointerleave', () => { art.style.setProperty('--mx','0px'); art.style.setProperty('--my','0px'); });
}
const tabs = $$('[data-tab]');
function activateTab(name, focus = false) { tabs.forEach(tab => { const active = tab.dataset.tab === name; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; $(`#panel-${tab.dataset.tab}`).hidden = !active; if (active && focus) tab.focus(); }); }
tabs.forEach((tab, i) => { tab.addEventListener('click', () => activateTab(tab.dataset.tab)); tab.addEventListener('keydown', e => { let next; if (e.key === 'ArrowRight') next = (i+1)%tabs.length; if (e.key === 'ArrowLeft') next = (i-1+tabs.length)%tabs.length; if (e.key === 'Home') next = 0; if (e.key === 'End') next = tabs.length-1; if (next !== undefined) { e.preventDefault(); activateTab(tabs[next].dataset.tab,true); } }); });
const architecture = {
  frontend: { kicker: '01 / PRESENTATION LAYER', title: 'Good interfaces remove friction.', copy: 'React and TypeScript turn requests, approvals, and activity into a clear workspace. The UI reflects permissions; the API enforces them.', code: 'Interface → REST request → API', note: 'A clear status and the right next action keep every request moving.' },
  api: { kicker: '02 / APPLICATION LAYER', title: 'Trust is checked on the server.', copy: 'FastAPI validates input and applies authentication, object-level access, and approval rules. A user cannot approve their own request or skip a review step.', code: 'Validate → Authenticate → Authorize → Execute', note: 'Business rules live on the server, so changing the interface cannot bypass them.' },
  database: { kicker: '03 / PERSISTENCE LAYER', title: 'Decisions deserve a history.', copy: 'SQLAlchemy models connect users, requests, workflows, and audit events to PostgreSQL. Transactions and row locking help protect approval decisions from competing updates.', code: 'Request + approval + audit → Transaction', note: 'Workflow snapshots preserve the approval path already assigned to a request.' },
  jobs: { kicker: '04 / BACKGROUND SERVICES', title: 'Useful work, beyond the click.', copy: 'Redis supports rate limiting. Celery handles background tasks such as emails, pending-request reminders, and escalation notifications.', code: 'Event → Job queue → Worker → Notification', note: 'These services are part of the project architecture; their operation depends on deployment configuration.' }
};
$$('[data-node]').forEach(button => button.addEventListener('click', () => { const data = architecture[button.dataset.node]; $$('[data-node]').forEach(node => { const active = node === button; node.classList.toggle('active',active); node.setAttribute('aria-pressed',String(active)); }); for (const key of ['kicker','title','copy','code','note']) $(`#node-${key}`).textContent = data[key]; }));
const stages = ['manager','it','finance']; const stageNames = ['Manager','IT reviewer','Finance reviewer']; let stage = 0;
function renderSimulation() {
  $$('[data-step]').forEach((step,i) => { step.classList.toggle('done',i<stage); step.classList.toggle('current',i===stage); $('span',step).textContent = i<stage ? '✓' : String(i+1); $('small',step).textContent = i<stage ? 'Approved in this simulation' : i===stage ? `Waiting for ${stageNames[i].toLowerCase()}` : 'Queued'; });
  $('#sim-complete').hidden = stage !== 3; $('#approve').disabled = stage === 3; $('#approve').textContent = stage === 3 ? 'Request approved ✓' : 'Approve request ↗';
}
$('#approve').addEventListener('click', () => { if(stage>=3) return; const role = $('#role').value; const feedback = $('#sim-feedback'); feedback.classList.remove('error'); if (role === 'employee') { feedback.textContent = 'Blocked: requesters cannot approve their own requests. Switch to Manager to continue.'; feedback.classList.add('error'); return; } if (role !== stages[stage]) { feedback.textContent = `Blocked: ${stageNames[stage]} must review this step first. Approval order matters.`; feedback.classList.add('error'); return; } stage++; renderSimulation(); feedback.textContent = stage === 3 ? 'Complete! Three ordered reviews, with no self-approval. Reset to try another path.' : `Approved. Switch to ${stageNames[stage]} for the next step.`; });
$('#reset').addEventListener('click', () => { stage = 0; $('#role').value = 'employee'; $('#sim-feedback').textContent = 'Try approving as Alex. Can a requester approve their own request?'; $('#sim-feedback').classList.remove('error'); renderSimulation(); });
async function copyEmail() { try { await navigator.clipboard.writeText('mdraish9216@gmail.com'); toast('Email copied. Let’s build something.'); } catch (_) { toast('Email: mdraish9216@gmail.com'); } }
$('#copy-email').addEventListener('click', copyEmail);
const dialogs = $$('dialog');
function openDialog(dialog) { if(!dialog.open) dialog.showModal(); document.body.style.overflow = 'hidden'; }
function closeDialog(dialog) { dialog.close(); }
dialogs.forEach(dialog => { dialog.addEventListener('close', () => { if (!dialogs.some(d => d.open)) document.body.style.overflow = ''; }); dialog.addEventListener('click', e => { if(e.target === dialog) { const rect = dialog.getBoundingClientRect(); if(e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) closeDialog(dialog); } }); });
$$('[data-close]').forEach(button => button.addEventListener('click',() => closeDialog($(`#${button.dataset.close}`))));
const commandDialog = $('#command-dialog'); let selectedCommand = 0; let visibleCommands = [];
function jump(id, tab) { closeDialog(commandDialog); if (tab) activateTab(tab); $(id).scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' }); }
const commands = [
  {label:'Explore selected work', detail:'Section', keywords:'projects flowops postmark work', action:() => jump('#work')},
  {label:'Explore FlowOps architecture', detail:'Interactive lab', keywords:'api react postgres redis system backend', action:() => jump('#lab','architecture')},
  {label:'Try the approval playground', detail:'Interactive lab', keywords:'demo simulation roles rbac security', action:() => jump('#lab','playground')},
  {label:'Meet the person behind the code', detail:'About', keywords:'education experience skills intern', action:() => jump('#about')},
  {label:'Download my résumé', detail:'PDF', keywords:'cv resume download', action:() => { closeDialog(commandDialog); const a = document.createElement('a'); a.href = 'assets/Md_Raish_Resume.pdf'; a.download = 'Md_Raish_Resume.pdf'; document.body.append(a); a.click(); a.remove(); }},
  {label:'Let’s talk', detail:'Contact', keywords:'email hire contact hello', action:() => jump('#contact')},
  {label:'Copy email address', detail:'Clipboard', keywords:'contact mail address', action:() => {closeDialog(commandDialog); copyEmail();}},
  {label:'Pause / resume decorative motion', detail:'Appearance', keywords:'animation motion pause reduce', action:() => {$('#motion-toggle').click();closeDialog(commandDialog);}},
  {label:'Open recruiter briefing', detail:'Quick overview', keywords:'hire recruiter cv summary experience', action:() => {closeDialog(commandDialog);$('#recruiter-open').click();}},
  {label:'Explore the project universe', detail:'Interactive scene', keywords:'3d orbit universe projects', action:() => jump('#universe')},
  {label:'Experiment with the API sandbox', detail:'Interactive lab', keywords:'api json request response backend', action:() => jump('#lab','api')}
];
function markSelection() { $$('.command-result').forEach((button,i) => { button.classList.toggle('selected',i===selectedCommand); if(i===selectedCommand) button.scrollIntoView({block:'nearest'}); }); }
function renderCommands() { const query = $('#command-search').value.trim().toLowerCase(); visibleCommands = commands.filter(c => `${c.label} ${c.keywords}`.toLowerCase().includes(query)); selectedCommand = 0; const results = $('#command-results'); results.replaceChildren(); if(!visibleCommands.length) { const empty = document.createElement('p'); empty.textContent = 'No match. Try “projects”, “résumé”, or “contact”.'; empty.style.cssText = 'font-size:12px;padding:15px'; results.append(empty); return; } visibleCommands.forEach((command,i) => { const button = document.createElement('button'); button.className = 'command-result'; const label = document.createElement('b'); label.style.fontWeight = '500'; label.textContent = command.label; const detail = document.createElement('span'); detail.textContent = command.detail; button.append(label,detail); button.addEventListener('click',command.action); results.append(button); }); markSelection(); }
function openCommands() { if($('#case-dialog').open) closeDialog($('#case-dialog')); $('#command-search').value = ''; openDialog(commandDialog); renderCommands(); $('#command-search').focus(); }
$('.command-trigger').addEventListener('click',openCommands); $('#open-console').addEventListener('click',openCommands);
$('#command-search').addEventListener('input',renderCommands);
$('#command-search').addEventListener('keydown',e => { if(e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if(visibleCommands.length) { selectedCommand = (selectedCommand+(e.key==='ArrowDown'?1:-1)+visibleCommands.length)%visibleCommands.length; markSelection(); } } if(e.key === 'Enter') { e.preventDefault(); visibleCommands[selectedCommand]?.action(); } });
addEventListener('keydown',e => { if((e.metaKey || e.ctrlKey) && e.key.toLowerCase()==='k') { e.preventDefault(); commandDialog.open ? closeDialog(commandDialog) : openCommands(); } });
const cases = {
 flowops: { title:'FlowOps', intro:'One workspace for the decisions that keep a company moving.', problem:'Equipment, software, expenses, and access requests need a clear owner, the right reviewers, and a visible history. FlowOps brings that process into a role-based workspace.', decisions:['React and TypeScript for the interface; FastAPI, SQLAlchemy, and PostgreSQL behind it.','Ordered approval steps, manager assignments, workflow snapshots, and object-level access rules.','JWT sessions and Argon2id password hashing, with checks against self-approval and unauthorized access.','Redis rate limiting and Celery tasks for reminders and escalation.'], takeaway:'The interesting challenge is keeping authorization consistent: who can see a request, who can act on it, and what happens when two people act at once.', demo:'https://flowops-274o.onrender.com', source:'https://github.com/Mdraish786/FlowOps' },
 postmark: { title:'Postmark', intro:'Short links on the surface. Accounts, ownership, and analytics underneath.', problem:'Sharing a link should be simple. Understanding what happened to it requires account ownership, reliable redirection, and a record of each click.', decisions:['A lightweight HTML, CSS, and JavaScript frontend with a Python FastAPI backend.','JWT-based authentication and bcrypt password hashing for account access.','SQLAlchemy models for users, links, and clicks, with server-side ownership checks.','Database configuration supports a DATABASE_URL connection and a local SQLite fallback.'], takeaway:'A small product still needs careful boundaries. A user should only be able to view and manage their own links and analytics.', demo:'https://postmark-7jfj.onrender.com', source:'https://github.com/Mdraish786/Postmark' }
};
$$('[data-case]').forEach(button => button.addEventListener('click', () => { const c = cases[button.dataset.case]; const content = $('#case-content'); content.replaceChildren(); function add(tag,text){ const el = document.createElement(tag); el.textContent = text; content.append(el); return el; } add('h2',c.title).id = 'case-title'; add('p',c.intro); add('h3','The problem'); add('p',c.problem); add('h3','The engineering'); const ul = document.createElement('ul'); c.decisions.forEach(t => { const li=document.createElement('li');li.textContent=t;ul.append(li); });content.append(ul); add('h3','What makes it interesting');add('p',c.takeaway); const links=document.createElement('div');links.className='case-links';[[c.demo,'Open live demo ↗'],[c.source,'View source ↗']].forEach(([href,label])=>{const a=document.createElement('a');a.href=href;a.textContent=label;a.target='_blank';a.rel='noopener noreferrer';links.append(a);});content.append(links);add('p','Live demos may need a moment to wake up on Render.').style.cssText='font-size:10px;margin:18px 0 0';openDialog($('#case-dialog')); }));
