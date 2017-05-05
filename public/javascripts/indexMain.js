
function redirectPage(param)
{

    sessionStorage.setItem('searchCategory',param.innerText);
    window.location.replace("/seekerHome");
}