function initAutocomplete() {
  new google.maps.places.Autocomplete(document.getElementById("searchPlace"), {
    types: ["geocode"],
  });
}
