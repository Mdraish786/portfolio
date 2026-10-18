'use strict';
(() => {
 const form=document.getElementById('contact-form');
 if(!form)return;
 const message=document.getElementById('contact-message');
 const status=document.getElementById('contact-status');
 const submit=document.getElementById('contact-submit');
 const count=document.getElementById('message-count');
 const local=location.protocol==='file:';
 const normalLabel='Send message <span>↗</span>';
 function updateCount(){count.textContent=`${message.value.length} / 3000`;}
 updateCount();message.addEventListener('input',updateCount);
 if(local){status.textContent='Preview mode: email delivery works from the published website. You can also use the email link on the left.';status.classList.add('local-note');}
 form.addEventListener('submit',event=>{
  if(local){event.preventDefault();status.textContent='This downloaded preview cannot send messages. Use the published website, or contact mdraish9216@gmail.com directly.';return;}
  // Native HTML validation handles the fields before this event runs.
  // FormSubmit owns the spam check and confirmation. We do not claim delivery here.
  submit.disabled=true;submit.textContent='Continuing to verification…';
  status.textContent='Opening the secure form verification page. Your message is not confirmed as delivered yet.';
  setTimeout(()=>{submit.disabled=false;submit.innerHTML=normalLabel;},15000);
 });
 addEventListener('pageshow',()=>{submit.disabled=false;submit.innerHTML=normalLabel;updateCount();});
})();
