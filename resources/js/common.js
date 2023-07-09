function openHamburger() {
  var x = document.getElementById("myTopnav");
  if (x.className === "topnav") {
    x.className += " responsive";
  } else {
    x.className = "topnav";
  }
}

const route = (event) => {
  event = event || window.event;
  event.preventDefault();
  window.histoy.pushState({}, "", event.target.href);
  handleLocation();
};

const routes = {
  404: "index.html",
  "/": "index.html",
  "/projects": "projects.html",
  "/about": "about.html",
  "/music": "music.html"
}

const handleLocation = async() => {
  const pathname = window.location.pathname;
  const route = routes[path] || routes[404];
  const html  = await fetch(route).then((data) => data.text());
  document.getElementById("main-page").innerHTML = html;
}

window.onpopstate = handleLocation;
window.route = route;

handleLocation();