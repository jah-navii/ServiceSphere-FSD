import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  adminId: { type: String, required: true },
  phone: { type: String, required: true },
  issueType: { type: String, required: true },
  message: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now }
});

export default mongoose.model("ContactMessage", contactMessageSchema);


PS C:\Users\jahna\acads\sem5\fdfed\servicesphere-fsd> git commit -m "reviews"
[main 6ba1210] reviews
 3 files changed, 65 insertions(+), 23 deletions(-)
 create mode 100644 javascript/review.js
PS C:\Users\jahna\acads\sem5\fdfed\servicesphere-fsd> git push origin main
Enumerating objects: 10, done.
Counting objects: 100% (10/10), done.
Delta compression using up to 12 threads
Compressing objects: 100% (6/6), done.
Writing objects: 100% (6/6), 1.33 KiB | 1.33 MiB/s, done.
Total 6 (delta 4), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (4/4), completed with 4 local objects.
To https://github.com/jah-navii/ServiceSphere-FSD.git
   687f938..6ba1210  main -> main
PS C:\Users\jahna\acads\sem5\fdfed\servicesphere-fsd> git add .
PS C:\Users\jahna\acads\sem5\fdfed\servicesphere-fsd> git commit -m "lalala"
[main 56ba5df] lalala
 3 files changed, 109 insertions(+), 24 deletions(-)
 create mode 100644 javascript/seekerRegistration.js
PS C:\Users\jahna\acads\sem5\fdfed\servicesphere-fsd> git push origin main
Enumerating objects: 10, done.
Counting objects: 100% (10/10), done.
Delta compression using up to 12 threads
Compressing objects: 100% (6/6), done.
Writing objects: 100% (6/6), 1.61 KiB | 1.61 MiB/s, done.
Total 6 (delta 4), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (4/4), completed with 3 local objects.
To https://github.com/jah-navii/ServiceSphere-FSD.git
   6ba1210..56ba5df  main -> main
PS C:\Users\jahna\acads\sem5\fdfed\servicesphere-fsd>