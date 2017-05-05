
function redirectPage(param)
{

    sessionStorage.setItem('searchCategory',param.innerText);
    if(sessionStorage.getItem('loginBool'))
        window.location.replace("/seekerHome"); 
    else
        window.location.replace("/login");
}