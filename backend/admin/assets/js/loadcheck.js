document.addEventListener("DOMContentLoaded", (e) => {
    if (document.cookie.includes("login=true")) {
        document.querySelector("body").style.display = "block";
    }

    const link = new URL(window.location.href);

    fetch(link.origin + "/admin/auth/verify", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    })
        .then((res) => {
            console.log(res.status);
            if (res.status === 200) {
                return res.json();
            } else {
                throw new Error("Não autorizado");
            }
        })
        .then((data) => {
            document.cookie =
                "login=true; expires=Fri, 31 Dec 9999 23:59:59 GMT; SameSite=Lax";
            document.querySelector("body").style.display = "block";
            console.log(data);
        })
        .catch((err) => {
            document.cookie =
                "login=false; expires=Fri, 31 Dec 9999 23:59:59 GMT; SameSite=Lax";
            console.log(err);
            localStorage.removeItem("token");
            window.location.href = "/admin/login";
        });
});
