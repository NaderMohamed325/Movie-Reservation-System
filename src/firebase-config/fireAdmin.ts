import admin, { ServiceAccount } from "firebase-admin";

import serviceAccount from "./firebase-service-account.json.json"; // adjust path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
});
