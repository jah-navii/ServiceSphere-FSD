const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const inputs = document.querySelectorAll('input[name="name"], input[name="mobilenumber"], input[name="address"]');

    editBtn.addEventListener('click', () => {
      inputs.forEach(input => {
        input.removeAttribute('readonly');
        input.style.backgroundColor = 'white';
        input.style.border = '1px solid #007ea7';
        input.style.borderRadius = '4px';
      });
  
      
      editBtn.style.display = 'none';
      saveBtn.style.display = 'inline-block';
    });

