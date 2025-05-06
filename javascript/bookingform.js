document.getElementById("bookingForm").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const address = document.getElementById("address").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    
    alert("Your booking has been confirmed!\n\n" +
          "Address: " + address + "\n" +
          "Date: " + date + "\n" +
          "Time: " + time);
          
    document.getElementById("statusMessage").textContent = "Booking Status: Pending";
    document.getElementById("statusMessage").style.display = "block";
    document.getElementById("cancelButton").style.display = "block";
    document.getElementById("bookButton").style.display = "none";
    document.getElementById("bookingForm").reset();
});

document.getElementById("cancelButton").addEventListener("click", function() {
    if (confirm("Are you sure you want to cancel the service?")) {
        alert("Your booking has been canceled.");
        document.getElementById("statusMessage").textContent = "Booking Status: Canceled";
        document.getElementById("statusMessage").style.display = "none";
        document.getElementById("cancelButton").style.display = "none";
        document.getElementById("bookButton").style.display = "block";
    }
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
