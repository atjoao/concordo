document.addEventListener("DOMContentLoaded", (e) => {
    if (!localStorage.getItem("token")) {
        window.location.href = "/admin/login";
    }
    fetch("admin/auth/verify", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    })
        .then((res) => {
            if (res.status === 200) {
                return res.json();
            } else {
                throw new Error("Não autorizado");
            }
        })
        .then((data) => {
            console.log(data);
        })
        .catch((err) => {
            localStorage.removeItem("token");
            window.location.href = "/admin/login";
        });
});
