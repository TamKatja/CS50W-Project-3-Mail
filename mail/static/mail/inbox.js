document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => loadMailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => loadMailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => loadMailbox('archive'));
  document.querySelector('#compose').addEventListener('click', composeEmail);

  // Create email-view fields
  const emailContent = document.querySelector('#email-view');

  const emailSubject = document.createElement('div');
  emailSubject.id = 'email-subject';
  emailContent.appendChild(emailSubject);

  const emailSender = document.createElement('div');
  emailSender.id = 'email-sender';
  emailContent.appendChild(emailSender);

  const emailRecipients = document.createElement('div');
  emailRecipients.id = 'email-recipients';
  emailContent.appendChild(emailRecipients);

  const emailTimestamp = document.createElement('div');
  emailTimestamp.id = 'email-timestamp';
  emailContent.appendChild(emailTimestamp);

  const emailBody = document.createElement('div');
  emailBody.id = 'email-body';
  emailContent.appendChild(emailBody);

  // Create 'reply', 'archive' and 'unarchive' buttons
  const emailBtns = document.createElement('div');
  emailBtns.className = 'email-btns d-flex';
  emailContent.appendChild(emailBtns);

  const replyBtn = document.createElement('button');
  replyBtn.id = 'reply-btn';
  replyBtn.className = 'col-auto btn btn-primary';
  replyBtn.innerText = 'Reply';
  emailBtns.appendChild(replyBtn);

  const archiveBtn = document.createElement('button');
  archiveBtn.id = 'archive-btn';
  archiveBtn.className = 'col-auto btn btn-primary';
  archiveBtn.innerText = 'Archive';
  emailBtns.appendChild(archiveBtn);

  const unarchiveBtn = document.createElement('button');
  unarchiveBtn.id = 'unarchive-btn';
  unarchiveBtn.className = 'col-auto btn btn-primary';
  unarchiveBtn.innerText = 'Unarchive';
  emailBtns.appendChild(unarchiveBtn);

  // By default, load the inbox
  loadMailbox('inbox');
});

function composeEmail() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Hide error-message
  document.querySelector('#error-message').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // User submits email composition form
  document.querySelector('#compose-form').onsubmit = (event) => {
    // Prevent default form submission
    event.preventDefault();
    // Retrieve user input data and create new email object
    newEmail = {
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    }
    return sendEmail(newEmail)
  }
}

function sendEmail(newEmail) {
  // Send email via API POST request
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      // Retrieve user input data
      recipients: newEmail.recipients,
      subject: newEmail.subject,
      body: newEmail.body
    })
  })
  .then(response => response.json())
  .then(emailData => {
    if ('error' in emailData) {
      // Display error message
      let errorMessage = document.querySelector('#error-message');
      errorMessage.className = 'alert alert-danger'
      errorMessage.textContent = emailData.error;
      errorMessage.style.display = 'block';
    } else {
      // Load user's 'sent' mailbox
      loadMailbox('sent');
    }
  })
  .catch(error => console.log(error));
}

function loadMailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Send API GET request
  fetch(`emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => renderMailbox(emails, mailbox))
  .catch(error => console.log(error));
}

function renderMailbox(emails, mailboxName) {
  const mailbox = document.querySelector('#emails-view');
  mailbox.className = 'container';

  // User has empty mailbox
  if (emails.length < 1) {
    mailbox.innerHTML += '<div class="alert alert-primary">No messages.</div>';
  }

  // Iterate through emails in mailbox
  emails.forEach(email => {

    // Display email container
    const emailContainer = document.createElement('div');
    emailContainer.className = 'email-wrapper row';
    mailbox.appendChild(emailContainer);

    // Display email sender (from) or recipients (to)
    if (mailboxName == 'sent') {
      let emailRecipients = document.createElement('div');
      emailRecipients.className = 'email-recipients-col col-sm-12 col-md-3';
      emailRecipients.innerHTML = `To: ${email.recipients.join(',<br>')}`;
      emailContainer.appendChild(emailRecipients);
    } else {
      let emailSender = document.createElement('div');
      emailSender.className = 'email-sender-col col-sm-12 col-md-3';
      emailSender.textContent = `From: ${email.sender}`;
      emailContainer.appendChild(emailSender);
    }

    // Display email subject
    let emailSubject = document.createElement('div');
    emailSubject.className = 'email-subject-col col-sm-12 col-md-7';
    emailSubject.textContent = email.subject;
    emailContainer.appendChild(emailSubject);

    // Display email timestamp
    let emailTimestamp = document.createElement('div');
    emailTimestamp.className = 'email-timestamp-col col-sm-12 col-md-auto';
    emailTimestamp.textContent = email.timestamp;
    emailContainer.appendChild(emailTimestamp);

    // Re-style email container if email read
    if (email.read == true) {
      emailContainer.style.backgroundColor = 'rgb(230, 230, 230)';
      emailContainer.style.fontWeight = '400';
    }

    // Render email on click
    emailContainer.onclick = () => {
      fetch(`/emails/${email.id}`)
      .then(response => response.json())
      .then(email => openEmail(email, mailboxName))
      .catch(error => console.log(error));
    }
  })
}

function openEmail(email, mailboxName) {
  // Show email view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Display email details
  document.querySelector('#email-subject').innerHTML = `<h5>${email.subject}</h5>`;
  document.querySelector('#email-sender').innerHTML = `<strong>From:</strong> ${email.sender}`;
  document.querySelector('#email-recipients').innerHTML = `<strong>To:</strong> ${email.recipients}`;
  document.querySelector('#email-timestamp').innerHTML = `<i>${email.timestamp}</i>`;
  document.querySelector('#email-body').innerHTML = email.body;

   // Display 'reply', 'archive' and 'unarchive buttons as relevant
  let replyBtn = document.querySelector('#reply-btn');
  let archiveBtn = document.querySelector('#archive-btn');
  let unarchiveBtn = document.querySelector('#unarchive-btn');
 
  if (mailboxName == 'inbox') {
    replyBtn.style.display = 'block';
    archiveBtn.style.display = 'block';
    unarchiveBtn.style.display = 'none';

  } else if (mailboxName == 'sent') {
    replyBtn.style.display = 'none';
    archiveBtn.style.display = 'none';
    unarchiveBtn.style.display = 'none';

  } else if (mailboxName == 'archive') {
    replyBtn.style.display = 'block';
    archiveBtn.style.display = 'none';
    unarchiveBtn.style.display = 'block';
  }

  // API PUT request to mark email as 'read'
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })

// User clicks on 'reply', 'archive' or 'unarchive' button
replyBtn.onclick = () => replyToEmail(email);
archiveBtn.onclick = () => archiveEmail(email);
unarchiveBtn.onclick = () => unarchiveEmail(email);
}

function replyToEmail(email) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Hide error-message
  document.querySelector('#error-message').style.display = 'none';
 
  // Pre-fill and disable email recipient field
  document.querySelector('#compose-recipients').value = email.sender;

  // Pre-fill subject line and prepend with 'Re:'
  if (!email.subject.toLowerCase().startsWith('re')) {
    document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
  } else {
    document.querySelector('#compose-subject').value = email.subject;
  }

  //Pre-fill email body with existing replies
  document.querySelector('#compose-body').value = `\n\nOn ${email.timestamp}, ${email.sender} wrote:\n${email.body}`;

  // User submits email reply
  document.querySelector('#compose-form').onsubmit = (event) => {
    // Prevent default form submission
    event.preventDefault();
    // Create new email object
    newEmail = {
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    }
    return sendEmail(newEmail)
  }
}

function archiveEmail(email) {
  // API PUT request to archive email
  fetch(`emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  })
  .then(response => loadMailbox('inbox'));
}

function unarchiveEmail(email) {
  // API PUT request to unarchive email
  fetch(`emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  })
  .then(response => loadMailbox('inbox'));
}