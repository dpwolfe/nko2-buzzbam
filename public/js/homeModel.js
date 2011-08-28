// MODEL
var model = {
  parties: [],
  user: {},
  isLoggedIn: false,
};

function modelAddParty(party) {
  model.parties.push(party);
  viewModel.parties(model.parties);
}

function modelSetUser(user) {
  model.user = user;
  viewModel.user(user);
};

function modelSetIsLoggedIn(isLoggedIn) {
  model.isLoggedIn = isLoggedIn;
  viewModel.isLoggedIn(isLoggedIn);
};

// VIEWMODEL
var viewModel = {
  parties: ko.observableArray([]),
  user: ko.observable(),
  isLoggedIn: ko.observable(false),
};

viewModel.logInOutOfFacebook = function() {
  if (!model.isLoggedIn) {
    window.location = 'https://www.facebook.com/dialog/oauth?client_id=225589484159909&redirect_uri=http://partyplanner.no.de/login';
  } else {
    FB.logout(function(resp) {
      modelSetUser({});
      modelSetIsLoggedIn(false);
    });
  }
};

viewModel.createNewParty = function() {
  // get information from form
  var title = "Your party title";
  var description = "Your party description";
  server.newParty(title, description, function(party) {
      modelAddParty(party);
      window.location = 'index.html?partyId=' + data._id;
    });
};

viewModel.getPublicParties = ko.dependentObservable(function() {
  var parties = viewModel.parties();
  var publicParties = [];
  for (var i in parties) {
    if (parties[i].isPublic) {
      publicParties.push(parties[i]);
    }
  };
  return publicParties;
});

viewModel.getPrivateParties = ko.dependentObservable(function() {
  var parties = viewModel.parties();
  var privateParties = [];
  for (var i in parties) {
    if (!parties[i].isPublic) {
      privateParties.push(parties[i]);
    }
  };
  return privateParties;
});

viewModel.redirectToParty = function(partyId) {
  window.location = 'http://partyplanner.no.de/index.html?partyId=' + partyId;
};

viewModel.formattedLoggedInName = ko.dependentObservable(function () {
  if (model.isLoggedIn) {
    var name = user.fullName;
    return "Logout, " + name;
  } else {
    return "Log in";
  }
}, viewModel);

// FUNCTIONS
function loadData() {
  if (window.location.hash === '#debug') {
    server = server_local;
  }
  server.getUserAndFriends(function(data) {
      modelSetUser(data.me);
      modelSetIsLoggedIn(data.me.id ? true : false);
    });
  server.getParties(function(partyIds) {
      for (var i in partyIds) {
        server.getParty(partyIds[i], modelAddParty);
      }
    });
};


// READY
$(document).ready(function() {
  if (window.location.hash === '#debug') {
    server = server_local;
  }
  
  ko.applyBindings(viewModel);
  loadData();
});