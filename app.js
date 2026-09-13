// Firebase Setup
const firebaseConfig = {
    apiKey: "AIzaSyBttv5ikEbtJzK7WrDbikRwMAvSdL_z-qo",
    authDomain: "imran-41edd.firebaseapp.com",
    databaseURL: "https://imran-41edd-default-rtdb.firebaseio.com",
    projectId: "imran-41edd",
    storageBucket: "imran-41edd.firebasestorage.app",
    messagingSenderId: "374999191485",
    appId: "1:374999191485:web:04742032eb6f6a058dccd4"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const usersRef = database.ref("users");

// DOM Elements Selection
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const submitBtn = document.getElementById("submit");
const displayContainer = document.getElementById("display");
const toastContainer = document.getElementById("toast-container");

let editKey = null;

// Custom Toastify Notification Function (Bina kisi external link ke)
function showToast(message, isError = true) {
    const toast = document.createElement("div");
    toast.className = `custom-toast ${isError ? "toast-error" : "toast-success"}`;

    const icon = isError ? "fa-circle-xmark" : "fa-circle-check";
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("toast-fade-out");
        setTimeout(() => toast.remove(), 300);
    }, 2700);
}

// Aapka Email Validation Function (Regex Pattern)
function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

// Name Field Par Enter Key Event
nameInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        emailInput.focus();
    }
});

// Email Field Par Enter Key Event
emailInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        submitData();
    }
});

submitBtn.addEventListener("click", submitData);

// Form Submit Function
function submitData() {
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();

    nameInput.classList.remove("error-border");
    emailInput.classList.remove("error-border");

    if (name === "") {
        showToast("Please enter full name!");
        nameInput.classList.add("error-border");
        nameInput.focus();
        return;
    }

    if (email === "") {
        showToast("Please enter email address!");
        emailInput.classList.add("error-border");
        emailInput.focus();
        return;
    }

    // Email validation ke function ka yahan use kiya hai
    if (!isValidEmail(email)) {
        showToast("Sahi email enter karein! Example: name@gmail.com");
        emailInput.classList.add("error-border");
        emailInput.focus();
        return;
    }

    if (editKey) {
        usersRef.child(editKey).update({ name, email }).then(() => {
            editKey = null;
            submitBtn.innerHTML = `<i class="fa-solid fa-plus"></i> Add`;
            showToast("User updated successfully!", false);
            resetForm();
        });
    } else {
        usersRef.push({ name, email }).then(() => {
            showToast("User added successfully!", false);
            resetForm();
        });
    }
}

// Firebase Realtime Data Fetching
usersRef.on("value", (snapshot) => {
    displayContainer.innerHTML = "";
    const data = snapshot.val();

    if (!data) {
        displayContainer.innerHTML = `<p style="color:#64748b;">No users added yet.</p>`;
        return;
    }

    for (let key in data) {
        const user = data[key];
        const firstLetter = user.name ? user.name.charAt(0).toUpperCase() : "U";

        displayContainer.innerHTML += `
            <div class="user-card">
                <div class="user-info">
                    <div class="avatar">${firstLetter}</div>
                    <div class="details">
                        <h3>${user.name}</h3>
                        <p>${user.email}</p>
                    </div>
                </div>
                <div class="actions">
                    <button class="action-btn btn-edit" onclick="editUser('${key}', '${user.name}', '${user.email}')">Edit</button>
                    <button class="action-btn btn-delete" onclick="deleteUser('${key}')">Delete</button>
                </div>
            </div>
        `;
    }
});

// Delete Function
window.deleteUser = function(key) {
    if (confirm("Delete this user?")) {
        usersRef.child(key).remove().then(() => {
            showToast("User deleted successfully!", false);
        });
    }
};

// Edit Function
window.editUser = function(key, name, email) {
    nameInput.value = name;
    emailInput.value = email;
    editKey = key;
    submitBtn.innerHTML = `<i class="fa-solid fa-check"></i> Update`;
    nameInput.focus();
};

function resetForm() {
    nameInput.value = "";
    emailInput.value = "";
    nameInput.focus();
}