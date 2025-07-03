class UnauthorizedError extends Error { }
class InvalidTokenError extends Error { }

/**
 * @param {string} pat 
 * @param {...string} logins 
 * @returns {Promise<Account[]>}
 */
async function accountList(pat, ...logins) {
    const response = await fetch("https://api.github.com/graphql", {
        method: "post",
        headers: { 'Authorization': `Bearer ${pat}` },
        body: JSON.stringify({
            query: `query CheckLoginExistance{
                ${logins.map((login, i) => `u${i}:user(login:"${login}"){login}`).join()}
                ${logins.map((login, i) => `o${i}:organization(login:"${login}"){login}`).join()}
            }`
        })
    })

    if (response.status === 401) throw new InvalidTokenError()
    if (response.status === 403) throw new UnauthorizedError()

    const { data } = await response.json();

    return logins.map((login, i) => {
        const isUser = data[`u${i}`] != null
        const isOrganization = data[`o${i}`] != null
        return {
            login: login,
            kind: isUser ? "user" : isOrganization ? "organization" : null
        }
    })
}


window.token.value = localStorage.getItem("github_pat") ?? "";
window.token.onchange = async () => {
    if (window.token.value === "") localStorage.removeItem("github_pat")
    else localStorage.setItem("github_pat", window.token.value)
}

window.check.onclick = async () => {
    const pat = localStorage.getItem("github_pat")
    if (pat === null || pat === "") {
        window.token.setCustomValidity("token is missing")
        window.token.reportValidity()
        return
    }

    const usernames = window.usernames.value.split("\n").filter(Boolean)

    accountList(pat, ...usernames).then(accounts => {
        window.results.innerHTML = ""

        for (const account of accounts) {
            const row = window.results.insertRow()
            row.insertCell(0).innerText = account.login
            row.insertCell(1).innerText = account.kind ?? "no"
        }
    }).catch(err => {
        if (err === InvalidTokenError)
    })


}