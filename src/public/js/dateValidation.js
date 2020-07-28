var today = new Date().toISOString().split("T")[0];
document.getElementsByName("date")[0].setAttribute("min", today);

var today1 = new Date();
var time = today1.getHours();

document.getElementsById("time").setAttribute("min", time);
