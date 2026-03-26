import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
// Importamos Firestore
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    // COPIA AQUÍ TUS DATOS DE CONFIGURACIÓN
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

// --- FUNCIÓN: Cargar clases desde la Nube ---
async function loadClassesFromCloud() {
    if (!currentUser) return;
    
    // Buscamos solo las clases que pertenecen al UID del usuario actual
    const q = query(collection(db, "classes"), where("userId", "==", currentUser.uid));
    const querySnapshot = await getDocs(q);
    
    classes = []; // Limpiamos la variable local
    querySnapshot.forEach((doc) => {
        classes.push({ id: doc.id, ...doc.data() });
    });
    
    renderDashboard();
}

// --- FUNCIÓN: Añadir clase a la Nube ---
window.addClass = async () => {
    const name = prompt("Nombre de la clase:");
    if (name && currentUser) {
        try {
            const newClass = {
                name: name,
                students: 0,
                userId: currentUser.uid, // Vinculamos la clase al usuario
                createdAt: Date.now()
            };
            // Guardamos en Firestore
            const docRef = await addDoc(collection(db, "classes"), newClass);
            console.log("Clase guardada con ID: ", docRef.id);
            
            loadClassesFromCloud(); // Recargamos la vista
        } catch (e) {
            alert("Error al guardar: " + e.message);
        }
    }
};

// --- FUNCIÓN: Eliminar clase de la Nube ---
window.deleteClass = async (id) => {
    if (confirm("¿Eliminar esta clase permanentemente?")) {
        await deleteDoc(doc(db, "classes", id));
        loadClassesFromCloud();
    }
};

// --- OBSERVADOR DE USUARIO ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        document.getElementById('user-display-name').innerText = user.email.split('@')[0];
        showScreen('dashboard-screen');
        loadClassesFromCloud(); // Al entrar, cargamos sus datos
    } else {
        currentUser = null;
        showScreen('home-screen');
    }
});
