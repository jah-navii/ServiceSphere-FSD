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

    


  nothing added to commit but untracked files present (use "git add" to track)
PS C:\Users\jahna\acads\sem5\fdfed\servicesphere-fsd> git add .
PS C:\Users\jahna\acads\sem5\fdfed\servicesphere-fsd> git commit -m "bookingformjs mongo"
[main 65373df] bookingformjs mongo
 1 file changed, 28 insertions(+)
 create mode 100644 javascript/bookingform.js
PS C:\Users\jahna\acads\sem5\fdfed\servicesphere-fsd> git push origin main
Enumerating objects: 6, done.
Counting objects: 100% (6/6), done.
Delta compression using up to 12 threads
Compressing objects: 100% (4/4), done.
Writing objects: 100% (4/4), 725 bytes | 725.00 KiB/s, done.
Total 4 (delta 2), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (2/2), completed with 2 local objects.
To https://github.com/jah-navii/ServiceSphere-FSD.git
   24b1aa1..65373df  main -> main
PS C:\Users\jahna\acads\sem5\fdfed\servicesphere-fsd>



