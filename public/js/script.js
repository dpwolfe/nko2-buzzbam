/* Author:

*/

function updateUserStatus()
{
  $(document).ready(function() {
    $.getJSON('getuser', function(data) {
      if (data.user) {
        var anchor = $('<a/>');
        anchor.click(function(e) {
          //$.getJSON('logout', updateUserStatus);
          window.location = 'http://www.facebook.com/logout.php';
        });
        anchor.text('Logout (' + data.user.name + ')');
        $('.loggedin').empty().append(anchor);
      }
      else {
        var anchor = $('<a/>');
        anchor.attr('href', 'https://www.facebook.com/dialog/oauth?client_id=225589484159909&redirect_uri=http://partyplanner.no.de/login');
        anchor.text('Login with Facebook');
        $('.loggedin').empty().append(anchor);
      }
    });
  });
}

$(document).ready(function() {
  updateUserStatus();
});

var viewModel = {
};

ko.applyBindings(viewModel);

