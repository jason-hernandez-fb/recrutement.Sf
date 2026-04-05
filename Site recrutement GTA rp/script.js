// ======= Connexion persistante =======
let userID = localStorage.getItem("userID");
if(!userID){
    userID = 'ID-'+Date.now()+'-'+Math.floor(Math.random()*1000);
    localStorage.setItem("userID", userID);
}

// ======= Bouton Staff / Citoyen =======
const btnStaff = document.getElementById("btnStaff");
btnStaff.addEventListener("click", function(){
    const mdp = prompt("Mot de passe Staff ou Citoyen:");
    if(mdp === "Admin123"){
        localStorage.setItem("roleUser","staff");
        alert("Rôle Staff activé !");
        document.getElementById("btnGestionCandidaturesContainer").style.display = "block";
    } else if(mdp === "Citoyen789"){
        localStorage.setItem("roleUser","citoyen");
        alert("Rôle Citoyen activé !");
        document.getElementById("btnGestionCandidaturesContainer").style.display = "none";
    } else {
        alert("Mot de passe incorrect !");
    }
});

// ======= Webhook Discord =======
function envoyerCandidatureDiscord(candidature){
    const webhookURL = "https://discord.com/api/webhooks/1490361980190724145/BVsY2Vrn7dugTq4QoZwIcZWeaZKP2qCQrln6PUKvIfm29jLd56ORsvqT-wYM7InTxzi9";

    const message = {
        content: `📣 **Candidature Acceptée !**
Pseudo RP: ${candidature.pseudoRp}
Prénom/Nom: ${candidature.prenomNom}
Rôle: ${candidature.role}
Discord: ${candidature.pseudoDiscord} (${candidature.discordID})
Âge HRP: ${candidature.ageHrp}
Prénom HRP: ${candidature.prenomHrp}`
    };

    fetch(webhookURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message)
    })
    .then(res => { if(res.ok) console.log("Candidature envoyée sur Discord !"); })
    .catch(err => console.error("Erreur webhook Discord:", err));
}

// ======= Bouton Gérer les candidatures =======
const btnGestion = document.getElementById("btnGestionCandidatures");
if(btnGestion){
    btnGestion.addEventListener("click", function(){
        const panel = document.getElementById("gestionCandidatures");
        panel.style.display = panel.style.display === "block" ? "none" : "block";
        afficherCandidatures();
    });
}

// ======= Afficher candidatures pour Staff uniquement =======
function afficherCandidatures(){
    const panel = document.getElementById("gestionCandidatures");
    panel.innerHTML = "<h2>Gérer les candidatures</h2>";
    let candidatures = JSON.parse(localStorage.getItem("candidatures")||"[]");
    if(candidatures.length === 0){
        panel.innerHTML += "<p>Aucune candidature pour le moment.</p>";
        return;
    }

    candidatures.forEach((c,index)=>{
        const div = document.createElement("div");
        div.className = "candidat-card";
        div.innerHTML = `<strong>${c.pseudoRp} (${c.prenomNom})</strong> - Rôle: 
        <select id="roleSelect-${index}">
            <option value="candidature en attente" ${c.role==="candidature en attente"?"selected":""}>Candidature en attente</option>
            <option value="citoyen" ${c.role==="citoyen"?"selected":""}>Citoyen</option>
            <option value="candidature accepté" ${c.role==="candidature accepté"?"selected":""}>Candidature Acceptée</option>
            <option value="staff" ${c.role==="staff"?"selected":""}>Staff</option>
        </select>
        <button id="saveRole-${index}">Enregistrer</button>
        <div id="details-${index}" class="details" style="display:none;"></div>`;

        panel.appendChild(div);

        // Afficher les détails (Staff uniquement)
        div.addEventListener("click", ()=>{
            const detailsDiv = document.getElementById(`details-${index}`);
            if(detailsDiv.style.display==="none"){
                detailsDiv.style.display="block";
                detailsDiv.innerHTML = `
                    <p><strong>Prénom HRP:</strong> ${c.prenomHrp}</p>
                    <p><strong>Âge HRP:</strong> ${c.ageHrp}</p>
                    <p><strong>Discord:</strong> ${c.pseudoDiscord} (${c.discordID})</p>
                    <p><strong>Pseudo RP:</strong> ${c.pseudoRp}</p>
                    <p><strong>Lieu Naissance:</strong> ${c.lieuxNaissance}</p>
                    <p><strong>Sexe:</strong> ${c.sexe}</p>
                    <p><strong>Téléphone:</strong> ${c.tel}</p>
                    <p><strong>RIB:</strong> ${c.rib}</p>
                    <p><strong>Disponibilités:</strong> ${c.disponibilite}</p>
                    <p><strong>Présentation:</strong> ${c.presentation}</p>
                    <p><strong>Diplôme:</strong> ${c.diplome}</p>
                    <p><strong>Motivation:</strong> ${c.motivation}</p>
                    <p><strong>Permis:</strong> ${c.permis.join(", ")}</p>
                    <p><strong>Conclusion:</strong> ${c.conclusion}</p>
                `;
            } else { detailsDiv.style.display="none"; }
        });

        // Changer rôle (Staff uniquement)
        document.getElementById(`saveRole-${index}`).addEventListener("click", ()=>{
            const roleUser = localStorage.getItem("roleUser");
            if(roleUser !== "staff"){
                alert("Seulement le Staff peut changer le rôle !");
                return;
            }
            const newRole = document.getElementById(`roleSelect-${index}`).value;
            c.role = newRole;
            candidatures[index] = c;
            localStorage.setItem("candidatures", JSON.stringify(candidatures));
            alert("Rôle mis à jour !");

            // Envoyer sur Discord si accepté
            if(newRole === "candidature accepté"){
                envoyerCandidatureDiscord(c);
            }
        });
    });
}

// ======= Afficher les boutons selon rôle actuel =======
const roleActuel = localStorage.getItem("roleUser");
if(roleActuel === "staff"){
    document.getElementById("btnGestionCandidaturesContainer").style.display = "block";
} else if(roleActuel === "citoyen"){
    document.getElementById("btnGestionCandidaturesContainer").style.display = "none";
}

// ======= Fonction confirmation après postuler =======
function confirmerCandidature(){
    alert("Votre candidature a bien été envoyée !");
}