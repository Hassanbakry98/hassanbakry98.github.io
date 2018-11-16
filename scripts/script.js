function on_load() {
  $('.info-button').click(function (){
    $('#fullscreen').css("display", "flex");
  })

  $('#fullscreen-exit').click(function(){
    $('#fullscreen').css("display", "none");
  })
};

function change_form() {
  $('#submit-button').click(function(){
    if ($('#i-agree').is(':checked')) {
      window.location.replace('dining-updated.html');
    } else {
      alert("Please agree to the Terms and Conditions");
    }
  })
}

function display_success() {
  alert("Meal Plan Successfully Updated");
};
